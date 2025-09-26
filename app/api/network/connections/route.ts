import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NetworkService } from '@/lib/services/NetworkService'

const networkService = new NetworkService()

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get user's connections
    const connections = await networkService.getUserConnections(user.id, {
      status,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      data: connections
    })

  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { partnerId, message } = body

    if (!partnerId) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      )
    }

    // Send connection request
    await networkService.sendConnectionRequest(user.id, partnerId, message)

    return NextResponse.json({
      success: true,
      message: 'Connection request sent successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error sending connection request:', error)
    return NextResponse.json(
      { error: 'Failed to send connection request' },
      { status: 500 }
    )
  }
}
