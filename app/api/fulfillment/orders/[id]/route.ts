import { NextRequest, NextResponse } from 'next/server'
import { fulfillmentService } from '@/lib/services/FulfillmentService'

// GET /api/fulfillment/orders/[id] - Get specific fulfillment order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fulfillmentOrder = await fulfillmentService.getFulfillmentOrder(id)

    if (!fulfillmentOrder) {
      return NextResponse.json(
        { error: 'Fulfillment order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: fulfillmentOrder
    })
  } catch (error: any) {
    console.error('Error in fulfillment.orders.[id].GET:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/fulfillment/orders/[id]/status - Update fulfillment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params;
    
    const fulfillmentOrder = await fulfillmentService.updateFulfillmentStatus(id, body)

    return NextResponse.json({
      success: true,
      data: fulfillmentOrder,
      message: 'Fulfillment status updated successfully'
    })
  } catch (error: any) {
    console.error('Error in fulfillment.orders.[id].PATCH:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 