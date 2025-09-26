import { createClient } from '@supabase/supabase-js'
import type { ServiceResponse } from './BaseService'

export interface DashboardMetrics {
  totalRevenue: number
  totalOrders: number
  activeCustomers: number
  totalProducts: number
  inventoryValue: number
  averageOrderValue: number
  customerRetention: number
  salesGrowth: number
  customerSatisfaction: number
  productionEfficiency: number
  globalReach: string
  teamPerformance: string
  productionMetrics: {
    totalItems: number
    itemsByStage: Record<string, number>
    itemsByStatus: Record<string, number>
    averageCompletionTime: number
    onTimeDeliveryRate: number
    itemsInProduction: number
    completedItems: number
  }
  financeMetrics: {
    totalReceivables: number
    totalPayables: number
    cashFlow: number
    outstandingInvoices: number
    overdueInvoices: number
    averagePaymentTime: number
  }
  topProducts: Array<{
    name: string
    sales: number
    revenue: number
    stock: number
  }>
  recentActivity: Array<{
    type: 'order' | 'customer' | 'product' | 'inventory' | 'production' | 'finance'
    id: string
    title: string
    amount?: number
    time: string
  }>
  monthlyTrends: Array<{
    month: string
    revenue: number
    orders: number
    customers: number
  }>
}

export interface AnalyticsFilters {
  startDate?: string
  endDate?: string
  customerId?: string
  productCategory?: string
}

class AnalyticsService {
  private supabase: any

  constructor() {
    // Use hardcoded values if environment variables are not available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jplmmjcwwhjrltlevkoh.supabase.co'
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwbG1tamN3d2hqcmx0bGV2a29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTI1MDksImV4cCI6MjA2MzMyODUwOX0.PQTyBGcwNWCCnlDkjOUjKhfeys8kDLfYi_ohcw02vu0'
    
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(filters?: AnalyticsFilters): Promise<ServiceResponse<DashboardMetrics>> {
    try {
      // Check if we're in demo mode (no real Supabase connection)
      if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co') {
        return this.getMockDashboardMetrics()
      }

      // Check if Supabase is properly configured
      if (!this.supabase) {
        console.warn('Supabase client not initialized, returning mock data')
        return this.getMockDashboardMetrics()
      }

      // Fetch all data in parallel
      const [customers, orders, products, inventory, production, finance] = await Promise.all([
        this.fetchCustomers(filters),
        this.fetchOrders(filters),
        this.fetchProducts(filters),
        this.fetchInventory(filters),
        this.fetchProduction(filters),
        this.fetchFinance(filters)
      ])

      // Handle errors gracefully - if any critical data fails, fall back to mock data
      if (customers.error || orders.error || products.error) {
        console.warn('Critical data fetch failed, falling back to mock data:', {
          customers: customers.error,
          orders: orders.error,
          products: products.error
        })
        return this.getMockDashboardMetrics()
      }

      const customerData = customers.data || []
      const orderData = orders.data || []
      const productData = products.data || []
      const inventoryData = inventory.data || []
      const productionData = production.data || []
      const financeData = finance.data || []

      // Calculate core metrics
      const totalRevenue = orderData.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const totalOrders = orderData.length
      const activeCustomers = customerData.length
      const totalProducts = productData.length
      const inventoryValue = productData.reduce((sum, product) => sum + ((product.price || 0) * (product.stock || 0)), 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Calculate production metrics
      const productionMetrics = this.calculateProductionMetrics(productionData)
      const productionEfficiency = this.calculateProductionEfficiency(productionData)

      // Calculate finance metrics
      const financeMetrics = {
        totalReceivables: financeData.total_receivables || 0,
        totalPayables: financeData.total_payables || 0,
        cashFlow: financeData.cash_flow || 0,
        outstandingInvoices: financeData.outstanding_invoices || 0,
        overdueInvoices: financeData.overdue_invoices || 0,
        averagePaymentTime: financeData.average_payment_time || 0
      }

      // Calculate top products
      const topProducts = this.calculateTopProducts(orderData, productData)

      // Calculate recent activity
      const recentActivity = this.calculateRecentActivity(orderData, customerData, productData, inventoryData, productionData, financeData)

      // Calculate monthly trends
      const monthlyTrends = this.calculateMonthlyTrends(orderData, customerData)

      // Calculate growth metrics
      const salesGrowth = this.calculateSalesGrowth(orderData)
      const customerRetention = this.calculateCustomerRetention(customerData, orderData)

      const metrics: DashboardMetrics = {
        totalRevenue,
        totalOrders,
        activeCustomers,
        totalProducts,
        inventoryValue,
        averageOrderValue,
        customerRetention,
        salesGrowth,
        customerSatisfaction: 4.8, // TODO: Calculate from reviews/feedback
        productionEfficiency,
        globalReach: '12 Countries', // TODO: Calculate from customer locations
        teamPerformance: '94%', // TODO: Calculate from team metrics
        productionMetrics,
        financeMetrics,
        topProducts,
        recentActivity,
        monthlyTrends
      }

      return { data: metrics, error: null }
    } catch (error: any) {
      console.error('AnalyticsService.getDashboardMetrics error:', error)
      return { data: null, error: error.message }
    }
  }

  /**
   * Fetch customers with optional filters
   */
  private async fetchCustomers(filters?: AnalyticsFilters): Promise<ServiceResponse<any[]>> {
    try {
      if (!this.supabase) {
        return { data: [], error: null }
      }

      // Use B2B customers table instead of regular customers table
      let query = this.supabase
        .from('b2b_customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate)
      }

      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching customers:', error)
        return { data: [], error: `Failed to fetch customers: ${error.message}` }
      }
      
      return { data: data || [], error: null }
    } catch (error: any) {
      console.error('Error in fetchCustomers:', error)
      return { data: [], error: `Failed to fetch customers: ${error.message}` }
    }
  }

  /**
   * Fetch orders with optional filters
   */
  private async fetchOrders(filters?: AnalyticsFilters): Promise<ServiceResponse<any[]>> {
    try {
      if (!this.supabase) {
        return { data: [], error: null }
      }

      // Use B2B orders table instead of regular orders table
      let query = this.supabase
        .from('b2b_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate)
      }
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId)
      }

      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching orders:', error)
        return { data: [], error: `Failed to fetch orders: ${error.message}` }
      }
      
      return { data: data || [], error: null }
    } catch (error: any) {
      console.error('Error in fetchOrders:', error)
      return { data: [], error: `Failed to fetch orders: ${error.message}` }
    }
  }

  /**
   * Fetch products with optional filters
   */
  private async fetchProducts(filters?: AnalyticsFilters): Promise<ServiceResponse<any[]>> {
    try {
      if (!this.supabase) {
        return { data: [], error: null }
      }

      // Use inventory table instead of products table
      let query = this.supabase
        .from('inventory')
        .select('id, name, unit_price, category, sku, status, quantity')

      if (filters?.productCategory) {
        query = query.eq('category', filters.productCategory)
      }

      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching products:', error)
        return { data: [], error: `Failed to fetch products: ${error.message}` }
      }
      
      // Map database columns to frontend-friendly format
      const mappedData = (data || []).map((product: any) => ({
        id: product.id,
        name: product.name || '',
        price: Number(product.unit_price) || 0,
        stock: Number(product.quantity) || 0, // Use quantity from inventory table
        category: product.category || '',
        sku: product.sku || '',
        image: undefined, // images column doesn't exist in inventory
        status: product.status || 'active'
      }))

      return { data: mappedData, error: null }
    } catch (error: any) {
      console.error('Error in fetchProducts:', error)
      return { data: [], error: `Failed to fetch products: ${error.message}` }
    }
  }

  /**
   * Fetch inventory with optional filters
   */
  private async fetchInventory(filters?: AnalyticsFilters): Promise<ServiceResponse<any[]>> {
    try {
      if (!this.supabase) {
        return { data: [], error: null }
      }

      let query = this.supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.productCategory) {
        query = query.eq('category', filters.productCategory)
      }

      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching inventory:', error)
        return { data: [], error: `Failed to fetch inventory: ${error.message}` }
      }
      
      return { data: data || [], error: null }
    } catch (error: any) {
      console.error('Error in fetchInventory:', error)
      return { data: [], error: `Failed to fetch inventory: ${error.message}` }
    }
  }

  /**
   * Fetch production data with optional filters
   */
  private async fetchProduction(filters?: AnalyticsFilters): Promise<ServiceResponse<any[]>> {
    try {
      if (!this.supabase) {
        return { data: [], error: null }
      }

      let query = this.supabase
        .from('products_in_production_pipeline')
        .select('*')
        .order('"Start Date"', { ascending: false })

      if (filters?.startDate) {
        query = query.gte('"Start Date"', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('"Start Date"', filters.endDate)
      }

      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching production data:', error)
        return { data: [], error: `Failed to fetch production data: ${error.message}` }
      }
      
      // Map database columns to frontend-friendly format
      const mappedData = (data || []).map((item: any) => ({
        id: item.id,
        product_id: item['Product ID'],
        name: item.Name,
        description: item.Description,
        category: item.Category,
        stage: item.Stage,
        status: item.Status,
        assigned_employee: item['Assigned Employee'],
        start_date: item['Start Date'],
        estimated_completion: item['Estimated Completion'],
        actual_completion: item.actual_completion,
        priority: item.priority || 'medium',
        notes: item.Notes,
        order_id: item.order_id,
        customer_name: item.customer_name,
        created_at: item.created_at,
        updated_at: item.updated_at
      }))

      return { data: mappedData, error: null }
    } catch (error: any) {
      console.error('Error in fetchProduction:', error)
      return { data: [], error: `Failed to fetch production data: ${error.message}` }
    }
  }

  /**
   * Fetch finance data with optional filters
   */
  private async fetchFinance(filters?: AnalyticsFilters): Promise<ServiceResponse<any>> {
    try {
      // For now, return mock finance data since the finance tables may not exist yet
      // In a real implementation, this would fetch from billing_invoices, billing_payments, etc.
      const mockFinanceData = {
        total_receivables: 15000,
        total_payables: 8000,
        cash_flow: 7000,
        outstanding_invoices: 5,
        overdue_invoices: 2,
        average_payment_time: 15
      }

      return { data: mockFinanceData, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  /**
   * Calculate top selling products
   */
  private calculateTopProducts(orders: any[], products: any[]): Array<{ name: string; sales: number; revenue: number; stock: number }> {
    // Create a map of product sales
    const productSales = new Map<string, { sales: number; revenue: number }>()

    // Count sales from orders
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const productId = item.product_id || item.inventory_id
          const existing = productSales.get(productId) || { sales: 0, revenue: 0 }
          productSales.set(productId, {
            sales: existing.sales + (item.quantity || 1),
            revenue: existing.revenue + (item.total_price || item.unit_price || 0)
          })
        })
      }
    })

    // Map to product names and add stock info
    const topProducts = Array.from(productSales.entries())
      .map(([productId, sales]) => {
        const product = products.find(p => p.id === productId)
        return {
          name: product?.name || `Product ${productId}`,
          sales: sales.sales,
          revenue: sales.revenue,
          stock: product?.stock || 0
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return topProducts
  }

  /**
   * Calculate recent activity from all data sources
   */
  private calculateRecentActivity(orders: any[], customers: any[], products: any[], inventory: any[], production: any[], finance: any[]): Array<{
    type: 'order' | 'customer' | 'product' | 'inventory' | 'production' | 'finance'
    id: string
    title: string
    amount?: number
    time: string
  }> {
    const activities: any[] = []

    // Add recent orders
    orders.slice(0, 5).forEach(order => {
      activities.push({
        type: 'order' as const,
        id: order.id,
        title: `Order ${order.order_number || order.id}`,
        amount: order.total_amount,
        time: this.getTimeAgo(order.created_at)
      })
    })

    // Add recent customers
    customers.slice(0, 3).forEach(customer => {
      activities.push({
        type: 'customer' as const,
        id: customer.id,
        title: `New customer: ${customer.full_name || customer.name || 'Unknown'}`,
        time: this.getTimeAgo(customer.created_at)
      })
    })

    // Add recent products (no created_at, so just take first 2 by id)
    products.slice(0, 2).forEach(product => {
      activities.push({
        type: 'product' as const,
        id: product.id,
        title: `New product: ${product.name}`,
        time: '' // No created_at available
      })
    })

    // Sort by time and return top 10 (orders and customers have time, products do not)
    return activities
      .sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      })
      .slice(0, 10)
  }

  /**
   * Calculate monthly trends
   */
  private calculateMonthlyTrends(orders: any[], customers: any[]): Array<{
    month: string
    revenue: number
    orders: number
    customers: number
  }> {
    const monthlyData = new Map<string, { revenue: number; orders: number; customers: number }>()

    // Process orders
    orders.forEach(order => {
      const month = new Date(order.created_at).toISOString().slice(0, 7) // YYYY-MM
      const existing = monthlyData.get(month) || { revenue: 0, orders: 0, customers: 0 }
      monthlyData.set(month, {
        revenue: existing.revenue + (order.total_amount || 0),
        orders: existing.orders + 1,
        customers: existing.customers
      })
    })

    // Process customers
    customers.forEach(customer => {
      const month = new Date(customer.created_at).toISOString().slice(0, 7)
      const existing = monthlyData.get(month) || { revenue: 0, orders: 0, customers: 0 }
      monthlyData.set(month, {
        ...existing,
        customers: existing.customers + 1
      })
    })

    // Convert to array and sort
    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        ...data
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // Last 6 months
  }

  /**
   * Calculate sales growth percentage
   */
  private calculateSalesGrowth(orders: any[]): number {
    if (orders.length < 2) return 0

    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)

    const lastMonthRevenue = orders
      .filter(order => new Date(order.created_at) >= lastMonth)
      .reduce((sum, order) => sum + (order.total_amount || 0), 0)

    const previousMonthRevenue = orders
      .filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= twoMonthsAgo && orderDate < lastMonth
      })
      .reduce((sum, order) => sum + (order.total_amount || 0), 0)

    if (previousMonthRevenue === 0) return lastMonthRevenue > 0 ? 100 : 0

    return ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
  }

  /**
   * Calculate customer retention rate
   */
  private calculateCustomerRetention(customers: any[], orders: any[]): number {
    if (customers.length === 0) return 0

    // Count customers with multiple orders
    const customerOrderCounts = new Map<string, number>()
    orders.forEach(order => {
      const customerId = order.customer_id
      customerOrderCounts.set(customerId, (customerOrderCounts.get(customerId) || 0) + 1)
    })

    const repeatCustomers = Array.from(customerOrderCounts.values()).filter(count => count > 1).length
    return (repeatCustomers / customers.length) * 100
  }

  /**
   * Calculate production metrics
   */
  private calculateProductionMetrics(productionData: any[]): any {
    if (productionData.length === 0) {
      return {
        efficiency: { value: 0, change: 0, trend: "neutral" },
        cycleTime: { value: 0, change: 0, trend: "neutral" },
        qualityPass: { value: 0, change: 0, trend: "neutral" },
        onTimeDelivery: { value: 0, change: 0, trend: "neutral" },
        totalItems: 0,
        itemsByStage: {},
        itemsByStatus: {},
        averageCompletionTime: 0,
        onTimeDeliveryRate: 0,
        itemsInProduction: 0,
        completedItems: 0
      }
    }

    const totalItems = productionData.length;
    const itemsByStage = new Map<string, number>();
    const itemsByStatus = new Map<string, number>();
    let totalCompletionTime = 0;
    let onTimeCount = 0;
    let completedItems = 0;
    let itemsInProduction = 0;

    productionData.forEach(item => {
      const stage = item.stage || 'Unknown';
      const status = item.status || 'Unknown';
      const completionTime = item.completion_time || 0;
      const deliveryTime = item.delivery_time || 0;

      itemsByStage.set(stage, (itemsByStage.get(stage) || 0) + 1);
      itemsByStatus.set(status, (itemsByStatus.get(status) || 0) + 1);
      totalCompletionTime += completionTime;

      // Count completed and in-production items
      if (status === 'completed' || status === 'Completed') completedItems++;
      else itemsInProduction++;

      if (deliveryTime <= 0) {
        onTimeCount++;
      }
    });

    // Calculate efficiency (completed items / total items)
    const efficiency = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

    // Calculate average cycle time
    const cycleTimes: number[] = []
    productionData.forEach(item => {
      if (item.completion_time && item.completion_time > 0) {
        cycleTimes.push(item.completion_time)
      }
    })
    const avgCycleTime = cycleTimes.length > 0 ? 
      cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length : 0

    // Calculate quality pass rate (assuming items that reached completion passed QC)
    const qualityPassRate = completedItems > 0 ? 
      (completedItems / totalItems) * 100 : 0

    // Calculate on-time delivery rate
    const onTimeItems = productionData.filter(item => {
      if (!item.actual_completion || !item.estimated_completion) return false
      const actual = new Date(item.actual_completion)
      const estimated = new Date(item.estimated_completion)
      return actual <= estimated
    }).length
    const onTimeDeliveryRate = completedItems > 0 ? 
      (onTimeItems / completedItems) * 100 : 0

    return {
      efficiency: { 
        value: Math.round(efficiency * 10) / 10, 
        change: 5, // Mock change - would calculate from historical data
        trend: "up" 
      },
      cycleTime: { 
        value: Math.round(avgCycleTime * 10) / 10, 
        change: -0.8, // Mock change
        trend: "down" 
      },
      qualityPass: { 
        value: Math.round(qualityPassRate * 10) / 10, 
        change: 3, // Mock change
        trend: "up" 
      },
      onTimeDelivery: { 
        value: Math.round(onTimeDeliveryRate * 10) / 10, 
        change: -2, // Mock change
        trend: "down" 
      },
      totalItems,
      itemsByStage: Object.fromEntries(itemsByStage),
      itemsByStatus: Object.fromEntries(itemsByStatus),
      averageCompletionTime: totalItems > 0 ? totalCompletionTime / totalItems : 0,
      onTimeDeliveryRate: totalItems > 0 ? (onTimeCount / totalItems) * 100 : 0,
      itemsInProduction,
      completedItems
    };
  }

  /**
   * Calculate production efficiency
   */
  private calculateProductionEfficiency(productionData: any[]): number {
    if (productionData.length === 0) return 0;

    let completedItems = 0;
    let onTimeItems = 0;
    let totalProgress = 0;

    productionData.forEach(item => {
      // Count completed items
      if (item.status === 'Completed' || item.stage === 'Completed') {
        completedItems++;
      }

      // Calculate on-time delivery
      if (item.actual_completion && item.estimated_completion) {
        const actual = new Date(item.actual_completion);
        const estimated = new Date(item.estimated_completion);
        if (actual <= estimated) {
          onTimeItems++;
        }
      }

      // Calculate progress based on stage
      const stageProgress: Record<string, number> = {
        'Design': 12.5,
        'Casting': 25,
        'Setting': 37.5,
        'Stone Setting': 37.5,
        'Polishing': 50,
        'QC': 62.5,
        'Quality Check': 62.5,
        'Completed': 100,
        'Rework': 25,
        'Shipping': 87.5,
        'Assembly': 75,
        'Engraving': 87.5,
        'Restoration': 50
      };

      const progress = stageProgress[item.stage] || 0;
      totalProgress += progress;
    });

    const completionRate = productionData.length > 0 ? (completedItems / productionData.length) * 100 : 0;
    const onTimeRate = completedItems > 0 ? (onTimeItems / completedItems) * 100 : 0;
    const averageProgress = productionData.length > 0 ? totalProgress / productionData.length : 0;

    // Calculate overall efficiency as weighted average
    const efficiency = (completionRate * 0.4) + (onTimeRate * 0.3) + (averageProgress * 0.3);
    
    return Math.round(efficiency * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Convert date to "time ago" format
   */
  private getTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`
    if (diffInHours < 48) return '1 day ago'
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  /**
   * Get comprehensive customer analytics with real data
   */
  async getCustomerAnalytics(filters?: AnalyticsFilters): Promise<ServiceResponse<any>> {
    try {
      // Fetch customers and orders data
      const [customersResponse, ordersResponse] = await Promise.all([
        this.fetchCustomers(filters),
        this.fetchOrders(filters)
      ])

      if (customersResponse.error) throw customersResponse.error
      if (ordersResponse.error) throw ordersResponse.error

      const customers = customersResponse.data || []
      const orders = ordersResponse.data || []

      // Calculate Customer Lifetime Value (CLV)
      const clvData = this.calculateCustomerLifetimeValue(customers, orders)
      
      // Calculate customer segmentation
      const segmentation = this.calculateCustomerSegmentation(customers, orders)
      
      // Calculate retention metrics
      const retention = this.calculateCustomerRetentionMetrics(customers, orders)
      
      // Calculate customer behavior analysis
      const behavior = this.calculateCustomerBehavior(customers, orders)
      
      // Calculate geographic distribution
      const geographic = this.calculateGeographicDistribution(customers)
      
      // Calculate purchase frequency
      const frequency = this.calculatePurchaseFrequency(customers, orders)

      // Calculate month-over-month metrics
      const monthlyMetrics = this.calculateMonthlyMetrics(customers, orders)

      return {
        data: {
          overview: {
            totalCustomers: customers.length,
            activeCustomers: customers.length, // All customers are considered active since no status column
            newThisMonth: this.getNewCustomersThisMonth(customers),
            averageOrderValue: this.calculateAverageOrderValue(orders),
            totalRevenue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
            averageCLV: clvData.averageCLV,
            medianCLV: clvData.medianCLV,
            top10PercentCLV: clvData.top10PercentCLV,
            // Month-over-month changes
            totalCustomersChange: monthlyMetrics.totalCustomersChange,
            averageOrderValueChange: monthlyMetrics.averageOrderValueChange,
            retentionRateChange: monthlyMetrics.retentionRateChange,
            retentionRate: retention.repeatPurchaseRate
          },
          clv: clvData,
          segmentation,
          retention,
          behavior,
          geographic,
          frequency,
          monthlyMetrics
        },
        error: null
      }
    } catch (error: any) {
      console.error('AnalyticsService.getCustomerAnalytics error:', error)
      return { data: null, error: error.message }
    }
  }

  /**
   * Calculate Customer Lifetime Value (CLV)
   * CLV = (Average Order Value × Purchase Frequency × Customer Lifespan)
   */
  private calculateCustomerLifetimeValue(customers: any[], orders: any[]): any {
    const customerOrderMap = new Map<string, any[]>()
    
    // Group orders by customer
    orders.forEach(order => {
      const customerId = order.customer_id
      if (!customerOrderMap.has(customerId)) {
        customerOrderMap.set(customerId, [])
      }
      customerOrderMap.get(customerId)!.push(order)
    })

    // Calculate CLV for each customer
    const customerCLVs: Array<{ customerId: string; clv: number; orderCount: number; totalSpent: number }> = []
    
    customers.forEach(customer => {
      const customerOrders = customerOrderMap.get(customer.id) || []
      const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const orderCount = customerOrders.length
      
      if (orderCount > 0) {
        const averageOrderValue = totalSpent / orderCount
        const purchaseFrequency = orderCount // Simplified for now
        const customerLifespan = this.calculateCustomerLifespan(customer.created_at)
        const clv = averageOrderValue * purchaseFrequency * customerLifespan
        
        customerCLVs.push({
          customerId: customer.id,
          clv,
          orderCount,
          totalSpent
        })
      }
    })

    // Sort by CLV for distribution calculation
    customerCLVs.sort((a, b) => b.clv - a.clv)

    // Calculate distribution buckets
    const distribution = this.calculateCLVDistribution(customerCLVs)

    // Calculate statistics
    const clvValues = customerCLVs.map(c => c.clv)
    const averageCLV = clvValues.length > 0 ? clvValues.reduce((sum, clv) => sum + clv, 0) / clvValues.length : 0
    const medianCLV = this.calculateMedian(clvValues)
    const top10PercentCLV = clvValues.length > 0 ? clvValues[Math.floor(clvValues.length * 0.1)] : 0

    return {
      averageCLV: Math.round(averageCLV * 100) / 100,
      medianCLV: Math.round(medianCLV * 100) / 100,
      top10PercentCLV: Math.round(top10PercentCLV * 100) / 100,
      distribution,
      customerCLVs
    }
  }

  /**
   * Calculate customer segmentation based on real data
   */
  private calculateCustomerSegmentation(customers: any[], orders: any[]): any {
    const customerOrderMap = new Map<string, any[]>()
    
    // Group orders by customer
    orders.forEach(order => {
      const customerId = order.customer_id
      if (!customerOrderMap.has(customerId)) {
        customerOrderMap.set(customerId, [])
      }
      customerOrderMap.get(customerId)!.push(order)
    })

    const segments = {
      highValue: { count: 0, customers: [] as any[], totalRevenue: 0 },
      regular: { count: 0, customers: [] as any[], totalRevenue: 0 },
      new: { count: 0, customers: [] as any[], totalRevenue: 0 },
      dormant: { count: 0, customers: [] as any[], totalRevenue: 0 }
    }

    customers.forEach(customer => {
      const customerOrders = customerOrderMap.get(customer.id) || []
      const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const orderCount = customerOrders.length
      const lastOrderDate = customerOrders.length > 0 ? 
        Math.max(...customerOrders.map(o => new Date(o.created_at).getTime())) : 0
      const daysSinceLastOrder = lastOrderDate > 0 ? 
        (Date.now() - lastOrderDate) / (1000 * 60 * 60 * 24) : Infinity

      const customerData = {
        id: customer.id,
        name: customer.name || customer.email,
        totalSpent,
        orderCount,
        lastOrderDate: lastOrderDate > 0 ? new Date(lastOrderDate) : null
      }

      // Segment customers
      if (totalSpent > 5000) {
        segments.highValue.count++
        segments.highValue.customers.push(customerData)
        segments.highValue.totalRevenue += totalSpent
      } else if (orderCount > 1) {
        segments.regular.count++
        segments.regular.customers.push(customerData)
        segments.regular.totalRevenue += totalSpent
      } else if (orderCount === 1) {
        segments.new.count++
        segments.new.customers.push(customerData)
        segments.new.totalRevenue += totalSpent
      } else {
        segments.dormant.count++
        segments.dormant.customers.push(customerData)
      }
    })

    return segments
  }

  /**
   * Calculate customer retention metrics
   */
  private calculateCustomerRetentionMetrics(customers: any[], orders: any[]): any {
    const customerOrderMap = new Map<string, any[]>()
    
    // Group orders by customer
    orders.forEach(order => {
      const customerId = order.customer_id
      if (!customerOrderMap.has(customerId)) {
        customerOrderMap.set(customerId, [])
      }
      customerOrderMap.get(customerId)!.push(order)
    })

    // Calculate repeat purchase rate
    const customersWithOrders = customers.filter(c => customerOrderMap.has(c.id))
    const customersWithMultipleOrders = customersWithOrders.filter(c => 
      (customerOrderMap.get(c.id) || []).length > 1
    )
    const repeatPurchaseRate = customersWithOrders.length > 0 ? 
      (customersWithMultipleOrders.length / customersWithOrders.length) * 100 : 0

    // Calculate average time between purchases
    const timeBetweenPurchases: number[] = []
    customersWithMultipleOrders.forEach(customer => {
      const customerOrders = customerOrderMap.get(customer.id) || []
      const sortedOrders = customerOrders.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      
      for (let i = 1; i < sortedOrders.length; i++) {
        const timeDiff = new Date(sortedOrders[i].created_at).getTime() - 
                        new Date(sortedOrders[i-1].created_at).getTime()
        timeBetweenPurchases.push(timeDiff / (1000 * 60 * 60 * 24)) // Convert to days
      }
    })

    const averageTimeBetweenPurchases = timeBetweenPurchases.length > 0 ? 
      timeBetweenPurchases.reduce((sum, time) => sum + time, 0) / timeBetweenPurchases.length : 0

    // Calculate customer growth trends (last 6 months)
    const monthlyGrowth = this.calculateMonthlyCustomerGrowth(customers)

    return {
      repeatPurchaseRate: Math.round(repeatPurchaseRate * 10) / 10,
      averageTimeBetweenPurchases: Math.round(averageTimeBetweenPurchases * 10) / 10,
      monthlyGrowth,
      totalCustomers: customers.length,
      activeCustomers: customersWithOrders.length,
      repeatCustomers: customersWithMultipleOrders.length
    }
  }

  /**
   * Calculate customer behavior analysis
   */
  private calculateCustomerBehavior(customers: any[], orders: any[]): any {
    const customerOrderMap = new Map<string, any[]>()
    
    // Group orders by customer
    orders.forEach(order => {
      const customerId = order.customer_id
      if (!customerOrderMap.has(customerId)) {
        customerOrderMap.set(customerId, [])
      }
      customerOrderMap.get(customerId)!.push(order)
    })

    // Calculate purchase patterns
    const purchasePatterns = {
      weekdayDistribution: new Array(7).fill(0),
      monthDistribution: new Array(12).fill(0),
      timeOfDayDistribution: new Array(24).fill(0)
    }

    orders.forEach(order => {
      const orderDate = new Date(order.created_at)
      purchasePatterns.weekdayDistribution[orderDate.getDay()]++
      purchasePatterns.monthDistribution[orderDate.getMonth()]++
      purchasePatterns.timeOfDayDistribution[orderDate.getHours()]++
    })

    // Calculate average order value by customer segment
    const customerSegments = this.calculateCustomerSegmentation(customers, orders)
    const segmentAOV = {
      highValue: customerSegments.highValue.count > 0 ? 
        customerSegments.highValue.totalRevenue / customerSegments.highValue.count : 0,
      regular: customerSegments.regular.count > 0 ? 
        customerSegments.regular.totalRevenue / customerSegments.regular.count : 0,
      new: customerSegments.new.count > 0 ? 
        customerSegments.new.totalRevenue / customerSegments.new.count : 0
    }

    return {
      purchasePatterns,
      segmentAOV,
      totalOrders: orders.length,
      averageOrderValue: this.calculateAverageOrderValue(orders)
    }
  }

  /**
   * Calculate geographic distribution
   */
  private calculateGeographicDistribution(customers: any[]): any {
    const geographicData = new Map<string, number>()
    
    customers.forEach(customer => {
      const location = customer.location || customer.city || 'Unknown'
      geographicData.set(location, (geographicData.get(location) || 0) + 1)
    })

    return Array.from(geographicData.entries()).map(([location, count]) => ({
      location,
      count,
      percentage: Math.round((count / customers.length) * 100 * 10) / 10
    })).sort((a, b) => b.count - a.count)
  }

  /**
   * Calculate purchase frequency
   */
  private calculatePurchaseFrequency(customers: any[], orders: any[]): any {
    const customerOrderMap = new Map<string, any[]>()
    
    // Group orders by customer
    orders.forEach(order => {
      const customerId = order.customer_id
      if (!customerOrderMap.has(customerId)) {
        customerOrderMap.set(customerId, [])
      }
      customerOrderMap.get(customerId)!.push(order)
    })

    const frequencyDistribution = {
      '1 order': 0,
      '2-3 orders': 0,
      '4-6 orders': 0,
      '7-10 orders': 0,
      '10+ orders': 0
    }

    customers.forEach(customer => {
      const orderCount = (customerOrderMap.get(customer.id) || []).length
      
      if (orderCount === 1) frequencyDistribution['1 order']++
      else if (orderCount >= 2 && orderCount <= 3) frequencyDistribution['2-3 orders']++
      else if (orderCount >= 4 && orderCount <= 6) frequencyDistribution['4-6 orders']++
      else if (orderCount >= 7 && orderCount <= 10) frequencyDistribution['7-10 orders']++
      else if (orderCount > 10) frequencyDistribution['10+ orders']++
    })

    const totalCustomersWithOrders = customers.filter(c => customerOrderMap.has(c.id)).length
    const averageFrequency = totalCustomersWithOrders > 0 ? 
      orders.length / totalCustomersWithOrders : 0

    return {
      distribution: frequencyDistribution,
      averageFrequency: Math.round(averageFrequency * 10) / 10,
      totalCustomersWithOrders
    }
  }

  /**
   * Helper methods
   */
  private calculateCustomerLifespan(createdAt: string): number {
    const created = new Date(createdAt)
    const now = new Date()
    const diffInDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    return Math.max(1, diffInDays / 365) // Return years, minimum 1 year
  }

  private calculateCLVDistribution(customerCLVs: Array<{ clv: number }>): Array<{ value: string; count: number; percentage: number }> {
    const buckets = [
      { min: 0, max: 100, label: "$0-$100" },
      { min: 101, max: 500, label: "$101-$500" },
      { min: 501, max: 1000, label: "$501-$1,000" },
      { min: 1001, max: 2500, label: "$1,001-$2,500" },
      { min: 2501, max: 5000, label: "$2,501-$5,000" },
      { min: 5001, max: 10000, label: "$5,001-$10,000" },
      { min: 10001, max: Infinity, label: "$10,001+" }
    ]

    const distribution = buckets.map(bucket => {
      const count = customerCLVs.filter(c => c.clv >= bucket.min && c.clv <= bucket.max).length
      const percentage = customerCLVs.length > 0 ? (count / customerCLVs.length) * 100 : 0
      return {
        value: bucket.label,
        count,
        percentage: Math.round(percentage * 10) / 10
      }
    })

    return distribution
  }

  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? 
      (sorted[middle - 1] + sorted[middle]) / 2 : 
      sorted[middle]
  }

  private getNewCustomersThisMonth(customers: any[]): number {
    const now = new Date()
    return customers.filter(c => {
      const created = new Date(c.created_at)
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length
  }

  private calculateAverageOrderValue(orders: any[]): number {
    if (orders.length === 0) return 0
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    return Math.round((totalRevenue / orders.length) * 100) / 100
  }

  private calculateMonthlyCustomerGrowth(customers: any[]): Array<{ month: string; count: number; growth: number }> {
    const monthlyData = new Map<string, number>()
    const now = new Date()
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
      monthlyData.set(monthKey, 0)
    }

    // Count customers by month
    customers.forEach(customer => {
      const created = new Date(customer.created_at)
      const monthKey = created.toISOString().slice(0, 7)
      if (monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1)
      }
    })

    // Calculate growth
    const monthlyGrowth: Array<{ month: string; count: number; growth: number }> = []
    let previousCount = 0

    Array.from(monthlyData.entries()).forEach(([month, count]) => {
      const growth = previousCount > 0 ? ((count - previousCount) / previousCount) * 100 : 0
      monthlyGrowth.push({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count,
        growth: Math.round(growth * 10) / 10
      })
      previousCount = count
    })

    return monthlyGrowth
  }

  /**
   * Calculate month-over-month metrics for dashboard cards
   */
  private calculateMonthlyMetrics(customers: any[], orders: any[]): any {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Get current month data
    const currentMonthCustomers = customers.filter(customer => {
      const created = new Date(customer.created_at)
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear
    })
    
    const currentMonthOrders = orders.filter(order => {
      const created = new Date(order.created_at)
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear
    })
    
    // Get previous month data
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    const previousMonthCustomers = customers.filter(customer => {
      const created = new Date(customer.created_at)
      return created.getMonth() === previousMonth && created.getFullYear() === previousYear
    })
    
    const previousMonthOrders = orders.filter(order => {
      const created = new Date(order.created_at)
      return created.getMonth() === previousMonth && created.getFullYear() === previousYear
    })
    
    // Calculate total customers change
    const totalCustomersChange = previousMonthCustomers.length > 0 ? 
      ((currentMonthCustomers.length - previousMonthCustomers.length) / previousMonthCustomers.length) * 100 : 0
    
    // Calculate average order value change
    const currentMonthAOV = currentMonthOrders.length > 0 ? 
      currentMonthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / currentMonthOrders.length : 0
    const previousMonthAOV = previousMonthOrders.length > 0 ? 
      previousMonthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / previousMonthOrders.length : 0
    
    const averageOrderValueChange = previousMonthAOV > 0 ? 
      ((currentMonthAOV - previousMonthAOV) / previousMonthAOV) * 100 : 0
    
    // Calculate retention rate change (simplified - based on repeat customers)
    const currentMonthRepeatCustomers = this.calculateRepeatCustomers(currentMonthOrders)
    const previousMonthRepeatCustomers = this.calculateRepeatCustomers(previousMonthOrders)
    
    const currentRetentionRate = currentMonthOrders.length > 0 ? 
      (currentMonthRepeatCustomers / currentMonthOrders.length) * 100 : 0
    const previousRetentionRate = previousMonthOrders.length > 0 ? 
      (previousMonthRepeatCustomers / previousMonthOrders.length) * 100 : 0
    
    const retentionRateChange = previousRetentionRate > 0 ? 
      currentRetentionRate - previousRetentionRate : 0
    
    return {
      totalCustomersChange: Math.round(totalCustomersChange * 10) / 10,
      averageOrderValueChange: Math.round(averageOrderValueChange * 10) / 10,
      retentionRateChange: Math.round(retentionRateChange * 10) / 10,
      currentMonthCustomers: currentMonthCustomers.length,
      previousMonthCustomers: previousMonthCustomers.length,
      currentMonthAOV: Math.round(currentMonthAOV * 100) / 100,
      previousMonthAOV: Math.round(previousMonthAOV * 100) / 100,
      currentRetentionRate: Math.round(currentRetentionRate * 10) / 10,
      previousRetentionRate: Math.round(previousRetentionRate * 10) / 10
    }
  }

  /**
   * Calculate number of repeat customers from orders
   */
  private calculateRepeatCustomers(orders: any[]): number {
    const customerOrderCount = new Map<string, number>()
    
    orders.forEach(order => {
      const customerId = order.customer_id
      customerOrderCount.set(customerId, (customerOrderCount.get(customerId) || 0) + 1)
    })
    
    return Array.from(customerOrderCount.values()).filter(count => count > 1).length
  }

  /**
   * Get order analytics
   */
  async getOrderAnalytics(filters?: AnalyticsFilters): Promise<ServiceResponse<any>> {
    try {
      const { data: orders, error } = await this.fetchOrders(filters)
      if (error) throw error

      const totalOrders = (orders ?? []).length
      const totalRevenue = (orders ?? []).reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Calculate processing time (mock for now)
      const processingTime = 3.2

      return {
        data: {
          totalOrders,
          pendingOrders: (orders ?? []).filter(o => o.status === 'pending').length,
          completedOrders: (orders ?? []).filter(o => o.status === 'completed').length,
          totalRevenue,
          averageOrderValue,
          processingTime
        },
        error: null
      }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  /**
   * Get inventory analytics
   */
  async getInventoryAnalytics(filters?: AnalyticsFilters): Promise<ServiceResponse<any>> {
    try {
      const { data: inventory, error } = await this.fetchInventory(filters)
      if (error) throw error

      const totalItems = (inventory ?? []).length
      const totalValue = (inventory ?? []).reduce((sum, item) => sum + (item.value || 0), 0)
      // Since stock_quantity column doesn't exist, use quantity column or default to 0
      const lowStockItems = (inventory ?? []).filter(item => (item.quantity || 0) < 10).length
      const outOfStockItems = (inventory ?? []).filter(item => (item.quantity || 0) === 0).length

      return {
        data: {
          totalItems,
          totalValue,
          lowStockItems,
          outOfStockItems,
          averageValue: totalItems > 0 ? totalValue / totalItems : 0
        },
        error: null
      }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  /**
   * Get real sales analytics (metrics, trends, category, channel)
   */
  async getSalesAnalytics(filters?: AnalyticsFilters): Promise<ServiceResponse<any>> {
    try {
      // Fetch orders and products
      const [ordersResponse, productsResponse] = await Promise.all([
        this.fetchOrders(filters),
        this.fetchProducts(filters)
      ])
      if (ordersResponse.error) throw ordersResponse.error
      if (productsResponse.error) throw productsResponse.error
      const orders = ordersResponse.data || []
      const products = productsResponse.data || []

      // --- Metrics ---
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      const orderCount = orders.length
      const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0
      // If you have returns, calculate return rate (mocked here)
      const returnRate = 0.032
      // New customers (orders with first-time customer)
      const customerOrderCounts = new Map<string, number>()
      orders.forEach(o => {
        if (!customerOrderCounts.has(o.customer_id)) customerOrderCounts.set(o.customer_id, 0)
        customerOrderCounts.set(o.customer_id, customerOrderCounts.get(o.customer_id)! + 1)
      })
      const newCustomers = Array.from(customerOrderCounts.values()).filter(count => count === 1).length

      // --- Revenue Trends ---
      const dailyTrends = this.calculateRevenueTrends(orders, 'day')
      const weeklyTrends = this.calculateRevenueTrends(orders, 'week')
      const monthlyTrends = this.calculateRevenueTrends(orders, 'month')

      // --- Sales by Category ---
      const salesByCategory = this.calculateSalesByCategory(orders, products)

      // --- Channel Performance ---
      const channelPerformance = this.calculateChannelPerformance(orders)

      return {
        data: {
          metrics: {
            totalRevenue,
            orderCount,
            averageOrderValue,
            returnRate,
            newCustomers
          },
          trends: {
            daily: dailyTrends,
            weekly: weeklyTrends,
            monthly: monthlyTrends
          },
          salesByCategory,
          channelPerformance
        },
        error: null
      }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  /**
   * Calculate revenue trends (daily, weekly, monthly)
   */
  private calculateRevenueTrends(orders: any[], period: 'day' | 'week' | 'month') {
    const trends: Record<string, { revenue: number; transactions: number }> = {}
    orders.forEach(order => {
      const date = new Date(order.created_at)
      let key = ''
      if (period === 'day') {
        key = date.toISOString().slice(0, 10) // YYYY-MM-DD
      } else if (period === 'week') {
        // Get year-week string
        const week = this.getWeekNumber(date)
        key = `${date.getFullYear()}-W${week}`
      } else if (period === 'month') {
        key = date.toLocaleString('default', { month: 'short', year: 'numeric' })
      }
      if (!trends[key]) trends[key] = { revenue: 0, transactions: 0 }
      trends[key].revenue += order.total_amount || 0
      trends[key].transactions += 1
    })
    // Convert to array and sort by date
    return Object.entries(trends).map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Calculate sales by product category
   */
  private calculateSalesByCategory(orders: any[], products: any[]) {
    // Map productId to category
    const productMap = new Map<string, any>()
    products.forEach(p => productMap.set(p.id, p))
    const categoryTotals: Record<string, { revenue: number; units: number }> = {}
    orders.forEach(order => {
      (order.items || []).forEach((item: any) => {
        const product = productMap.get(item.product_id)
        const category = product?.category || 'Uncategorized'
        if (!categoryTotals[category]) categoryTotals[category] = { revenue: 0, units: 0 }
        categoryTotals[category].revenue += (item.total || 0)
        categoryTotals[category].units += (item.quantity || 0)
      })
    })
    return Object.entries(categoryTotals).map(([name, v]) => ({ name, ...v }))
  }

  /**
   * Calculate channel performance (if channel is tracked)
   */
  private calculateChannelPerformance(orders: any[]) {
    // Assume order.channel exists (e.g., 'Online', 'In-Store', etc.)
    const channelTotals: Record<string, { revenue: number; units: number }> = {}
    orders.forEach(order => {
      const channel = order.channel || 'Unknown'
      if (!channelTotals[channel]) channelTotals[channel] = { revenue: 0, units: 0 }
      channelTotals[channel].revenue += order.total_amount || 0
      channelTotals[channel].units += (order.items || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
    })
    return Object.entries(channelTotals).map(([name, v]) => ({ name, ...v }))
  }

  /**
   * Helper: Get ISO week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d as any) - (yearStart as any)) / 86400000 + 1) / 7)
  }

  /**
   * Get comprehensive production analytics with real data
   */
  async getProductionAnalytics(filters?: AnalyticsFilters): Promise<ServiceResponse<any>> {
    try {
      // Fetch production data
      const productionResponse = await this.fetchProduction(filters)
      if (productionResponse.error) throw productionResponse.error
      const productionData = productionResponse.data || []

      // Calculate production metrics
      const metrics = this.calculateProductionMetrics(productionData)
      
      // Calculate production flow
      const flow = this.calculateProductionFlow(productionData)
      
      // Calculate cycle time analysis
      const cycleTime = this.calculateCycleTimeAnalysis(productionData)
      
      // Calculate bottleneck analysis
      const bottlenecks = this.calculateBottleneckAnalysis(productionData)
      
      // Calculate craftsperson performance
      const craftspersonPerformance = this.calculateCraftspersonPerformance(productionData)
      
      // Calculate quality analysis
      const quality = this.calculateQualityAnalysis(productionData)
      
      // Calculate capacity utilization
      const capacity = this.calculateCapacityUtilization(productionData)
      
      // Calculate trend analysis
      const trends = this.calculateProductionTrends(productionData)

      return {
        data: {
          metrics,
          flow,
          cycleTime,
          bottlenecks,
          craftspersonPerformance,
          quality,
          capacity,
          trends
        },
        error: null
      }
    } catch (error: any) {
      console.error('AnalyticsService.getProductionAnalytics error:', error)
      return { data: null, error: error.message }
    }
  }



  /**
   * Calculate production flow (items by stage)
   */
  private calculateProductionFlow(productionData: any[]): any {
    const stageCounts: Record<string, number> = {}
    const stageNames = ['Design', 'Casting', 'Stone Setting', 'Polishing', 'QC', 'Completed', 'Rework']
    
    // Initialize all stages
    stageNames.forEach(stage => stageCounts[stage] = 0)
    
    // Count items by stage
    productionData.forEach(item => {
      const stage = item.stage || 'Unknown'
      stageCounts[stage] = (stageCounts[stage] || 0) + 1
    })

    return {
      stages: Object.entries(stageCounts).map(([stage, count]) => ({
        stage,
        count,
        percentage: productionData.length > 0 ? (count / productionData.length) * 100 : 0
      })),
      totalItems: productionData.length
    }
  }

  /**
   * Calculate cycle time analysis by stage
   */
  private calculateCycleTimeAnalysis(productionData: any[]): any {
    const stageTimes: Record<string, { times: number[], avg: number, min: number, max: number }> = {}
    
    // Group completion times by stage
    productionData.forEach(item => {
      if (item.completion_time && item.completion_time > 0) {
        const stage = item.stage || 'Unknown'
        if (!stageTimes[stage]) {
          stageTimes[stage] = { times: [], avg: 0, min: 0, max: 0 }
        }
        stageTimes[stage].times.push(item.completion_time)
      }
    })

    // Calculate statistics for each stage
    const analysis = Object.entries(stageTimes).map(([stage, data]) => {
      const times = data.times.sort((a, b) => a - b)
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length
      const min = times[0]
      const max = times[times.length - 1]

      return {
        stage,
        avgTime: Math.round(avg * 10) / 10,
        minTime: Math.round(min * 10) / 10,
        maxTime: Math.round(max * 10) / 10
      }
    })

    return analysis
  }

  /**
   * Calculate bottleneck analysis
   */
  private calculateBottleneckAnalysis(productionData: any[]): any {
    const stageCounts: Record<string, number> = {}
    const stageTimes: Record<string, number[]> = {}
    
    // Count items and collect times by stage
    productionData.forEach(item => {
      const stage = item.stage || 'Unknown'
      stageCounts[stage] = (stageCounts[stage] || 0) + 1
      
      if (item.completion_time && item.completion_time > 0) {
        if (!stageTimes[stage]) stageTimes[stage] = []
        stageTimes[stage].push(item.completion_time)
      }
    })

    // Calculate average time per stage
    const bottlenecks = Object.entries(stageCounts).map(([stage, count]) => {
      const times = stageTimes[stage] || []
      const avgTime = times.length > 0 ? 
        times.reduce((sum, time) => sum + time, 0) / times.length : 0
      
      return {
        stage,
        itemCount: count,
        avgTime: Math.round(avgTime * 10) / 10,
        bottleneckScore: count * avgTime // Higher score = more bottleneck
      }
    }).sort((a, b) => b.bottleneckScore - a.bottleneckScore)

    return {
      bottlenecks,
      topBottleneck: bottlenecks[0] || null
    }
  }

  /**
   * Calculate craftsperson performance
   */
  private calculateCraftspersonPerformance(productionData: any[]): any {
    const craftspersonStats: Record<string, { 
      items: number, 
      completed: number, 
      avgTime: number, 
      qualityScore: number 
    }> = {}
    
    productionData.forEach(item => {
      const craftsperson = item.craftsperson || item.assigned_to || 'Unknown'
      if (!craftspersonStats[craftsperson]) {
        craftspersonStats[craftsperson] = { 
          items: 0, 
          completed: 0, 
          avgTime: 0, 
          qualityScore: 0 
        }
      }
      
      craftspersonStats[craftsperson].items++
      
      if (item.status === 'completed' || item.status === 'Completed') {
        craftspersonStats[craftsperson].completed++
      }
      
      if (item.completion_time && item.completion_time > 0) {
        const current = craftspersonStats[craftsperson]
        const totalTime = current.avgTime * (current.completed - 1) + item.completion_time
        current.avgTime = totalTime / current.completed
      }
    })

    // Calculate quality score (completion rate)
    const performance = Object.entries(craftspersonStats).map(([name, stats]) => ({
      name,
      items: stats.items,
      completed: stats.completed,
      completionRate: stats.items > 0 ? (stats.completed / stats.items) * 100 : 0,
      avgTime: Math.round(stats.avgTime * 10) / 10,
      qualityScore: Math.round((stats.completed / stats.items) * 100 * 10) / 10
    })).sort((a, b) => b.qualityScore - a.qualityScore)

    return performance
  }

  /**
   * Calculate quality analysis
   */
  private calculateQualityAnalysis(productionData: any[]): any {
    const totalItems = productionData.length
    const completedItems = productionData.filter(item => 
      item.status === 'completed' || item.status === 'Completed'
    ).length
    const reworkItems = productionData.filter(item => 
      item.stage === 'Rework' || item.status === 'rework'
    ).length
    const qualityIssues = productionData.filter(item => 
      item.quality_issues || item.defects
    ).length

    return {
      totalItems,
      completedItems,
      reworkItems,
      qualityIssues,
      passRate: totalItems > 0 ? ((totalItems - qualityIssues) / totalItems) * 100 : 0,
      reworkRate: totalItems > 0 ? (reworkItems / totalItems) * 100 : 0
    }
  }

  /**
   * Calculate capacity utilization
   */
  private calculateCapacityUtilization(productionData: any[]): any {
    // Mock capacity data - in real app would come from equipment/workstation data
    const totalCapacity = 30 // Mock total capacity
    const currentUtilization = productionData.length
    const utilizationRate = (currentUtilization / totalCapacity) * 100

    return {
      totalCapacity,
      currentUtilization,
      utilizationRate: Math.round(utilizationRate * 10) / 10,
      availableCapacity: totalCapacity - currentUtilization
    }
  }

  /**
   * Calculate production trends
   */
  private calculateProductionTrends(productionData: any[]): any {
    // Group by month and calculate trends
    const monthlyData: Record<string, { 
      total: number, 
      completed: number, 
      efficiency: number 
    }> = {}
    
    productionData.forEach(item => {
      const date = new Date(item.created_at)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, completed: 0, efficiency: 0 }
      }
      
      monthlyData[monthKey].total++
      
      if (item.status === 'completed' || item.status === 'Completed') {
        monthlyData[monthKey].completed++
      }
    })

    // Calculate efficiency for each month
    Object.keys(monthlyData).forEach(month => {
      const data = monthlyData[month]
      data.efficiency = data.total > 0 ? (data.completed / data.total) * 100 : 0
    })

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      total: data.total,
      completed: data.completed,
      efficiency: Math.round(data.efficiency * 10) / 10
    }))
  }

  /**
   * Get API usage analytics
   */
  async getApiUsageAnalytics(query: any): Promise<any> {
    try {
      // Mock implementation - in real app would query database
      const mockData = {
        totalRequests: 1250,
        averageResponseTime: 245,
        successRate: 98.5,
        topEndpoints: [
          { endpoint: '/api/orders', count: 450 },
          { endpoint: '/api/customers', count: 320 },
          { endpoint: '/api/inventory', count: 280 }
        ],
        requestsByMethod: {
          GET: 800,
          POST: 300,
          PUT: 100,
          DELETE: 50
        },
        requestsByStatus: {
          '200': 1200,
          '400': 25,
          '500': 25
        }
      }

      return mockData
    } catch (error) {
      console.error('Error getting API usage analytics:', error)
      throw error
    }
  }

  /**
   * Log API request for analytics
   */
  async logApiRequest(logData: any): Promise<void> {
    try {
      // Mock implementation - in real app would save to database
      console.log('API Request Logged:', logData)
    } catch (error) {
      console.error('Error logging API request:', error)
      throw error
    }
  }

  /**
   * Mock dashboard metrics for demo mode
   */
  private getMockDashboardMetrics(): ServiceResponse<DashboardMetrics> {
    return {
      data: {
        totalRevenue: 27060, // Real B2B orders: 18010 + 9050 = 27060
        totalOrders: 2, // Real B2B orders count
        activeCustomers: 2, // Real B2B customers count
        totalProducts: 5, // Based on mock inventory
        inventoryValue: 7250, // Based on mock inventory
        averageOrderValue: 13530, // 27060 / 2 = 13530
        customerRetention: 100.0, // Both B2B customers have orders
        salesGrowth: 15.2,
        customerSatisfaction: 4.8,
        productionEfficiency: 92.0,
        globalReach: "2 cities", // Chicago and Los Angeles
        teamPerformance: "Good",
        productionMetrics: {
          totalItems: 3,
          itemsByStage: {
            "Design": 1,
            "Casting": 1,
            "Completed": 1
          },
          itemsByStatus: {
            "In Progress": 2,
            "Completed": 1
          },
          averageCompletionTime: 12.0,
          onTimeDeliveryRate: 100.0,
          itemsInProduction: 2,
          completedItems: 1
        },
        financeMetrics: {
          totalReceivables: 1800, // One pending order
          totalPayables: 500,
          cashFlow: 1300,
          outstandingInvoices: 1,
          overdueInvoices: 0,
          averagePaymentTime: 15
        },
        topProducts: [
          { name: "Diamond Engagement Ring", sales: 1, revenue: 2500, stock: 8 },
          { name: "Gold Necklace", sales: 1, revenue: 1200, stock: 15 },
          { name: "Pearl Earrings", sales: 2, revenue: 1600, stock: 22 }
        ],
        recentActivity: [
          { type: "order", id: "GJE-2025-002", title: "New order from Diamond Wholesale Co", amount: 9050, time: "2 hours ago" },
          { type: "order", id: "GJE-2025-001", title: "New order from Sparkle Jewelers Chicago", amount: 18010, time: "4 hours ago" },
          { type: "customer", id: "CUST-002", title: "New customer: Diamond Wholesale Co", time: "1 day ago" }
        ],
        monthlyTrends: [
          { month: "Jun", revenue: 0, orders: 0, customers: 0 },
          { month: "Jul", revenue: 0, orders: 0, customers: 0 },
          { month: "Aug", revenue: 27060, orders: 2, customers: 2 }
        ]
      },
      error: null
    }
  }
}

export default AnalyticsService

// Create and export a singleton instance
export const analyticsService = new AnalyticsService() 