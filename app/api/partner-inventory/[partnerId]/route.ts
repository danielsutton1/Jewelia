import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PartnerInventoryService } from '@/lib/services/PartnerInventoryService'

// =====================================================
// PARTNER INVENTORY API ENDPOINTS
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      // Demo user fallback for development
      const demoUserId = 'demo-user-id'
      console.log('Using demo user for partner inventory access')
    }

    const userId = user?.id || 'demo-user-id'
    const { partnerId } = await params

    const partnerInventoryService = new PartnerInventoryService()
    
    const inventory = await partnerInventoryService.getPartnerInventory(partnerId, userId)

    return NextResponse.json({
      success: true,
      data: inventory
    })

  } catch (error: any) {
    console.error('Error getting partner inventory:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
