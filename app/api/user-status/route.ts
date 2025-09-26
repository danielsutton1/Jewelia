import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (userId) {
      // Get specific user status
      const { data: status, error } = await supabase
        .from('user_status')
        .select(`
          *,
          user:auth.users!user_status_user_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching user status:', error)
        return NextResponse.json({ error: 'Failed to fetch user status' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: status
      })
    } else {
      // Get all online users
      const { data: onlineUsers, error } = await supabase
        .from('user_status')
        .select(`
          *,
          user:auth.users!user_status_user_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('status', 'online')
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
        .order('last_seen', { ascending: false })

      if (error) {
        console.error('Error fetching online users:', error)
        return NextResponse.json({ error: 'Failed to fetch online users' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: onlineUsers
      })
    }

  } catch (error) {
    console.error('Error in user status API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const { status, custom_status } = body

    if (!status || !['online', 'offline', 'away', 'busy'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update or create user status
    const { data, error } = await supabase
      .from('user_status')
      .upsert({
        user_id: user.id,
        status,
        custom_status,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating user status:', error)
      return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error in user status API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { is_typing, current_thread_id } = body

    // Update typing status
    const { data, error } = await supabase
      .from('user_status')
      .update({
        is_typing,
        current_thread_id,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating typing status:', error)
      return NextResponse.json({ error: 'Failed to update typing status' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error in user status API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 