import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NetworkService } from '@/lib/services/NetworkService'

const networkService = new NetworkService()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let body: any;
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    body = await request.json()
    const { action } = body
    const { id } = await params

    if (!action || !['accept', 'reject', 'block'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be accept, reject, or block' },
        { status: 400 }
      )
    }

    const connectionId = id

    switch (action) {
      case 'accept':
        await networkService.acceptConnection(connectionId, user.id)
        break
      case 'reject':
        await networkService.rejectConnection(connectionId, user.id)
        break
      case 'block':
        await networkService.blockConnection(connectionId, user.id)
        break
    }

    return NextResponse.json({
      success: true,
      message: `Connection ${action}ed successfully`
    })

  } catch (error) {
    console.error(`Error ${body?.action}ing connection:`, error)
    return NextResponse.json(
      { error: `Failed to ${body?.action} connection` },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const connectionId = id

    // Remove connection
    await networkService.removeConnection(connectionId, user.id)

    return NextResponse.json({
      success: true,
      message: 'Connection removed successfully'
    })

  } catch (error) {
    console.error('Error removing connection:', error)
    return NextResponse.json(
      { error: 'Failed to remove connection' },
      { status: 500 }
    )
  }
}
