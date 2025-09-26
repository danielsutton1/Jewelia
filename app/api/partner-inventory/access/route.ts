import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PartnerInventoryService } from '@/lib/services/PartnerInventoryService'

// =====================================================
// PARTNER INVENTORY ACCESS API ENDPOINTS
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      // Demo user fallback for development
      const demoUserId = 'demo-user-id'
      console.log('Using demo user for partner inventory access request')
    }

    const userId = user?.id || 'demo-user-id'
    const body = await request.json()
    
    if (!body.partner_id || !body.inventory_id || !body.access_type) {
      return NextResponse.json(
        { error: 'Partner ID, inventory ID, and access type are required' },
        { status: 400 }
      )
    }

    const partnerInventoryService = new PartnerInventoryService()
    
    const accessRequest = await partnerInventoryService.requestInventoryAccess(userId, {
      partner_id: body.partner_id,
      inventory_id: body.inventory_id,
      access_type: body.access_type,
      message: body.message
    })

    return NextResponse.json({
      success: true,
      data: accessRequest,
      message: 'Inventory access request sent successfully'
    })

  } catch (error: any) {
    console.error('Error creating inventory access request:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      // Demo user fallback for development
      const demoUserId = 'demo-user-id'
      console.log('Using demo user for partner inventory access requests')
    }

    const userId = user?.id || 'demo-user-id'
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'my_requests'

    const partnerInventoryService = new PartnerInventoryService()
    
    let requests
    if (type === 'pending') {
      // Get pending requests for the user's inventory (as a partner)
      requests = await partnerInventoryService.getPendingAccessRequests(userId)
    } else {
      // Get user's own requests
      requests = await partnerInventoryService.getMyAccessRequests(userId)
    }

    return NextResponse.json({
      success: true,
      data: requests
    })

  } catch (error: any) {
    console.error('Error getting inventory access requests:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
