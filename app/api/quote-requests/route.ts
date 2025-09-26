import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { QuoteOrderService } from '@/lib/services/QuoteOrderService'

// =====================================================
// QUOTE REQUESTS API ENDPOINTS
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      // Demo user fallback for development
      const demoUserId = 'demo-user-id'
      console.log('Using demo user for quote request')
    }

    const userId = user?.id || 'demo-user-id'
    const body = await request.json()
    
    if (!body.partner_id || !body.inventory_id || !body.requested_quantity) {
      return NextResponse.json(
        { error: 'Partner ID, inventory ID, and requested quantity are required' },
        { status: 400 }
      )
    }

    const quoteOrderService = new QuoteOrderService()
    
    const quoteRequest = await quoteOrderService.createQuoteRequest(userId, {
      partner_id: body.partner_id,
      inventory_id: body.inventory_id,
      requested_quantity: body.requested_quantity,
      requested_price: body.requested_price,
      message: body.message
    })

    return NextResponse.json({
      success: true,
      data: quoteRequest,
      message: 'Quote request sent successfully'
    })

  } catch (error: any) {
    console.error('Error creating quote request:', error)
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
      console.log('Using demo user for quote requests')
    }

    const userId = user?.id || 'demo-user-id'
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'my_requests'

    const quoteOrderService = new QuoteOrderService()
    
    let requests
    if (type === 'pending') {
      // Get pending requests for the user's inventory (as a partner)
      requests = await quoteOrderService.getPendingQuoteRequests(userId)
    } else {
      // Get user's own requests
      requests = await quoteOrderService.getMyQuoteRequests(userId)
    }

    return NextResponse.json({
      success: true,
      data: requests
    })

  } catch (error: any) {
    console.error('Error getting quote requests:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
