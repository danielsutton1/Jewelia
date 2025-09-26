import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MeetingService } from '@/lib/services/MeetingService'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    let query = supabase
      .from('meeting_briefs')
      .select('*', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,attendees.ilike.%${search}%`)
    }
    
    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (dateFrom) {
      query = query.gte('meeting_date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('meeting_date', dateTo)
    }

    // Apply sorting and pagination
    const { data: meetings, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching meetings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch meetings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: meetings,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: any) {
    console.error('Meetings API error:', error)
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
    if (!body.title || !body.meetingDate || !body.type) {
      return NextResponse.json(
        { error: 'Title, meeting date, and type are required' },
        { status: 400 }
      )
    }

    // Create meeting service instance
    const meetingService = new MeetingService()

    // Create meeting brief
    const result = await meetingService.create({
      title: body.title,
      description: body.description || '',
      type: body.type,
      meeting_date: body.meetingDate,
      location: body.location || '',
      attendees: body.attendees || [],
      status: body.status || 'scheduled',
      notes: body.notes || ''
    })

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create meeting error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 