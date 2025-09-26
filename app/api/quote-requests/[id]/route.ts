import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { QuoteOrderService } from '@/lib/services/QuoteOrderService'

// =====================================================
// QUOTE REQUEST MANAGEMENT API ENDPOINTS
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
      console.log('Using demo user for quote request management')
    }

    const userId = user?.id || 'demo-user-id'
    const body = await request.json()
    const { id: quoteId } = await params
    
    if (!body.action || !['respond', 'accept', 'reject'].includes(body.action)) {
      return NextResponse.json(
        { error: 'Action must be "respond", "accept", or "reject"' },
        { status: 400 }
      )
    }

    const quoteOrderService = new QuoteOrderService()
    
    let result
    if (body.action === 'respond') {
      if (!body.response_price) {
        return NextResponse.json(
          { error: 'Response price is required for quote response' },
          { status: 400 }
        )
      }

      result = await quoteOrderService.respondToQuoteRequest(
        userId,
        quoteId,
        body.response_price,
        body.response_message
      )
    } else if (body.action === 'accept') {
      result = await quoteOrderService.acceptQuote(userId, quoteId)
    } else {
      // Handle reject action (you might want to add a reject method to the service)
      return NextResponse.json(
        { error: 'Reject action not yet implemented' },
        { status: 501 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Quote request ${body.action}ed successfully`
    })

  } catch (error: any) {
    console.error('Error managing quote request:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
