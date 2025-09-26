// Materials Tracking System Types
// Comprehensive type definitions for materials management, supplier tracking, and cost analysis

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface MaterialCategory {
  id: string;
  name: string;
  description?: string;
  color?: string; // Hex color for UI
  icon?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  
  // Related data
  material_types?: MaterialType[];
}

export interface MaterialType {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  unit_of_measure: string; // grams, carats, pieces, etc.
  density?: number; // g/cm³ for metals
  hardness?: number; // Mohs scale for gems
  melting_point?: number; // Celsius for metals
  color?: string;
  finish_options?: string[]; // Array of available finishes
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Related data
  category?: MaterialCategory;
  materials?: Material[];
}

export interface MaterialSupplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  payment_terms?: string;
  credit_limit?: number;
  quality_rating?: number; // 0.00 to 5.00
  reliability_rating?: number; // 0.00 to 5.00
  certifications?: string[]; // Array of certifications
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Related data
  materials?: Material[];
  purchase_orders?: MaterialPurchaseOrder[];
}

export interface Material {
  id: string;
  material_type_id: string;
  supplier_id?: string;
  
  // Basic information
  name: string;
  description?: string;
  sku?: string;
  lot_number?: string;
  certificate_number?: string;
  
  // Specifications
  weight?: number; // in grams
  dimensions?: string; // JSON or text description
  color?: string;
  finish?: string;
  purity?: number; // percentage for metals
  clarity?: string; // for gems
  cut?: string; // for gems
  
  // Inventory management
  current_stock: number;
  minimum_stock: number;
  reorder_point: number;
  reorder_quantity: number;
  location?: string;
  
  // Cost information
  unit_cost: number;
  currency: string;
  markup_percentage: number;
  selling_price?: number;
  
  // Status and tracking
  status: MaterialStatus;
  condition: MaterialCondition;
  expiry_date?: string;
  last_audit_date?: string;
  
  // Metadata
  tags?: string[];
  images?: string[]; // Array of image URLs
  documents?: string[]; // Array of document URLs
  notes?: string;
  
  created_at: string;
  updated_at: string;
  
  // Related data
  material_type?: MaterialType;
  supplier?: MaterialSupplier;
  usage_records?: MaterialUsage[];
  movements?: MaterialMovement[];
  cost_history?: MaterialCostHistory[];
  purchase_order_items?: MaterialPurchaseOrderItem[];
}

export interface MaterialPurchaseOrder {
  id: string;
  supplier_id: string;
  order_number: string;
  
  // Order details
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status: PurchaseOrderStatus;
  
  // Financial information
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  
  // Shipping information
  shipping_address?: string;
  shipping_method?: string;
  tracking_number?: string;
  
  // Notes and approval
  notes?: string;
  approved_by?: string; // Reference to users table
  approved_at?: string;
  
  created_at: string;
  updated_at: string;
  
  // Related data
  supplier?: MaterialSupplier;
  items?: MaterialPurchaseOrderItem[];
}

export interface MaterialPurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  material_id: string;
  
  // Item details
  quantity: number;
  unit_cost: number;
  total_cost: number;
  
  // Receiving information
  received_quantity: number;
  received_date?: string;
  quality_check_passed?: boolean;
  quality_notes?: string;
  
  // Status
  status: PurchaseOrderItemStatus;
  
  created_at: string;
  updated_at: string;
  
  // Related data
  purchase_order?: MaterialPurchaseOrder;
  material?: Material;
}

export interface MaterialUsage {
  id: string;
  material_id: string;
  production_item_id?: string; // Reference to production items (flexible)
  order_id?: string; // Reference to orders (flexible)
  project_id?: string; // Project identifier
  
  // Usage details
  quantity_used: number;
  quantity_waste: number;
  total_quantity: number; // used + waste
  
  // Cost information
  unit_cost_at_time: number;
  total_cost: number;
  waste_cost: number;
  
  // Usage context
  usage_type: UsageType;
  usage_notes?: string;
  
  // Tracking
  used_by?: string; // Reference to users table
  used_at: string;
  
  created_at: string;
  updated_at: string;
  
  // Related data
  material?: Material;
}

export interface MaterialMovement {
  id: string;
  material_id: string;
  
  // Movement details
  movement_type: MovementType;
  quantity: number;
  from_location?: string;
  to_location?: string;
  
  // Reference information
  reference_type?: string; // purchase_order, usage, transfer, adjustment
  reference_id?: string; // ID of the referenced record
  
  // Cost impact
  unit_cost?: number;
  total_cost?: number;
  
  // Notes and approval
  notes?: string;
  approved_by?: string; // Reference to users table
  approved_at?: string;
  
  // Tracking
  moved_by?: string; // Reference to users table
  moved_at: string;
  
  created_at: string;
  updated_at: string;
  
  // Related data
  material?: Material;
}

export interface MaterialCostHistory {
  id: string;
  material_id: string;
  supplier_id?: string;
  
  // Cost information
  unit_cost: number;
  currency: string;
  effective_date: string;
  
  // Context
  source: CostHistorySource;
  reference_id?: string; // ID of the source record
  
  // Market data
  market_price?: number;
  price_change_percentage?: number;
  
  created_at: string;
  
  // Related data
  material?: Material;
  supplier?: MaterialSupplier;
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface MaterialSpecifications {
  weight?: number;
  dimensions?: string;
  color?: string;
  finish?: string;
  purity?: number;
  clarity?: string;
  cut?: string;
}

export interface MaterialInventory {
  current_stock: number;
  minimum_stock: number;
  reorder_point: number;
  reorder_quantity: number;
  location?: string;
}

export interface MaterialCosts {
  unit_cost: number;
  currency: string;
  markup_percentage: number;
  selling_price?: number;
}

export interface SupplierContact {
  contact_person?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export interface SupplierRatings {
  quality_rating?: number;
  reliability_rating?: number;
  certifications?: string[];
}

// ============================================================================
// REQUEST INTERFACES
// ============================================================================

export interface CreateMaterialCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

export interface UpdateMaterialCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface CreateMaterialTypeRequest {
  category_id: string;
  name: string;
  description?: string;
  unit_of_measure: string;
  density?: number;
  hardness?: number;
  melting_point?: number;
  color?: string;
  finish_options?: string[];
}

export interface UpdateMaterialTypeRequest {
  category_id?: string;
  name?: string;
  description?: string;
  unit_of_measure?: string;
  density?: number;
  hardness?: number;
  melting_point?: number;
  color?: string;
  finish_options?: string[];
  is_active?: boolean;
}

export interface CreateMaterialSupplierRequest {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  payment_terms?: string;
  credit_limit?: number;
  quality_rating?: number;
  reliability_rating?: number;
  certifications?: string[];
  notes?: string;
}

export interface UpdateMaterialSupplierRequest {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  payment_terms?: string;
  credit_limit?: number;
  quality_rating?: number;
  reliability_rating?: number;
  certifications?: string[];
  notes?: string;
  is_active?: boolean;
}

export interface CreateMaterialRequest {
  material_type_id: string;
  supplier_id?: string;
  name: string;
  description?: string;
  sku?: string;
  lot_number?: string;
  certificate_number?: string;
  specifications?: MaterialSpecifications;
  inventory?: MaterialInventory;
  costs?: MaterialCosts;
  status?: MaterialStatus;
  condition?: MaterialCondition;
  expiry_date?: string;
  tags?: string[];
  images?: string[];
  documents?: string[];
  notes?: string;
}

export interface UpdateMaterialRequest {
  material_type_id?: string;
  supplier_id?: string;
  name?: string;
  description?: string;
  sku?: string;
  lot_number?: string;
  certificate_number?: string;
  specifications?: MaterialSpecifications;
  inventory?: MaterialInventory;
  costs?: MaterialCosts;
  status?: MaterialStatus;
  condition?: MaterialCondition;
  expiry_date?: string;
  tags?: string[];
  images?: string[];
  documents?: string[];
  notes?: string;
}

export interface CreatePurchaseOrderRequest {
  supplier_id: string;
  order_number: string;
  order_date: string;
  expected_delivery_date?: string;
  subtotal?: number;
  tax_amount?: number;
  shipping_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  currency?: string;
  shipping_address?: string;
  shipping_method?: string;
  tracking_number?: string;
  notes?: string;
  items: CreatePurchaseOrderItemRequest[];
}

export interface CreatePurchaseOrderItemRequest {
  material_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

export interface UpdatePurchaseOrderRequest {
  supplier_id?: string;
  order_date?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status?: PurchaseOrderStatus;
  subtotal?: number;
  tax_amount?: number;
  shipping_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  currency?: string;
  shipping_address?: string;
  shipping_method?: string;
  tracking_number?: string;
  notes?: string;
  approved_by?: string;
}

export interface CreateMaterialUsageRequest {
  material_id: string;
  production_item_id?: string;
  order_id?: string;
  project_id?: string;
  quantity_used: number;
  quantity_waste?: number;
  unit_cost_at_time: number;
  usage_type?: UsageType;
  usage_notes?: string;
  used_by?: string;
}

export interface CreateMaterialMovementRequest {
  material_id: string;
  movement_type: MovementType;
  quantity: number;
  from_location?: string;
  to_location?: string;
  reference_type?: string;
  reference_id?: string;
  unit_cost?: number;
  total_cost?: number;
  notes?: string;
  approved_by?: string;
  moved_by?: string;
}

// ============================================================================
// FILTER AND SEARCH TYPES
// ============================================================================

export interface MaterialFilters {
  search?: string;
  category_id?: string;
  material_type_id?: string;
  supplier_id?: string;
  status?: MaterialStatus;
  condition?: MaterialCondition;
  location?: string;
  min_stock?: number;
  max_stock?: number;
  min_cost?: number;
  max_cost?: number;
  tags?: string[];
  created_after?: string;
  created_before?: string;
}

export interface SupplierFilters {
  search?: string;
  country?: string;
  min_quality_rating?: number;
  max_quality_rating?: number;
  min_reliability_rating?: number;
  max_reliability_rating?: number;
  is_active?: boolean;
  has_certifications?: boolean;
}

export interface PurchaseOrderFilters {
  supplier_id?: string;
  status?: PurchaseOrderStatus;
  order_date_after?: string;
  order_date_before?: string;
  delivery_date_after?: string;
  delivery_date_before?: string;
  min_total?: number;
  max_total?: number;
  approved_by?: string;
}

export interface UsageFilters {
  material_id?: string;
  production_item_id?: string;
  order_id?: string;
  project_id?: string;
  usage_type?: UsageType;
  used_by?: string;
  used_after?: string;
  used_before?: string;
  min_cost?: number;
  max_cost?: number;
}

export interface MovementFilters {
  material_id?: string;
  movement_type?: MovementType;
  reference_type?: string;
  reference_id?: string;
  from_location?: string;
  to_location?: string;
  moved_after?: string;
  moved_before?: string;
  moved_by?: string;
  approved_by?: string;
}

export interface CostHistoryFilters {
  material_id?: string;
  supplier_id?: string;
  source?: CostHistorySource;
  effective_date_after?: string;
  effective_date_before?: string;
  min_cost?: number;
  max_cost?: number;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface MaterialListResponse {
  data: Material[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  filters: MaterialFilters;
  categories: MaterialCategory[];
  suppliers: MaterialSupplier[];
  stats: MaterialStats;
}

export interface SupplierListResponse {
  data: MaterialSupplier[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  filters: SupplierFilters;
  stats: SupplierStats;
}

export interface PurchaseOrderListResponse {
  data: MaterialPurchaseOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  filters: PurchaseOrderFilters;
  suppliers: MaterialSupplier[];
  stats: PurchaseOrderStats;
}

export interface UsageListResponse {
  data: MaterialUsage[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  filters: UsageFilters;
  materials: Material[];
  stats: UsageStats;
}

export interface MaterialStats {
  total_materials: number;
  total_categories: number;
  total_suppliers: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_inventory_value: number;
  average_unit_cost: number;
}

export interface SupplierStats {
  total_suppliers: number;
  active_suppliers: number;
  average_quality_rating: number;
  average_reliability_rating: number;
  total_purchase_orders: number;
  total_spent: number;
}

export interface PurchaseOrderStats {
  total_orders: number;
  draft_orders: number;
  sent_orders: number;
  confirmed_orders: number;
  received_orders: number;
  cancelled_orders: number;
  total_value: number;
  average_order_value: number;
}

export interface UsageStats {
  total_usage_records: number;
  total_materials_used: number;
  total_cost: number;
  total_waste: number;
  waste_percentage: number;
  average_usage_per_record: number;
}

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export enum MaterialStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued'
}

export enum MaterialCondition {
  NEW = 'new',
  USED = 'used',
  DAMAGED = 'damaged'
}

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  CONFIRMED = 'confirmed',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

export enum PurchaseOrderItemStatus {
  ORDERED = 'ordered',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

export enum UsageType {
  PRODUCTION = 'production',
  REPAIR = 'repair',
  SAMPLE = 'sample',
  TESTING = 'testing'
}

export enum MovementType {
  IN = 'in',
  OUT = 'out',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  LOSS = 'loss'
}

export enum CostHistorySource {
  PURCHASE = 'purchase',
  ADJUSTMENT = 'adjustment',
  MARKET_UPDATE = 'market_update'
}

// ============================================================================
// CONSTANTS AND UTILITIES
// ============================================================================

export const MATERIAL_STATUS_OPTIONS: MaterialStatus[] = [
  MaterialStatus.ACTIVE,
  MaterialStatus.INACTIVE,
  MaterialStatus.DISCONTINUED
];

export const MATERIAL_CONDITION_OPTIONS: MaterialCondition[] = [
  MaterialCondition.NEW,
  MaterialCondition.USED,
  MaterialCondition.DAMAGED
];

export const PURCHASE_ORDER_STATUS_OPTIONS: PurchaseOrderStatus[] = [
  PurchaseOrderStatus.DRAFT,
  PurchaseOrderStatus.SENT,
  PurchaseOrderStatus.CONFIRMED,
  PurchaseOrderStatus.RECEIVED,
  PurchaseOrderStatus.CANCELLED
];

export const PURCHASE_ORDER_ITEM_STATUS_OPTIONS: PurchaseOrderItemStatus[] = [
  PurchaseOrderItemStatus.ORDERED,
  PurchaseOrderItemStatus.PARTIALLY_RECEIVED,
  PurchaseOrderItemStatus.RECEIVED,
  PurchaseOrderItemStatus.CANCELLED
];

export const USAGE_TYPE_OPTIONS: UsageType[] = [
  UsageType.PRODUCTION,
  UsageType.REPAIR,
  UsageType.SAMPLE,
  UsageType.TESTING
];

export const MOVEMENT_TYPE_OPTIONS: MovementType[] = [
  MovementType.IN,
  MovementType.OUT,
  MovementType.TRANSFER,
  MovementType.ADJUSTMENT,
  MovementType.LOSS
];

export const COST_HISTORY_SOURCE_OPTIONS: CostHistorySource[] = [
  CostHistorySource.PURCHASE,
  CostHistorySource.ADJUSTMENT,
  CostHistorySource.MARKET_UPDATE
];

// Common material categories
export const COMMON_MATERIAL_CATEGORIES = [
  'Metals',
  'Gemstones',
  'Findings',
  'Tools & Equipment',
  'Chemicals'
];

// Common units of measure
export const COMMON_UNITS_OF_MEASURE = [
  'grams',
  'carats',
  'pieces',
  'meters',
  'inches',
  'ounces',
  'pounds',
  'kilograms'
];

// Utility functions
export const calculateTotalCost = (quantity: number, unitCost: number): number => {
  return quantity * unitCost;
};

export const calculateWastePercentage = (quantityUsed: number, quantityWaste: number): number => {
  const total = quantityUsed + quantityWaste;
  return total > 0 ? (quantityWaste / total) * 100 : 0;
};

export const calculateMarkupPrice = (unitCost: number, markupPercentage: number): number => {
  return unitCost * (1 + markupPercentage / 100);
};

export const isLowStock = (currentStock: number, reorderPoint: number): boolean => {
  return currentStock <= reorderPoint;
};

export const isOutOfStock = (currentStock: number): boolean => {
  return currentStock <= 0;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatWeight = (weight: number, unit: string = 'grams'): string => {
  return `${weight.toFixed(2)} ${unit}`;
}; 