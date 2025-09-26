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
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      user = authUser;
    }
    
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const assignedTo = searchParams.get('assignedTo') || ''
    const status = searchParams.get('status') || 'all'
    const priority = searchParams.get('priority') || 'all'
    const category = searchParams.get('category') || 'all'
    const sortBy = searchParams.get('sortBy') || 'due_date'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    const offset = (page - 1) * limit

    let query = supabase
      .from('tasks')
      .select('*', { count: 'exact' })

    // Apply filters
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (priority !== 'all') {
      query = query.eq('priority', priority)
    }

    if (category !== 'all') {
      query = query.eq('category', category)
    }

    // Apply sorting and pagination
    const { data: tasks, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: any) {
    console.error('Tasks API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.assigned_to) {
      return NextResponse.json(
        { error: 'Title and assigned user are required' },
        { status: 400 }
      )
    }

    // Create task
    const { data: task, error } = await supabase
      .from('tasks')
      .insert([{
        title: body.title,
        description: body.description || null,
        assigned_to: body.assigned_to,
        assigned_by: body.assigned_by,
        priority: body.priority || 'medium',
        status: body.status || 'pending',
        category: body.category || 'general',
        due_date: body.due_date || null,
        estimated_hours: body.estimated_hours || null,
        actual_hours: body.actual_hours || null,
        tags: body.tags || []
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: task
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 