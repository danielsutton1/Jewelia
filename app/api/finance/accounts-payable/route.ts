import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const vendorId = searchParams.get('vendorId') || ''
    const status = searchParams.get('status') || 'all'
    const overdue = searchParams.get('overdue') === 'true'
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const sortBy = searchParams.get('sortBy') || 'due_date'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    const offset = (page - 1) * limit

    let query = supabase
      .from('accounts_payable')
      .select(`
        *,
        vendors!inner(name, email, phone)
      `, { count: 'exact' })

    // Apply filters
    if (vendorId) {
      query = query.eq('vendor_id', vendorId)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (overdue) {
      query = query.lt('due_date', new Date().toISOString())
    }

    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate)
    }

    // Apply sorting and pagination
    const { data: payables, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching accounts payable:', error)
      return NextResponse.json(
        { error: 'Failed to fetch accounts payable' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: payables,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: any) {
    console.error('Accounts payable API error:', error)
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
    if (!body.vendor_id || !body.amount || !body.due_date) {
      return NextResponse.json(
        { error: 'Vendor ID, amount, and due date are required' },
        { status: 400 }
      )
    }

    // Create accounts payable entry
    const { data: payable, error } = await supabase
      .from('accounts_payable')
      .insert([{
        vendor_id: body.vendor_id,
        invoice_number: body.invoice_number || null,
        amount: body.amount,
        paid_amount: body.paid_amount || 0,
        due_date: body.due_date,
        status: body.status || 'outstanding',
        description: body.description || null,
        category: body.category || 'general',
        purchase_order_id: body.purchase_order_id || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating accounts payable:', error)
      return NextResponse.json(
        { error: 'Failed to create accounts payable entry' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: payable
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create accounts payable error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 