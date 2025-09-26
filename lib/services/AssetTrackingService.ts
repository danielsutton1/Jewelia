import { createClient } from '@supabase/supabase-js';
import {
  AssetLocation,
  AssetMovement,
  AssetAssignment,
  InventoryItem,
  CreateLocationRequest,
  UpdateLocationRequest,
  CreateMovementRequest,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  UpdateInventoryItemRequest,
  LocationFilters,
  MovementFilters,
  AssignmentFilters,
  InventoryFilters,
  AssetTrackingAnalytics,
  CheckOutRequest,
  CheckInRequest,
  LocationType,
  MovementType,
  AssignmentType,
  AssignmentStatus,
  ItemStatus
} from '@/types/asset-tracking';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class AssetTrackingService {
  // Location Management
  async createLocation(data: CreateLocationRequest): Promise<AssetLocation> {
    const { data: location, error } = await supabase
      .from('asset_locations')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create location: ${error.message}`);
    }

    return location;
  }

  async getLocationById(id: string): Promise<AssetLocation | null> {
    const { data: location, error } = await supabase
      .from('asset_locations')
      .select(`
        *,
        parent_location:asset_locations!asset_locations_parent_location_id_fkey(*),
        child_locations:asset_locations!asset_locations_parent_location_id_fkey(*),
        inventory_items:inventory_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get location: ${error.message}`);
    }

    return location;
  }

  async listLocations(filters: LocationFilters = {}, page = 1, limit = 20): Promise<{
    data: AssetLocation[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    let query = supabase
      .from('asset_locations')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.location_type) {
      query = query.eq('location_type', filters.location_type);
    }
    if (filters.parent_location_id) {
      query = query.eq('parent_location_id', filters.parent_location_id);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    query = query.order('name', { ascending: true });

    const { data: locations, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list locations: ${error.message}`);
    }

    return {
      data: locations || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    };
  }

  async updateLocation(id: string, data: UpdateLocationRequest): Promise<AssetLocation> {
    const { data: location, error } = await supabase
      .from('asset_locations')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update location: ${error.message}`);
    }

    return location;
  }

  async deleteLocation(id: string): Promise<void> {
    // Check if location has child locations or inventory items
    const { data: children } = await supabase
      .from('asset_locations')
      .select('id')
      .eq('parent_location_id', id);

    const { data: items } = await supabase
      .from('inventory_items')
      .select('id')
      .eq('current_location_id', id);

    if (children && children.length > 0) {
      throw new Error('Cannot delete location with child locations');
    }

    if (items && items.length > 0) {
      throw new Error('Cannot delete location with assigned inventory items');
    }

    const { error } = await supabase
      .from('asset_locations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete location: ${error.message}`);
    }
  }

  async getLocationHierarchy(): Promise<AssetLocation[]> {
    const { data: locations, error } = await supabase
      .from('asset_locations')
      .select(`
        *,
        parent_location:asset_locations!asset_locations_parent_location_id_fkey(id, name, location_type),
        child_locations:asset_locations!asset_locations_parent_location_id_fkey(*)
      `)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to get location hierarchy: ${error.message}`);
    }

    return locations || [];
  }

  // Movement Tracking
  async createMovement(data: CreateMovementRequest): Promise<AssetMovement> {
    const { data: movement, error } = await supabase
      .from('asset_movements')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create movement: ${error.message}`);
    }

    // Update inventory item location if moving to a new location
    if (data.to_location_id) {
      await supabase
        .from('inventory_items')
        .update({ current_location_id: data.to_location_id })
        .eq('id', data.inventory_item_id);
    }

    return movement;
  }

  async listMovements(filters: MovementFilters = {}, page = 1, limit = 20): Promise<{
    data: AssetMovement[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    let query = supabase
      .from('asset_movements')
      .select(`
        *,
        inventory_item:inventory_items(id, name, sku, current_value),
        from_location:asset_locations!asset_movements_from_location_id_fkey(id, name, location_type),
        to_location:asset_locations!asset_movements_to_location_id_fkey(id, name, location_type)
      `, { count: 'exact' });

    // Apply filters
    if (filters.inventory_item_id) {
      query = query.eq('inventory_item_id', filters.inventory_item_id);
    }
    if (filters.from_location_id) {
      query = query.eq('from_location_id', filters.from_location_id);
    }
    if (filters.to_location_id) {
      query = query.eq('to_location_id', filters.to_location_id);
    }
    if (filters.movement_type) {
      query = query.eq('movement_type', filters.movement_type);
    }
    if (filters.moved_by) {
      query = query.eq('moved_by', filters.moved_by);
    }
    if (filters.date_from) {
      query = query.gte('moved_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('moved_at', filters.date_to);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    query = query.order('moved_at', { ascending: false });

    const { data: movements, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list movements: ${error.message}`);
    }

    return {
      data: movements || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    };
  }

  async getItemMovementHistory(inventoryItemId: string): Promise<AssetMovement[]> {
    const { data: movements, error } = await supabase
      .from('asset_movements')
      .select(`
        *,
        from_location:asset_locations!asset_movements_from_location_id_fkey(id, name, location_type),
        to_location:asset_locations!asset_movements_to_location_id_fkey(id, name, location_type)
      `)
      .eq('inventory_item_id', inventoryItemId)
      .order('moved_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get movement history: ${error.message}`);
    }

    return movements || [];
  }

  // Assignment Management
  async createAssignment(data: CreateAssignmentRequest): Promise<AssetAssignment> {
    // Transform the request to match database schema
    const assignmentData = {
      inventory_item_id: data.inventory_item_id,
      assigned_to: data.assigned_to_id, // Use assigned_to_id as assigned_to
      assigned_by: '00000000-0000-0000-0000-000000000001', // Default user ID
      assignment_type: data.assigned_to_type === 'customer' ? 'customer' : 'staff',
      assigned_to_type: data.assigned_to_type,
      assigned_to_id: data.assigned_to_id,
      expected_return_at: data.expected_return_date,
      notes: data.notes
    };

    const { data: assignment, error } = await supabase
      .from('asset_assignments')
      .insert([assignmentData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create assignment: ${error.message}`);
    }

    // Update inventory item status and assignment reference
    await supabase
      .from('inventory_items')
      .update({ 
        status: 'in_use',
        current_assignment_id: assignment.id
      })
      .eq('id', data.inventory_item_id);

    return assignment;
  }

  async listAssignments(filters: AssignmentFilters = {}, page = 1, limit = 20): Promise<{
    data: AssetAssignment[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    let query = supabase
      .from('asset_assignments')
      .select(`
        *,
        inventory_item:inventory_items(id, name, sku, current_value)
      `, { count: 'exact' });

    // Apply filters
    if (filters.inventory_item_id) {
      query = query.eq('inventory_item_id', filters.inventory_item_id);
    }
    if (filters.assigned_to_type) {
      query = query.eq('assigned_to_type', filters.assigned_to_type);
    }
    if (filters.assigned_to_id) {
      query = query.eq('assigned_to_id', filters.assigned_to_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.assigned_by) {
      query = query.eq('assigned_by', filters.assigned_by);
    }
    if (filters.date_from) {
      query = query.gte('assigned_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('assigned_at', filters.date_to);
    }
    if (filters.is_overdue !== undefined) {
      query = query.eq('is_overdue', filters.is_overdue);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    query = query.order('assigned_at', { ascending: false });

    const { data: assignments, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list assignments: ${error.message}`);
    }

    return {
      data: assignments || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    };
  }

  async getAssignmentById(id: string): Promise<AssetAssignment | null> {
    const { data: assignment, error } = await supabase
      .from('asset_assignments')
      .select(`
        *,
        inventory_item:inventory_items(id, name, sku, current_value, current_location_id),
        inventory_item_location:inventory_items!inventory_items_current_location_id_fkey(
          current_location:asset_locations(id, name, location_type)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get assignment: ${error.message}`);
    }

    return assignment;
  }

  async updateAssignment(id: string, data: UpdateAssignmentRequest): Promise<AssetAssignment> {
    const updateData: any = {};
    
    if (data.expected_return_date) updateData.expected_return_at = data.expected_return_date;
    if (data.actual_return_date) updateData.actual_return_at = data.actual_return_date;
    if (data.notes) updateData.notes = data.notes;

    const { data: assignment, error } = await supabase
      .from('asset_assignments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update assignment: ${error.message}`);
    }

    return assignment;
  }

  async deleteAssignment(id: string): Promise<void> {
    const { error } = await supabase
      .from('asset_assignments')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete assignment: ${error.message}`);
    }
  }

  async getOverdueAssignments(): Promise<AssetAssignment[]> {
    const { data: assignments, error } = await supabase
      .from('asset_assignments')
      .select(`
        *,
        inventory_item:inventory_items(id, name, sku, current_value)
      `)
      .eq('is_overdue', true)
      .order('expected_return_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get overdue assignments: ${error.message}`);
    }

    return assignments || [];
  }

  // Check-in/Check-out Operations
  async checkOutItem(data: CheckOutRequest): Promise<AssetMovement> {
    // Create movement record
    const movementData = {
      inventory_item_id: data.inventory_item_id,
      to_location_id: data.to_location_id,
      movement_type: 'checkout',
      movement_reason: data.reason,
      expected_return_at: data.expected_return_date,
      notes: data.notes
    };

    const { data: movement, error } = await supabase
      .from('asset_movements')
      .insert([movementData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to check out item: ${error.message}`);
    }

    // Update inventory item status
    await supabase
      .from('inventory_items')
      .update({ 
        status: 'in_use',
        current_location_id: data.to_location_id
      })
      .eq('id', data.inventory_item_id);

    return movement;
  }

  async checkInItem(data: CheckInRequest): Promise<AssetMovement> {
    // Create movement record
    const movementData = {
      inventory_item_id: data.inventory_item_id,
      from_location_id: data.from_location_id,
      to_location_id: data.to_location_id,
      movement_type: 'checkin',
      actual_return_at: data.actual_return_date,
      notes: data.notes
    };

    const { data: movement, error } = await supabase
      .from('asset_movements')
      .insert([movementData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to check in item: ${error.message}`);
    }

    // Update inventory item status and location
    await supabase
      .from('inventory_items')
      .update({ 
        status: 'available',
        current_location_id: data.to_location_id,
        current_assignment_id: null
      })
      .eq('id', data.inventory_item_id);

    return movement;
  }

  // Inventory Item Management
  async listInventoryItems(filters: InventoryFilters = {}, page = 1, limit = 20): Promise<{
    data: InventoryItem[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    let query = supabase
      .from('inventory_items')
      .select(`
        *,
        current_location:asset_locations(id, name, location_type),
        current_assignment:asset_assignments(id, status, assigned_to_type, assigned_to_id)
      `, { count: 'exact' });

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.subcategory) {
      query = query.eq('subcategory', filters.subcategory);
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.current_location_id) {
      query = query.eq('current_location_id', filters.current_location_id);
    }
    if (filters.is_tracked !== undefined) {
      query = query.eq('is_tracked', filters.is_tracked);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }
    if (filters.min_value) {
      query = query.gte('current_value', filters.min_value);
    }
    if (filters.max_value) {
      query = query.lte('current_value', filters.max_value);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data: items, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list inventory items: ${error.message}`);
    }

    return {
      data: items || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    };
  }

  async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    const { data: item, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        current_location:asset_locations(id, name, location_type),
        current_assignment:asset_assignments(id, status, assigned_to_type, assigned_to_id),
        movements:asset_movements(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get inventory item: ${error.message}`);
    }

    return item;
  }

  async updateInventoryItem(id: string, data: UpdateInventoryItemRequest): Promise<InventoryItem> {
    const { data: item, error } = await supabase
      .from('inventory_items')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update inventory item: ${error.message}`);
    }

    return item;
  }

  // Analytics
  async getAssetTrackingAnalytics(): Promise<AssetTrackingAnalytics> {
    // Get total items
    const { count: totalItems } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true });

    // Get tracked items
    const { count: trackedItems } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('is_tracked', true);

    // Get assigned items
    const { count: assignedItems } = await supabase
      .from('asset_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get overdue items
    const { count: overdueItems } = await supabase
      .from('asset_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('is_overdue', true);

    // Get total locations
    const { count: totalLocations } = await supabase
      .from('asset_locations')
      .select('*', { count: 'exact', head: true });

    // Get active locations
    const { count: activeLocations } = await supabase
      .from('asset_locations')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get recent movements
    const { data: recentMovements } = await supabase
      .from('asset_movements')
      .select(`
        *,
        inventory_item:inventory_items(id, name, sku)
      `)
      .order('moved_at', { ascending: false })
      .limit(10);

    // Get overdue assignments
    const { data: overdueAssignments } = await supabase
      .from('asset_assignments')
      .select(`
        *,
        inventory_item:inventory_items(id, name, sku, current_value)
      `)
      .eq('is_overdue', true)
      .order('expected_return_at', { ascending: true })
      .limit(10);

    // Get location utilization
    const { data: locationUtilization } = await supabase
      .from('asset_locations')
      .select(`
        id,
        name,
        capacity,
        current_count
      `)
      .eq('is_active', true);

    const utilization = locationUtilization?.map(loc => ({
      location_id: loc.id,
      location_name: loc.name,
      capacity: loc.capacity || 0,
      current_count: loc.current_count || 0,
      utilization_percentage: loc.capacity ? (loc.current_count || 0) / loc.capacity * 100 : 0
    })) || [];

    return {
      total_items: totalItems || 0,
      tracked_items: trackedItems || 0,
      assigned_items: assignedItems || 0,
      overdue_items: overdueItems || 0,
      total_locations: totalLocations || 0,
      active_locations: activeLocations || 0,
      recent_movements: recentMovements || [],
      overdue_assignments: overdueAssignments || [],
      location_utilization: utilization
    };
  }

  // Utility Methods
  async getItemsByLocation(locationId: string): Promise<InventoryItem[]> {
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        current_assignment:asset_assignments(id, status, assigned_to_type, assigned_to_id)
      `)
      .eq('current_location_id', locationId);

    if (error) {
      throw new Error(`Failed to get items by location: ${error.message}`);
    }

    return items || [];
  }

  async getItemsByAssignment(assignedToType: AssignmentType, assignedToId: string): Promise<InventoryItem[]> {
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        current_assignment:asset_assignments!inventory_items_current_assignment_id_fkey(*)
      `)
      .eq('current_assignment.assigned_to_type', assignedToType)
      .eq('current_assignment.assigned_to_id', assignedToId);

    if (error) {
      throw new Error(`Failed to get items by assignment: ${error.message}`);
    }

    return items || [];
  }

  async transferItem(inventoryItemId: string, toLocationId: string, reason?: string): Promise<AssetMovement> {
    // Get current location
    const { data: currentItem } = await supabase
      .from('inventory_items')
      .select('current_location_id')
      .eq('id', inventoryItemId)
      .single();

    // Create movement record
    const movementData = {
      inventory_item_id: inventoryItemId,
      from_location_id: currentItem?.current_location_id,
      to_location_id: toLocationId,
      movement_type: 'transfer',
      movement_reason: reason || 'Manual transfer',
      moved_at: new Date().toISOString()
    };

    const { data: movement, error } = await supabase
      .from('asset_movements')
      .insert([movementData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to transfer item: ${error.message}`);
    }

    // Update inventory item location
    await supabase
      .from('inventory_items')
      .update({ current_location_id: toLocationId })
      .eq('id', inventoryItemId);

    return movement;
  }
}

export const assetTrackingService = new AssetTrackingService(); 