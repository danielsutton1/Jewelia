import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NetworkService } from '@/lib/services/NetworkService'

const networkService = new NetworkService()

// GET: Get pending connection requests for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // For development, use a demo user ID if no auth
    let user = { id: '6d1a08f1-134c-46dd-aa1e-21f95b80bed4' } // Demo user
    
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authUser && !authError) {
        user = authUser
      }
    } catch (error) {
      console.log('🔧 Using demo user for connection requests in development mode')
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // 'incoming', 'outgoing', 'all'

    // Get pending connection requests
    const pendingRequests = await networkService.getPendingConnectionRequests(user.id)

    // Filter by type if specified
    let filteredRequests = pendingRequests
    if (type === 'incoming') {
      filteredRequests = pendingRequests.filter(req => req.isIncoming)
    } else if (type === 'outgoing') {
      filteredRequests = pendingRequests.filter(req => !req.isIncoming)
    }

    return NextResponse.json({
      success: true,
      data: {
        requests: filteredRequests,
        total: filteredRequests.length,
        incoming: pendingRequests.filter(req => req.isIncoming).length,
        outgoing: pendingRequests.filter(req => !req.isIncoming).length
      }
    })

  } catch (error) {
    console.error('Error fetching connection requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connection requests' },
      { status: 500 }
    )
  }
}

// POST: Send a new connection request
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // For development, use a demo user ID if no auth
    let user = { id: '6d1a08f1-134c-46dd-aa1e-21f95b80bed4' } // Demo user
    
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authUser && !authError) {
        user = authUser
      }
    } catch (error) {
      console.log('🔧 Using demo user for connection request creation in development mode')
    }

    const body = await request.json()
    const { partnerId, message } = body

    if (!partnerId) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      )
    }

    // Check if user is trying to connect to themselves
    if (partnerId === user.id) {
      return NextResponse.json(
        { error: 'Cannot send connection request to yourself' },
        { status: 400 }
      )
    }

    // Send connection request
    await networkService.sendConnectionRequest(user.id, partnerId, message)

    return NextResponse.json({
      success: true,
      message: 'Connection request sent successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error sending connection request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send connection request' },
      { status: 500 }
    )
  }
}
