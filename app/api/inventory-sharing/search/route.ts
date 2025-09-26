import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InventorySharingService } from '@/lib/services/InventorySharingService'

// =====================================================
// SHARED INVENTORY SEARCH API ENDPOINT
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get search parameters
    const query = searchParams.get('query') || ''
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const metalType = searchParams.get('metal_type')
    const gemstoneType = searchParams.get('gemstone_type')
    const priceMin = searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : undefined
    const priceMax = searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : undefined
    const weightMin = searchParams.get('weight_min') ? parseFloat(searchParams.get('weight_min')!) : undefined
    const weightMax = searchParams.get('weight_max') ? parseFloat(searchParams.get('weight_max')!) : undefined
    const brand = searchParams.get('brand')
    const ownerId = searchParams.get('owner_id')
    const b2bEnabled = searchParams.get('b2b_enabled') === 'true'
    const showPricing = searchParams.get('show_pricing') === 'true'
    const visibilityLevel = searchParams.get('visibility_level') as any
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get current user from auth
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const sharingService = new InventorySharingService()

    // Build search parameters
    const searchParamsObj = {
      query,
      filters: {
        search: query,
        category: category || undefined,
        subcategory: subcategory || undefined,
        metal_type: metalType || undefined,
        gemstone_type: gemstoneType || undefined,
        price_min: priceMin,
        price_max: priceMax,
        weight_min: weightMin,
        weight_max: weightMax,
        brand: brand || undefined,
        owner_id: ownerId || undefined,
        b2b_enabled: b2bEnabled,
        show_pricing: showPricing,
        visibility_level: visibilityLevel
      },
      sort_by: sortBy as any,
      sort_order: sortOrder as any,
      page,
      limit
    }

    // Search shared inventory
    const result = await sharingService.searchSharedInventory(searchParamsObj, user.id)

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: {
        page: result.page,
        limit: limit,
        total: result.total,
        total_pages: result.totalPages
      },
      filters: searchParamsObj.filters
    })

  } catch (error: any) {
    console.error('Search shared inventory error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
