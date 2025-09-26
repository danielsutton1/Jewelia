import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { UnifiedMessagingService } from '@/lib/services/UnifiedMessagingService'

const messagingService = new UnifiedMessagingService()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params;
    const thread = await messagingService.getThread(id)

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: thread
    })

  } catch (error) {
    console.error('Error fetching thread:', error)
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = await params;
    
    // Only allow updating certain fields
    const allowedUpdates = {
      subject: body.subject,
      category: body.category,
      participants: body.participants,
      tags: body.tags,
      metadata: body.metadata,
      is_active: body.is_active,
      is_archived: body.is_archived,
      is_pinned: body.is_pinned
    }

    const thread = await messagingService.updateThread(id, allowedUpdates)

    return NextResponse.json({
      success: true,
      data: thread
    })

  } catch (error) {
    console.error('Error updating thread:', error)
    return NextResponse.json(
      { error: 'Failed to update thread' },
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

    const { id } = await params;
    await messagingService.archiveThread(id)

    return NextResponse.json({
      success: true,
      message: 'Thread archived successfully'
    })

  } catch (error) {
    console.error('Error archiving thread:', error)
    return NextResponse.json(
      { error: 'Failed to archive thread' },
      { status: 500 }
    )
  }
} 