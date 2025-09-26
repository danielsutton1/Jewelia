import { NextRequest, NextResponse } from 'next/server'
import AnalyticsService from '@/lib/services/AnalyticsService'

const analyticsService = new AnalyticsService()

export async function GET(request: NextRequest) {
  try {
    console.log('Testing AnalyticsService with service role key...')
    
    // Test basic data access
    const result = await analyticsService.getDashboardMetrics()
    
    console.log('AnalyticsService result:', {
      success: !result.error,
      error: result.error,
      dataLength: result.data ? Object.keys(result.data).length : 0,
      totalRevenue: result.data?.totalRevenue,
      totalOrders: result.data?.totalOrders,
      activeCustomers: result.data?.activeCustomers
    })

    if (result.error) {
      return NextResponse.json(
        { error: result.error, message: 'AnalyticsService failed to access data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'AnalyticsService can access data successfully',
      data: {
        totalRevenue: result.data?.totalRevenue,
        totalOrders: result.data?.totalOrders,
        activeCustomers: result.data?.activeCustomers,
        totalProducts: result.data?.totalProducts
      }
    })

  } catch (error: any) {
    console.error('Test AnalyticsService error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 