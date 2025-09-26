import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { TradeInService } from '@/lib/services/TradeInService'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const customerId = searchParams.get('customerId') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    let query = supabase
      .from('trade_ins')
      .select(`
        *,
        customers!inner(full_name, email, phone)
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`trade_in_number.ilike.%${search}%,customers.full_name.ilike.%${search}%`)
    }
    
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate)
    }

    // Apply sorting and pagination
    const { data: tradeIns, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching trade-ins:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trade-ins' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: tradeIns,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: any) {
    console.error('Trade-ins API error:', error)
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
    if (!body.customer_id || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Customer ID and trade-in items are required' },
        { status: 400 }
      )
    }

    // Create trade-in service instance
    const tradeInService = new TradeInService()

    // Create trade-in transaction
    const result = await tradeInService.createTradeIn({
      customer_id: body.customer_id,
      item_type: body.item_type || 'jewelry',
      description: body.description,
      estimated_value: body.estimated_value,
      condition: body.condition,
      notes: body.notes
    })

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create trade-in error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 