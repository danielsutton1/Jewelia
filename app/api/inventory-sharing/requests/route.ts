import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InventorySharingService } from '@/lib/services/InventorySharingService'

// =====================================================
// INVENTORY SHARING REQUESTS API ENDPOINT
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.inventory_id || !body.request_type) {
      return NextResponse.json(
        { error: 'Inventory ID and request type are required' },
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
    
    // Check if inventory is shared and accessible
    const sharing = await sharingService.getInventorySharing(body.inventory_id, user.id)
    if (!sharing || !sharing.is_shared) {
      return NextResponse.json(
        { error: 'Inventory not found or not shared' },
        { status: 404 }
      )
    }

    // Check if user already has a pending request
    const existingRequests = await sharingService.getRequests(user.id, 'sent')
    const hasPendingRequest = existingRequests.some(req => 
      req.inventory_id === body.inventory_id && 
      req.status === 'pending'
    )

    if (hasPendingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this inventory' },
        { status: 409 }
      )
    }

    // Create request
    const result = await sharingService.createRequest({
      inventory_id: body.inventory_id,
      request_type: body.request_type,
      message: body.message,
      requested_quantity: body.requested_quantity,
      requested_price: body.requested_price
    }, user.id)

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Request created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create request error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'received'
    const status = searchParams.get('status')
    const requestType = searchParams.get('request_type')

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
    
    // Get requests
    let result = await sharingService.getRequests(user.id, type as 'sent' | 'received')

    // Apply additional filters
    if (status) {
      result = result.filter(req => req.status === status)
    }

    if (requestType) {
      result = result.filter(req => req.request_type === requestType)
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Get requests error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: any = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
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
    
    // Get existing request to verify ownership
    const sentRequests = await sharingService.getRequests(user.id, 'sent')
    const receivedRequests = await sharingService.getRequests(user.id, 'received')
    const requestItem = [...sentRequests, ...receivedRequests].find(req => req.id === body.id)
    
    if (!requestItem) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Only the owner can update the status
    if (requestItem.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only update requests for your own inventory' },
        { status: 403 }
      )
    }

    // Update request
    const result = await sharingService.updateRequest(body.id, {
      status: body.status,
      response_message: body.response_message,
      response_price: body.response_price,
      response_quantity: body.response_quantity
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Request updated successfully'
    })

  } catch (error: any) {
    console.error('Update request error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const id: string | null = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
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
    
    // Get existing request to verify ownership
    const sentRequests = await sharingService.getRequests(user.id, 'sent')
    const requestItem = sentRequests.find((req: any) => req.id === id)
    
    if (!requestItem) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Only the owner can cancel the request
    if (requestItem.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only cancel requests for your own inventory' },
        { status: 403 }
      )
    }

    // Cancel request
    const result = await sharingService.updateRequest(id, {
      status: 'cancelled' as any,
      response_message: 'Request cancelled by owner'
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Request cancelled successfully'
    })

  } catch (error: any) {
    console.error('Cancel request error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
