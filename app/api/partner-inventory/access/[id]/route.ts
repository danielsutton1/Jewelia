import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PartnerInventoryService } from '@/lib/services/PartnerInventoryService'

// =====================================================
// PARTNER INVENTORY ACCESS MANAGEMENT API ENDPOINTS
// =====================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      // Demo user fallback for development
      const demoUserId = 'demo-user-id'
      console.log('Using demo user for partner inventory access management')
    }

    const userId = user?.id || 'demo-user-id'
    const body = await request.json()
    const { id: accessId } = await params
    
    if (!body.action || !['approve', 'reject'].includes(body.action)) {
      return NextResponse.json(
        { error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      )
    }

    const partnerInventoryService = new PartnerInventoryService()
    
    let result
    if (body.action === 'approve') {
      if (!body.permissions) {
        return NextResponse.json(
          { error: 'Permissions are required for approval' },
          { status: 400 }
        )
      }

      result = await partnerInventoryService.approveInventoryAccess(
        userId,
        accessId,
        body.permissions,
        body.response_message
      )
    } else {
      result = await partnerInventoryService.rejectInventoryAccess(
        userId,
        accessId,
        body.response_message
      )
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Inventory access request ${body.action}d successfully`
    })

  } catch (error: any) {
    console.error('Error managing inventory access request:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
