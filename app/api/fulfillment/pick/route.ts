import { NextRequest, NextResponse } from 'next/server'
import { fulfillmentService } from '@/lib/services/FulfillmentService'

// POST /api/fulfillment/pick - Pick items for fulfillment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const pickedItem = await fulfillmentService.pickItem(body)

    return NextResponse.json({
      success: true,
      data: pickedItem,
      message: 'Item picked successfully'
    })
  } catch (error: any) {
    console.error('Error in fulfillment.pick.POST:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 