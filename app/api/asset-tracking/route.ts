import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AssetTrackingService } from '@/lib/services/AssetTrackingService'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || 'all'
    const assignedTo = searchParams.get('assignedTo') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    let query = supabase
      .from('assets')
      .select(`
        *,
        users!inner(full_name, email)
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`asset_tag.ilike.%${search}%,name.ilike.%${search}%,serial_number.ilike.%${search}%`)
    }
    
    if (category) {
      query = query.eq('category', category)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    // Apply sorting and pagination
    const { data: assets, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching assets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch assets' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: assets,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: any) {
    console.error('Asset tracking API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.asset_tag || !body.name) {
      return NextResponse.json(
        { error: 'Asset tag and name are required' },
        { status: 400 }
      )
    }

    // Create asset tracking service instance
    const assetTrackingService = new AssetTrackingService()

    // Create asset using the service
    const result = await assetTrackingService.createLocation({
      name: body.name,
      description: body.description || null,
      location_type: body.category || 'equipment',
      address: body.location || null,
      capacity: body.capacity || null
    })

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create asset error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 