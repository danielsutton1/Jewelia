import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type') || 'all'
    const status = searchParams.get('status') || 'all'
    const userId = searchParams.get('userId') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    let query = supabase
      .from('communications')
      .select('*', { count: 'exact' })

    // Apply filters
    if (type !== 'all') {
      query = query.eq('type', type)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (userId) {
      query = query.or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    }

    // Apply sorting and pagination
    const { data: communications, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching communications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch communications', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: communications,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      note: 'Simple API without user joins'
    })

  } catch (error: any) {
    console.error('Communications API error:', error)
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
    if (!body.type || !body.subject || !body.content) {
      return NextResponse.json(
        { error: 'Type, subject, and content are required' },
        { status: 400 }
      )
    }

    // Create communication
    const { data: communication, error } = await supabase
      .from('communications')
      .insert([{
        type: body.type,
        subject: body.subject,
        content: body.content,
        sender_id: body.sender_id,
        recipient_id: body.recipient_id,
        priority: body.priority || 'normal',
        status: body.status || 'unread',
        due_date: body.due_date || null,
        category: body.category || 'general'
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating communication:', error)
      return NextResponse.json(
        { error: 'Failed to create communication' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: communication
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create communication error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 