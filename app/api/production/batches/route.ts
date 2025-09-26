import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') || 'all'
    const productId = searchParams.get('productId') || ''
    const assignedTo = searchParams.get('assignedTo') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    let query = supabase
      .from('production_batches')
      .select(`
        *,
        products!inner(name, sku),
        users!inner(full_name, email)
      `, { count: 'exact' })

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (productId) {
      query = query.eq('product_id', productId)
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate)
    }

    // Apply sorting and pagination
    const { data: batches, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching production batches:', error)
      return NextResponse.json(
        { error: 'Failed to fetch production batches' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: batches,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: any) {
    console.error('Production batches API error:', error)
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
    if (!body.product_id || !body.quantity) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      )
    }

    // Create production batch
    const { data: batch, error } = await supabase
      .from('production_batches')
      .insert([{
        batch_number: body.batch_number || `BATCH-${Date.now()}`,
        product_id: body.product_id,
        quantity: body.quantity,
        completed_quantity: body.completed_quantity || 0,
        assigned_to: body.assigned_to || null,
        status: body.status || 'pending',
        priority: body.priority || 'normal',
        planned_start_date: body.planned_start_date || null,
        planned_end_date: body.planned_end_date || null,
        actual_start_date: body.actual_start_date || null,
        actual_end_date: body.actual_end_date || null,
        notes: body.notes || null,
        quality_score: body.quality_score || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating production batch:', error)
      return NextResponse.json(
        { error: 'Failed to create production batch' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: batch
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create production batch error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 