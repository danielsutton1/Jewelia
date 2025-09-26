import { NextRequest, NextResponse } from 'next/server'
import AnalyticsService from '@/lib/services/AnalyticsService'

const analyticsService = new AnalyticsService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse filters from query parameters
    const filters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      productCategory: searchParams.get('productCategory') || undefined
    }

    // Get the type of analytics requested
    const type = searchParams.get('type') || 'dashboard'

    let result

    switch (type) {
      case 'dashboard':
        result = await analyticsService.getDashboardMetrics(filters)
        break
      case 'customers':
        result = await analyticsService.getCustomerAnalytics(filters)
        break
      case 'orders':
        result = await analyticsService.getOrderAnalytics(filters)
        break
      case 'inventory':
        result = await analyticsService.getInventoryAnalytics(filters)
        break
      case 'sales':
        result = await analyticsService.getSalesAnalytics(filters)
        break
      case 'production':
        result = await analyticsService.getProductionAnalytics(filters)
        break
      default:
        result = await analyticsService.getDashboardMetrics(filters)
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error: any) {
    console.error('Analytics API error:', error)
    
    // Fallback to sample data when database connection fails
    const sampleData = {
      dashboard: {
        totalRevenue: 125000,
        totalOrders: 342,
        totalCustomers: 156,
        averageOrderValue: 365.50,
        revenueGrowth: 12.5,
        orderGrowth: 8.3,
        customerGrowth: 15.2,
        conversionRate: 3.2,
        topProducts: [
          { name: "Diamond Engagement Ring", sales: 45, revenue: 112500 },
          { name: "Pearl Necklace", sales: 32, revenue: 48000 },
          { name: "Gold Bracelet", sales: 28, revenue: 42000 }
        ],
        recentOrders: [
          { id: "ORD-001", customer: "John Smith", amount: 2500, status: "completed" },
          { id: "ORD-002", customer: "Jane Doe", amount: 1800, status: "processing" },
          { id: "ORD-003", customer: "Robert Brown", amount: 3200, status: "shipped" }
        ],
        salesByMonth: [
          { month: "Jan", revenue: 85000, orders: 45 },
          { month: "Feb", revenue: 92000, orders: 52 },
          { month: "Mar", revenue: 105000, orders: 61 },
          { month: "Apr", revenue: 98000, orders: 58 },
          { month: "May", revenue: 112000, orders: 67 },
          { month: "Jun", revenue: 125000, orders: 72 }
        ]
      },
      customers: {
        totalCustomers: 156,
        newCustomers: 23,
        returningCustomers: 133,
        averageOrderValue: 365.50,
        customerLifetimeValue: 1250.00,
        topCustomers: [
          { name: "John Smith", orders: 8, totalSpent: 12500 },
          { name: "Jane Doe", orders: 6, totalSpent: 9800 },
          { name: "Robert Brown", orders: 5, totalSpent: 8500 }
        ]
      },
      orders: {
        totalOrders: 342,
        pendingOrders: 12,
        completedOrders: 298,
        cancelledOrders: 32,
        averageOrderValue: 365.50,
        ordersByStatus: [
          { status: "completed", count: 298, percentage: 87.1 },
          { status: "pending", count: 12, percentage: 3.5 },
          { status: "cancelled", count: 32, percentage: 9.4 }
        ]
      },
      inventory: {
        totalProducts: 156,
        lowStockItems: 8,
        outOfStockItems: 2,
        totalValue: 450000,
        topSellingProducts: [
          { name: "Diamond Engagement Ring", sales: 45, revenue: 112500 },
          { name: "Pearl Necklace", sales: 32, revenue: 48000 },
          { name: "Gold Bracelet", sales: 28, revenue: 42000 }
        ]
      },
      sales: {
        totalRevenue: 125000,
        monthlyRevenue: 125000,
        dailyRevenue: 4167,
        revenueGrowth: 12.5,
        salesByCategory: [
          { category: "Rings", revenue: 75000, percentage: 60 },
          { category: "Necklaces", revenue: 30000, percentage: 24 },
          { category: "Bracelets", revenue: 20000, percentage: 16 }
        ]
      },
      production: {
        totalItems: 89,
        inProgress: 23,
        completed: 45,
        onHold: 12,
        averageCompletionTime: 5.2,
        productionStages: [
          { stage: "Design", count: 15, percentage: 16.9 },
          { stage: "Casting", count: 18, percentage: 20.2 },
          { stage: "Setting", count: 12, percentage: 13.5 },
          { stage: "Polishing", count: 8, percentage: 9.0 },
          { stage: "QC", count: 6, percentage: 6.7 },
          { stage: "Completed", count: 30, percentage: 33.7 }
        ]
      }
    }

    const type = new URL(request.url).searchParams.get('type') || 'dashboard'
    const data = sampleData[type as keyof typeof sampleData] || sampleData.dashboard

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Using sample data (Database connection failed)'
    })
  }
} 