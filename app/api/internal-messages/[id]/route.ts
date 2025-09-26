import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { InternalMessagingService } from '@/lib/services/InternalMessagingService'

// GET /api/internal-messages/[id] - Get a specific message
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🚀 GET /api/internal-messages/[id] called with params:', { id })
    console.log('🔗 Request URL:', request.url)
    
    const supabase = await createSupabaseServerClient()
    console.log('✅ Supabase client created')
    
    // TEMPORARY: Skip authentication for testing
    // const { data: { user }, error: authError } = await supabase.auth.getUser()
    // if (authError || !user) {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    // }

    // Use hardcoded test user for testing
    const testUser = { id: 'fdb2a122-d6ae-4e78-b277-3317e1a09132' }
    console.log('👤 Using test user:', testUser.id)

    console.log('🔧 Creating InternalMessagingService...')
    const internalMessagingService = new InternalMessagingService(supabase)
    console.log('✅ InternalMessagingService created')
    
    console.log('📞 Calling service.getMessage()...')
    const message = await internalMessagingService.getMessage(id, testUser.id)
    console.log('📨 Service returned:', message ? 'SUCCESS' : 'NULL')

    if (!message) {
      console.log('❌ Message not found')
      return NextResponse.json(
        { success: false, message: 'Message not found' },
        { status: 404 }
      )
    }

    console.log('✅ Returning message:', message)
    return NextResponse.json({
      success: true,
      data: message
    })
  } catch (error) {
    console.error('❌ Error fetching message:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/internal-messages/[id] - Update a message (e.g., mark as read)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    
    // TEMPORARY: Skip authentication for testing
    // const { data: { user }, error: authError } = await supabase.auth.getUser()
    // if (authError || !user) {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    // }

    // Use hardcoded test user for testing
    const testUser = { id: 'fdb2a122-d6ae-4e78-b277-3317e1a09132' }

    const body = await request.json()
    const { status } = body

    if (status === 'read') {
      const internalMessagingService = new InternalMessagingService(supabase)
      await internalMessagingService.markAsRead(id)
      
      return NextResponse.json({
        success: true,
        message: 'Message marked as read'
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid status update' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/internal-messages/[id] - Delete a message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    
    // TEMPORARY: Skip authentication for testing
    // const { data: { user }, error: authError } = await supabase.auth.getUser()
    // if (authError || !user) {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    // }

    // Use hardcoded test user for testing
    const testUser = { id: 'fdb2a122-d6ae-4e78-b277-3317e1a09132' }

    const internalMessagingService = new InternalMessagingService(supabase)
    await internalMessagingService.deleteMessage(id, testUser.id)
    
    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
