import { createSupabaseServerClient } from '@/lib/supabase/server'

// =====================================================
// QUOTE AND ORDER REQUEST SERVICE
// =====================================================

export interface QuoteRequest {
  id: string
  requester_id: string
  partner_id: string
  inventory_id: string
  requested_quantity: number
  requested_price?: number
  message?: string
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'expired'
  response_price?: number
  response_message?: string
  valid_until?: string
  created_at: string
  updated_at: string
  requester?: any
  partner?: any
  inventory?: any
}

export interface OrderRequest {
  id: string
  requester_id: string
  partner_id: string
  inventory_id: string
  requested_quantity: number
  agreed_price: number
  shipping_address: string
  billing_address: string
  payment_terms: string
  special_instructions?: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  tracking_number?: string
  estimated_delivery?: string
  created_at: string
  updated_at: string
  requester?: any
  partner?: any
  inventory?: any
}

export interface CreateQuoteRequest {
  partner_id: string
  inventory_id: string
  requested_quantity: number
  requested_price?: number
  message?: string
}

export interface CreateOrderRequest {
  partner_id: string
  inventory_id: string
  requested_quantity: number
  agreed_price: number
  shipping_address: string
  billing_address: string
  payment_terms: string
  special_instructions?: string
}

export class QuoteOrderService {
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
  // QUOTE REQUEST MANAGEMENT
  // =====================================================

  async createQuoteRequest(
    requesterId: string, 
    request: CreateQuoteRequest
  ): Promise<QuoteRequest> {
    try {
      const supabase = await this.getSupabase()

      // Verify partners are connected
      const { data: connection } = await supabase
        .from('partner_relationships')
        .select('status')
        .or(`and(partner_a.eq.${requesterId},partner_b.eq.${request.partner_id}),and(partner_a.eq.${request.partner_id},partner_b.eq.${requesterId})`)
        .eq('status', 'accepted')
        .single()

      if (!connection) {
        throw new Error('You must be connected to this partner to request quotes')
      }

      // Check if inventory is accessible
      const { data: access } = await supabase
        .from('partner_inventory_access')
        .select('*')
        .eq('partner_id', request.partner_id)
        .eq('requester_id', requesterId)
        .eq('inventory_id', request.inventory_id)
        .eq('status', 'approved')
        .single()

      if (!access || !access.permissions?.can_request_quote) {
        throw new Error('You do not have permission to request quotes for this inventory')
      }

      // Create quote request
      const { data, error } = await supabase
        .from('quote_requests')
        .insert({
          requester_id: requesterId,
          partner_id: request.partner_id,
          inventory_id: request.inventory_id,
          requested_quantity: request.requested_quantity,
          requested_price: request.requested_price,
          message: request.message,
          status: 'pending',
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .select(`
          *,
          requester:users!quote_requests_requester_id_fkey(*),
          partner:partners!quote_requests_partner_id_fkey(*),
          inventory:inventory!quote_requests_inventory_id_fkey(*)
        `)
        .single()

      if (error) throw error

      return this.mapDatabaseToQuoteRequest(data)
    } catch (error) {
      console.error('Error creating quote request:', error)
      throw new Error(`Failed to create quote request: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async respondToQuoteRequest(
    partnerId: string,
    quoteId: string,
    responsePrice: number,
    responseMessage?: string
  ): Promise<QuoteRequest> {
    try {
      const supabase = await this.getSupabase()

      const { data, error } = await supabase
        .from('quote_requests')
        .update({
          status: 'quoted',
          response_price: responsePrice,
          response_message: responseMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId)
        .eq('partner_id', partnerId)
        .eq('status', 'pending')
        .select(`
          *,
          requester:users!quote_requests_requester_id_fkey(*),
          partner:partners!quote_requests_partner_id_fkey(*),
          inventory:inventory!quote_requests_inventory_id_fkey(*)
        `)
        .single()

      if (error) throw error

      return this.mapDatabaseToQuoteRequest(data)
    } catch (error) {
      console.error('Error responding to quote request:', error)
      throw new Error(`Failed to respond to quote request: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async acceptQuote(requesterId: string, quoteId: string): Promise<QuoteRequest> {
    try {
      const supabase = await this.getSupabase()

      const { data, error } = await supabase
        .from('quote_requests')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId)
        .eq('requester_id', requesterId)
        .eq('status', 'quoted')
        .select(`
          *,
          requester:users!quote_requests_requester_id_fkey(*),
          partner:partners!quote_requests_partner_id_fkey(*),
          inventory:inventory!quote_requests_inventory_id_fkey(*)
        `)
        .single()

      if (error) throw error

      return this.mapDatabaseToQuoteRequest(data)
    } catch (error) {
      console.error('Error accepting quote:', error)
      throw new Error(`Failed to accept quote: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async createOrderRequest(
    requesterId: string,
    request: CreateOrderRequest
  ): Promise<OrderRequest> {
    try {
      const supabase = await this.getSupabase()

      // Verify partners are connected
      const { data: connection } = await supabase
        .from('partner_relationships')
        .select('status')
        .or(`and(partner_a.eq.${requesterId},partner_b.eq.${request.partner_id}),and(partner_a.eq.${request.partner_id},partner_b.eq.${requesterId})`)
        .eq('status', 'accepted')
        .single()

      if (!connection) {
        throw new Error('You must be connected to this partner to place orders')
      }

      // Check if inventory is accessible
      const { data: access } = await supabase
        .from('partner_inventory_access')
        .select('*')
        .eq('partner_id', request.partner_id)
        .eq('requester_id', requesterId)
        .eq('inventory_id', request.inventory_id)
        .eq('status', 'approved')
        .single()

      if (!access || !access.permissions?.can_place_order) {
        throw new Error('You do not have permission to place orders for this inventory')
      }

      // Create order request
      const { data, error } = await supabase
        .from('order_requests')
        .insert({
          requester_id: requesterId,
          partner_id: request.partner_id,
          inventory_id: request.inventory_id,
          requested_quantity: request.requested_quantity,
          agreed_price: request.agreed_price,
          shipping_address: request.shipping_address,
          billing_address: request.billing_address,
          payment_terms: request.payment_terms,
          special_instructions: request.special_instructions,
          status: 'pending'
        })
        .select(`
          *,
          requester:users!order_requests_requester_id_fkey(*),
          partner:partners!order_requests_partner_id_fkey(*),
          inventory:inventory!order_requests_inventory_id_fkey(*)
        `)
        .single()

      if (error) throw error

      return this.mapDatabaseToOrderRequest(data)
    } catch (error) {
      console.error('Error creating order request:', error)
      throw new Error(`Failed to create order request: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getMyQuoteRequests(userId: string): Promise<QuoteRequest[]> {
    try {
      const supabase = await this.getSupabase()

      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          *,
          requester:users!quote_requests_requester_id_fkey(*),
          partner:partners!quote_requests_partner_id_fkey(*),
          inventory:inventory!quote_requests_inventory_id_fkey(*)
        `)
        .eq('requester_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((item: any) => this.mapDatabaseToQuoteRequest(item))
    } catch (error) {
      console.error('Error getting quote requests:', error)
      throw new Error(`Failed to get quote requests: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getPendingQuoteRequests(partnerId: string): Promise<QuoteRequest[]> {
    try {
      const supabase = await this.getSupabase()

      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          *,
          requester:users!quote_requests_requester_id_fkey(*),
          partner:partners!quote_requests_partner_id_fkey(*),
          inventory:inventory!quote_requests_inventory_id_fkey(*)
        `)
        .eq('partner_id', partnerId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((item: any) => this.mapDatabaseToQuoteRequest(item))
    } catch (error) {
      console.error('Error getting pending quote requests:', error)
      throw new Error(`Failed to get pending quote requests: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getMyOrderRequests(userId: string): Promise<OrderRequest[]> {
    try {
      const supabase = await this.getSupabase()

      const { data, error } = await supabase
        .from('order_requests')
        .select(`
          *,
          requester:users!order_requests_requester_id_fkey(*),
          partner:partners!order_requests_partner_id_fkey(*),
          inventory:inventory!order_requests_inventory_id_fkey(*)
        `)
        .eq('requester_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((item: any) => this.mapDatabaseToOrderRequest(item))
    } catch (error) {
      console.error('Error getting order requests:', error)
      throw new Error(`Failed to get order requests: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getPendingOrderRequests(partnerId: string): Promise<OrderRequest[]> {
    try {
      const supabase = await this.getSupabase()

      const { data, error } = await supabase
        .from('order_requests')
        .select(`
          *,
          requester:users!order_requests_requester_id_fkey(*),
          partner:partners!order_requests_partner_id_fkey(*),
          inventory:inventory!order_requests_inventory_id_fkey(*)
        `)
        .eq('partner_id', partnerId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((item: any) => this.mapDatabaseToOrderRequest(item))
    } catch (error) {
      console.error('Error getting pending order requests:', error)
      throw new Error(`Failed to get pending order requests: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private mapDatabaseToQuoteRequest(data: any): QuoteRequest {
    return {
      id: data.id,
      requester_id: data.requester_id,
      partner_id: data.partner_id,
      inventory_id: data.inventory_id,
      requested_quantity: data.requested_quantity,
      requested_price: data.requested_price,
      message: data.message,
      status: data.status,
      response_price: data.response_price,
      response_message: data.response_message,
      valid_until: data.valid_until,
      created_at: data.created_at,
      updated_at: data.updated_at,
      requester: data.requester,
      partner: data.partner,
      inventory: data.inventory
    }
  }

  private mapDatabaseToOrderRequest(data: any): OrderRequest {
    return {
      id: data.id,
      requester_id: data.requester_id,
      partner_id: data.partner_id,
      inventory_id: data.inventory_id,
      requested_quantity: data.requested_quantity,
      agreed_price: data.agreed_price,
      shipping_address: data.shipping_address,
      billing_address: data.billing_address,
      payment_terms: data.payment_terms,
      special_instructions: data.special_instructions,
      status: data.status,
      tracking_number: data.tracking_number,
      estimated_delivery: data.estimated_delivery,
      created_at: data.created_at,
      updated_at: data.updated_at,
      requester: data.requester,
      partner: data.partner,
      inventory: data.inventory
    }
  }
}
