import { NextRequest, NextResponse } from 'next/server'
import { EnhancedExternalMessagingService } from '@/lib/services/EnhancedExternalMessagingService'

// =====================================================
// ENHANCED EXTERNAL MESSAGES API
// =====================================================
// This endpoint provides the same rich features as internal messaging
// for B2B partner communications

export async function GET(request: NextRequest) {
  try {
    const service = new EnhancedExternalMessagingService()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const conversationId = searchParams.get('conversationId')
    const userId = searchParams.get('userId') || '6d1a08f1-134c-46dd-aa1e-21f95b80bed4' // Default for demo
    
    if (conversationId) {
      // Get specific conversation with messages
      const result = await service.getConversation(conversationId, userId)
      return NextResponse.json({
        success: true,
        data: result
      })
    } else {
      // Get all conversations for user
      const options = {
        status: searchParams.get('status') || undefined,
        priority: searchParams.get('priority') || undefined,
        category: searchParams.get('category') || undefined,
        search: searchParams.get('search') || undefined,
        limit: parseInt(searchParams.get('limit') || '50'),
        offset: parseInt(searchParams.get('offset') || '0')
      }
      
      console.log('🔍 API: Calling getConversations with userId:', userId)
      console.log('🔍 API: Options:', options)
      
      const result = await service.getConversations(userId, options)
      
      console.log('🔍 API: getConversations result:', result)
      console.log('🔍 API: Result type:', typeof result)
      console.log('🔍 API: Result keys:', Object.keys(result || {}))
      
      return NextResponse.json({
        success: true,
        data: result
      })
    }
  } catch (error) {
    console.error('Error in enhanced external messages GET:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch enhanced external messages',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const service = new EnhancedExternalMessagingService()
    const body = await request.json()
    const userId = body.userId || '6d1a08f1-134c-46dd-aa1e-21f95b80bed4' // Default for demo
    
    if (body.action === 'create_conversation') {
      // Create new conversation
      const conversation = await service.createConversation(body.conversation, userId)
      return NextResponse.json({
        success: true,
        message: 'Conversation created successfully',
        data: { conversation }
      })
    } else if (body.action === 'send_message') {
      // Send message in existing conversation
      const message = await service.sendMessage(body.message, userId)
      return NextResponse.json({
        success: true,
        message: 'Message sent successfully',
        data: { message }
      })
    } else if (body.action === 'update_conversation') {
      // Update conversation details
      const conversation = await service.updateConversation(body.conversationId, body.updates)
      return NextResponse.json({
        success: true,
        message: 'Conversation updated successfully',
        data: { conversation }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action specified'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in enhanced external messages POST:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process enhanced external message request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const service = new EnhancedExternalMessagingService()
    const body = await request.json()
    const userId = body.userId || '6d1a08f1-134c-46dd-aa1e-21f95b80bed4' // Default for demo
    
    if (body.action === 'add_participant') {
      // Add participant to conversation
      await service.addParticipant(body.conversationId, body.userId, body.role)
      return NextResponse.json({
        success: true,
        message: 'Participant added successfully'
      })
    } else if (body.action === 'remove_participant') {
      // Remove participant from conversation
      await service.removeParticipant(body.conversationId, body.userId)
      return NextResponse.json({
        success: true,
        message: 'Participant removed successfully'
      })
    } else if (body.action === 'mark_notifications_read') {
      // Mark notifications as read
      await service.markNotificationsAsRead(userId, body.conversationId)
      return NextResponse.json({
        success: true,
        message: 'Notifications marked as read'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action specified'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in enhanced external messages PUT:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process enhanced external message update',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const service = new EnhancedExternalMessagingService()
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    
    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'Conversation ID required'
      }, { status: 400 })
    }
    
    // Archive conversation (soft delete)
    await service.updateConversation(conversationId, { status: 'archived' })
    
    return NextResponse.json({
      success: true,
      message: 'Conversation archived successfully'
    })
  } catch (error) {
    console.error('Error in enhanced external messages DELETE:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to archive conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
