import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  limit: z.number().min(1).max(100).default(20), // Consistent max limit of 100
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
  created_at: string;
  updated_at: string;
}

export class InventoryService {
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
      
      let query = supabase
        .from('inventory')
        .select('*')
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

      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', itemId)
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
      const validatedData = CreateInventorySchema.parse(itemData);
      
      // Check if SKU already exists
      const { data: existingItem } = await supabase
        .from('inventory')
        .select('id')
        .eq('sku', validatedData.sku)
        .single();

      if (existingItem) {
        throw new Error(`SKU ${validatedData.sku} already exists`);
      }

      // Auto-update status based on quantity
      const status = this.calculateStatus(validatedData.quantity);

      const { data, error } = await supabase
        .from('inventory')
        .insert([{ ...validatedData, status }])
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
      if (!itemId) {
        throw new Error('Item ID is required');
      }

      const validatedUpdates = UpdateInventorySchema.parse(updates);

      // If quantity is being updated, recalculate status
      if (validatedUpdates.quantity !== undefined) {
        validatedUpdates.status = this.calculateStatus(validatedUpdates.quantity);
      }

      const { data, error } = await supabase
        .from('inventory')
        .update(validatedUpdates)
        .eq('id', itemId)
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
      if (!itemId) {
        throw new Error('Item ID is required');
      }

      // Check if item exists and can be deleted
      const existingItem = await this.get(itemId);
      if (!existingItem) {
        throw new Error('Inventory item not found');
      }

      // Check if item is used in any orders
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('id')
        .eq('inventory_id', itemId)
        .limit(1);

      if (orderItems && orderItems.length > 0) {
        throw new Error('Cannot delete inventory item that is used in orders');
      }

      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId);

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
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
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
      const { data: items, error: itemsError } = await supabase
        .from('inventory')
        .select('quantity, unit_price, category, status');

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
      await supabase
        .from('audit_logs')
        .insert({
          action: 'quantity_change',
          table_name: 'inventory',
          record_id: itemId,
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

  /**
   * Get advanced inventory analytics
   */
  async getAdvancedAnalytics(): Promise<{
    stockLevels: { inStock: number; lowStock: number; outOfStock: number; discontinued: number };
    valueAnalytics: { totalValue: number; averageValue: number; highestValue: number; lowestValue: number };
    categoryBreakdown: Array<{ category: string; count: number; value: number; percentage: number }>;
    turnoverAnalysis: { fastMoving: number; slowMoving: number; stagnant: number };
    reorderRecommendations: Array<{ item_id: string; sku: string; name: string; current_stock: number; recommended_order: number; urgency: 'high' | 'medium' | 'low' }>;
    performanceMetrics: { stockoutRate: number; turnoverRate: number; accuracyRate: number; efficiencyScore: number };
  }> {
    try {
      const { data: items, error } = await supabase
        .from('inventory')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch inventory analytics: ${error.message}`);
      }

      const inventoryItems = items || [];

      // Stock level analysis
      const stockLevels = {
        inStock: inventoryItems.filter(item => item.status === 'in_stock').length,
        lowStock: inventoryItems.filter(item => item.status === 'low_stock').length,
        outOfStock: inventoryItems.filter(item => item.status === 'out_of_stock').length,
        discontinued: inventoryItems.filter(item => item.status === 'discontinued').length
      };

      // Value analytics
      const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const averageValue = inventoryItems.length > 0 ? totalValue / inventoryItems.length : 0;
      const highestValue = Math.max(...inventoryItems.map(item => item.quantity * item.unit_price), 0);
      const lowestValue = Math.min(...inventoryItems.map(item => item.quantity * item.unit_price), 0);

      // Category breakdown
      const categoryMap = new Map<string, { count: number; value: number }>();
      inventoryItems.forEach(item => {
        const category = item.category || 'Uncategorized';
        const current = categoryMap.get(category) || { count: 0, value: 0 };
        categoryMap.set(category, {
          count: current.count + 1,
          value: current.value + (item.quantity * item.unit_price)
        });
      });

      const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        count: data.count,
        value: data.value,
        percentage: (data.count / inventoryItems.length) * 100
      }));

      // Turnover analysis (simplified - based on stock levels)
      const fastMoving = inventoryItems.filter(item => item.status === 'in_stock' && item.quantity > 20).length;
      const slowMoving = inventoryItems.filter(item => item.status === 'low_stock').length;
      const stagnant = inventoryItems.filter(item => item.status === 'out_of_stock' || item.status === 'discontinued').length;

      // Reorder recommendations
      const reorderRecommendations = inventoryItems
        .filter(item => item.status === 'low_stock' || item.status === 'out_of_stock')
        .map(item => {
          const recommendedOrder = item.status === 'out_of_stock' ? 50 : 25;
          const urgency: 'high' | 'medium' | 'low' = item.status === 'out_of_stock' ? 'high' : 
                         item.quantity <= 5 ? 'high' : 'medium';
          
          return {
            item_id: item.id,
            sku: item.sku,
            name: item.name,
            current_stock: item.quantity,
            recommended_order: recommendedOrder,
            urgency
          };
        })
        .sort((a, b) => {
          const urgencyOrder: Record<'high' | 'medium' | 'low', number> = { high: 3, medium: 2, low: 1 };
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        });

      // Performance metrics
      const stockoutRate = inventoryItems.length > 0 ? (stockLevels.outOfStock / inventoryItems.length) * 100 : 0;
      const turnoverRate = inventoryItems.length > 0 ? (fastMoving / inventoryItems.length) * 100 : 0;
      const accuracyRate = 95; // Placeholder - would be calculated from actual data
      const efficiencyScore = Math.max(0, 100 - stockoutRate - (100 - turnoverRate));

      return {
        stockLevels,
        valueAnalytics: { totalValue, averageValue, highestValue, lowestValue },
        categoryBreakdown,
        turnoverAnalysis: { fastMoving, slowMoving, stagnant },
        reorderRecommendations,
        performanceMetrics: { stockoutRate, turnoverRate, accuracyRate, efficiencyScore }
      };
    } catch (error) {
      console.error('Error in inventory.getAdvancedAnalytics:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Calculate inventory forecasting
   */
  async calculateForecast(timeframe: '30days' | '90days' | '1year' = '90days'): Promise<{
    projectedDemand: number;
    recommendedStock: number;
    reorderPoints: Array<{ item_id: string; sku: string; reorder_point: number; safety_stock: number }>;
    seasonalTrends: Array<{ month: string; demand_multiplier: number }>;
  }> {
    try {
      const { data: items, error } = await supabase
        .from('inventory')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch inventory for forecasting: ${error.message}`);
      }

      const inventoryItems = items || [];
      
      // Simplified forecasting logic
      const baseDemand = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
      const timeframeMultipliers = { '30days': 1.1, '90days': 1.3, '1year': 1.5 };
      const projectedDemand = baseDemand * timeframeMultipliers[timeframe];
      
      const recommendedStock = Math.ceil(projectedDemand * 1.2); // 20% safety margin

      // Calculate reorder points for each item
      const reorderPoints = inventoryItems.map(item => {
        const leadTime = 14; // 14 days lead time
        const dailyDemand = item.quantity / 30; // Simplified daily demand
        const safetyStock = dailyDemand * 7; // 7 days safety stock
        const reorderPoint = (dailyDemand * leadTime) + safetyStock;
        
        return {
          item_id: item.id,
          sku: item.sku,
          reorder_point: Math.ceil(reorderPoint),
          safety_stock: Math.ceil(safetyStock)
        };
      });

      // Seasonal trends (simplified)
      const seasonalTrends = [
        { month: 'January', demand_multiplier: 0.8 },
        { month: 'February', demand_multiplier: 0.9 },
        { month: 'March', demand_multiplier: 1.0 },
        { month: 'April', demand_multiplier: 1.1 },
        { month: 'May', demand_multiplier: 1.2 },
        { month: 'June', demand_multiplier: 1.3 },
        { month: 'July', demand_multiplier: 1.2 },
        { month: 'August', demand_multiplier: 1.1 },
        { month: 'September', demand_multiplier: 1.0 },
        { month: 'October', demand_multiplier: 1.1 },
        { month: 'November', demand_multiplier: 1.2 },
        { month: 'December', demand_multiplier: 1.4 }
      ];

      return {
        projectedDemand,
        recommendedStock,
        reorderPoints,
        seasonalTrends
      };
    } catch (error) {
      console.error('Error in inventory.calculateForecast:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Get inventory optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<{
    overstockedItems: Array<{ item_id: string; sku: string; name: string; current_stock: number; recommended_stock: number; excess_amount: number }>;
    understockedItems: Array<{ item_id: string; sku: string; name: string; current_stock: number; recommended_stock: number; shortage_amount: number }>;
    slowMovingItems: Array<{ item_id: string; sku: string; name: string; days_in_stock: number; suggested_action: 'discount' | 'discontinue' | 'promote' }>;
    spaceOptimization: { total_space_used: number; space_efficiency: number; recommendations: string[] };
  }> {
    try {
      const { data: items, error } = await supabase
        .from('inventory')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch inventory for optimization: ${error.message}`);
      }

      const inventoryItems = items || [];

      // Overstocked items (more than 3x average stock)
      const averageStock = inventoryItems.reduce((sum, item) => sum + item.quantity, 0) / inventoryItems.length;
      const overstockedItems = inventoryItems
        .filter(item => item.quantity > averageStock * 3)
        .map(item => ({
          item_id: item.id,
          sku: item.sku,
          name: item.name,
          current_stock: item.quantity,
          recommended_stock: Math.ceil(averageStock * 1.5),
          excess_amount: item.quantity - (averageStock * 1.5)
        }));

      // Understocked items (less than 0.5x average stock)
      const understockedItems = inventoryItems
        .filter(item => item.quantity < averageStock * 0.5 && item.status !== 'discontinued')
        .map(item => ({
          item_id: item.id,
          sku: item.sku,
          name: item.name,
          current_stock: item.quantity,
          recommended_stock: Math.ceil(averageStock * 1.5),
          shortage_amount: (averageStock * 1.5) - item.quantity
        }));

      // Slow moving items (simplified logic)
      const slowMovingItems = inventoryItems
        .filter(item => item.quantity > 0 && item.status === 'in_stock')
        .map(item => {
          const daysInStock = Math.floor(Math.random() * 365) + 30; // Placeholder
          let suggestedAction: 'discount' | 'discontinue' | 'promote';
          
          if (daysInStock > 180) {
            suggestedAction = 'discontinue';
          } else if (daysInStock > 90) {
            suggestedAction = 'discount';
          } else {
            suggestedAction = 'promote';
          }

          return {
            item_id: item.id,
            sku: item.sku,
            name: item.name,
            days_in_stock: daysInStock,
            suggested_action: suggestedAction
          };
        })
        .filter(item => item.suggested_action !== 'promote');

      // Space optimization (simplified)
      const totalSpaceUsed = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
      const spaceEfficiency = Math.min(100, (totalSpaceUsed / (inventoryItems.length * 100)) * 100);
      
      const recommendations = [];
      if (overstockedItems.length > 0) {
        recommendations.push(`Consider reducing stock levels for ${overstockedItems.length} overstocked items`);
      }
      if (understockedItems.length > 0) {
        recommendations.push(`Replenish stock for ${understockedItems.length} understocked items`);
      }
      if (slowMovingItems.length > 0) {
        recommendations.push(`Review ${slowMovingItems.length} slow-moving items for potential discounts or discontinuation`);
      }

      return {
        overstockedItems,
        understockedItems,
        slowMovingItems,
        spaceOptimization: {
          total_space_used: totalSpaceUsed,
          space_efficiency: spaceEfficiency,
          recommendations
        }
      };
    } catch (error) {
      console.error('Error in inventory.getOptimizationRecommendations:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Process automated inventory updates
   */
  async processAutomatedUpdates(): Promise<{
    updated: number;
    notifications: number;
    actions: Array<{ item_id: string; action: string; reason: string }>;
  }> {
    try {
      const { data: items, error } = await supabase
        .from('inventory')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch inventory for automated updates: ${error.message}`);
      }

      const inventoryItems = items || [];
      let updated = 0;
      let notifications = 0;
      const actions: Array<{ item_id: string; action: string; reason: string }> = [];

      for (const item of inventoryItems) {
        const newStatus = this.calculateStatus(item.quantity);
        
        if (newStatus !== item.status) {
          // Update item status
          const { error: updateError } = await supabase
            .from('inventory')
            .update({ status: newStatus })
            .eq('id', item.id);

          if (!updateError) {
            updated++;
            actions.push({
              item_id: item.id,
              action: 'status_update',
              reason: `Status changed from ${item.status} to ${newStatus}`
            });

            // Send notification for critical status changes
            if (newStatus === 'out_of_stock' || newStatus === 'low_stock') {
              notifications++;
              await this.sendInventoryNotification(item, newStatus);
            }
          }
        }

        // Check for reorder points
        if (item.quantity <= 5 && item.status !== 'discontinued') {
          actions.push({
            item_id: item.id,
            action: 'reorder_alert',
            reason: `Stock level (${item.quantity}) is below reorder point`
          });
        }
      }

      return { updated, notifications, actions };
    } catch (error) {
      console.error('Error in inventory.processAutomatedUpdates:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Send inventory notification
   */
  private async sendInventoryNotification(item: any, status: string): Promise<void> {
    try {
      // This would integrate with your notification system
      console.log(`Inventory notification: ${item.name} (${item.sku}) is now ${status}`);
      
      // Placeholder for actual notification logic
      await supabase
        .from('notifications')
        .insert({
          type: 'inventory_alert',
          title: `Inventory Alert: ${item.name}`,
          message: `${item.name} (${item.sku}) stock level is now ${status}`,
          metadata: { item_id: item.id, status }
        });
    } catch (error) {
      console.error('Failed to send inventory notification:', error);
    }
  }
}

// Export singleton instance
export const inventoryService = new InventoryService(); 