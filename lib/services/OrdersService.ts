import { supabase } from '@/lib/database'
import { z } from 'zod'
import type { Order, OrderItem } from '@/types/database'

// Order schemas
const OrderSchema = z.object({
  id: z.string().optional(),
  customer_id: z.string().min(1, 'Customer ID is required'),
  order_number: z.string().min(1, 'Order number is required'),
  status: z.enum(['pending', 'confirmed', 'in_production', 'ready', 'shipped', 'delivered', 'cancelled']).default('pending'),
  total_amount: z.number().min(0, 'Total amount must be positive'),
  tax_amount: z.number().min(0, 'Tax amount must be positive').default(0),
  shipping_amount: z.number().min(0, 'Shipping amount must be positive').default(0),
  discount_amount: z.number().min(0, 'Discount amount must be positive').default(0),
  notes: z.string().optional(),
  expected_delivery_date: z.string().optional(),
  actual_delivery_date: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
})

const OrderItemSchema = z.object({
  id: z.string().optional(),
  order_id: z.string().min(1, 'Order ID is required'),
  product_id: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price must be positive'),
  total_price: z.number().min(0, 'Total price must be positive'),
  notes: z.string().optional(),
  created_at: z.date().optional()
})

const OrderFiltersSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_production', 'ready', 'shipped', 'delivered', 'cancelled']).optional(),
  customer_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['created_at', 'order_number', 'total_amount', 'expected_delivery_date']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export type OrderInput = z.infer<typeof OrderSchema>
export type OrderItemInput = z.infer<typeof OrderItemSchema>
export type OrderFilters = z.infer<typeof OrderFiltersSchema>

export class OrdersService {
  // Get all orders with filters
  async list(filters?: OrderFilters): Promise<{
    orders: (Order & { customer: any; items: OrderItem[] })[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const validatedFilters = OrderFiltersSchema.parse(filters || {})
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          items:order_items(*)
        `, { count: 'exact' })

      // Apply filters
      if (validatedFilters.status) {
        query = query.eq('status', validatedFilters.status)
      }
      if (validatedFilters.customer_id) {
        query = query.eq('customer_id', validatedFilters.customer_id)
      }
      if (validatedFilters.start_date) {
        query = query.gte('created_at', validatedFilters.start_date)
      }
      if (validatedFilters.end_date) {
        query = query.lte('created_at', validatedFilters.end_date)
      }
      if (validatedFilters.search) {
        query = query.or(`order_number.ilike.%${validatedFilters.search}%,notes.ilike.%${validatedFilters.search}%`)
      }

      // Apply sorting
      query = query.order(validatedFilters.sortBy, { ascending: validatedFilters.sortOrder === 'asc' })

      // Apply pagination
      const offset = (validatedFilters.page - 1) * validatedFilters.limit
      query = query.range(offset, offset + validatedFilters.limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      const total = count || 0
      const totalPages = Math.ceil(total / validatedFilters.limit)

      return {
        orders: data || [],
        total,
        page: validatedFilters.page,
        limit: validatedFilters.limit,
        totalPages
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw new Error('Failed to fetch orders')
    }
  }

  // Get single order by ID (alias for getById)
  async get(id: string): Promise<Order & { customer: any; items: OrderItem[] }> {
    return this.getById(id)
  }

  // Get single order by ID
  async getById(id: string): Promise<Order & { customer: any; items: OrderItem[] }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          items:order_items(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching order:', error)
      throw new Error('Failed to fetch order')
    }
  }

  // Create new order
  async create(orderData: Omit<OrderInput, 'id' | 'created_at' | 'updated_at'>, items: Omit<OrderItemInput, 'id' | 'order_id' | 'created_at'>[] = []): Promise<Order> {
    try {
      const validatedOrder = OrderSchema.parse({
        ...orderData,
        created_at: new Date(),
        updated_at: new Date()
      })

      // Start transaction
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([validatedOrder])
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      if (items.length > 0) {
        const orderItems = items.map(item => ({
          ...item,
          order_id: order.id,
          created_at: new Date()
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) throw itemsError
      }

      return order
    } catch (error) {
      console.error('Error creating order:', error)
      throw new Error('Failed to create order')
    }
  }

  // Update order
  async update(id: string, updates: Partial<Omit<OrderInput, 'id' | 'created_at'>>, items?: Omit<OrderItemInput, 'id' | 'order_id' | 'created_at'>[]): Promise<Order> {
    try {
      const validatedUpdates = OrderSchema.partial().parse({
        ...updates,
        updated_at: new Date()
      })

      // Update order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update(validatedUpdates)
        .eq('id', id)
        .select()
        .single()

      if (orderError) throw orderError

      // Update order items if provided
      if (items) {
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', id)

        if (deleteError) throw deleteError

        // Insert new items
        if (items.length > 0) {
          const orderItems = items.map(item => ({
            ...item,
            order_id: id,
            created_at: new Date()
          }))

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

          if (itemsError) throw itemsError
        }
      }

      return order
    } catch (error) {
      console.error('Error updating order:', error)
      throw new Error('Failed to update order')
    }
  }

  // Delete order
  async delete(id: string): Promise<void> {
    try {
      // Delete order items first (due to foreign key constraint)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id)

      if (itemsError) throw itemsError

      // Delete order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)

      if (orderError) throw orderError
    } catch (error) {
      console.error('Error deleting order:', error)
      throw new Error('Failed to delete order')
    }
  }

  // Update order status
  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date(),
          actual_delivery_date: status === 'delivered' ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating order status:', error)
      throw new Error('Failed to update order status')
    }
  }

  // Get order statistics
  async getStats(): Promise<{
    total: number
    pending: number
    confirmed: number
    inProduction: number
    ready: number
    shipped: number
    delivered: number
    cancelled: number
    totalRevenue: number
    averageOrderValue: number
  }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount')

      if (error) throw error

      const orders = data || []
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        inProduction: orders.filter(o => o.status === 'in_production').length,
        ready: orders.filter(o => o.status === 'ready').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / orders.length : 0
      }

      return stats
    } catch (error) {
      console.error('Error fetching order stats:', error)
      throw new Error('Failed to fetch order statistics')
    }
  }

  // Get orders by customer
  async getByCustomer(customerId: string): Promise<(Order & { items: OrderItem[] })[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching customer orders:', error)
      throw new Error('Failed to fetch customer orders')
    }
  }

  // Search orders
  async search(query: string): Promise<(Order & { customer: any; items: OrderItem[] })[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          items:order_items(*)
        `)
        .or(`order_number.ilike.%${query}%,notes.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching orders:', error)
      throw new Error('Failed to search orders')
    }
  }

  // Advanced analytics
  async getAdvancedAnalytics(): Promise<{
    revenueByMonth: { month: string; revenue: number }[]
    ordersByStatus: { status: string; count: number }[]
    topCustomers: { customerId: string; customerName: string; totalOrders: number; totalRevenue: number }[]
    averageOrderValue: number
    totalOrders: number
    totalRevenue: number
  }> {
    try {
      // This is a simplified version - in production you'd want more sophisticated analytics
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const ordersData = orders || []
      
      // Calculate revenue by month
      const revenueByMonth: Record<string, number> = {}
      ordersData.forEach(order => {
        const month = new Date(order.created_at).toISOString().slice(0, 7)
        revenueByMonth[month] = (revenueByMonth[month] || 0) + (order.total_amount || 0)
      })

      // Calculate orders by status
      const ordersByStatus: Record<string, number> = {}
      ordersData.forEach(order => {
        ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1
      })

      // Calculate top customers
      const customerStats: Record<string, {
        customerId: string
        customerName: string
        totalOrders: number
        totalRevenue: number
      }> = {}

      ordersData.forEach(order => {
        const customerId = order.customer_id
        if (!customerStats[customerId]) {
          customerStats[customerId] = {
            customerId,
            customerName: order.customer?.full_name || 'Unknown',
            totalOrders: 0,
            totalRevenue: 0
          }
        }
        customerStats[customerId].totalOrders++
        customerStats[customerId].totalRevenue += order.total_amount || 0
      })

      const topCustomers = Object.values(customerStats)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10)

      const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const averageOrderValue = ordersData.length > 0 ? totalRevenue / ordersData.length : 0

      return {
        revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })),
        ordersByStatus: Object.entries(ordersByStatus).map(([status, count]) => ({ status, count })),
        topCustomers,
        averageOrderValue,
        totalOrders: ordersData.length,
        totalRevenue
      }
    } catch (error) {
      console.error('Error fetching advanced analytics:', error)
      throw new Error('Failed to fetch advanced analytics')
    }
  }

  // Process automated status updates
  async processAutomatedStatusUpdates(): Promise<{
    updated: number
    errors: string[]
  }> {
    try {
      const errors: string[] = []
      let updated = 0

      // Get orders that need status updates
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['confirmed', 'in_production', 'ready', 'shipped'])

      if (error) throw error

      for (const order of orders || []) {
        try {
          let newStatus = order.status

          // Simple automated logic - in production you'd have more sophisticated rules
          if (order.status === 'confirmed' && order.expected_delivery_date) {
            const expectedDate = new Date(order.expected_delivery_date)
            const now = new Date()
            if (now >= expectedDate) {
              newStatus = 'ready'
            }
          }

          if (newStatus !== order.status) {
            await this.updateStatus(order.id, newStatus)
            updated++
          }
        } catch (err) {
          errors.push(`Failed to update order ${order.id}: ${err}`)
        }
      }

      return { updated, errors }
    } catch (error) {
      console.error('Error processing automated updates:', error)
      throw new Error('Failed to process automated updates')
    }
  }

  // Convert quote to order
  async convertQuoteToOrder(quoteId: string, customerId: string, items: Omit<OrderItemInput, 'id' | 'order_id' | 'created_at'>[]): Promise<Order> {
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Calculate totals
      const totalAmount = items.reduce((sum, item) => sum + (item.total_price || 0), 0)

      // Create order
      const orderData = {
        customer_id: customerId,
        order_number: orderNumber,
        status: 'pending' as const,
        total_amount: totalAmount,
        tax_amount: 0,
        shipping_amount: 0,
        discount_amount: 0,
        notes: `Converted from quote ${quoteId}`
      }

      return await this.create(orderData, items)
    } catch (error) {
      console.error('Error converting quote to order:', error)
      throw new Error('Failed to convert quote to order')
    }
  }
}

// Export singleton instance
export const ordersService = new OrdersService()