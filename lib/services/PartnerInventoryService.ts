import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InventorySharingService } from './InventorySharingService'
import { NetworkService } from './NetworkService'

// =====================================================
// PARTNER INVENTORY INTEGRATION SERVICE
// =====================================================

export interface PartnerInventoryAccess {
  id: string
  partner_id: string
  requester_id: string
  inventory_id: string
  access_type: 'view' | 'quote' | 'order' | 'full'
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  message?: string
  response_message?: string
  permissions: {
    can_view_pricing: boolean
    can_view_quantity: boolean
    can_request_quote: boolean
    can_place_order: boolean
    custom_price?: number
    custom_discount_percent?: number
  }
  created_at: string
  updated_at: string
  partner?: any
  requester?: any
  inventory?: any
}

export interface PartnerInventoryRequest {
  partner_id: string
  inventory_id: string
  access_type: 'view' | 'quote' | 'order' | 'full'
  message?: string
}

export class PartnerInventoryService {
  private supabase: any
  private inventorySharingService: InventorySharingService
  private networkService: NetworkService

  constructor() {
    this.supabase = null
    this.inventorySharingService = new InventorySharingService()
    this.networkService = new NetworkService()
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createSupabaseServerClient()
    }
    return this.supabase
  }

  // =====================================================
  // PARTNER INVENTORY ACCESS MANAGEMENT
  // =====================================================

  async requestInventoryAccess(
    requesterId: string, 
    request: PartnerInventoryRequest
  ): Promise<PartnerInventoryAccess> {
    try {
      const supabase = await this.getSupabase()

      // Verify partners are connected
      const connectionStatus = await this.networkService.getConnectionStatus(
        requesterId, 
        request.partner_id
      )

      if (connectionStatus.status !== 'connected') {
        throw new Error('You must be connected to this partner to request inventory access')
      }

      // Check if inventory is shared by the partner
      const inventorySharing = await this.inventorySharingService.getInventorySharing(
        request.inventory_id,
        request.partner_id
      )

      if (!inventorySharing || !inventorySharing.is_shared) {
        throw new Error('This inventory is not shared by the partner')
      }

      // Check for existing request
      const { data: existingRequest } = await supabase
        .from('partner_inventory_access')
        .select('*')
        .eq('requester_id', requesterId)
        .eq('partner_id', request.partner_id)
        .eq('inventory_id', request.inventory_id)
        .eq('status', 'pending')
        .single()

      if (existingRequest) {
        throw new Error('You already have a pending request for this inventory')
      }

      // Create access request
      const { data, error } = await supabase
        .from('partner_inventory_access')
        .insert({
          partner_id: request.partner_id,
          requester_id: requesterId,
          inventory_id: request.inventory_id,
          access_type: request.access_type,
          message: request.message,
          status: 'pending',
          permissions: {
            can_view_pricing: false,
            can_view_quantity: false,
            can_request_quote: false,
            can_place_order: false
          }
        })
        .select(`
          *,
          partner:partners!partner_inventory_access_partner_id_fkey(*),
          requester:users!partner_inventory_access_requester_id_fkey(*),
          inventory:inventory!partner_inventory_access_inventory_id_fkey(*)
        `)
        .single()

      if (error) throw error

      return this.mapDatabaseToPartnerInventoryAccess(data)
    } catch (error) {
      console.error('Error requesting inventory access:', error)
      throw new Error(`Failed to request inventory access: ${error instanceof Error ? error instanceof Error ? error.message : 'Unknown error' : 'Unknown error'}`)
    }
  }

  async approveInventoryAccess(
    partnerId: string,
    accessId: string,
    permissions: {
      can_view_pricing: boolean
      can_view_quantity: boolean
      can_request_quote: boolean
      can_place_order: boolean
      custom_price?: number
      custom_discount_percent?: number
    },
    responseMessage?: string
  ): Promise<PartnerInventoryAccess> {
    try {
      const supabase = await this.getSupabase()

      // Get the access request
      const { data: accessRequest, error: fetchError } = await supabase
        .from('partner_inventory_access')
        .select('*')
        .eq('id', accessId)
        .eq('partner_id', partnerId)
        .eq('status', 'pending')
        .single()

      if (fetchError || !accessRequest) {
        throw new Error('Access request not found or already processed')
      }

      // Update the access request
      const { data, error } = await supabase
        .from('partner_inventory_access')
        .update({
          status: 'approved',
          permissions,
          response_message: responseMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', accessId)
        .select(`
          *,
          partner:partners!partner_inventory_access_partner_id_fkey(*),
          requester:users!partner_inventory_access_requester_id_fkey(*),
          inventory:inventory!partner_inventory_access_inventory_id_fkey(*)
        `)
        .single()

      if (error) throw error

      // Create inventory sharing connection
      const inventorySharing = await this.inventorySharingService.getInventorySharing(
        accessRequest.inventory_id,
        partnerId
      )

      if (inventorySharing) {
        await this.inventorySharingService.addConnection({
          sharing_id: inventorySharing.id,
          viewer_id: accessRequest.requester_id,
          connection_type: 'partner',
          can_view_pricing: permissions.can_view_pricing,
          can_view_quantity: permissions.can_view_quantity,
          can_request_quote: permissions.can_request_quote,
          can_place_order: permissions.can_place_order,
          custom_price: permissions.custom_price,
          custom_discount_percent: permissions.custom_discount_percent
        })
      }

      return this.mapDatabaseToPartnerInventoryAccess(data)
    } catch (error) {
      console.error('Error approving inventory access:', error)
      throw new Error(`Failed to approve inventory access: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async rejectInventoryAccess(
    partnerId: string,
    accessId: string,
    responseMessage?: string
  ): Promise<PartnerInventoryAccess> {
    try {
      const supabase = await this.getSupabase()

      const { data, error } = await supabase
        .from('partner_inventory_access')
        .update({
          status: 'rejected',
          response_message: responseMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', accessId)
        .eq('partner_id', partnerId)
        .select(`
          *,
          partner:partners!partner_inventory_access_partner_id_fkey(*),
          requester:users!partner_inventory_access_requester_id_fkey(*),
          inventory:inventory!partner_inventory_access_inventory_id_fkey(*)
        `)
        .single()

      if (error) throw error

      return this.mapDatabaseToPartnerInventoryAccess(data)
    } catch (error) {
      console.error('Error rejecting inventory access:', error)
      throw new Error(`Failed to reject inventory access: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getPendingAccessRequests(partnerId: string): Promise<PartnerInventoryAccess[]> {
    try {
      const supabase = await this.getSupabase()

      const { data, error } = await supabase
        .from('partner_inventory_access')
        .select(`
          *,
          partner:partners!partner_inventory_access_partner_id_fkey(*),
          requester:users!partner_inventory_access_requester_id_fkey(*),
          inventory:inventory!partner_inventory_access_inventory_id_fkey(*)
        `)
        .eq('partner_id', partnerId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((item: any) => this.mapDatabaseToPartnerInventoryAccess(item))
    } catch (error) {
      console.error('Error getting pending access requests:', error)
      throw new Error(`Failed to get pending access requests: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getMyAccessRequests(requesterId: string): Promise<PartnerInventoryAccess[]> {
    try {
      const supabase = await this.getSupabase()

      const { data, error } = await supabase
        .from('partner_inventory_access')
        .select(`
          *,
          partner:partners!partner_inventory_access_partner_id_fkey(*),
          requester:users!partner_inventory_access_requester_id_fkey(*),
          inventory:inventory!partner_inventory_access_inventory_id_fkey(*)
        `)
        .eq('requester_id', requesterId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((item: any) => this.mapDatabaseToPartnerInventoryAccess(item))
    } catch (error) {
      console.error('Error getting my access requests:', error)
      throw new Error(`Failed to get access requests: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getPartnerInventory(partnerId: string, viewerId: string): Promise<any[]> {
    try {
      const supabase = await this.getSupabase()

      // Get approved access requests for this partner
      const { data: accessRequests, error: accessError } = await supabase
        .from('partner_inventory_access')
        .select('*')
        .eq('partner_id', partnerId)
        .eq('requester_id', viewerId)
        .eq('status', 'approved')

      if (accessError) throw accessError

      if (!accessRequests || accessRequests.length === 0) {
        return []
      }

      // Get inventory IDs that the viewer has access to
      const inventoryIds = accessRequests.map((req: any) => req.inventory_id)

      // Get the shared inventory
      const { data: sharedInventory, error: inventoryError } = await supabase
        .from('shared_inventory_view')
        .select('*')
        .eq('owner_id', partnerId)
        .in('inventory_id', inventoryIds)
        .eq('is_shared', true)

      if (inventoryError) throw inventoryError

      // Apply permissions from access requests
      const accessMap = new Map(
        accessRequests.map((req: any) => [req.inventory_id, req])
      )

      return (sharedInventory || []).map((item: any) => {
        const access = accessMap.get(item.inventory_id)
        return {
          ...item,
          can_view_pricing: (access as any)?.permissions?.can_view_pricing ?? false,
          can_view_quantity: (access as any)?.permissions?.can_view_quantity ?? false,
          can_request_quote: (access as any)?.permissions?.can_request_quote ?? false,
          can_place_order: (access as any)?.permissions?.can_place_order ?? false,
          custom_price: (access as any)?.permissions?.custom_price,
          custom_discount_percent: (access as any)?.permissions?.custom_discount_percent
        }
      })
    } catch (error) {
      console.error('Error getting partner inventory:', error)
      throw new Error(`Failed to get partner inventory: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async syncPartnerConnectionsWithInventory(userId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()

      // Get user's connected partners
      const connections = await this.networkService.getUserConnections(userId)
      const connectedPartnerIds = connections
        .filter((conn: any) => conn.status === 'accepted')
        .map((conn: any) => conn.partner_id)

      if (connectedPartnerIds.length === 0) {
        return
      }

      // Get user's shared inventory
      const { data: sharedInventory, error: inventoryError } = await supabase
        .from('inventory_sharing')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_shared', true)

      if (inventoryError) throw inventoryError

      // For each shared inventory item, ensure connected partners have access
      for (const sharing of sharedInventory || []) {
        for (const partnerId of connectedPartnerIds) {
          // Check if connection already exists
          const { data: existingConnection } = await supabase
            .from('inventory_sharing_connections')
            .select('id')
            .eq('sharing_id', sharing.id)
            .eq('viewer_id', partnerId)
            .single()

          if (!existingConnection) {
            // Create connection with default permissions
            await this.inventorySharingService.addConnection({
              sharing_id: sharing.id,
              viewer_id: partnerId,
              connection_type: 'partner',
              can_view_pricing: sharing.show_pricing,
              can_view_quantity: true,
              can_request_quote: true,
              can_place_order: sharing.b2b_enabled
            })
          }
        }
      }
    } catch (error) {
      console.error('Error syncing partner connections with inventory:', error)
      // Don't throw error for sync failures
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private mapDatabaseToPartnerInventoryAccess(data: any): PartnerInventoryAccess {
    return {
      id: data.id,
      partner_id: data.partner_id,
      requester_id: data.requester_id,
      inventory_id: data.inventory_id,
      access_type: data.access_type,
      status: data.status,
      message: data.message,
      response_message: data.response_message,
      permissions: data.permissions || {
        can_view_pricing: false,
        can_view_quantity: false,
        can_request_quote: false,
        can_place_order: false
      },
      created_at: data.created_at,
      updated_at: data.updated_at,
      partner: data.partner,
      requester: data.requester,
      inventory: data.inventory
    }
  }
}
