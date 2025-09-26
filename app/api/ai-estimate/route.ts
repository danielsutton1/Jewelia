import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AIEstimationService } from '@/lib/services/AIEstimationService'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()

    // Validate required fields
    if (!body.itemType || !body.materials || !body.complexity) {
      return NextResponse.json(
        { error: 'Item type, materials, and complexity are required' },
        { status: 400 }
      )
    }

    // Create AI estimation service instance
    const aiService = new AIEstimationService()

    // Generate estimation
    const estimation = await aiService.generateEstimation({
      itemType: body.itemType,
      materials: body.materials,
      complexity: body.complexity,
      weight: body.weight,
      dimensions: body.dimensions,
      customizations: body.customizations || [],
      rushOrder: body.rushOrder || false,
      quantity: body.quantity || 1
    })

    return NextResponse.json({
      success: true,
      data: estimation
    })

  } catch (error: any) {
    console.error('AI estimation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const itemType = searchParams.get('itemType') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    const offset = (page - 1) * limit

    let query = supabase
      .from('ai_estimations')
      .select('*', { count: 'exact' })

    // Apply filters
    if (itemType) {
      query = query.eq('item_type', itemType)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    // Apply sorting and pagination
    const { data: estimations, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching estimations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch estimations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: estimations,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: any) {
    console.error('AI estimation history error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 