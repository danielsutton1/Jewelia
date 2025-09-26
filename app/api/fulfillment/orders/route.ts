import { NextRequest, NextResponse } from 'next/server'
import { fulfillmentService } from '@/lib/services/FulfillmentService'

// GET /api/fulfillment/orders - List fulfillment orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      status: searchParams.get('status') as any,
      priority: searchParams.get('priority') as any,
      assigned_to: searchParams.get('assigned_to') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    }

    const result = await fulfillmentService.listFulfillmentOrders(filters)

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.count,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        hasMore: result.count > (filters.offset + filters.limit)
      }
    })
  } catch (error: any) {
    console.error('Error in fulfillment.orders.GET:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/fulfillment/orders - Create new fulfillment order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const fulfillmentOrder = await fulfillmentService.createFulfillmentOrder(body)

    return NextResponse.json({
      success: true,
      data: fulfillmentOrder,
      message: 'Fulfillment order created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error in fulfillment.orders.POST:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 