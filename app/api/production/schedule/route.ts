import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const resourceId = searchParams.get('resourceId') || ''
    const status = searchParams.get('status') || 'all'
    const sortBy = searchParams.get('sortBy') || 'start_time'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    const offset = (page - 1) * limit

    let query = supabase
      .from('production_schedule')
      .select(`
        *,
        production_batches!inner(batch_number, products!inner(name)),
        equipment!inner(name, type),
        users!inner(full_name, email)
      `, { count: 'exact' })

    // Apply filters
    if (startDate && endDate) {
      query = query.gte('start_time', startDate).lte('end_time', endDate)
    }

    if (resourceId) {
      query = query.eq('resource_id', resourceId)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply sorting and pagination
    const { data: schedule, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching production schedule:', error)
      return NextResponse.json(
        { error: 'Failed to fetch production schedule' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: schedule,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: any) {
    console.error('Production schedule API error:', error)
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
    if (!body.batch_id || !body.start_time || !body.end_time) {
      return NextResponse.json(
        { error: 'Batch ID, start time, and end time are required' },
        { status: 400 }
      )
    }

    // Create production schedule entry
    const { data: scheduleEntry, error } = await supabase
      .from('production_schedule')
      .insert([{
        batch_id: body.batch_id,
        resource_id: body.resource_id || null,
        assigned_to: body.assigned_to || null,
        start_time: body.start_time,
        end_time: body.end_time,
        status: body.status || 'scheduled',
        priority: body.priority || 'normal',
        notes: body.notes || null,
        setup_time: body.setup_time || 0,
        cleanup_time: body.cleanup_time || 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating production schedule:', error)
      return NextResponse.json(
        { error: 'Failed to create production schedule' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: scheduleEntry
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create production schedule error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 