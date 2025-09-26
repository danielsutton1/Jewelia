import { NextRequest, NextResponse } from 'next/server'
import { InternalMessagingService } from '@/lib/services/InternalMessagingService'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/internal-messages - Get messages for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get parameters from query string
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const lastCheck = searchParams.get('last_check')
    
    // If last_check is provided without userId, we need to handle this differently
    // For now, we'll require userId for all requests to maintain security
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID required for security. Please provide userId parameter.' 
      }, { status: 400 })
    }
    
    const testUser = { id: userId }

    const filters = {
      status: searchParams.get('status') as 'unread' | 'read' | 'archived' | 'deleted' | undefined,
      message_type: searchParams.get('message_type') || undefined,
      priority: searchParams.get('priority') || undefined,
      search: searchParams.get('search') || undefined,
      sender_id: searchParams.get('sender_id') || undefined
    }

    const internalMessagingService = new InternalMessagingService(supabase)
    
    // If last_check is provided, we can optimize to only fetch newer messages
    if (lastCheck) {
      const lastCheckDate = new Date(lastCheck)
      if (isNaN(lastCheckDate.getTime())) {
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid last_check date format' 
        }, { status: 400 })
      }
      
      // Get messages newer than lastCheck
      const messages = await internalMessagingService.getMessages(testUser.id, filters)
      const newMessages = messages.filter(msg => new Date(msg.created_at) > lastCheckDate)
      const unreadCount = await internalMessagingService.getUnreadCount(testUser.id)

      // Fetch attachments for new messages
      const newMessagesWithAttachments = await Promise.all(
        newMessages.map(async (message) => {
          try {
            const { data: attachments, error: attachmentsError } = await supabase
              .from('message_attachments')
              .select('*')
              .eq('message_id', message.id)
              .order('created_at', { ascending: true })

            if (attachmentsError) {
              console.error(`Error fetching attachments for message ${message.id}:`, attachmentsError)
              return message
            }

            // Transform attachments to match the expected format
            const transformedAttachments = (attachments || []).map((att: any) => ({
              id: att.id,
              name: att.file_name, // Use original filename for display
              type: att.mime_type,
              size: att.file_size,
              file_path: att.file_path, // Use sanitized path for storage access
              message_id: att.message_id,
              uploaded_by: att.uploaded_by,
              created_at: att.created_at
            }))

            return {
              ...message,
              attachments: transformedAttachments
            }
          } catch (error) {
            console.error(`Error processing attachments for message ${message.id}:`, error)
            return message
          }
        })
      )

      return NextResponse.json({
        success: true,
        data: {
          messages: newMessagesWithAttachments,
          total_count: newMessagesWithAttachments.length,
          unread_count: unreadCount,
          has_new_messages: newMessagesWithAttachments.length > 0
        }
      })
    } else {
      // Regular message fetch
      const messages = await internalMessagingService.getMessages(testUser.id, filters)
      const unreadCount = await internalMessagingService.getUnreadCount(testUser.id)

      // Fetch attachments for all messages from the new message_attachments table
      const messagesWithAttachments = await Promise.all(
        messages.map(async (message) => {
          try {
            const { data: attachments, error: attachmentsError } = await supabase
              .from('message_attachments')
              .select('*')
              .eq('message_id', message.id)
              .order('created_at', { ascending: true })

            if (attachmentsError) {
              console.error(`Error fetching attachments for message ${message.id}:`, attachmentsError)
              return message
            }

            // Transform attachments to match the expected format
            const transformedAttachments = (attachments || []).map((att: any) => ({
              id: att.id,
              name: att.file_name, // Use original filename for display
              type: att.mime_type,
              size: att.file_size,
              file_path: att.file_path, // Use sanitized path for storage access
              message_id: att.message_id,
              uploaded_by: att.uploaded_by,
              created_at: att.created_at
            }))

            return {
              ...message,
              attachments: transformedAttachments
            }
          } catch (error) {
            console.error(`Error processing attachments for message ${message.id}:`, error)
            return message
          }
        })
      )

      return NextResponse.json({
        success: true,
        data: {
          messages: messagesWithAttachments,
          total_count: messagesWithAttachments.length,
          unread_count: unreadCount
        }
      })
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/internal-messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/internal-messages called')
    const supabase = await createSupabaseServerClient()
    console.log('✅ Supabase client created')
    
    // Get user ID from request body for testing
    const body = await request.json()
    console.log('📥 Request body received:', body)
    
    const { sender_id, recipient_id, subject, content, message_type, priority, company_id, order_id, parent_message_id, thread_id, attachments } = body
    
    if (!sender_id) {
      console.log('❌ Missing sender_id')
      return NextResponse.json({ success: false, message: 'Sender ID required' }, { status: 400 })
    }
    
    const testUser = { id: sender_id }
    console.log('👤 Test user:', testUser)

    if (!recipient_id || !subject || !content) {
      console.log('❌ Missing required fields:', { recipient_id, subject, content })
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Add this debug logging
    console.log('📤 About to send message with data:', {
      sender_id: testUser.id,
      recipient_id,
      subject,
      content,
      message_type,
      priority
    })

    const internalMessagingService = new InternalMessagingService(supabase)
    console.log('🔧 InternalMessagingService created')
    
    console.log('📝 Calling sendMessage...')
    const message = await internalMessagingService.sendMessage('', { // senderId parameter no longer needed
      sender_id: testUser.id, // Include sender_id in messageData
      recipient_id,
      subject,
      content,
      message_type,
      priority,
      company_id,
      order_id,
      parent_message_id,
      thread_id,
      attachments
    })

    // Add this debug logging
    console.log('📨 Message result:', message)

    if (!message) {
      console.log('❌ sendMessage returned null')
      return NextResponse.json(
        { success: false, message: 'Failed to send message' },
        { status: 500 }
      )
    }

    // If there are attachments, upload them to Supabase storage
    let uploadedAttachments = []
    if (attachments && attachments.length > 0) {
      console.log('📎 Processing attachments:', attachments.length)
      
      for (const attachment of attachments) {
        try {
          // For now, since we don't have the actual file data in the request,
          // we'll create a placeholder entry. In a real implementation, you'd need
          // to send the file data separately (e.g., using FormData)
          
          // Create a placeholder file path
          const filePath = `${message.id}/${attachment.name}`
          
          // Insert attachment record into database
          const { data: attachmentData, error: attachmentError } = await supabase
            .from('message_attachments')
            .insert({
              message_id: message.id,
              file_name: attachment.name,
              file_type: attachment.type,
              file_size: attachment.size,
              file_path: filePath,
              mime_type: attachment.type,
              uploaded_by: testUser.id
            })
            .select()
            .single()
          
          if (attachmentError) {
            console.error('❌ Error creating attachment record:', attachmentError)
          } else {
            console.log('✅ Attachment record created:', attachmentData)
            uploadedAttachments.push(attachmentData)
          }
        } catch (attachmentError) {
          console.error('❌ Error processing attachment:', attachmentError)
        }
      }
    }

    console.log('✅ Message sent successfully')
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: { 
        message: {
          ...message,
          attachments: uploadedAttachments // Include the uploaded attachments
        },
        messageId: message.id // Add this so frontend can use it for file uploads
      }
    })
  } catch (error) {
    console.error('💥 Error sending internal message:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}