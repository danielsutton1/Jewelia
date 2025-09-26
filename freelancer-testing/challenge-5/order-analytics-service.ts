// CHALLENGE 5: Fixed OrderAnalyticsService
// This file should contain your fixed service code

import type { Order } from '@/types/database'

interface OrderTotals {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
}

interface OrderStatistics {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
}

// TODO: Fix the OrderAnalyticsService here
// You need to:
// 1. Handle undefined data properly
// 2. Add proper error handling
// 3. Add data validation
// 4. Add TypeScript types
// 5. Add logging for debugging

export class OrderAnalyticsService {
  async calculateOrderTotals(orders: Order[]): Promise<OrderTotals> {
    // TODO: Fix this method
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + order.total_amount
    }, 0)
    
    // This crashes when orders is undefined
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
    
    // This crashes when order.items is undefined
    const totalItems = orders.length
    
    return { totalRevenue, totalOrders: orders.length, averageOrderValue }
  }
  
  async getOrderStatistics(orders: Order[]): Promise<OrderStatistics> {
    // TODO: Fix this method
    // This crashes when orders is undefined
    const totalOrders = orders.length
    
    const statusCounts = orders.reduce((counts: Record<string, number>, order) => {
      counts[order.status] = (counts[order.status] || 0) + 1
      return counts
    }, {})
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
    
    return { totalOrders, totalRevenue, averageOrderValue }
  }
}
