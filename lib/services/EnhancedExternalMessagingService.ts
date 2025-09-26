import { createClient } from '@supabase/supabase-js'

// =====================================================
// ENHANCED EXTERNAL MESSAGING SERVICE
// =====================================================
// This service provides the same rich features as internal messaging
// for B2B partner communications

export interface ExternalConversation {
  id: string
  title: string
  subject: string
  category: string
  partner_id: string
  initiator_id: string
  participants: string[]
  business_type: 'inquiry' | 'quote' | 'order' | 'support' | 'general'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'active' | 'in_progress' | 'resolved' | 'closed' | 'archived'
  tags: string[]
  metadata: Record<string, any>
  is_pinned: boolean
  last_message_at: string
  created_at: string
  updated_at: string
  partner?: {
    id: string
    name: string
    type: string
    status: string
    avatar_url?: string
  }
  last_message?: {
    id: string
    content: string
    sender: {
      id: string
      full_name: string
      avatar_url?: string
    }
    created_at: string
  }
  unread_count?: number
}

export interface EnhancedExternalMessage {
  id: string
  conversation_id: string
  sender_id: string
  partner_id: string
  subject?: string
  content: string
  content_type: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: string
  status: string
  is_read: boolean
  read_at?: string
  delivered_at?: string
  thread_id?: string
  reply_to_id?: string
  related_order_id?: string
  related_project_id?: string
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  sender?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  partner?: {
    id: string
    name: string
    company: string
    avatar_url?: string
  }
  attachments?: MessageAttachment[]
}

export interface MessageAttachment {
  id: string
  message_id: string
  conversation_id?: string
  file_name: string
  file_type: string
  file_size: number
  mime_type?: string
  file_path: string
  file_url?: string
  is_processed: boolean
  processing_status: string
  uploaded_by?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface CreateConversationRequest {
  title: string
  subject: string
  category: string
  partner_id: string
  business_type: 'inquiry' | 'quote' | 'order' | 'support' | 'general'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  tags?: string[]
  metadata?: Record<string, any>
  related_order_id?: string
  related_project_id?: string
}

export interface SendMessageRequest {
  conversation_id: string
  content: string
  subject?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  category?: string
  tags?: string[]
  metadata?: Record<string, any>
  attachments?: File[]
  reply_to_id?: string
}

export class EnhancedExternalMessagingService {
  private supabase: any

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  // =====================================================
  // CONVERSATION MANAGEMENT
  // =====================================================

  /**
   * Get all external conversations for a user
   */
  async getConversations(userId: string, options?: {
    status?: string
    priority?: string
    category?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<{ conversations: ExternalConversation[], total: number }> {
    try {
      console.log('🔍 getConversations called with userId:', userId)
      console.log('🔍 Options:', options)
      
      // Check if message_threads table exists, if not return empty result
      const { data: tableExists } = await this.supabase
        .from('message_threads')
        .select('id', { count: 'exact', head: true })
        .limit(1)

      if (!tableExists) {
        console.log('⚠️ message_threads table does not exist yet, returning empty result')
        return {
          conversations: [],
          total: 0
        }
      }

      let query = this.supabase
        .from('message_threads')
        .select(`*`)
        .order('last_message_at', { ascending: false })

      console.log('🔍 Query built, applying filters...')

      // Apply filters
      if (options?.status) {
        query = query.eq('status', options.status)
      }
      if (options?.priority) {
        query = query.eq('priority', options.priority)
      }
      if (options?.category) {
        query = query.eq('category', options.category)
      }
      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,subject.ilike.%${options.search}%`)
      }

      console.log('🔍 Getting total count...')

      // Get total count
      const { count, error: countError } = await this.supabase
        .from('message_threads')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('❌ Count error:', countError)
        console.log('⚠️ Returning empty result due to count error')
        return {
          conversations: [],
          total: 0
        }
      }

      console.log('🔍 Total count:', count)

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      if (options?.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1)
      }

      console.log('🔍 Executing main query...')

      const { data: conversations, error } = await query

      if (error) {
        console.error('❌ Main query error:', error)
        console.log('⚠️ Returning empty result due to query error')
        return {
          conversations: [],
          total: 0
        }
      }

      console.log('🔍 Conversations fetched:', conversations?.length || 0)

      // Transform conversations to match the expected interface
      const transformedConversations = (conversations || []).map((conv: any) => ({
        id: conv.id,
        title: conv.subject || 'Untitled Conversation',
        subject: conv.subject || '',
        category: conv.category || 'general',
        partner_id: conv.partner_id,
        initiator_id: conv.created_by,
        participants: conv.participants || [],
        business_type: conv.business_type || 'general',
        priority: conv.priority || 'normal',
        status: conv.status || 'active',
        tags: conv.tags || [],
        metadata: conv.metadata || {},
        is_pinned: conv.is_pinned || false,
        last_message_at: conv.last_message_at || conv.created_at,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        unread_count: 0
      }))

      console.log('✅ Returning conversations:', transformedConversations.length)

      return {
        conversations: transformedConversations,
        total: count || 0
      }
    } catch (error) {
      console.error('❌ Error in getConversations:', error)
      // Return empty result instead of throwing to prevent 500 errors
      return {
        conversations: [],
        total: 0
      }
    }
  }

  /**
   * Get a specific conversation with all its messages
   */
  async getConversation(conversationId: string, userId: string): Promise<{
    conversation: ExternalConversation
    messages: EnhancedExternalMessage[]
    total: number
  }> {
    try {
      // Get conversation details
      const { data: conversation, error: convError } = await this.supabase
        .from('message_threads')
        .select(`*`)
        .eq('id', conversationId)
        .single()

      if (convError || !conversation) {
        throw new Error('Conversation not found')
      }

      // Get messages for this conversation
      const { data: messages, error: msgError } = await this.supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          ),
          partner:partners(
            id,
            name,
            type,
            avatar_url
          ),
          attachments:message_attachments(*)
        `)
        .eq('thread_id', conversationId)
        .order('created_at', { ascending: true })

      if (msgError) {
        console.error('Error fetching messages:', msgError)
        throw new Error('Failed to fetch messages')
      }

      // Mark conversation as read for this user
      await this.markConversationAsRead(conversationId, userId)

      return {
        conversation,
        messages: messages || [],
        total: messages?.length || 0
      }
    } catch (error) {
      console.error('Error in getConversation:', error)
      throw error
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(request: CreateConversationRequest, userId: string): Promise<ExternalConversation> {
    try {
      const { data: conversation, error } = await this.supabase
        .from('message_threads')
        .insert({
          title: request.title,
          subject: request.subject,
          category: request.category,
          partner_id: request.partner_id,
          initiator_id: userId,
          participants: [userId],
          business_type: request.business_type,
          priority: request.priority || 'normal',
          tags: request.tags || [],
          metadata: request.metadata || {},
          related_order_id: request.related_order_id,
          related_project_id: request.related_project_id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating conversation:', error)
        throw new Error('Failed to create conversation')
      }

      // Add user as participant
      await this.addParticipant(conversation.id, userId, 'owner')

      return conversation
    } catch (error) {
      console.error('Error in createConversation:', error)
      throw error
    }
  }

  /**
   * Update conversation details
   */
  async updateConversation(
    conversationId: string,
    updates: Partial<Pick<ExternalConversation, 'title' | 'subject' | 'category' | 'priority' | 'status' | 'tags' | 'metadata'>>
  ): Promise<ExternalConversation> {
    try {
      const { data: conversation, error } = await this.supabase
        .from('message_threads')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .select()
        .single()

      if (error) {
        console.error('Error updating conversation:', error)
        throw new Error('Failed to update conversation')
      }

      return conversation
    } catch (error) {
      console.error('Error in updateConversation:', error)
      throw error
    }
  }

  // =====================================================
  // MESSAGE MANAGEMENT
  // =====================================================

  /**
   * Send a message in a conversation
   */
  async sendMessage(request: SendMessageRequest, userId: string): Promise<EnhancedExternalMessage> {
    try {
      // Get conversation details for metadata
      const { data: conversation } = await this.supabase
        .from('message_threads')
        .select('partner_id, category')
        .eq('id', request.conversation_id)
        .single()

      if (!conversation) {
        throw new Error('Conversation not found')
      }

      // Create the message
      const { data: message, error } = await this.supabase
        .from('messages')
        .insert({
          type: 'external',
          sender_id: userId,
          partner_id: conversation.partner_id,
          subject: request.subject,
          content: request.content,
          content_type: 'text',
          priority: request.priority || 'normal',
          category: request.category || conversation.category,
          status: 'sent',
          tags: request.tags || [],
          metadata: {
            ...request.metadata,
            conversation_id: request.conversation_id,
            reply_to_id: request.reply_to_id
          },
          thread_id: request.conversation_id,
          reply_to_id: request.reply_to_id
        })
        .select(`
          *,
          sender:users!sender_id(
            id,
            full_name,
            email,
            avatar_url
          ),
          partner:partners!partner_id(
            id,
            name,
            type,
            avatar_url
          )
        `)
        .single()

      if (error) {
        console.error('Error sending message:', error)
        throw new Error('Failed to send message')
      }

      // Handle attachments if any
      if (request.attachments && request.attachments.length > 0) {
        await this.handleAttachments(message.id, request.conversation_id, request.attachments, userId)
      }

      // Update conversation's last_message_at (trigger should handle this)
      await this.supabase
        .from('message_threads')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', request.conversation_id)

      return message
    } catch (error) {
      console.error('Error in sendMessage:', error)
      throw error
    }
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getMessages(
    conversationId: string,
    options?: {
      limit?: number
      offset?: number
      before?: string
      after?: string
    }
  ): Promise<{ messages: EnhancedExternalMessage[], total: number, hasMore: boolean }> {
    try {
      console.log('🔍 getMessages called with conversationId:', conversationId)
      
      let query = this.supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(
            id,
            full_name,
            email,
            avatar_url
          ),
          attachments:message_attachments(
            id,
            file_name,
            file_type,
            file_size,
            file_path,
            mime_type
          )
        `)
        .eq('thread_id', conversationId)
        .order('created_at', { ascending: false })

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      if (options?.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1)
      }
      if (options?.before) {
        query = query.lt('created_at', options.before)
      }
      if (options?.after) {
        query = query.gt('created_at', options.after)
      }

      console.log('🔍 Executing messages query...')
      const { data: messages, error } = await query

      if (error) {
        console.error('❌ Error fetching messages:', error)
        throw new Error('Failed to fetch messages')
      }

      console.log('🔍 Messages fetched:', messages?.length || 0)

      // Get total count
      const { count } = await this.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', conversationId)

      console.log('🔍 Total count:', count)

      // Transform messages to match the expected interface
      const transformedMessages: EnhancedExternalMessage[] = (messages || []).map((msg: any) => ({
        id: msg.id,
        conversation_id: msg.thread_id,
        sender_id: msg.sender_id,
        partner_id: msg.partner_id,
        subject: msg.subject,
        content: msg.content,
        content_type: msg.content_type || 'text',
        priority: msg.priority || 'normal',
        category: msg.category || 'general',
        status: msg.status || 'active',
        is_read: msg.is_read || false,
        read_at: msg.read_at,
        delivered_at: msg.delivered_at,
        thread_id: msg.thread_id,
        reply_to_id: msg.reply_to_id,
        related_order_id: msg.related_order_id,
        related_project_id: msg.related_project_id,
        tags: msg.tags || [],
        metadata: msg.metadata || {},
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        sender: msg.sender ? {
          id: msg.sender.id,
          full_name: msg.sender.full_name || 'User',
          email: msg.sender.email || 'user@example.com',
          avatar_url: msg.sender.avatar_url
        } : {
          id: msg.sender_id,
          full_name: 'User',
          email: 'user@example.com',
          avatar_url: undefined
        },
        partner: {
          id: msg.partner_id,
          name: 'Partner', // We'll enhance this later
          company: 'Company',
          avatar_url: undefined
        },
        attachments: msg.attachments ? msg.attachments.map((att: any) => {
          // Generate public URL from file_path if it exists
          let fileUrl = ''
          if (att.file_path) {
            try {
              const { data: urlData } = this.supabase.storage
                .from('message-attachments')
                .getPublicUrl(att.file_path)
              fileUrl = urlData.publicUrl
            } catch (error) {
              console.warn('Failed to generate public URL for attachment:', att.id, error)
              fileUrl = ''
            }
          }
          
          return {
            id: att.id,
            file_name: att.file_name,
            file_type: att.file_type,
            file_size: att.file_size,
            file_url: fileUrl,
            file_path: att.file_path,
            mime_type: att.mime_type
          }
        }) : []
      }))

      return {
        messages: transformedMessages,
        total: count || 0,
        hasMore: (options?.offset || 0) + (options?.limit || 50) < (count || 0)
      }
    } catch (error) {
      console.error('❌ Error in getMessages:', error)
      throw error
    }
  }

  // =====================================================
  // PARTICIPANT MANAGEMENT
  // =====================================================

  /**
   * Add a participant to a conversation
   */
  async addParticipant(conversationId: string, userId: string, role: string = 'participant'): Promise<void> {
    try {
      // First, get the current participants array
      const { data: conversation, error: fetchError } = await this.supabase
        .from('message_threads')
        .select('participants')
        .eq('id', conversationId)
        .single()

      if (fetchError) {
        console.error('Error fetching conversation:', fetchError)
        throw new Error('Failed to fetch conversation')
      }

      // Add the new participant if not already present
      const currentParticipants = conversation.participants || []
      if (!currentParticipants.includes(userId)) {
        const updatedParticipants = [...currentParticipants, userId]
        
        // Update conversation participants array
        const { error: updateError } = await this.supabase
          .from('message_threads')
          .update({
            participants: updatedParticipants
          })
          .eq('id', conversationId)

        if (updateError) {
          console.error('Error updating participants:', updateError)
          throw new Error('Failed to update participants')
        }
      }

      // Add to conversation_participants table if it exists
      try {
        await this.supabase
          .from('conversation_participants')
          .upsert({
            conversation_id: conversationId,
            user_id: userId,
            role,
            joined_at: new Date().toISOString(),
            is_active: true
          })
      } catch (error) {
        // Table might not exist, that's okay
        console.log('conversation_participants table not available, skipping')
      }
    } catch (error) {
      console.error('Error in addParticipant:', error)
      throw error
    }
  }

  /**
   * Remove a participant from a conversation
   */
  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    try {
      // First, get the current participants array
      const { data: conversation, error: fetchError } = await this.supabase
        .from('message_threads')
        .select('participants')
        .eq('id', conversationId)
        .single()

      if (fetchError) {
        console.error('Error fetching conversation:', fetchError)
        throw new Error('Failed to fetch conversation')
      }

      // Remove the participant if present
      const currentParticipants = conversation.participants || []
      if (currentParticipants.includes(userId)) {
        const updatedParticipants = currentParticipants.filter((id: string) => id !== userId)
        
        // Update conversation participants array
        const { error: updateError } = await this.supabase
          .from('message_threads')
          .update({
            participants: updatedParticipants
          })
          .eq('id', conversationId)

        if (updateError) {
          console.error('Error updating participants:', updateError)
          throw new Error('Failed to update participants')
        }
      }

      // Update conversation_participants table if it exists
      try {
        await this.supabase
          .from('conversation_participants')
          .update({
            left_at: new Date().toISOString(),
            is_active: false
          })
          .eq('conversation_id', conversationId)
          .eq('user_id', userId)
      } catch (error) {
        // Table might not exist, that's okay
        console.log('conversation_participants table not available, skipping')
      }
    } catch (error) {
      console.error('Error in removeParticipant:', error)
      throw error
    }
  }

  // =====================================================
  // NOTIFICATION MANAGEMENT
  // =====================================================

  /**
   * Create a notification for a conversation
   */
  async createNotification(
    userId: string,
    conversationId: string,
    type: 'new_message' | 'mention' | 'reply' | 'status_change' | 'priority_change',
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('conversation_notifications')
        .insert({
          user_id: userId,
          conversation_id: conversationId,
          notification_type: type,
          title,
          message,
          metadata: metadata || {}
        })

      if (error) {
        console.error('Error creating notification:', error)
        throw new Error('Failed to create notification')
      }
    } catch (error) {
      console.error('Error in createNotification:', error)
      throw error
    }
  }

  /**
   * Mark notifications as read
   */
  async markNotificationsAsRead(userId: string, conversationId?: string): Promise<void> {
    try {
      let query = this.supabase
        .from('conversation_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (conversationId) {
        query = query.eq('conversation_id', conversationId)
      }

      const { error } = await query

      if (error) {
        console.error('Error marking notifications as read:', error)
        throw new Error('Failed to mark notifications as read')
      }
    } catch (error) {
      console.error('Error in markNotificationsAsRead:', error)
      throw error
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Get unread count for a conversation
   */
  private async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    try {
      const { count } = await this.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('sender_id', userId)

      return count || 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  /**
   * Mark conversation as read for a user
   */
  private async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      await this.supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('sender_id', userId)
    } catch (error) {
      console.error('Error marking conversation as read:', error)
    }
  }

  /**
   * Get thread ID for a reply message
   */
  private async getThreadId(messageId: string): Promise<string | null> {
    try {
      const { data: message } = await this.supabase
        .from('messages')
        .select('thread_id, conversation_id')
        .eq('id', messageId)
        .single()

      if (message?.thread_id) {
        return message.thread_id
      }

      // Create new thread if none exists
      if (message?.conversation_id) {
        const { data: thread } = await this.supabase
          .from('message_threads')
          .insert({
            title: 'Reply Thread',
            participants: [message.conversation_id],
            status: 'active'
          })
          .select('id')
          .single()

        return thread?.id || null
      }

      return null
    } catch (error) {
      console.error('Error getting thread ID:', error)
      return null
    }
  }

  /**
   * Handle file attachments
   */
  private async handleAttachments(
    messageId: string,
    conversationId: string,
    files: File[],
    userId: string
  ): Promise<void> {
    try {
      for (const file of files) {
        const filePath = `message-attachments/${conversationId}/${file.name}`
        
        // Upload to Supabase storage
        const { error: uploadError } = await this.supabase.storage
          .from('message-attachments')
          .upload(filePath, file)

        if (uploadError) {
          console.error('Error uploading file:', uploadError)
          continue
        }

        // Get public URL
        const { data: urlData } = this.supabase.storage
          .from('message-attachments')
          .getPublicUrl(filePath)

        // Create attachment record
        await this.supabase
          .from('message_attachments')
          .insert({
            message_id: messageId,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            mime_type: file.type,
            file_path: filePath,
            uploaded_by: null
          })
      }
    } catch (error) {
      console.error('Error handling attachments:', error)
    }
  }

  /**
   * Get default permissions for a role
   */
  private getDefaultPermissions(role: string): Record<string, any> {
    switch (role) {
      case 'owner':
        return {
          can_edit: true,
          can_delete: true,
          can_add_participants: true,
          can_remove_participants: true,
          can_change_settings: true
        }
      case 'admin':
        return {
          can_edit: true,
          can_delete: false,
          can_add_participants: true,
          can_remove_participants: true,
          can_change_settings: false
        }
      case 'participant':
        return {
          can_edit: false,
          can_delete: false,
          can_add_participants: false,
          can_remove_participants: false,
          can_change_settings: false
        }
      case 'viewer':
        return {
          can_edit: false,
          can_delete: false,
          can_add_participants: false,
          can_remove_participants: false,
          can_change_settings: false
        }
      default:
        return {}
    }
  }
}
