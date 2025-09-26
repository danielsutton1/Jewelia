import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { UserContext } from './UserContextService';

// Define valid inventory statuses
export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';

const CreateInventorySchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  unit_cost: z.number().min(0, 'Unit cost cannot be negative').optional(),
  quantity: z.number().int().min(0, 'Quantity cannot be negative').default(0),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued']).default('in_stock'),
});

const UpdateInventorySchema = CreateInventorySchema.partial();

const InventoryFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued']).optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  low_stock_only: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sort_by: z.enum(['name', 'sku', 'unit_price', 'quantity', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Inventory Item Interface
export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  unit_price: number;
  unit_cost: number | null;
  quantity: number;
  status: InventoryStatus;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export class TenantAwareInventoryService {
  private supabase: SupabaseClient;
  private userContext: UserContext;

  constructor(supabase: SupabaseClient, userContext: UserContext) {
    this.supabase = supabase;
    this.userContext = userContext;
  }

  /**
   * Check if a product has sufficient availability for an order
   */
  async checkProductAvailability(inventoryId: string, quantity: number): Promise<{ data: boolean; error: string | null }> {
    try {
      const item = await this.get(inventoryId);
      if (!item) {
        return { data: false, error: 'Product not found' };
      }
      
      const available = item.quantity >= quantity;
      return { data: available, error: null };
    } catch (error: any) {
      return { data: false, error: error.message };
    }
  }

  /**
   * Reserve inventory for an order
   */
  async reserveInventoryForOrder(inventoryId: string, quantity: number): Promise<void> {
    try {
      await this.updateQuantity(inventoryId, -quantity, 'Order reservation');
    } catch (error: any) {
      throw new Error(`Failed to reserve inventory: ${error.message}`);
    }
  }

  /**
   * Release inventory reservation when order is cancelled
   */
  async releaseInventoryReservation(inventoryId: string, quantity: number): Promise<void> {
    try {
      await this.updateQuantity(inventoryId, quantity, 'Order cancellation - reservation released');
    } catch (error: any) {
      throw new Error(`Failed to release inventory reservation: ${error.message}`);
    }
  }

  /**
   * List inventory items with filtering and pagination
   */
  async list(filters?: z.infer<typeof InventoryFiltersSchema>): Promise<InventoryItem[]> {
    try {
      const validatedFilters = InventoryFiltersSchema.parse(filters || {});
      
      let query = this.supabase
        .from('inventory')
        .select('*')
        .eq('tenant_id', this.userContext.tenantId) // CRITICAL: Filter by tenant
        .order(validatedFilters.sort_by, { ascending: validatedFilters.sort_order === 'asc' })
        .range(validatedFilters.offset, validatedFilters.offset + validatedFilters.limit - 1);

      // Apply filters
      if (validatedFilters.search) {
        query = query.or(`name.ilike.%${validatedFilters.search}%,sku.ilike.%${validatedFilters.search}%,description.ilike.%${validatedFilters.search}%`);
      }
      
      if (validatedFilters.category) {
        query = query.eq('category', validatedFilters.category);
      }
      
      if (validatedFilters.status) {
        query = query.eq('status', validatedFilters.status);
      }
      
      if (validatedFilters.min_price !== undefined) {
        query = query.gte('unit_price', validatedFilters.min_price);
      }
      
      if (validatedFilters.max_price !== undefined) {
        query = query.lte('unit_price', validatedFilters.max_price);
      }
      
      if (validatedFilters.low_stock_only) {
        query = query.eq('status', 'low_stock');
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch inventory: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in inventory.list:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Get single inventory item by ID
   */
  async get(itemId: string): Promise<InventoryItem | null> {
    try {
      if (!itemId) {
        throw new Error('Item ID is required');
      }

      const { data, error } = await this.supabase
        .from('inventory')
        .select('*')
        .eq('id', itemId)
        .eq('tenant_id', this.userContext.tenantId) // CRITICAL: Filter by tenant
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Item not found
        }
        throw new Error(`Failed to fetch inventory item: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in inventory.get:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Create new inventory item
   */
  async create(itemData: z.infer<typeof CreateInventorySchema>): Promise<InventoryItem> {
    try {
      // Check if user has permission to edit inventory
      if (!this.userContext.permissions.canEditInventory) {
        throw new Error('Insufficient permissions to create inventory items');
      }

      const validatedData = CreateInventorySchema.parse(itemData);
      
      // Check if SKU already exists within the tenant
      const { data: existingItem } = await this.supabase
        .from('inventory')
        .select('id')
        .eq('sku', validatedData.sku)
        .eq('tenant_id', this.userContext.tenantId) // CRITICAL: Check within tenant
        .single();

      if (existingItem) {
        throw new Error(`SKU ${validatedData.sku} already exists`);
      }

      // Auto-update status based on quantity
      const status = this.calculateStatus(validatedData.quantity);

      const { data, error } = await this.supabase
        .from('inventory')
        .insert([{ 
          ...validatedData, 
          status,
          tenant_id: this.userContext.tenantId // CRITICAL: Add tenant_id
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create inventory item: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in inventory.create:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Update inventory item
   */
  async update(itemId: string, updates: z.infer<typeof UpdateInventorySchema>): Promise<InventoryItem> {
    try {
      // Check if user has permission to edit inventory
      if (!this.userContext.permissions.canEditInventory) {
        throw new Error('Insufficient permissions to update inventory items');
      }

      if (!itemId) {
        throw new Error('Item ID is required');
      }

      const validatedUpdates = UpdateInventorySchema.parse(updates);

      // If quantity is being updated, recalculate status
      if (validatedUpdates.quantity !== undefined) {
        validatedUpdates.status = this.calculateStatus(validatedUpdates.quantity);
      }

      const { data, error } = await this.supabase
        .from('inventory')
        .update(validatedUpdates)
        .eq('id', itemId)
        .eq('tenant_id', this.userContext.tenantId) // CRITICAL: Filter by tenant
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update inventory item: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in inventory.update:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Delete inventory item
   */
  async delete(itemId: string): Promise<boolean> {
    try {
      // Check if user has permission to edit inventory
      if (!this.userContext.permissions.canEditInventory) {
        throw new Error('Insufficient permissions to delete inventory items');
      }

      if (!itemId) {
        throw new Error('Item ID is required');
      }

      // Check if item exists and can be deleted
      const existingItem = await this.get(itemId);
      if (!existingItem) {
        throw new Error('Inventory item not found');
      }

      // Check if item is used in any orders within the tenant
      const { data: orderItems } = await this.supabase
        .from('order_items')
        .select('id')
        .eq('inventory_id', itemId)
        .limit(1);

      if (orderItems && orderItems.length > 0) {
        throw new Error('Cannot delete inventory item that is used in orders');
      }

      const { error } = await this.supabase
        .from('inventory')
        .delete()
        .eq('id', itemId)
        .eq('tenant_id', this.userContext.tenantId); // CRITICAL: Filter by tenant

      if (error) {
        throw new Error(`Failed to delete inventory item: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in inventory.delete:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Update inventory quantity (for stock adjustments)
   */
  async updateQuantity(itemId: string, quantityChange: number, reason?: string): Promise<InventoryItem> {
    try {
      // Check if user has permission to edit inventory
      if (!this.userContext.permissions.canEditInventory) {
        throw new Error('Insufficient permissions to update inventory quantities');
      }

      const currentItem = await this.get(itemId);
      if (!currentItem) {
        throw new Error('Inventory item not found');
      }

      const newQuantity = currentItem.quantity + quantityChange;
      if (newQuantity < 0) {
        throw new Error('Quantity cannot be negative');
      }

      const status = this.calculateStatus(newQuantity);

      const updatedItem = await this.update(itemId, {
        quantity: newQuantity,
        status
      });

      // Log the quantity change for audit trail
      await this.logQuantityChange(itemId, currentItem.quantity, newQuantity, reason);

      return updatedItem;
    } catch (error) {
      console.error('Error in inventory.updateQuantity:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(threshold: number = 10): Promise<InventoryItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('inventory')
        .select('*')
        .eq('tenant_id', this.userContext.tenantId) // CRITICAL: Filter by tenant
        .or(`quantity.lte.${threshold},status.eq.low_stock`)
        .order('quantity', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch low stock items: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in inventory.getLowStockItems:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Get inventory statistics
   */
  async getStatistics(): Promise<{
    total_items: number;
    total_value: number;
    low_stock_count: number;
    out_of_stock_count: number;
    categories: { category: string; count: number }[];
  }> {
    try {
      // Get total items and value
      const { data: items, error: itemsError } = await this.supabase
        .from('inventory')
        .select('quantity, unit_price, category, status')
        .eq('tenant_id', this.userContext.tenantId); // CRITICAL: Filter by tenant

      if (itemsError) {
        throw new Error(`Failed to fetch inventory statistics: ${itemsError.message}`);
      }

      const total_items = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      const total_value = items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0;
      const low_stock_count = items?.filter(item => item.status === 'low_stock').length || 0;
      const out_of_stock_count = items?.filter(item => item.status === 'out_of_stock').length || 0;

      // Get category counts
      const categoryMap = new Map<string, number>();
      items?.forEach(item => {
        if (item.category) {
          categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1);
        }
      });

      const categories = Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count
      }));

      return {
        total_items,
        total_value,
        low_stock_count,
        out_of_stock_count,
        categories
      };
    } catch (error) {
      console.error('Error in inventory.getStatistics:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Calculate inventory status based on quantity
   */
  private calculateStatus(quantity: number): InventoryStatus {
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= 10) return 'low_stock';
    return 'in_stock';
  }

  /**
   * Log quantity changes for audit trail
   */
  private async logQuantityChange(
    itemId: string, 
    oldQuantity: number, 
    newQuantity: number, 
    reason?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('audit_logs')
        .insert({
          action: 'quantity_change',
          table_name: 'inventory',
          record_id: itemId,
          user_id: this.userContext.user.id,
          tenant_id: this.userContext.tenantId,
          changes: {
            old_quantity: oldQuantity,
            new_quantity: newQuantity,
            reason: reason || 'Manual adjustment'
          }
        });
    } catch (error) {
      console.error('Failed to log quantity change:', error);
      // Don't throw error for audit logging failures
    }
  }
}

/**
 * Factory function to create a tenant-aware inventory service
 */
export function createTenantAwareInventoryService(
  supabase: SupabaseClient, 
  userContext: UserContext
): TenantAwareInventoryService {
  return new TenantAwareInventoryService(supabase, userContext);
}
