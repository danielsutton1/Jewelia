import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AssetTrackingService } from '@/lib/services/AssetTrackingService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.asset_id || !body.user_id) {
      return NextResponse.json(
        { error: 'Asset ID and user ID are required' },
        { status: 400 }
      )
    }

    // Create asset tracking service instance
    const assetTrackingService = new AssetTrackingService()

    // Check out asset
    const result = await assetTrackingService.checkOutItem({
      inventory_item_id: body.asset_id,
      assigned_to_type: 'staff',
      assigned_to_id: body.user_id,
      expected_return_date: body.expected_return_date || null,
      notes: body.notes || null
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Asset checked out successfully'
    })

  } catch (error: any) {
    console.error('Checkout asset error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.asset_id) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      )
    }

    // Create asset tracking service instance
    const assetTrackingService = new AssetTrackingService()

    // Check in asset
    const result = await assetTrackingService.checkInItem({
      inventory_item_id: body.asset_id,
      to_location_id: body.location_id || 'default-location', // Required field
      actual_return_date: new Date().toISOString(),
      condition_notes: body.condition || 'good',
      notes: body.notes || null
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Asset checked in successfully'
    })

  } catch (error: any) {
    console.error('Checkin asset error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 