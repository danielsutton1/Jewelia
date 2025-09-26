import { supabase } from '../supabase'
import { z } from 'zod'

// Types for fulfillment system
export type FulfillmentStatus = 'pending' | 'picking' | 'picked' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
export type FulfillmentPriority = 'low' | 'normal' | 'high' | 'urgent'
export type ShippingCarrier = 'fedex' | 'ups' | 'usps' | 'dhl' | 'shipstation'

export interface FulfillmentOrder {
  id: string
  order_id: string
  fulfillment_number: string
  status: FulfillmentStatus
  priority: FulfillmentPriority
  assigned_to?: string
  estimated_pick_date?: string
  estimated_ship_date?: string
  actual_pick_date?: string
  actual_ship_date?: string
  actual_delivery_date?: string
  shipping_method?: string
  shipping_carrier?: ShippingCarrier
  tracking_number?: string
  shipping_cost?: number
  insurance_amount?: number
  special_instructions?: string
  created_at: string
  updated_at: string
}

export interface FulfillmentItem {
  id: string
  fulfillment_order_id: string
  inventory_id?: string
  sku?: string
  product_name: string
  quantity_ordered: number
  quantity_picked: number
  quantity_packed: number
  quantity_shipped: number
  unit_price?: number
  total_price?: number
  location_code?: string
  bin_number?: string
  picked_by?: string
  picked_at?: string
  packed_by?: string
  packed_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ShippingPackage {
  id: string
  fulfillment_order_id: string
  package_number: string
  weight?: number
  dimensions?: string
  shipping_method?: string
  shipping_carrier?: ShippingCarrier
  tracking_number?: string
  label_url?: string
  shipped_at?: string
  delivered_at?: string
  delivery_notes?: string
  created_at: string
  updated_at: string
}

export interface ShippingRate {
  id: string
  carrier: ShippingCarrier
  service_name: string
  service_code: string
  origin_zip?: string
  destination_zip?: string
  weight_min?: number
  weight_max?: number
  rate: number
  delivery_days?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WarehouseLocation {
  id: string
  location_code: string
  location_name: string
  location_type?: string
  aisle?: string
  shelf?: string
  bin?: string
  zone?: string
  is_active: boolean
  capacity?: number
  current_utilization: number
  created_at: string
  updated_at: string
}

export interface FulfillmentOrderWithDetails extends FulfillmentOrder {
  order: {
    id: string
    customer: string
    order_date: string
    status: string
    total_amount?: number
  }
  items: FulfillmentItem[]
  packages: ShippingPackage[]
  status_history: Array<{
    id: string
    status: FulfillmentStatus
    previous_status?: FulfillmentStatus
    changed_by?: string
    notes?: string
    created_at: string
  }>
}

// Validation schemas
const CreateFulfillmentOrderSchema = z.object({
  order_id: z.string().uuid(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  assigned_to: z.string().uuid().optional(),
  estimated_pick_date: z.string().optional(),
  estimated_ship_date: z.string().optional(),
  special_instructions: z.string().optional()
})

const UpdateFulfillmentStatusSchema = z.object({
  status: z.enum(['pending', 'picking', 'picked', 'packed', 'shipped', 'delivered', 'cancelled']),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

const PickItemSchema = z.object({
  fulfillment_item_id: z.string().uuid(),
  quantity_picked: z.number().positive(),
  picked_by: z.string().uuid(),
  location_code: z.string().optional(),
  bin_number: z.string().optional(),
  notes: z.string().optional()
})

const PackItemSchema = z.object({
  fulfillment_item_id: z.string().uuid(),
  quantity_packed: z.number().positive(),
  packed_by: z.string().uuid(),
  notes: z.string().optional()
})

const ShipPackageSchema = z.object({
  fulfillment_order_id: z.string().uuid(),
  shipping_method: z.string(),
  shipping_carrier: z.enum(['fedex', 'ups', 'usps', 'dhl', 'shipstation']),
  tracking_number: z.string(),
  weight: z.number().positive().optional(),
  dimensions: z.string().optional(),
  shipping_cost: z.number().positive().optional(),
  insurance_amount: z.number().positive().optional()
})

export class FulfillmentService {
  /**
   * Create a new fulfillment order from an existing order
   */
  async createFulfillmentOrder(data: z.infer<typeof CreateFulfillmentOrderSchema>): Promise<FulfillmentOrderWithDetails> {
    try {
      const validatedData = CreateFulfillmentOrderSchema.parse(data)

      // Check if order exists and is ready for fulfillment
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', validatedData.order_id)
        .single()

      if (orderError || !order) {
        throw new Error('Order not found')
      }

      if (order.status !== 'completed') {
        throw new Error('Order must be completed before creating fulfillment')
      }

      // Check if fulfillment order already exists
      const { data: existingFulfillment, error: existingError } = await supabase
        .from('fulfillment_orders')
        .select('id')
        .eq('order_id', validatedData.order_id)
        .single()

      if (existingFulfillment) {
        throw new Error('Fulfillment order already exists for this order')
      }

      // Generate fulfillment number
      const { data: fulfillmentNumber, error: numberError } = await supabase
        .rpc('generate_fulfillment_number')

      if (numberError) {
        throw new Error('Failed to generate fulfillment number')
      }

      // Create fulfillment order
      const { data: fulfillmentOrder, error: fulfillmentError } = await supabase
        .from('fulfillment_orders')
        .insert({
          order_id: validatedData.order_id,
          fulfillment_number: fulfillmentNumber,
          priority: validatedData.priority,
          assigned_to: validatedData.assigned_to,
          estimated_pick_date: validatedData.estimated_pick_date,
          estimated_ship_date: validatedData.estimated_ship_date,
          special_instructions: validatedData.special_instructions
        })
        .select()
        .single()

      if (fulfillmentError) {
        throw new Error(`Failed to create fulfillment order: ${fulfillmentError.message}`)
      }

      // Create fulfillment items from order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          inventory:inventory(id, name, sku, category, price)
        `)
        .eq('order_id', validatedData.order_id)

      if (itemsError) {
        throw new Error(`Failed to fetch order items: ${itemsError.message}`)
      }

      // Create fulfillment items
      const fulfillmentItems = orderItems.map(item => ({
        fulfillment_order_id: fulfillmentOrder.id,
        inventory_id: item.inventory_id,
        sku: item.inventory?.sku,
        product_name: item.inventory?.name || 'Unknown Product',
        quantity_ordered: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }))

      const { error: createItemsError } = await supabase
        .from('fulfillment_items')
        .insert(fulfillmentItems)

      if (createItemsError) {
        throw new Error(`Failed to create fulfillment items: ${createItemsError.message}`)
      }

      // Log initial status
      await this.logStatusChange(fulfillmentOrder.id, 'pending', undefined, 'Fulfillment order created')

      // Return complete fulfillment order with details
      const result = await this.getFulfillmentOrder(fulfillmentOrder.id)
      if (!result) {
        throw new Error('Failed to retrieve created fulfillment order')
      }
      return result
    } catch (error) {
      console.error('Error in fulfillment.createFulfillmentOrder:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Get fulfillment order with all related data
   */
  async getFulfillmentOrder(fulfillmentOrderId: string): Promise<FulfillmentOrderWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('fulfillment_orders')
        .select(`
          *,
          order:orders(id, customer, order_date, status, total_amount),
          items:fulfillment_items(*),
          packages:shipping_packages(*),
          status_history:fulfillment_status_history(
            id,
            status,
            previous_status,
            changed_by,
            notes,
            created_at
          )
        `)
        .eq('id', fulfillmentOrderId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw new Error(`Failed to fetch fulfillment order: ${error.message}`)
      }

      return data as FulfillmentOrderWithDetails
    } catch (error) {
      console.error('Error in fulfillment.getFulfillmentOrder:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * List fulfillment orders with filtering and pagination
   */
  async listFulfillmentOrders(filters?: {
    status?: FulfillmentStatus
    priority?: FulfillmentPriority
    assigned_to?: string
    date_from?: string
    date_to?: string
    limit?: number
    offset?: number
  }): Promise<{ data: FulfillmentOrderWithDetails[], count: number }> {
    try {
      let query = supabase
        .from('fulfillment_orders')
        .select(`
          *,
          order:orders(id, customer, order_date, status, total_amount),
          items:fulfillment_items(*),
          packages:shipping_packages(*)
        `, { count: 'exact' })

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to)
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      // Apply pagination
      const limit = filters?.limit || 20
      const offset = filters?.offset || 0
      query = query.order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new Error(`Failed to fetch fulfillment orders: ${error.message}`)
      }

      return {
        data: data as FulfillmentOrderWithDetails[],
        count: count || 0
      }
    } catch (error) {
      console.error('Error in fulfillment.listFulfillmentOrders:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Update fulfillment order status
   */
  async updateFulfillmentStatus(
    fulfillmentOrderId: string,
    data: z.infer<typeof UpdateFulfillmentStatusSchema>
  ): Promise<FulfillmentOrderWithDetails> {
    try {
      const validatedData = UpdateFulfillmentStatusSchema.parse(data)

      // Get current status
      const { data: currentOrder, error: currentError } = await supabase
        .from('fulfillment_orders')
        .select('status')
        .eq('id', fulfillmentOrderId)
        .single()

      if (currentError || !currentOrder) {
        throw new Error('Fulfillment order not found')
      }

      const previousStatus = currentOrder.status as FulfillmentStatus

      // Update status
      const { data: updatedOrder, error: updateError } = await supabase
        .from('fulfillment_orders')
        .update({
          status: validatedData.status,
          actual_pick_date: validatedData.status === 'picked' ? new Date().toISOString() : undefined,
          actual_ship_date: validatedData.status === 'shipped' ? new Date().toISOString() : undefined,
          actual_delivery_date: validatedData.status === 'delivered' ? new Date().toISOString() : undefined
        })
        .eq('id', fulfillmentOrderId)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to update fulfillment status: ${updateError.message}`)
      }

      // Log status change
      await this.logStatusChange(
        fulfillmentOrderId,
        validatedData.status,
        previousStatus,
        validatedData.notes,
        validatedData.metadata
      )

      // Return updated fulfillment order
      const result = await this.getFulfillmentOrder(fulfillmentOrderId)
      if (!result) {
        throw new Error('Failed to retrieve updated fulfillment order')
      }
      return result
    } catch (error) {
      console.error('Error in fulfillment.updateFulfillmentStatus:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Pick items for fulfillment
   */
  async pickItem(data: z.infer<typeof PickItemSchema>): Promise<FulfillmentItem> {
    try {
      const validatedData = PickItemSchema.parse(data)

      // Get fulfillment item
      const { data: item, error: itemError } = await supabase
        .from('fulfillment_items')
        .select('*')
        .eq('id', validatedData.fulfillment_item_id)
        .single()

      if (itemError || !item) {
        throw new Error('Fulfillment item not found')
      }

      // Validate quantity
      if (validatedData.quantity_picked > item.quantity_ordered) {
        throw new Error('Cannot pick more than ordered quantity')
      }

      // Update item
      const { data: updatedItem, error: updateError } = await supabase
        .from('fulfillment_items')
        .update({
          quantity_picked: validatedData.quantity_picked,
          picked_by: validatedData.picked_by,
          picked_at: new Date().toISOString(),
          location_code: validatedData.location_code,
          bin_number: validatedData.bin_number,
          notes: validatedData.notes
        })
        .eq('id', validatedData.fulfillment_item_id)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to update picked item: ${updateError.message}`)
      }

      // Check if all items are picked and update fulfillment status
      await this.checkAndUpdateFulfillmentStatus(item.fulfillment_order_id)

      return updatedItem
    } catch (error) {
      console.error('Error in fulfillment.pickItem:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Pack items for shipping
   */
  async packItem(data: z.infer<typeof PackItemSchema>): Promise<FulfillmentItem> {
    try {
      const validatedData = PackItemSchema.parse(data)

      // Get fulfillment item
      const { data: item, error: itemError } = await supabase
        .from('fulfillment_items')
        .select('*')
        .eq('id', validatedData.fulfillment_item_id)
        .single()

      if (itemError || !item) {
        throw new Error('Fulfillment item not found')
      }

      // Validate quantity
      if (validatedData.quantity_packed > item.quantity_picked) {
        throw new Error('Cannot pack more than picked quantity')
      }

      // Update item
      const { data: updatedItem, error: updateError } = await supabase
        .from('fulfillment_items')
        .update({
          quantity_packed: validatedData.quantity_packed,
          packed_by: validatedData.packed_by,
          packed_at: new Date().toISOString(),
          notes: validatedData.notes
        })
        .eq('id', validatedData.fulfillment_item_id)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to update packed item: ${updateError.message}`)
      }

      // Check if all items are packed and update fulfillment status
      await this.checkAndUpdateFulfillmentStatus(item.fulfillment_order_id)

      return updatedItem
    } catch (error) {
      console.error('Error in fulfillment.packItem:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Ship package
   */
  async shipPackage(data: z.infer<typeof ShipPackageSchema>): Promise<ShippingPackage> {
    try {
      const validatedData = ShipPackageSchema.parse(data)

      // Generate package number
      const { data: packageNumber, error: numberError } = await supabase
        .rpc('generate_package_number', { fulfillment_order_id: validatedData.fulfillment_order_id })

      if (numberError) {
        throw new Error('Failed to generate package number')
      }

      // Create shipping package
      const { data: shippingPackage, error: packageError } = await supabase
        .from('shipping_packages')
        .insert({
          fulfillment_order_id: validatedData.fulfillment_order_id,
          package_number: packageNumber,
          weight: validatedData.weight,
          dimensions: validatedData.dimensions,
          shipping_method: validatedData.shipping_method,
          shipping_carrier: validatedData.shipping_carrier,
          tracking_number: validatedData.tracking_number,
          shipped_at: new Date().toISOString()
        })
        .select()
        .single()

      if (packageError) {
        throw new Error(`Failed to create shipping package: ${packageError.message}`)
      }

      // Update fulfillment order with shipping info
      const { error: updateError } = await supabase
        .from('fulfillment_orders')
        .update({
          shipping_method: validatedData.shipping_method,
          shipping_carrier: validatedData.shipping_carrier,
          tracking_number: validatedData.tracking_number,
          shipping_cost: validatedData.shipping_cost,
          insurance_amount: validatedData.insurance_amount
        })
        .eq('id', validatedData.fulfillment_order_id)

      if (updateError) {
        throw new Error(`Failed to update fulfillment order: ${updateError.message}`)
      }

      // Update fulfillment status to shipped
      await this.updateFulfillmentStatus(validatedData.fulfillment_order_id, {
        status: 'shipped',
        notes: `Package shipped via ${validatedData.shipping_carrier}`
      })

      return shippingPackage
    } catch (error) {
      console.error('Error in fulfillment.shipPackage:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Get shipping rates for a destination
   */
  async getShippingRates(destinationZip: string, weight: number): Promise<ShippingRate[]> {
    try {
      const { data, error } = await supabase
        .from('shipping_rates')
        .select('*')
        .eq('destination_zip', destinationZip)
        .gte('weight_min', weight)
        .lte('weight_max', weight)
        .eq('is_active', true)
        .order('rate', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch shipping rates: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error in fulfillment.getShippingRates:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Get fulfillment statistics
   */
  async getFulfillmentStats(): Promise<{
    total_orders: number
    pending_orders: number
    picking_orders: number
    packed_orders: number
    shipped_orders: number
    delivered_orders: number
    average_fulfillment_time: number
    on_time_delivery_rate: number
  }> {
    try {
      // Get counts by status
      const { data: statusCounts, error: statusError } = await supabase
        .from('fulfillment_orders')
        .select('status')

      if (statusError) {
        throw new Error(`Failed to fetch status counts: ${statusError.message}`)
      }

      const counts = statusCounts.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Calculate average fulfillment time
      const { data: completedOrders, error: timeError } = await supabase
        .from('fulfillment_orders')
        .select('created_at, actual_delivery_date')
        .eq('status', 'delivered')
        .not('actual_delivery_date', 'is', null)

      if (timeError) {
        throw new Error(`Failed to fetch delivery times: ${timeError.message}`)
      }

      const averageFulfillmentTime = completedOrders.length > 0
        ? completedOrders.reduce((sum, order) => {
            const created = new Date(order.created_at)
            const delivered = new Date(order.actual_delivery_date)
            return sum + (delivered.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
          }, 0) / completedOrders.length
        : 0

      return {
        total_orders: statusCounts.length,
        pending_orders: counts.pending || 0,
        picking_orders: counts.picking || 0,
        packed_orders: counts.packed || 0,
        shipped_orders: counts.shipped || 0,
        delivered_orders: counts.delivered || 0,
        average_fulfillment_time: Math.round(averageFulfillmentTime),
        on_time_delivery_rate: 0 // TODO: Calculate based on estimated vs actual delivery dates
      }
    } catch (error) {
      console.error('Error in fulfillment.getFulfillmentStats:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Check and update fulfillment status based on item progress
   */
  private async checkAndUpdateFulfillmentStatus(fulfillmentOrderId: string): Promise<void> {
    try {
      // Get all items for this fulfillment order
      const { data: items, error: itemsError } = await supabase
        .from('fulfillment_items')
        .select('quantity_ordered, quantity_picked, quantity_packed')
        .eq('fulfillment_order_id', fulfillmentOrderId)

      if (itemsError || !items.length) {
        return
      }

      const totalOrdered = items.reduce((sum, item) => sum + item.quantity_ordered, 0)
      const totalPicked = items.reduce((sum, item) => sum + item.quantity_picked, 0)
      const totalPacked = items.reduce((sum, item) => sum + item.quantity_packed, 0)

      // Update status based on progress
      if (totalPicked === totalOrdered && totalPacked === totalOrdered) {
        await this.updateFulfillmentStatus(fulfillmentOrderId, { status: 'packed' })
      } else if (totalPicked === totalOrdered) {
        await this.updateFulfillmentStatus(fulfillmentOrderId, { status: 'picked' })
      }
    } catch (error) {
      console.error('Error in checkAndUpdateFulfillmentStatus:', error)
    }
  }

  /**
   * Log status change
   */
  private async logStatusChange(
    fulfillmentOrderId: string,
    status: FulfillmentStatus,
    previousStatus?: FulfillmentStatus,
    notes?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .from('fulfillment_status_history')
        .insert({
          fulfillment_order_id: fulfillmentOrderId,
          status,
          previous_status: previousStatus,
          notes,
          metadata
        })
    } catch (error) {
      console.error('Error logging status change:', error)
    }
  }
}

// Export singleton instance
export const fulfillmentService = new FulfillmentService() 