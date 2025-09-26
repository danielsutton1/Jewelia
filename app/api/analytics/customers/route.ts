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

    // Get customer analytics
    const result = await analyticsService.getCustomerAnalytics(filters)

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
    console.error('Customer Analytics API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 