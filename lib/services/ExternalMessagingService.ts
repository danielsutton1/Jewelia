import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface ExternalMessage {
  id: string
  type: 'external'
  sender_id: string
  recipient_id?: string
  partner_id: string
  subject?: string
  content: string
  content_type: 'text' | 'html' | 'markdown'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  is_read: boolean
  read_at?: string
  delivered_at?: string
  thread_id?: string
  reply_to_id?: string
  related_order_id?: string
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
  recipient?: {
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
  attachments?: ExternalMessageAttachment[]
}

export interface ExternalMessageAttachment {
  id: string
  message_id: string
  file_name: string
  file_type: string
  file_size: number
  file_path: string
  mime_type: string
  uploaded_by: string
  created_at: string
}

export interface CreateExternalMessageRequest {
  partner_id: string
  recipient_id?: string
  subject?: string
  content: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  category?: string
  thread_id?: string
  reply_to_id?: string
  related_order_id?: string
  tags?: string[]
  metadata?: Record<string, any>
  attachments?: Array<{
    name: string
    size: number
    type: string
    lastModified: number
  }>
}

export interface ExternalMessageQuery {
  partner_id: string
  limit?: number
  offset?: number
  unread_only?: boolean
  last_check?: string
}

export class ExternalMessagingService {
  private supabase: any

  constructor() {
    this.supabase = null
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createSupabaseServerClient()
    }
    return this.supabase
  }

  /**
   * Send an external message to a partner
   */
  async sendMessage(senderId: string, messageData: CreateExternalMessageRequest): Promise<ExternalMessage | null> {
    try {
      const supabase = await this.getSupabase()

      console.log('📤 Sending external message:', {
        sender_id: senderId,
        partner_id: messageData.partner_id,
        recipient_id: messageData.recipient_id,
        content_length: messageData.content.length
      })

      // Verify user has relationship with partner
      const { data: relationship, error: relError } = await supabase
        .from('partner_relationships')
        .select('id, status')
        .eq('partner_id', messageData.partner_id)
        .or(`partner_a.eq.${senderId},partner_b.eq.${senderId}`)
        .eq('status', 'active')
        .single()

      if (relError || !relationship) {
        console.error('❌ No active relationship with partner:', messageData.partner_id)
        throw new Error('No active relationship with this partner')
      }

      // Create external message
      const { data: message, error: insertError } = await supabase
        .from('messages')
        .insert({
          type: 'external',
          sender_id: senderId,
          recipient_id: messageData.recipient_id,
          partner_id: messageData.partner_id,
          subject: messageData.subject,
          content: messageData.content,
          content_type: 'text',
          priority: messageData.priority || 'normal',
          category: messageData.category || 'general',
          status: 'sent',
          is_read: false,
          delivered_at: new Date().toISOString(),
          thread_id: messageData.thread_id,
          reply_to_id: messageData.reply_to_id,
          related_order_id: messageData.related_order_id,
          tags: messageData.tags || [],
          metadata: messageData.metadata || {}
        })
        .select(`
          *,
          sender:users!sender_id(
            id,
            full_name,
            email,
            avatar_url
          ),
          recipient:users!recipient_id(
            id,
            full_name,
            email,
            avatar_url
          ),
          partner:partners(
            id,
            name,
            company,
            avatar_url
          )
        `)
        .single()

      if (insertError) {
        console.error('❌ Error creating external message:', insertError)
        throw new Error(`Failed to send message: ${insertError.message}`)
      }

      console.log('✅ External message sent successfully:', message.id)

      // Send real-time notification
      await supabase.channel('external-messages').send({
        type: 'broadcast',
        event: 'new-external-message',
        payload: {
          message_id: message.id,
          partner_id: messageData.partner_id,
          sender_id: senderId,
          recipient_id: messageData.recipient_id
        }
      })

      return message as ExternalMessage

    } catch (error) {
      console.error('❌ Error sending external message:', error)
      throw error
    }
  }

  /**
   * Get external messages for a partner
   */
  async getMessages(userId: string, query: ExternalMessageQuery): Promise<{
    messages: ExternalMessage[]
    hasNewMessages: boolean
    total: number
  }> {
    try {
      const supabase = await this.getSupabase()

      console.log('🔍 Fetching external messages for partner:', query.partner_id)

      // Build query for external messages
      let dbQuery = supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(
            id,
            full_name,
            email,
            avatar_url
          ),
          recipient:users!recipient_id(
            id,
            full_name,
            email,
            avatar_url
          ),
          partner:partners(
            id,
            name,
            company,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('type', 'external')
        .eq('partner_id', query.partner_id)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      // Add pagination
      if (query.limit) {
        dbQuery = dbQuery.range(query.offset || 0, (query.offset || 0) + query.limit - 1)
      }

      // Add unread filter
      if (query.unread_only) {
        dbQuery = dbQuery.eq('is_read', false)
      }

      const { data: messages, error, count } = await dbQuery

      if (error) {
        console.error('❌ Error fetching external messages:', error)
        throw new Error(`Failed to fetch messages: ${error.message}`)
      }

      // Check for new messages since last check
      let hasNewMessages = false
      if (query.last_check) {
        const newMessagesQuery = supabase
          .from('messages')
          .select('id')
          .eq('type', 'external')
          .eq('partner_id', query.partner_id)
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .gt('created_at', query.last_check)
          .limit(1)
        
        const { data: newMessages } = await newMessagesQuery
        hasNewMessages = (newMessages?.length || 0) > 0
      }

      console.log('✅ External messages fetched successfully:', {
        count: messages?.length || 0,
        hasNewMessages,
        partner_id: query.partner_id
      })

      return {
        messages: (messages || []) as ExternalMessage[],
        hasNewMessages,
        total: count || 0
      }

    } catch (error) {
      console.error('❌ Error fetching external messages:', error)
      throw error
    }
  }

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()

      const { error } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('recipient_id', userId)
        .eq('type', 'external')

      if (error) {
        console.error('❌ Error marking message as read:', error)
        throw new Error(`Failed to mark message as read: ${error.message}`)
      }

      console.log('✅ Message marked as read:', messageId)

    } catch (error) {
      console.error('❌ Error marking message as read:', error)
      throw error
    }
  }

  /**
   * Get unread message count for a partner
   */
  async getUnreadCount(userId: string, partnerId: string): Promise<number> {
    try {
      const supabase = await this.getSupabase()

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'external')
        .eq('partner_id', partnerId)
        .eq('recipient_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('❌ Error getting unread count:', error)
        return 0
      }

      return count || 0

    } catch (error) {
      console.error('❌ Error getting unread count:', error)
      return 0
    }
  }

  /**
   * Get message attachments
   */
  async getMessageAttachments(messageId: string): Promise<ExternalMessageAttachment[]> {
    try {
      const supabase = await this.getSupabase()

      const { data: attachments, error } = await supabase
        .from('message_attachments')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Error fetching message attachments:', error)
        return []
      }

      return (attachments || []) as ExternalMessageAttachment[]

    } catch (error) {
      console.error('❌ Error fetching message attachments:', error)
      return []
    }
  }
}
