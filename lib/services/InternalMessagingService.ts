import { SupabaseClient } from '@supabase/supabase-js'

export interface InternalMessage {
  id: string
  sender_id: string
  recipient_id: string
  subject: string
  content: string
  message_type: 'general' | 'urgent' | 'announcement' | 'task' | 'support'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'unread' | 'read' | 'archived' | 'deleted'
  is_admin_message: boolean
  company_id?: string
  order_id?: string
  parent_message_id?: string
  attachments: any[]
  read_at?: string
  created_at: string
  updated_at: string
  sender_name?: string
  recipient_name?: string
  thread_id?: string
}

export interface CreateMessageRequest {
  sender_id: string  // Add sender_id to the interface
  recipient_id: string
  subject: string
  content: string
  message_type?: 'general' | 'urgent' | 'announcement' | 'task' | 'support'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  company_id?: string
  order_id?: string
  parent_message_id?: string
  thread_id?: string
  attachments?: any[]
}

export interface MessageThread {
  id: string
  title: string
  initiator_id: string
  participants: string[]
  company_id?: string
  is_admin_thread: boolean
  status: 'active' | 'closed' | 'archived'
  last_message_at: string
  created_at: string
  updated_at: string
  participant_names?: string[]
  last_message?: string
}

export interface MessageFilters {
  status?: 'unread' | 'read' | 'archived' | 'deleted'
  message_type?: string
  priority?: string
  sender_id?: string
  recipient_id?: string
  company_id?: string
  search?: string
}

export class InternalMessagingService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  // =====================================================
  // MESSAGE OPERATIONS
  // =====================================================

  async sendMessage(senderId: string, messageData: CreateMessageRequest): Promise<InternalMessage | null> {
    try {
      const { data: message, error } = await this.supabase
        .from('internal_messages')
        .insert({
          sender_id: messageData.sender_id, // Use sender_id from messageData instead of parameter
          recipient_id: messageData.recipient_id,
          subject: messageData.subject,
          content: messageData.content,
          message_type: messageData.message_type || 'general',
          priority: messageData.priority || 'normal',
          company_id: messageData.company_id || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Use default company if not provided
          order_id: messageData.order_id,
          parent_message_id: messageData.parent_message_id,
          thread_id: messageData.thread_id,
          attachments: messageData.attachments || []
        })
        .select()
        .single()

      if (error) throw error

      // Create notification for recipient (optional - don't fail if notification fails)
      try {
        await this.createNotification(message.id, message.recipient_id, 'new_message')
      } catch (notificationError) {
        console.warn('Failed to create notification, but message was sent:', notificationError)
        // Don't fail the message sending if notification fails
      }

      return message
    } catch (error) {
      console.error('Error sending message:', error)
      return null
    }
  }

  async getMessages(userId: string, filters: MessageFilters = {}): Promise<InternalMessage[]> {
    try {
      // First, get all messages
      let query = this.supabase
        .from('internal_messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.message_type) {
        query = query.eq('message_type', filters.message_type)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.sender_id) {
        query = query.eq('sender_id', filters.sender_id)
      }
      if (filters.recipient_id) {
        query = query.eq('recipient_id', filters.recipient_id)
      }
      if (filters.company_id) {
        query = query.eq('company_id', filters.company_id)
      }
      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
      }

      const { data: messages, error } = await query
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get unique user IDs from all messages
      const userIds = new Set<string>()
      messages.forEach(message => {
        userIds.add(message.sender_id)
        userIds.add(message.recipient_id)
      })

      // Fetch all users in one query
      const { data: users, error: usersError } = await this.supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', Array.from(userIds))

      if (usersError) throw usersError

      // Create a map for quick lookup
      const userMap = new Map(users.map(user => [user.id, user]))

      // Map messages with user names
      return messages.map(message => ({
        ...message,
        sender_name: userMap.get(message.sender_id)?.full_name || 'Unknown User',
        recipient_name: userMap.get(message.recipient_id)?.full_name || 'Unknown User'
      }))
    } catch (error) {
      console.error('Error fetching messages:', error)
      return []
    }
  }

  async getMessage(messageId: string, userId: string): Promise<InternalMessage | null> {
    try {
      console.log('🔍 InternalMessagingService.getMessage() called with:', { messageId, userId })
      
      const { data: message, error } = await this.supabase
        .from('internal_messages')
        .select('*')
        .eq('id', messageId)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .single()

      if (error) {
        console.error('❌ Error fetching message:', error)
        throw error
      }

      console.log('✅ Message found:', message)

      // Mark as read if recipient is viewing
      if (message.recipient_id === userId && message.status === 'unread') {
        console.log('📖 Marking message as read...')
        await this.markAsRead(messageId)
      }

      // Fetch user names separately to avoid foreign key issues
      const userIds = [message.sender_id, message.recipient_id]
      console.log(' Fetching users for IDs:', userIds)
      
      try {
        const { data: users, error: usersError } = await this.supabase
          .from('users')
          .select('id, full_name, email')
          .in('id', userIds)

        if (usersError) {
          console.error('❌ Error fetching users:', usersError)
          throw usersError
        }

        console.log('👥 Users found:', users)

        // Create a map for quick lookup
        const userMap = new Map(users.map(user => [user.id, user]))

        const result = {
          ...message,
          sender_name: userMap.get(message.sender_id)?.full_name || 'Unknown User',
          recipient_name: userMap.get(message.recipient_id)?.full_name || 'Unknown User'
        }

        console.log('🎯 Final result with names:', result)
        return result
      } catch (userFetchError) {
        console.error('❌ Error in user name lookup:', userFetchError)
        // Return message without user names if lookup fails
        return {
          ...message,
          sender_name: 'Unknown User',
          recipient_name: 'Unknown User'
        }
      }
    } catch (error) {
      console.error('❌ Error in getMessage:', error)
      return null
    }
  }

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('internal_messages')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', messageId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error marking message as read:', error)
      return false
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('internal_messages')
        .update({ status: 'deleted' })
        .eq('id', messageId)
        .eq('sender_id', userId) // Only sender can delete

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting message:', error)
      return false
    }
  }

  // =====================================================
  // THREAD OPERATIONS
  // =====================================================

  async createThread(initiatorId: string, title: string, participants: string[], companyId?: string): Promise<MessageThread | null> {
    try {
      const { data: thread, error } = await this.supabase
        .from('message_threads')
        .insert({
          title,
          initiator_id: initiatorId,
          participants: [initiatorId, ...participants],
          company_id: companyId,
          is_admin_thread: false
        })
        .select()
        .single()

      if (error) throw error

      // Add participants to message_participants table
      const participantRecords = [initiatorId, ...participants].map(userId => ({
        thread_id: thread.id,
        user_id: userId,
        role: userId === initiatorId ? 'admin' : 'participant'
      }))

      await this.supabase
        .from('message_participants')
        .insert(participantRecords)

      return thread
    } catch (error) {
      console.error('Error creating thread:', error)
      return null
    }
  }

  async getThreads(userId: string, companyId?: string): Promise<MessageThread[]> {
    try {
      let query = this.supabase
        .from('message_threads')
        .select(`
          *,
          participants:message_participants(user_id, role)
        `)
        .or(`initiator_id.eq.${userId},participants.user_id.eq.${userId}`)

      if (companyId) {
        query = query.eq('company_id', companyId)
      }

      const { data: threads, error } = await query
        .order('last_message_at', { ascending: false })

      if (error) throw error

      // Get participant names and last message for each thread
      const enrichedThreads = await Promise.all(
        threads.map(async (thread) => {
          const participantNames = await this.getParticipantNames(thread.participants.map((p: any) => p.user_id))
          const lastMessage = await this.getLastMessageInThread(thread.id)
          
          return {
            ...thread,
            participant_names: participantNames,
            last_message: lastMessage?.content || 'No messages yet'
          }
        })
      )

      return enrichedThreads
    } catch (error) {
      console.error('Error fetching threads:', error)
      return []
    }
  }

  async getThreadMessages(threadId: string, userId: string): Promise<InternalMessage[]> {
    try {
      // Verify user is participant in thread
      const { data: participant, error: participantError } = await this.supabase
        .from('message_participants')
        .select('user_id')
        .eq('thread_id', threadId)
        .eq('user_id', userId)
        .single()

      if (participantError || !participant) {
        throw new Error('User not authorized to view this thread')
      }

      const { data: messages, error } = await this.supabase
        .from('internal_messages')
        .select(`
          *,
          sender:users!internal_messages_sender_id_fkey(full_name),
          recipient:users!internal_messages_recipient_id_fkey(full_name)
        `)
        .eq('parent_message_id', threadId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return messages.map(message => ({
        ...message,
        sender_name: message.sender?.full_name,
        recipient_name: message.recipient?.full_name
      }))
    } catch (error) {
      console.error('Error fetching thread messages:', error)
      return []
    }
  }

  // =====================================================
  // ADMIN OPERATIONS
  // =====================================================

  async sendAdminMessage(adminId: string, recipientIds: string[], subject: string, content: string, companyId?: string): Promise<boolean> {
    try {
      const messages = recipientIds.map(recipientId => ({
        sender_id: adminId,
        recipient_id: recipientId,
        subject,
        content,
        message_type: 'announcement' as const,
        priority: 'normal' as const,
        is_admin_message: true,
        company_id: companyId
      }))

      const { error } = await this.supabase
        .from('internal_messages')
        .insert(messages)

      if (error) throw error

      // Create notifications for all recipients
      await Promise.all(
        recipientIds.map(recipientId => 
          this.createNotification('', recipientId, 'admin_alert')
        )
      )

      return true
    } catch (error) {
      console.error('Error sending admin message:', error)
      return false
    }
  }

  async getAdminMessages(adminId: string, companyId?: string): Promise<InternalMessage[]> {
    try {
      let query = this.supabase
        .from('internal_messages')
        .select(`
          *,
          sender:users!internal_messages_sender_id_fkey(full_name),
          recipient:users!internal_messages_recipient_id_fkey(full_name)
        `)
        .eq('is_admin_message', true)

      if (companyId) {
        query = query.eq('company_id', companyId)
      }

      const { data: messages, error } = await query
        .order('created_at', { ascending: false })

      if (error) throw error

      return messages.map(message => ({
        ...message,
        sender_name: message.sender?.full_name,
        recipient_name: message.recipient?.full_name
      }))
    } catch (error) {
      console.error('Error fetching admin messages:', error)
      return []
    }
  }

  // =====================================================
  // NOTIFICATION OPERATIONS
  // =====================================================

  async createNotification(messageId: string, userId: string, type: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('message_notifications')
        .insert({
          recipient_id: userId,  // Fixed: should be recipient_id, not user_id
          message_id: messageId,
          notification_type: type
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error creating notification:', error)
      return false
    }
  }

  async getNotifications(userId: string): Promise<any[]> {
    try {
      const { data: notifications, error } = await this.supabase
        .from('message_notifications')
        .select(`
          *,
          message:internal_messages(subject, content, sender_id)
        `)
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return notifications || []
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('message_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  private async getParticipantNames(userIds: string[]): Promise<string[]> {
    try {
      const { data: users, error } = await this.supabase
        .from('users')
        .select('full_name')
        .in('id', userIds)

      if (error) throw error
      return users.map(user => user.full_name)
    } catch (error) {
      console.error('Error fetching participant names:', error)
      return []
    }
  }

  private async getLastMessageInThread(threadId: string): Promise<InternalMessage | null> {
    try {
      const { data: message, error } = await this.supabase
        .from('internal_messages')
        .select('*')
        .eq('parent_message_id', threadId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) return null
      return message
    } catch (error) {
      return null
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('internal_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('status', 'unread')

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }
}


