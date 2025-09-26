import { NextRequest, NextResponse } from 'next/server'
import { fulfillmentService } from '@/lib/services/FulfillmentService'

// GET /api/fulfillment/stats - Get fulfillment statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await fulfillmentService.getFulfillmentStats()

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error: any) {
    console.error('Error in fulfillment.stats.GET:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 