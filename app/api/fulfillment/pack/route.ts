import { NextRequest, NextResponse } from 'next/server'
import { fulfillmentService } from '@/lib/services/FulfillmentService'

// POST /api/fulfillment/pack - Pack items for shipping
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const packedItem = await fulfillmentService.packItem(body)

    return NextResponse.json({
      success: true,
      data: packedItem,
      message: 'Item packed successfully'
    })
  } catch (error: any) {
    console.error('Error in fulfillment.pack.POST:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 