import { NextRequest, NextResponse } from 'next/server'
import { fulfillmentService } from '@/lib/services/FulfillmentService'

// GET /api/fulfillment/shipping-rates - Get shipping rates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const destinationZip = searchParams.get('destination_zip')
    const weight = searchParams.get('weight')

    if (!destinationZip || !weight) {
      return NextResponse.json(
        { error: 'destination_zip and weight are required' },
        { status: 400 }
      )
    }

    const shippingRates = await fulfillmentService.getShippingRates(
      destinationZip,
      parseFloat(weight)
    )

    return NextResponse.json({
      success: true,
      data: shippingRates,
      count: shippingRates.length
    })
  } catch (error: any) {
    console.error('Error in fulfillment.shipping-rates.GET:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 