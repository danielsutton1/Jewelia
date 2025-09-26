// Asset Tracking System Types
// Comprehensive type definitions for asset tracking, location management, and movement history

export interface AssetLocation {
  id: string;
  name: string;
  description?: string;
  location_type: LocationType;
  parent_location_id?: string;
  address?: string;
  capacity?: number;
  current_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent_location?: AssetLocation;
  child_locations?: AssetLocation[];
}

export interface AssetMovement {
  id: string;
  inventory_item_id: string;
  from_location_id?: string;
  to_location_id?: string;
  from_assignment_id?: string;
  to_assignment_id?: string;
  moved_by?: string;
  movement_type: MovementType;
  movement_reason?: string;
  moved_at: string;
  expected_return_at?: string;
  actual_return_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  inventory_item?: InventoryItem;
  from_location?: AssetLocation;
  to_location?: AssetLocation;
  from_assignment?: AssetAssignment;
  to_assignment?: AssetAssignment;
  moved_by_user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface AssetAssignment {
  id: string;
  inventory_item_id: string;
  assigned_to?: string; // References users table
  assigned_by?: string; // References users table
  assignment_type: string; // work_order, repair, display, customer, staff, temporary
  assigned_to_type?: AssignmentType; // customer, staff, vendor, repair_shop, appraiser
  assigned_to_id?: string; // ID of the entity assigned to
  status: AssignmentStatus;
  assigned_at: string;
  expected_return_at?: string;
  actual_return_at?: string;
  notes?: string;
  is_overdue?: boolean; // Computed column
  created_at: string;
  updated_at: string;
  inventory_item?: InventoryItem;
  assigned_to_customer?: {
    id: string;
    full_name: string;
    email: string;
  };
  assigned_to_staff?: {
    id: string;
    full_name: string;
    email: string;
  };
  assigned_by_user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface InventoryItem {
  id: string;
  inventory_id?: string; // References inventory table
  sku: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  condition?: ItemCondition;
  status: ItemStatus;
  current_location_id?: string;
  current_assignment_id?: string; // References asset_assignments table
  assigned_to?: string; // References users table
  current_value?: number;
  purchase_price?: number;
  purchase_date?: string;
  warranty_expiry?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  is_tracked: boolean;
  tracking_number?: string;
  barcode?: string;
  rfid_tag?: string;
  dimensions?: string; // "LxWxH" format
  weight?: number;
  manufacturer?: string;
  model_number?: string;
  serial_number?: string;
  metadata?: any; // JSONB for additional flexible data
  created_at: string;
  updated_at: string;
  current_location?: AssetLocation;
  current_assignment?: AssetAssignment;
  movements?: AssetMovement[];
  assignments?: AssetAssignment[];
}

// Enums and Types
export type LocationType = 
  | 'store'
  | 'warehouse'
  | 'department'
  | 'section'
  | 'shelf'
  | 'display_case'
  | 'vault'
  | 'repair_shop'
  | 'offsite'
  | 'customer'
  | 'staff';

export type MovementType = 
  | 'transfer'
  | 'storage'
  | 'display'
  | 'repair'
  | 'shipping'
  | 'return'
  | 'checkout'
  | 'checkin';

export type AssignmentType = 
  | 'customer'
  | 'staff'
  | 'vendor'
  | 'repair_shop'
  | 'appraiser';

export type AssignmentStatus = 
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'overdue';

export type ItemCondition = 
  | 'new'
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor'
  | 'damaged';

export type ItemStatus = 
  | 'available'
  | 'in_use'
  | 'maintenance'
  | 'lost'
  | 'damaged'
  | 'retired';

// Request/Response Types
export interface CreateLocationRequest {
  name: string;
  description?: string;
  location_type: LocationType;
  parent_location_id?: string;
  address?: string;
  capacity?: number;
}

export interface UpdateLocationRequest {
  name?: string;
  description?: string;
  location_type?: LocationType;
  parent_location_id?: string;
  address?: string;
  capacity?: number;
  is_active?: boolean;
}

export interface CreateMovementRequest {
  inventory_item_id: string;
  from_location_id?: string;
  to_location_id?: string;
  from_assignment_id?: string;
  to_assignment_id?: string;
  movement_type: MovementType;
  movement_reason?: string;
  notes?: string;
  expected_return_at?: string;
}

export interface CreateAssignmentRequest {
  inventory_item_id: string;
  assigned_to_type: AssignmentType;
  assigned_to_id: string;
  expected_return_date?: string;
  notes?: string;
}

export interface UpdateAssignmentRequest {
  expected_return_date?: string;
  actual_return_date?: string;
  notes?: string;
}

export interface UpdateInventoryItemRequest {
  name?: string;
  description?: string;
  sku?: string;
  category?: string;
  subcategory?: string;
  condition?: ItemCondition;
  status?: ItemStatus;
  current_location_id?: string;
  current_assignment_id?: string;
  current_value?: number;
  purchase_price?: number;
  is_tracked?: boolean;
  tracking_number?: string;
  barcode?: string;
  rfid_tag?: string;
  dimensions?: string;
  weight?: number;
  manufacturer?: string;
  model_number?: string;
  serial_number?: string;
  metadata?: any;
}

// Filter Types
export interface LocationFilters {
  location_type?: LocationType;
  parent_location_id?: string;
  is_active?: boolean;
  search?: string;
}

export interface MovementFilters {
  inventory_item_id?: string;
  from_location_id?: string;
  to_location_id?: string;
  movement_type?: MovementType;
  moved_by?: string;
  date_from?: string;
  date_to?: string;
  is_overdue?: boolean;
}

export interface AssignmentFilters {
  inventory_item_id?: string;
  assigned_to_type?: AssignmentType;
  assigned_to_id?: string;
  status?: AssignmentStatus;
  assigned_by?: string;
  date_from?: string;
  date_to?: string;
  is_overdue?: boolean;
}

export interface InventoryFilters {
  category?: string;
  subcategory?: string;
  condition?: ItemCondition;
  status?: ItemStatus;
  current_location_id?: string;
  current_assignment_id?: string;
  is_tracked?: boolean;
  search?: string;
  min_value?: number;
  max_value?: number;
}

// Response Types
export interface LocationListResponse {
  success: boolean;
  data: AssetLocation[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface LocationDetailResponse {
  success: boolean;
  data: AssetLocation & {
    child_locations: AssetLocation[];
    inventory_items: InventoryItem[];
  };
}

export interface MovementListResponse {
  success: boolean;
  data: AssetMovement[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface AssignmentListResponse {
  success: boolean;
  data: AssetAssignment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface InventoryListResponse {
  success: boolean;
  data: InventoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// Analytics Types
export interface AssetTrackingAnalytics {
  total_items: number;
  tracked_items: number;
  assigned_items: number;
  overdue_items: number;
  total_locations: number;
  active_locations: number;
  recent_movements: AssetMovement[];
  overdue_assignments: AssetAssignment[];
  location_utilization: Array<{
    location_id: string;
    location_name: string;
    capacity: number;
    current_count: number;
    utilization_percentage: number;
  }>;
}

export interface AssetTrackingAnalyticsResponse {
  success: boolean;
  data: AssetTrackingAnalytics;
}

// Check-in/Check-out Types
export interface CheckOutRequest {
  inventory_item_id: string;
  to_location_id?: string;
  assigned_to_type?: AssignmentType;
  assigned_to_id?: string;
  expected_return_date?: string;
  reason?: string;
  notes?: string;
}

export interface CheckInRequest {
  inventory_item_id: string;
  from_location_id?: string;
  from_assignment_id?: string;
  to_location_id: string;
  actual_return_date?: string;
  condition_notes?: string;
  notes?: string;
}

// Bulk Operation Types
export interface BulkMovementRequest {
  inventory_item_ids: string[];
  movement_data: Omit<CreateMovementRequest, 'inventory_item_id'>;
}

export interface BulkAssignmentRequest {
  inventory_item_ids: string[];
  assignment_data: Omit<CreateAssignmentRequest, 'inventory_item_id'>;
}

// Extended Types for Detailed Views
export type LocationWithHierarchy = AssetLocation & {
  parent_location?: AssetLocation;
  child_locations: AssetLocation[];
  inventory_items: InventoryItem[];
};

export type MovementWithDetails = AssetMovement & {
  inventory_item: InventoryItem;
  from_location?: AssetLocation;
  to_location?: AssetLocation;
  moved_by_user: {
    id: string;
    full_name: string;
    email: string;
  };
};

export type AssignmentWithDetails = AssetAssignment & {
  inventory_item: InventoryItem;
  assigned_to_customer?: {
    id: string;
    full_name: string;
    email: string;
  };
  assigned_to_staff?: {
    id: string;
    full_name: string;
    email: string;
  };
};

// Error Types
export interface AssetTrackingError {
  code: string;
  message: string;
  details?: any;
}

export interface AssetTrackingErrorResponse {
  success: false;
  error: AssetTrackingError;
} 