import { NextRequest, NextResponse } from 'next/server'
import { fulfillmentService } from '@/lib/services/FulfillmentService'

// POST /api/fulfillment/ship - Ship package
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const shippedPackage = await fulfillmentService.shipPackage(body)

    return NextResponse.json({
      success: true,
      data: shippedPackage,
      message: 'Package shipped successfully'
    })
  } catch (error: any) {
    console.error('Error in fulfillment.ship.POST:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 