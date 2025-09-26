// =====================================================
// INVENTORY SHARING SYSTEM TYPES
// =====================================================

export type VisibilityLevel = 'private' | 'public' | 'connections_only' | 'specific_connections';
export type PricingTier = 'wholesale' | 'retail' | 'negotiable' | 'hidden';
export type ConnectionType = 'connection' | 'partner' | 'customer' | 'vendor';
export type RequestType = 'view' | 'quote' | 'order' | 'partnership';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'expired';

// =====================================================
// CORE INVENTORY SHARING INTERFACES
// =====================================================

export interface InventorySharing {
  id: string;
  inventory_id: string;
  owner_id: string;
  
  // Sharing settings
  is_shared: boolean;
  visibility_level: VisibilityLevel;
  
  // Pricing visibility
  show_pricing: boolean;
  pricing_tier: PricingTier;
  
  // B2B specific options
  b2b_enabled: boolean;
  b2b_minimum_order?: number;
  b2b_payment_terms?: string;
  b2b_shipping_terms?: string;
  
  // Metadata
  sharing_notes?: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  inventory?: SharedInventoryItem;
  owner?: UserProfile;
  connections?: InventorySharingConnection[];
  analytics?: InventorySharingAnalytics;
}

export interface InventorySharingConnection {
  id: string;
  sharing_id: string;
  viewer_id: string;
  
  // Connection type
  connection_type: ConnectionType;
  
  // Visibility permissions
  can_view_pricing: boolean;
  can_view_quantity: boolean;
  can_request_quote: boolean;
  can_place_order: boolean;
  
  // Custom pricing for this connection
  custom_price?: number;
  custom_discount_percent?: number;
  
  created_at: string;
  updated_at: string;
  
  // Computed fields
  viewer?: UserProfile;
  sharing?: InventorySharing;
}

export interface InventorySharingRequest {
  id: string;
  requester_id: string;
  owner_id: string;
  inventory_id: string;
  
  // Request details
  request_type: RequestType;
  status: RequestStatus;
  
  // Request message
  message?: string;
  requested_quantity?: number;
  requested_price?: number;
  
  // Response
  response_message?: string;
  response_price?: number;
  response_quantity?: number;
  
  expires_at?: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  requester?: UserProfile;
  owner?: UserProfile;
  inventory?: SharedInventoryItem;
}

export interface InventorySharingAnalytics {
  id: string;
  sharing_id: string;
  viewer_id: string;
  
  // View metrics
  view_count: number;
  last_viewed_at?: string;
  
  // Interaction metrics
  quote_requests: number;
  order_requests: number;
  partnership_requests: number;
  
  // Engagement metrics
  time_spent_seconds: number;
  shared_with_others: number;
  
  created_at: string;
  updated_at: string;
  
  // Computed fields
  viewer?: UserProfile;
  sharing?: InventorySharing;
}

// =====================================================
// SHARED INVENTORY ITEM INTERFACE
// =====================================================

export interface SharedInventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  cost: number;
  quantity: number;
  metal_type?: string;
  metal_purity?: string;
  weight_grams?: number;
  gemstone_type?: string;
  gemstone_carat?: number;
  gemstone_quality?: string;
  brand?: string;
  photo_urls: string[];
  specifications?: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
  
  // Sharing-specific fields
  sharing?: InventorySharing;
  is_visible_to_viewer?: boolean;
  can_view_pricing?: boolean;
  can_view_quantity?: boolean;
  can_request_quote?: boolean;
  can_place_order?: boolean;
  custom_price?: number;
  custom_discount_percent?: number;
}

// =====================================================
// USER PROFILE INTERFACE
// =====================================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company?: string;
  avatar_url?: string;
  location?: string;
  specialties?: string[];
  rating?: number;
  review_count?: number;
  is_online?: boolean;
  last_seen?: string;
}

// =====================================================
// SHARING SETTINGS INTERFACES
// =====================================================

export interface InventorySharingSettings {
  inventory_id: string;
  is_shared: boolean;
  visibility_level: VisibilityLevel;
  show_pricing: boolean;
  show_quantity: boolean;
  pricing_tier: PricingTier;
  b2b_enabled: boolean;
  b2b_minimum_order?: number;
  b2b_minimum_order_amount?: number;
  b2b_payment_terms?: string;
  b2b_shipping_terms?: string;
  allow_quote_requests: boolean;
  allow_order_requests: boolean;
  sharing_notes?: string;
}

export interface ConnectionSharingSettings {
  sharing_id: string;
  viewer_id: string;
  connection_type: ConnectionType;
  can_view_pricing: boolean;
  can_view_quantity: boolean;
  can_request_quote: boolean;
  can_place_order: boolean;
  custom_price?: number;
  custom_discount_percent?: number;
}

// =====================================================
// REQUEST INTERFACES
// =====================================================

export interface CreateSharingRequest {
  inventory_id: string;
  request_type: RequestType;
  message?: string;
  requested_quantity?: number;
  requested_price?: number;
}

export interface UpdateSharingRequest {
  status: RequestStatus;
  response_message?: string;
  response_price?: number;
  response_quantity?: number;
}

// =====================================================
// SEARCH AND FILTER INTERFACES
// =====================================================

export interface SharedInventoryFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  metal_type?: string;
  gemstone_type?: string;
  price_min?: number;
  price_max?: number;
  weight_min?: number;
  weight_max?: number;
  brand?: string;
  owner_id?: string;
  b2b_enabled?: boolean;
  show_pricing?: boolean;
  visibility_level?: VisibilityLevel;
}

export interface SharedInventorySearchParams {
  query?: string;
  filters?: SharedInventoryFilters;
  sort_by?: 'name' | 'price' | 'created_at' | 'rating' | 'popularity';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// =====================================================
// ANALYTICS INTERFACES
// =====================================================

export interface InventorySharingStats {
  total_shared_items: number;
  total_viewers: number;
  total_views: number;
  total_quote_requests: number;
  total_order_requests: number;
  total_partnership_requests: number;
  average_engagement_rate: number;
  top_performing_items: SharedInventoryItemWithAnalytics[];
  recent_activity: InventorySharingRequest[];
}

export interface SharedInventoryItemWithAnalytics extends SharedInventoryItem {
  total_views: number;
  total_quote_requests: number;
  total_order_requests: number;
  engagement_rate: number;
}

export interface SharingAnalyticsSummary {
  inventory_id: string;
  inventory_name: string;
  owner_id: string;
  owner_name: string;
  total_viewers: number;
  total_views: number;
  total_quote_requests: number;
  total_order_requests: number;
  last_activity?: string;
}

// =====================================================
// B2B SPECIFIC INTERFACES
// =====================================================

export interface B2BSharingSettings {
  b2b_enabled: boolean;
  minimum_order_amount?: number;
  payment_terms?: string;
  shipping_terms?: string;
  bulk_discounts?: BulkDiscount[];
  wholesale_pricing?: WholesalePricing[];
}

export interface BulkDiscount {
  quantity_min: number;
  quantity_max: number;
  discount_percent: number;
  applies_to: 'all' | 'specific_categories' | 'specific_items';
  category_ids?: string[];
  item_ids?: string[];
}

export interface WholesalePricing {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  minimum_order_amount: number;
  discount_percent: number;
  payment_terms: string;
  shipping_terms: string;
}

// =====================================================
// NOTIFICATION INTERFACES
// =====================================================

export interface SharingNotification {
  id: string;
  user_id: string;
  type: 'new_request' | 'request_approved' | 'request_rejected' | 'new_viewer' | 'inventory_shared';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

// =====================================================
// API RESPONSE INTERFACES
// =====================================================

export interface InventorySharingResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type InventorySharingWithDetails = InventorySharing & {
  inventory: SharedInventoryItem;
  owner: UserProfile;
  connections: InventorySharingConnection[];
  analytics: InventorySharingAnalytics;
};

export type SharedInventoryWithSharing = SharedInventoryItem & {
  sharing: InventorySharing;
  owner: UserProfile;
};

export type ConnectionWithDetails = InventorySharingConnection & {
  viewer: UserProfile;
  sharing: InventorySharing;
};
