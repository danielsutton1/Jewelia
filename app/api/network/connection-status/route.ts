import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NetworkService } from '@/lib/services/NetworkService'

const networkService = new NetworkService()

// GET: Check connection status between current user and a partner
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const partnerId = searchParams.get('partnerId')

    if (!partnerId) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      )
    }

    // Get connection status
    const connectionStatus = await networkService.getConnectionStatus(user.id, partnerId)

    return NextResponse.json({
      success: true,
      data: connectionStatus
    })

  } catch (error) {
    console.error('Error checking connection status:', error)
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 }
    )
  }
}
