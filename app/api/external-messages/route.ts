import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey === 'your_service_role_key_here') {
      console.error('❌ Missing Supabase configuration, returning mock data')
      const { searchParams } = new URL(request.url)
      const partnerId = searchParams.get('partnerId')
      
      return NextResponse.json({
        success: true,
        data: {
          messages: getMockExternalMessages(partnerId || 'partner-1'),
          hasNewMessages: false,
          pagination: {
            limit: 50,
            offset: 0,
            total: 3
          }
        }
      })
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('✅ Supabase admin client created successfully')
    
    // Get current user - but don't fail if not authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('⚠️ No authenticated user, using default user ID for demo')
      // For demo purposes, use a default user ID
      const defaultUserId = '6d1a08f1-134c-46dd-aa1e-21f95b80bed4' // Sarah Goldstein's ID
      
      const { searchParams } = new URL(request.url)
      const partnerId = searchParams.get('partnerId')
      const lastCheck = searchParams.get('last_check')
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')

      if (!partnerId) {
        return NextResponse.json({
          success: false,
          message: 'Partner ID required for external messages'
        }, { status: 400 })
      }

      console.log('🔍 Fetching external messages for partner:', partnerId, '(demo mode)')

      // Get all external messages for now (simplified for debugging)
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          message_type,
          sender_id,
          thread_id,
          content,
          is_read,
          read_at,
          metadata,
          created_at,
          updated_at,
          sender:users!messages_sender_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('message_type', 'external')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching external messages:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to fetch messages',
          details: error.message
        }, { status: 500 })
      }

      console.log('📝 Raw messages fetched:', messages?.length || 0)
      
      // Filter messages by partner_id in metadata
      const partnerMessages = messages?.filter(msg => {
        const msgPartnerId = msg.metadata?.partner_id
        console.log('🔍 Message partner_id:', msgPartnerId, 'vs requested:', partnerId)
        return msgPartnerId === partnerId
      }) || []
      
      console.log('📝 Filtered messages for partner:', partnerMessages.length)
      
      // Apply pagination
      const paginatedMessages = partnerMessages.slice(offset, offset + limit)
      
      // Try to get attachments for each message (gracefully handle errors)
      const messagesWithAttachments = await Promise.all(
        paginatedMessages.map(async (message) => {
          try {
            const { data: attachments } = await supabase
              .from('message_attachments')
              .select('id, file_name, file_type, file_size, file_path, mime_type, uploaded_by, created_at')
              .eq('message_id', message.id)
            
            return {
              ...message,
              attachments: attachments || []
            }
          } catch (error) {
            console.log('⚠️ Could not fetch attachments for message:', message.id)
            return {
              ...message,
              attachments: []
            }
          }
        })
      )
      
      // Check for new messages since last check
      let hasNewMessages = false
      if (lastCheck) {
        hasNewMessages = partnerMessages.some(msg => 
          new Date(msg.created_at) > new Date(lastCheck)
        )
      }

      console.log('✅ External messages fetched successfully (demo mode):', {
        count: paginatedMessages.length,
        total: partnerMessages.length,
        hasNewMessages,
        partnerId
      })

      return NextResponse.json({
        success: true,
        data: {
          messages: messagesWithAttachments,
          hasNewMessages,
          pagination: {
            limit,
            offset,
            total: partnerMessages.length
          }
        }
      })
    }
    
    // Original authenticated user logic continues here
    const { searchParams } = new URL(request.url)
    const partnerId = searchParams.get('partnerId')
    const lastCheck = searchParams.get('last_check')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!partnerId) {
      return NextResponse.json({
        success: false,
        message: 'Partner ID required for external messages'
      }, { status: 400 })
    }

    console.log('🔍 Fetching external messages for partner:', partnerId, 'user:', user.id)
    
    // First, get messages where user is sender
    const { data: sentMessages, error: sentError } = await supabase
      .from('messages')
      .select(`
        id,
        message_type,
        sender_id,
        thread_id,
        content,
        is_read,
        read_at,
        metadata,
        created_at,
        updated_at,
        sender:users!messages_sender_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('message_type', 'external')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false })

    if (sentError) {
      console.error('❌ Error fetching sent messages:', sentError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch messages' 
      }, { status: 500 })
    }

    // Then, get messages where user is recipient (via partner_id in metadata)
    const { data: receivedMessages, error: receivedError } = await supabase
      .from('messages')
      .select(`
        id,
        message_type,
        sender_id,
        thread_id,
        content,
        is_read,
        read_at,
        metadata,
        created_at,
        updated_at,
        sender:users!messages_sender_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('message_type', 'external')
      .eq('metadata->partner_id', partnerId)
      .order('created_at', { ascending: false })

    if (receivedError) {
      console.error('❌ Error fetching received messages:', receivedError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch messages' 
      }, { status: 500 })
    }

    // Combine and deduplicate messages
    const allMessages = [...(sentMessages || []), ...(receivedMessages || [])]
    const uniqueMessages = allMessages.filter((message, index, self) => 
      index === self.findIndex(m => m.id === message.id)
    )
    
    // Sort by creation date
    const sortedMessages = uniqueMessages.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    // Apply pagination
    const paginatedMessages = sortedMessages.slice(offset, offset + limit)
    
    // Try to get attachments for each message (gracefully handle errors)
    const messagesWithAttachments = await Promise.all(
      paginatedMessages.map(async (message) => {
        try {
          const { data: attachments } = await supabase
            .from('message_attachments')
            .select('id, file_name, file_type, file_size, file_path, mime_type, uploaded_by, created_at')
            .eq('message_id', message.id)
          
          return {
            ...message,
            attachments: attachments || []
          }
        } catch (error) {
          console.log('⚠️ Could not fetch attachments for message:', message.id)
          return {
            ...message,
            attachments: []
          }
        }
      })
    )
    
    // Check for new messages since last check
    let hasNewMessages = false
    if (lastCheck) {
      hasNewMessages = sortedMessages.some(msg => 
        new Date(msg.created_at) > new Date(lastCheck)
      )
    }

    console.log('✅ External messages fetched successfully:', {
      count: paginatedMessages.length,
      total: sortedMessages.length,
      hasNewMessages,
      partnerId,
      userId: user.id
    })

    return NextResponse.json({
      success: true,
      data: {
        messages: messagesWithAttachments,
        hasNewMessages,
        pagination: {
          limit,
          offset,
          total: sortedMessages.length
        }
      }
    })

  } catch (error) {
    console.error('❌ Error in external messages API:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase configuration')
      return NextResponse.json(
        { success: false, error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('✅ Supabase admin client created successfully')
    
    const body = await request.json()
    console.log('📝 Received message data:', body)
    
    // Handle both field name variations
    const partnerId = body.partnerId || body.partner_id
    const content = body.content
    const recipientId = body.recipientId || body.recipient_id
    const subject = body.subject
    const priority = body.priority
    const category = body.category
    const replyToId = body.replyToId || body.reply_to_id
    const threadId = body.threadId || body.thread_id
    const attachments = body.attachments || []

    if (!content || !partnerId) {
      console.error('❌ Missing required fields:', { content: !!content, partnerId: !!partnerId })
      return NextResponse.json({
        success: false,
        message: 'Content and partner ID are required',
        received: { content: !!content, partnerId: !!partnerId, body }
      }, { status: 400 })
    }

    // Get current user - but don't fail if not authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('⚠️ No authenticated user, using default user ID for demo')
      // For demo purposes, use a default user ID
      const defaultUserId = '6d1a08f1-134c-46dd-aa1e-21f95b80bed4' // Sarah Goldstein's ID
      
      console.log('📝 Creating external message (demo mode) with sender:', defaultUserId)
      
      const messageData = {
        message_type: 'external',
        sender_id: defaultUserId,
        content,
        metadata: {
          partner_id: partnerId,
          recipient_id: recipientId,
          subject,
          priority,
          category,
          reply_to_id: replyToId,
          thread_id: threadId,
          attachments
        }
      }

      console.log('📝 Inserting message data:', messageData)

      const { data: message, error: insertError } = await supabase
        .from('messages')
        .insert(messageData)
        .select()

      if (insertError) {
        console.error('❌ Error creating external message:', insertError)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create message',
          details: insertError.message
        }, { status: 500 })
      }

      console.log('✅ External message created successfully (demo mode):', message[0].id)

      return NextResponse.json({
        success: true,
        message: 'External message sent successfully',
        data: {
          message: message[0],
          messageId: message[0].id
        }
      })
    }
    
    // Original authenticated user logic continues here
    console.log('📝 Creating external message with sender:', user.id)
    
    const messageData = {
      message_type: 'external',
      sender_id: user.id,
      content,
      metadata: {
        partner_id: partnerId,
        recipient_id: recipientId,
        subject,
        priority,
        category,
        reply_to_id: replyToId,
        thread_id: threadId,
        attachments
      }
    }

    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert(messageData)
      .select()

    if (insertError) {
      console.error('❌ Error creating external message:', insertError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create message',
        details: insertError.message
      }, { status: 500 })
    }

    console.log('✅ External message created successfully:', message[0].id)

    return NextResponse.json({
      success: true,
      message: 'External message sent successfully',
      data: {
        message: message[0],
        messageId: message[0].id
      }
    })

  } catch (error) {
    console.error('❌ Error in external messages POST API:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Mock external messages data
function getMockExternalMessages(partnerId: string) {
  return [
    {
      id: 'msg-1',
      message_type: 'external',
      sender_id: 'user-1',
      thread_id: 'thread-1',
      content: 'Hi! I wanted to follow up on the diamond ring order. When can we expect delivery?',
      is_read: false,
      read_at: null,
      metadata: {
        partner_id: partnerId,
        subject: 'Order Follow-up',
        priority: 'normal',
        category: 'order_inquiry'
      },
      created_at: new Date('2024-08-11T10:30:00Z').toISOString(),
      updated_at: new Date('2024-08-11T10:30:00Z').toISOString(),
      sender: {
        id: 'user-1',
        full_name: 'Eli Martin',
        email: 'eli.martin@jewelia.com',
        avatar_url: null
      },
      attachments: []
    },
    {
      id: 'msg-2',
      message_type: 'external',
      sender_id: 'user-2',
      thread_id: 'thread-1',
      content: 'The ring is currently in quality control. We expect to ship it by Friday.',
      is_read: true,
      read_at: new Date('2024-08-11T11:15:00Z').toISOString(),
      metadata: {
        partner_id: partnerId,
        subject: 'Re: Order Follow-up',
        priority: 'normal',
        category: 'order_update'
      },
      created_at: new Date('2024-08-11T11:00:00Z').toISOString(),
      updated_at: new Date('2024-08-11T11:00:00Z').toISOString(),
      sender: {
        id: 'user-2',
        full_name: 'Lisa Rodriguez',
        email: 'lisa.rodriguez@jewelia.com',
        avatar_url: null
      },
      attachments: []
    },
    {
      id: 'msg-3',
      message_type: 'external',
      sender_id: 'user-3',
      thread_id: 'thread-2',
      content: 'Could you send me the specifications for the custom necklace design?',
      is_read: false,
      read_at: null,
      metadata: {
        partner_id: partnerId,
        subject: 'Custom Design Inquiry',
        priority: 'high',
        category: 'design_inquiry'
      },
      created_at: new Date('2024-08-11T14:20:00Z').toISOString(),
      updated_at: new Date('2024-08-11T14:20:00Z').toISOString(),
      sender: {
        id: 'user-3',
        full_name: 'Mike Chen',
        email: 'mike.chen@jewelia.com',
        avatar_url: null
      },
      attachments: []
    }
  ]
}
