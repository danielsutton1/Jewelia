import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { thread_id, is_typing } = body

    if (!thread_id || typeof is_typing !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Update user's typing status
    const { error: statusError } = await supabase
      .from('user_status')
      .upsert({
        user_id: user.id,
        is_typing,
        current_thread_id: is_typing ? thread_id : null,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (statusError) {
      console.error('Error updating typing status:', statusError)
      return NextResponse.json({ error: 'Failed to update typing status' }, { status: 500 })
    }

    // Broadcast typing indicator to thread participants
    const typingIndicator = {
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.email,
      thread_id,
      is_typing,
      timestamp: new Date().toISOString()
    }

    await supabase.channel(`thread-${thread_id}`).send({
      type: 'broadcast',
      event: 'typing-indicator',
      payload: typingIndicator
    })

    return NextResponse.json({
      success: true,
      data: typingIndicator
    })

  } catch (error) {
    console.error('Error in typing indicator API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('thread_id')

    if (!threadId) {
      return NextResponse.json({ error: 'Thread ID is required' }, { status: 400 })
    }

    // Get typing users in the thread
    const { data: typingUsers, error } = await supabase
      .from('user_status')
      .select(`
        user_id,
        is_typing,
        last_seen,
        users!user_status_user_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('current_thread_id', threadId)
      .eq('is_typing', true)
      .gte('last_seen', new Date(Date.now() - 10 * 1000).toISOString()) // Last 10 seconds
      .neq('user_id', user.id) // Exclude current user

    if (error) {
      console.error('Error fetching typing users:', error)
      return NextResponse.json({ error: 'Failed to fetch typing users' }, { status: 500 })
    }

    const formattedTypingUsers = typingUsers.map((userStatus: any) => ({
      user_id: userStatus.user_id,
      user_name: userStatus.users?.[0]?.full_name || userStatus.users?.[0]?.email,
      is_typing: userStatus.is_typing,
      timestamp: userStatus.last_seen
    }))

    return NextResponse.json({
      success: true,
      data: formattedTypingUsers
    })

  } catch (error) {
    console.error('Error in typing indicator API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 