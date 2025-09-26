import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  InventorySharing,
  InventorySharingConnection,
  InventorySharingRequest,
  InventorySharingAnalytics,
  SharedInventoryItem,
  InventorySharingSettings,
  ConnectionSharingSettings,
  CreateSharingRequest,
  UpdateSharingRequest,
  SharedInventoryFilters,
  SharedInventorySearchParams,
  InventorySharingStats,
  SharingAnalyticsSummary,
  VisibilityLevel,
  PricingTier,
  ConnectionType,
  RequestType,
  RequestStatus
} from '@/types/inventory-sharing'

// =====================================================
// INVENTORY SHARING SERVICE
// =====================================================

export class InventorySharingService {
  private supabase: any

  constructor() {
    this.supabase = null
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createSupabaseServerClient()
    }
    return this.supabase
  }

  // =====================================================
  // INVENTORY SHARING MANAGEMENT
  // =====================================================

  async createInventorySharing(settings: InventorySharingSettings): Promise<InventorySharing> {
    try {
      const supabase = await this.getSupabase()
      
      const { data, error } = await supabase
        .from('inventory_sharing')
        .insert({
          inventory_id: settings.inventory_id,
          owner_id: (settings as any).owner_id,
          is_shared: settings.is_shared,
          visibility_level: settings.visibility_level,
          show_pricing: settings.show_pricing,
          pricing_tier: settings.pricing_tier,
          b2b_enabled: settings.b2b_enabled,
          b2b_minimum_order: settings.b2b_minimum_order,
          b2b_payment_terms: settings.b2b_payment_terms,
          b2b_shipping_terms: settings.b2b_shipping_terms,
          sharing_notes: settings.sharing_notes
        })
        .select()
        .single()

      if (error) throw error
      return this.mapDatabaseToInventorySharing(data)
    } catch (error) {
      console.error('Error creating inventory sharing:', error)
      throw new Error(`Failed to create inventory sharing: ${error instanceof Error ? error instanceof Error ? error.message : 'Unknown error' : 'Unknown error'}`)
    }
  }

  async updateInventorySharing(id: string, settings: Partial<InventorySharingSettings>): Promise<InventorySharing> {
    try {
      const supabase = await this.getSupabase()
      
      const { data, error } = await supabase
        .from('inventory_sharing')
        .update(settings)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return this.mapDatabaseToInventorySharing(data)
    } catch (error) {
      console.error('Error updating inventory sharing:', error)
      throw new Error(`Failed to update inventory sharing: ${error instanceof Error ? error instanceof Error ? error.message : 'Unknown error' : 'Unknown error'}`)
    }
  }

  async getInventorySharing(inventoryId: string, ownerId: string): Promise<InventorySharing | null> {
    try {
      const supabase = await this.getSupabase()
      
      const { data, error } = await supabase
        .from('inventory_sharing')
        .select(`
          *,
          inventory:inventory(*),
          owner:users!inventory_sharing_owner_id_fkey(*)
        `)
        .eq('inventory_id', inventoryId)
        .eq('owner_id', ownerId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? this.mapDatabaseToInventorySharing(data) : null
    } catch (error) {
      console.error('Error getting inventory sharing:', error)
      throw new Error(`Failed to get inventory sharing: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getInventorySharingById(id: string): Promise<InventorySharing | null> {
    try {
      const supabase = await this.getSupabase()
      
      const { data, error } = await supabase
        .from('inventory_sharing')
        .select(`
          *,
          inventory:inventory(*),
          owner:users!inventory_sharing_owner_id_fkey(*)
        `)
        .eq('id', id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? this.mapDatabaseToInventorySharing(data) : null
    } catch (error) {
      console.error('Error getting inventory sharing by ID:', error)
      throw new Error(`Failed to get inventory sharing: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteInventorySharing(id: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      const { error } = await supabase
        .from('inventory_sharing')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting inventory sharing:', error)
      throw new Error(`Failed to delete inventory sharing: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // =====================================================
  // CONNECTION MANAGEMENT
  // =====================================================

  async addConnection(settings: ConnectionSharingSettings): Promise<InventorySharingConnection> {
    try {
      const supabase = await this.getSupabase()
      
      const { data, error } = await supabase
        .from('inventory_sharing_connections')
        .insert({
          sharing_id: settings.sharing_id,
          viewer_id: settings.viewer_id,
          connection_type: settings.connection_type,
          can_view_pricing: settings.can_view_pricing,
          can_view_quantity: settings.can_view_quantity,
          can_request_quote: settings.can_request_quote,
          can_place_order: settings.can_place_order,
          custom_price: settings.custom_price,
          custom_discount_percent: settings.custom_discount_percent
        })
        .select()
        .single()

      if (error) throw error
      return this.mapDatabaseToConnection(data)
    } catch (error) {
      console.error('Error adding connection:', error)
      throw new Error(`Failed to add connection: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateConnection(id: string, settings: Partial<ConnectionSharingSettings>): Promise<InventorySharingConnection> {
    try {
      const supabase = await this.getSupabase()
      
      const { data, error } = await supabase
        .from('inventory_sharing_connections')
        .update(settings)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return this.mapDatabaseToConnection(data)
    } catch (error) {
      console.error('Error updating connection:', error)
      throw new Error(`Failed to update connection: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async removeConnection(id: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      const { error } = await supabase
        .from('inventory_sharing_connections')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error removing connection:', error)
      throw new Error(`Failed to remove connection: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getConnections(sharingId: string): Promise<InventorySharingConnection[]> {
    try {
      const supabase = await this.getSupabase()
      
      const { data, error } = await supabase
        .from('inventory_sharing_connections')
        .select(`
          *,
          viewer:users!inventory_sharing_connections_viewer_id_fkey(*)
        `)
        .eq('sharing_id', sharingId)

      if (error) throw error
      return (data || []).map((item: any) => this.mapDatabaseToConnection(item))
    } catch (error) {
      console.error('Error getting connections:', error)
      throw new Error(`Failed to get connections: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // =====================================================
  // REQUEST MANAGEMENT
  // =====================================================

  async createRequest(request: CreateSharingRequest, requesterId: string): Promise<InventorySharingRequest> {
    try {
      const supabase = await this.getSupabase()
      
      // Get the inventory sharing record to find the owner
      const sharing = await this.getInventorySharing(request.inventory_id, requesterId)
      if (!sharing) {
        throw new Error('Inventory sharing not found')
      }

      const { data, error } = await supabase
        .from('inventory_sharing_requests')
        .insert({
          requester_id: requesterId,
          owner_id: sharing.owner_id,
          inventory_id: request.inventory_id,
          request_type: request.request_type,
          message: request.message,
          requested_quantity: request.requested_quantity,
          requested_price: request.requested_price,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .select()
        .single()

      if (error) throw error
      return this.mapDatabaseToRequest(data)
    } catch (error) {
      console.error('Error creating request:', error)
      throw new Error(`Failed to create request: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateRequest(id: string, update: UpdateSharingRequest): Promise<InventorySharingRequest> {
    try {
      const supabase = await this.getSupabase()
      
      const { data, error } = await supabase
        .from('inventory_sharing_requests')
        .update(update)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return this.mapDatabaseToRequest(data)
    } catch (error) {
      console.error('Error updating request:', error)
      throw new Error(`Failed to update request: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getRequests(userId: string, type: 'sent' | 'received'): Promise<InventorySharingRequest[]> {
    try {
      const supabase = await this.getSupabase()
      
      const query = type === 'sent' 
        ? supabase.from('inventory_sharing_requests').eq('requester_id', userId)
        : supabase.from('inventory_sharing_requests').eq('owner_id', userId)

      const { data, error } = await query
        .select(`
          *,
          requester:users!inventory_sharing_requests_requester_id_fkey(*),
          owner:users!inventory_sharing_requests_owner_id_fkey(*),
          inventory:inventory(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map((item: any) => this.mapDatabaseToRequest(item))
    } catch (error) {
      console.error('Error getting requests:', error)
      throw new Error(`Failed to get requests: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // =====================================================
  // SHARED INVENTORY SEARCH
  // =====================================================

  async searchSharedInventory(params: SharedInventorySearchParams, viewerId: string): Promise<{
    items: SharedInventoryItem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const supabase = await this.getSupabase()
      
      let query = supabase
        .from('shared_inventory_view')
        .select('*', { count: 'exact' })

      // Apply filters
      if (params.filters) {
        const { filters } = params
        
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
        }
        
        if (filters.category) {
          query = query.eq('category', filters.category)
        }
        
        if (filters.subcategory) {
          query = query.eq('subcategory', filters.subcategory)
        }
        
        if (filters.metal_type) {
          query = query.eq('metal_type', filters.metal_type)
        }
        
        if (filters.gemstone_type) {
          query = query.eq('gemstone_type', filters.gemstone_type)
        }
        
        if (filters.price_min !== undefined) {
          query = query.gte('price', filters.price_min)
        }
        
        if (filters.price_max !== undefined) {
          query = query.lte('price', filters.price_max)
        }
        
        if (filters.b2b_enabled !== undefined) {
          query = query.eq('b2b_enabled', filters.b2b_enabled)
        }
        
        if (filters.visibility_level) {
          query = query.eq('visibility_level', filters.visibility_level)
        }
      }

      // Apply sorting
      if (params.sort_by) {
        const sortOrder = params.sort_order || 'desc'
        query = query.order(params.sort_by, { ascending: sortOrder === 'asc' })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      const page = params.page || 1
      const limit = params.limit || 20
      const offset = (page - 1) * limit
      
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      const total = count || 0
      const totalPages = Math.ceil(total / limit)

      // Filter items based on viewer's permissions
      const items = await this.filterItemsByViewerPermissions(data || [], viewerId)

      return {
        items,
        total,
        page,
        totalPages
      }
    } catch (error) {
      console.error('Error searching shared inventory:', error)
      throw new Error(`Failed to search shared inventory: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // =====================================================
  // ANALYTICS
  // =====================================================

  async getSharingStats(ownerId: string): Promise<InventorySharingStats> {
    try {
      const supabase = await this.getSupabase()
      
      // Get basic stats
      const { data: analytics, error: analyticsError } = await supabase
        .from('inventory_sharing_analytics_summary')
        .select('*')
        .eq('owner_id', ownerId)

      if (analyticsError) throw analyticsError

      // Calculate totals
      const stats = {
        total_shared_items: analytics?.length || 0,
        total_viewers: 0,
        total_views: 0,
        total_quote_requests: 0,
        total_order_requests: 0,
        total_partnership_requests: 0,
        average_engagement_rate: 0,
        top_performing_items: [],
        recent_activity: []
      }

      if (analytics) {
        stats.total_viewers = analytics.reduce((sum: number, item: any) => sum + (item.total_viewers || 0), 0)
        stats.total_views = analytics.reduce((sum: number, item: any) => sum + (item.total_views || 0), 0)
        stats.total_quote_requests = analytics.reduce((sum: number, item: any) => sum + (item.total_quote_requests || 0), 0)
        stats.total_order_requests = analytics.reduce((sum: number, item: any) => sum + (item.total_order_requests || 0), 0)
        
        // Calculate engagement rate
        const totalItems = stats.total_shared_items
        if (totalItems > 0) {
          stats.average_engagement_rate = (stats.total_views / totalItems) / Math.max(stats.total_viewers, 1)
        }

        // Get top performing items
        stats.top_performing_items = analytics
          .sort((a: any, b: any) => (b.total_views || 0) - (a.total_views || 0))
          .slice(0, 5)
          .map((item: any) => ({
            id: item.inventory_id,
            name: item.inventory_name,
            total_views: item.total_views || 0,
            total_quote_requests: item.total_quote_requests || 0,
            total_order_requests: item.total_order_requests || 0
          }))
      }

      // Get recent activity
      const { data: recentRequests, error: requestsError } = await supabase
        .from('inventory_sharing_requests')
        .select(`
          *,
          requester:users!inventory_sharing_requests_requester_id_fkey(*),
          inventory:inventory(*)
        `)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!requestsError && recentRequests) {
        stats.recent_activity = recentRequests.map((item: any) => this.mapDatabaseToRequest(item))
      }

      return stats
    } catch (error) {
      console.error('Error getting sharing stats:', error)
      throw new Error(`Failed to get sharing stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async trackInventoryView(sharingId: string, viewerId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      // Call the database function to track the view
      const { error } = await supabase.rpc('track_inventory_view', {
        sharing_id: sharingId,
        viewer_id: viewerId
      })

      if (error) throw error
    } catch (error) {
      console.error('Error tracking inventory view:', error)
      // Don't throw error for tracking failures
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private async filterItemsByViewerPermissions(items: any[], viewerId: string): Promise<SharedInventoryItem[]> {
    try {
      const supabase = await this.getSupabase()
      
      // Get viewer's connections to determine permissions
      const { data: connections, error } = await supabase
        .from('inventory_sharing_connections')
        .select('*')
        .eq('viewer_id', viewerId)

      if (error) throw error

      const connectionMap = new Map(
        connections?.map((conn: any) => [conn.sharing_id, conn]) || []
      )

      return items.map(item => {
        const connection = connectionMap.get(item.id)
        const isVisible = this.isItemVisibleToViewer(item, viewerId, connection)
        
        if (!isVisible) return null

        return {
          ...item,
          is_visible_to_viewer: true,
          can_view_pricing: (connection as any)?.can_view_pricing ?? item.show_pricing,
          can_view_quantity: (connection as any)?.can_view_quantity ?? true,
          can_request_quote: (connection as any)?.can_request_quote ?? true,
          can_place_order: (connection as any)?.can_place_order ?? false,
          custom_price: (connection as any)?.custom_price,
          custom_discount_percent: (connection as any)?.custom_discount_percent
        }
      }).filter(Boolean) as SharedInventoryItem[]
    } catch (error) {
      console.error('Error filtering items by permissions:', error)
      return items
    }
  }

  private isItemVisibleToViewer(item: any, viewerId: string, connection?: any): boolean {
    // If item is not shared, it's not visible
    if (!item.is_shared) return false

    // If viewer is the owner, they can see everything
    if (item.owner_id === viewerId) return true

    // Check visibility level
    switch (item.visibility_level) {
      case 'public':
        return true
      case 'connections_only':
        return !!connection
      case 'specific_connections':
        return !!connection
      case 'private':
      default:
        return false
    }
  }

  // =====================================================
  // DATABASE MAPPING METHODS
  // =====================================================

  private mapDatabaseToInventorySharing(data: any): InventorySharing {
    return {
      id: data.id,
      inventory_id: data.inventory_id,
      owner_id: data.owner_id,
      is_shared: data.is_shared,
      visibility_level: data.visibility_level,
      show_pricing: data.show_pricing,
      pricing_tier: data.pricing_tier,
      b2b_enabled: data.b2b_enabled,
      b2b_minimum_order: data.b2b_minimum_order,
      b2b_payment_terms: data.b2b_payment_terms,
      b2b_shipping_terms: data.b2b_shipping_terms,
      sharing_notes: data.sharing_notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
      inventory: data.inventory ? this.mapDatabaseToSharedInventoryItem(data.inventory) : undefined,
      owner: data.owner ? this.mapDatabaseToUserProfile(data.owner) : undefined
    }
  }

  private mapDatabaseToConnection(data: any): InventorySharingConnection {
    return {
      id: data.id,
      sharing_id: data.sharing_id,
      viewer_id: data.viewer_id,
      connection_type: data.connection_type,
      can_view_pricing: data.can_view_pricing,
      can_view_quantity: data.can_view_quantity,
      can_request_quote: data.can_request_quote,
      can_place_order: data.can_place_order,
      custom_price: data.custom_price,
      custom_discount_percent: data.custom_discount_percent,
      created_at: data.created_at,
      updated_at: data.updated_at,
      viewer: data.viewer ? this.mapDatabaseToUserProfile(data.viewer) : undefined
    }
  }

  private mapDatabaseToRequest(data: any): InventorySharingRequest {
    return {
      id: data.id,
      requester_id: data.requester_id,
      owner_id: data.owner_id,
      inventory_id: data.inventory_id,
      request_type: data.request_type,
      status: data.status,
      message: data.message,
      requested_quantity: data.requested_quantity,
      requested_price: data.requested_price,
      response_message: data.response_message,
      response_price: data.response_price,
      response_quantity: data.response_quantity,
      expires_at: data.expires_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
      requester: data.requester ? this.mapDatabaseToUserProfile(data.requester) : undefined,
      owner: data.owner ? this.mapDatabaseToUserProfile(data.owner) : undefined,
      inventory: data.inventory ? this.mapDatabaseToSharedInventoryItem(data.inventory) : undefined
    }
  }

  private mapDatabaseToSharedInventoryItem(data: any): SharedInventoryItem {
    return {
      id: data.id,
      sku: data.sku,
      name: data.name,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      price: data.price,
      cost: data.cost,
      quantity: data.quantity,
      metal_type: data.metal_type,
      metal_purity: data.metal_purity,
      weight_grams: data.weight_grams,
      gemstone_type: data.gemstone_type,
      gemstone_carat: data.gemstone_carat,
      gemstone_quality: data.gemstone_quality,
      brand: data.brand,
      photo_urls: data.photo_urls || [],
      specifications: data.specifications,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  }

  private mapDatabaseToUserProfile(data: any): any {
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      company: data.company,
      avatar_url: data.avatar_url,
      location: data.location,
      specialties: data.specialties,
      rating: data.rating,
      review_count: data.review_count,
      is_online: data.is_online,
      last_seen: data.last_seen
    }
  }

  // =====================================================
  // METHOD ALIASES FOR BACKWARD COMPATIBILITY
  // =====================================================

  async getInventorySharingStats(ownerId: string): Promise<InventorySharingStats> {
    return this.getSharingStats(ownerId)
  }

  async createInventorySharingRequest(request: CreateSharingRequest, requesterId: string): Promise<InventorySharingRequest> {
    return this.createRequest(request, requesterId)
  }

  async updateInventorySharingRequest(id: string, update: UpdateSharingRequest): Promise<InventorySharingRequest> {
    return this.updateRequest(id, update)
  }

  async getInventorySharingRequests(userId: string, type?: 'sent' | 'received'): Promise<InventorySharingRequest[]> {
    return this.getRequests(userId, type || 'sent')
  }

  async createInventorySharingConnection(settings: ConnectionSharingSettings): Promise<InventorySharingConnection> {
    return this.addConnection(settings)
  }

  async updateInventorySharingConnection(id: string, settings: Partial<ConnectionSharingSettings>): Promise<InventorySharingConnection> {
    return this.updateConnection(id, settings)
  }

  async deleteInventorySharingConnection(id: string): Promise<void> {
    return this.removeConnection(id)
  }

  async getInventorySharingConnections(sharingId: string): Promise<InventorySharingConnection[]> {
    return this.getConnections(sharingId)
  }
}
