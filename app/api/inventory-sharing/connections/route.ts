import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InventorySharingService } from '@/lib/services/InventorySharingService'

// =====================================================
// INVENTORY SHARING CONNECTIONS API ENDPOINT
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.sharing_id || !body.viewer_id) {
      return NextResponse.json(
        { error: 'Sharing ID and viewer ID are required' },
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
    
    // Verify user owns the sharing
    const sharing = await sharingService.getInventorySharingById(body.sharing_id)
    if (!sharing) {
      return NextResponse.json(
        { error: 'Inventory sharing not found' },
        { status: 404 }
      )
    }

    if (sharing.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only manage connections for your own shared inventory' },
        { status: 403 }
      )
    }

    // Add connection
    const result = await sharingService.addConnection({
      sharing_id: body.sharing_id,
      viewer_id: body.viewer_id,
      connection_type: body.connection_type || 'connection',
      can_view_pricing: body.can_view_pricing !== undefined ? body.can_view_pricing : true,
      can_view_quantity: body.can_view_quantity !== undefined ? body.can_view_quantity : true,
      can_request_quote: body.can_request_quote !== undefined ? body.can_request_quote : true,
      can_place_order: body.can_place_order !== undefined ? body.can_place_order : false,
      custom_price: body.custom_price,
      custom_discount_percent: body.custom_discount_percent
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Connection added successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Add connection error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sharingId = searchParams.get('sharing_id')

    if (!sharingId) {
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
    
    // Verify user owns the sharing or is a viewer
    const sharing = await sharingService.getInventorySharingById(sharingId)
    if (!sharing) {
      return NextResponse.json(
        { error: 'Inventory sharing not found' },
        { status: 404 }
      )
    }

    if (sharing.owner_id !== user.id) {
      // Check if user is a viewer
      const connections = await sharingService.getConnections(sharingId)
      const isViewer = connections.some(conn => conn.viewer_id === user.id)
      
      if (!isViewer) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    // Get connections
    const result = await sharingService.getConnections(sharingId)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Get connections error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
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
    
    // Get existing connection to verify ownership
    const connections = await sharingService.getConnections(body.sharing_id)
    const connection = connections.find(conn => conn.id === body.id)
    
    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      )
    }

    // Verify user owns the sharing
    const sharing = await sharingService.getInventorySharingById(body.sharing_id)
    if (!sharing || sharing.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only update connections for your own shared inventory' },
        { status: 403 }
      )
    }

    // Update connection
    const result = await sharingService.updateConnection(body.id, {
      connection_type: body.connection_type,
      can_view_pricing: body.can_view_pricing,
      can_view_quantity: body.can_view_quantity,
      can_request_quote: body.can_request_quote,
      can_place_order: body.can_place_order,
      custom_price: body.custom_price,
      custom_discount_percent: body.custom_discount_percent
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Connection updated successfully'
    })

  } catch (error: any) {
    console.error('Update connection error:', error)
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
    const sharingId = searchParams.get('sharing_id')

    if (!id || !sharingId) {
      return NextResponse.json(
        { error: 'Connection ID and sharing ID are required' },
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
    
    // Verify user owns the sharing
    const sharing = await sharingService.getInventorySharingById(sharingId)
    if (!sharing || sharing.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only remove connections for your own shared inventory' },
        { status: 403 }
      )
    }

    // Remove connection
    await sharingService.removeConnection(id)

    return NextResponse.json({
      success: true,
      message: 'Connection removed successfully'
    })

  } catch (error: any) {
    console.error('Remove connection error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
