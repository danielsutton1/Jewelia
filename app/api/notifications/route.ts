import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // DEVELOPMENT MODE: Skip authentication for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    let user;
    if (isDevelopment) {
      // Create a mock user for development
      user = {
        id: 'c5e33bb2-4811-4042-bd4e-97b1ffec7c38', // Use existing UUID from test data
        email: 'dev@example.com',
        user_metadata: { role: 'admin' }
      };
    } else {
      const supabase = await createSupabaseServerClient()
      // Get current user from session
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      user = authUser;
    }
    // Pagination and filters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') || ''
    const offset = (page - 1) * limit
    // Query notifications using message_notifications table
    const supabase = await createSupabaseServerClient()
    let query = supabase
      .from('message_notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
    if (status) {
      query = query.eq('status', status)
    }
    const { data: notifications, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) {
      console.error('Fetch notifications error:', error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }
    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()

    // Validate required fields
    if (!body.user_id || !body.title || !body.message) {
      return NextResponse.json(
        { error: 'User ID, title, and message are required' },
        { status: 400 }
      )
    }

    // Create notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: body.user_id,
        title: body.title,
        message: body.message,
        type: body.type || 'info',
        priority: body.priority || 'normal',
        read: false,
        action_url: body.action_url || null,
        expires_at: body.expires_at || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notification
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()

    // Mark notifications as read
    if (body.markAsRead && body.notificationIds) {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', body.notificationIds)

      if (error) {
        console.error('Error marking notifications as read:', error)
        return NextResponse.json(
          { error: 'Failed to mark notifications as read' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Notifications marked as read'
      })
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('Update notifications error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 