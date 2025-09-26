import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InventorySharingService } from '@/lib/services/InventorySharingService'

// =====================================================
// INVENTORY SHARING API ENDPOINTS
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { items, settings } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 })
    }

    if (!settings) {
      return NextResponse.json({ error: 'Sharing settings are required' }, { status: 400 })
    }

    // Create inventory sharing records
    const sharingRecords = items.map(item => ({
      owner_id: user.id,
      inventory_id: item.inventory_id,
      sku: item.sku,
      name: item.name,
      category: item.category,
      price: item.price,
      visibility_level: settings.visibility_level,
      show_pricing: settings.show_pricing,
      show_quantity: settings.show_quantity,
      allow_quote_requests: settings.allow_quote_requests,
      allow_order_requests: settings.allow_order_requests,
      b2b_enabled: settings.b2b_enabled,
      minimum_order_amount: settings.minimum_order_amount || 0,
      payment_terms: settings.payment_terms || 'net_30',
      shipping_terms: settings.shipping_terms || 'fob_origin',
      status: 'active',
      created_at: new Date().toISOString()
    }))

    // Insert the sharing records
    const { data: insertedRecords, error: insertError } = await supabase
      .from('inventory_sharing')
      .insert(sharingRecords)
      .select()

    if (insertError) {
      console.error('Error inserting inventory sharing records:', insertError)
      return NextResponse.json({ error: 'Failed to create sharing records' }, { status: 500 })
    }

    // If specific connections are selected, create connection records
    if (settings.visibility_level === 'specific_connections' && settings.selected_connections?.length > 0) {
      const connectionRecords = settings.selected_connections.map((connectionId: string) => ({
        sharing_id: insertedRecords[0].id, // Use the first sharing record as reference
        connection_id: connectionId,
        status: 'active',
        created_at: new Date().toISOString()
      }))

      const { error: connectionError } = await supabase
        .from('inventory_sharing_connections')
        .insert(connectionRecords)

      if (connectionError) {
        console.error('Error creating connection records:', connectionError)
        // Don't fail the entire request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Successfully shared ${items.length} item(s)`,
        shared_items: insertedRecords.length,
        sharing_id: insertedRecords[0]?.id
      }
    })

  } catch (error) {
    console.error('Error in inventory sharing API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get shared inventory for the current user
    const { data: sharedInventory, error: fetchError, count } = await supabase
      .from('inventory_sharing')
      .select(`
        *,
        inventory:inventory_id(*)
      `, { count: 'exact' })
      .eq('owner_id', user.id)
      .eq('status', 'active')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching shared inventory:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch shared inventory' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: sharedInventory || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error in inventory sharing GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Sharing ID is required' },
        { status: 400 }
      )
    }

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
    
    // Get existing sharing to verify ownership
    const existing = await sharingService.getInventorySharingById(body.id)
    if (!existing) {
      return NextResponse.json(
        { error: 'Inventory sharing not found' },
        { status: 404 }
      )
    }

    if (existing.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only update sharing settings for your own inventory' },
        { status: 403 }
      )
    }

    // Update sharing settings
    const result = await sharingService.updateInventorySharing(body.id, {
      is_shared: body.is_shared,
      visibility_level: body.visibility_level,
      show_pricing: body.show_pricing,
      pricing_tier: body.pricing_tier,
      b2b_enabled: body.b2b_enabled,
      b2b_minimum_order: body.b2b_minimum_order,
      b2b_payment_terms: body.b2b_payment_terms,
      b2b_shipping_terms: body.b2b_shipping_terms,
      sharing_notes: body.sharing_notes
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Inventory sharing settings updated successfully'
    })

  } catch (error: any) {
    console.error('Update inventory sharing error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Sharing ID is required' },
        { status: 400 }
      )
    }

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
    
    // Get existing sharing to verify ownership
    const existing = await sharingService.getInventorySharingById(id)
    if (!existing) {
      return NextResponse.json(
        { error: 'Inventory sharing not found' },
        { status: 404 }
      )
    }

    if (existing.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete sharing settings for your own inventory' },
        { status: 403 }
      )
    }

    // Delete sharing settings
    await sharingService.deleteInventorySharing(id)

    return NextResponse.json({
      success: true,
      message: 'Inventory sharing settings deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete inventory sharing error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
