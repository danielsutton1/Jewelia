import { createSupabaseServerClient } from "@/lib/supabase/server"
import { z } from "zod"

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const MessageSchema = z.object({
  type: z.enum(['internal', 'external', 'system', 'notification']),
  recipient_id: z.string().uuid().optional(),
  partner_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  subject: z.string().max(255).optional(),
  content: z.string().min(1).max(10000),
  content_type: z.enum(['text', 'html', 'markdown']).default('text'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  category: z.string().max(100).default('general'),
  thread_id: z.string().uuid().optional(),
  reply_to_id: z.string().uuid().optional(),
  related_order_id: z.string().uuid().optional(),
  related_task_id: z.string().uuid().optional(),
  related_project_id: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({})
})

const ThreadSchema = z.object({
  type: z.enum(['internal', 'external', 'system', 'notification']),
  subject: z.string().min(1).max(255),
  category: z.string().max(100).default('general'),
  participants: z.array(z.string().uuid()).default([]),
  partner_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  related_order_id: z.string().uuid().optional(),
  related_project_id: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({})
})

const MessageQuerySchema = z.object({
  type: z.enum(['internal', 'external', 'system', 'notification']).optional(),
  thread_id: z.string().uuid().optional(),
  partner_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  unread_only: z.boolean().default(false),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional()
})

// =====================================================
// INTERFACES
// =====================================================

export interface Message {
  id: string
  type: 'internal' | 'external' | 'system' | 'notification'
  sender_id: string
  recipient_id?: string
  partner_id?: string
  organization_id?: string
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
  related_task_id?: string
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
  attachments?: MessageAttachment[]
  reactions?: MessageReaction[]
  read_receipts?: MessageReadReceipt[]
}

export interface MessageThread {
  id: string
  type: 'internal' | 'external' | 'system' | 'notification'
  subject: string
  category: string
  created_by: string
  participants: string[]
  partner_id?: string
  organization_id?: string
  department_id?: string
  related_order_id?: string
  related_project_id?: string
  tags: string[]
  metadata: Record<string, any>
  is_active: boolean
  is_archived: boolean
  is_pinned: boolean
  created_at: string
  updated_at: string
  last_message_at: string
  message_count: number
  unread_count: number
  last_message: {
    content: string
    created_at: string
    sender_name: string
  } | null
  participants_details?: Array<{
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }>
}

export interface MessageAttachment {
  id: string
  message_id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  storage_path?: string
  mime_type?: string
  is_processed: boolean
  processing_status: string
  created_at: string
  updated_at: string
}

export interface MessageReaction {
  id: string
  message_id: string
  user_id: string
  reaction_type: string
  reaction_data: Record<string, any>
  created_at: string
  user?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export interface MessageReadReceipt {
  id: string
  message_id: string
  user_id: string
  read_at: string
  read_method: string
  created_at: string
  user?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export interface MessageNotification {
  id: string
  message_id: string
  user_id: string
  notification_type: string
  title: string
  body?: string
  data: Record<string, any>
  is_sent: boolean
  is_delivered: boolean
  is_read: boolean
  email_sent: boolean
  push_sent: boolean
  sms_sent: boolean
  created_at: string
  sent_at?: string
  delivered_at?: string
  read_at?: string
}

export interface MessagingStats {
  total_messages: number
  unread_messages: number
  total_threads: number
  active_threads: number
  messages_by_type: Record<string, number>
  response_time_avg: number
  recent_activity: Array<{
    date: string
    message_count: number
    thread_count: number
  }>
}

// =====================================================
// UNIFIED MESSAGING SERVICE
// =====================================================

export class UnifiedMessagingService {
  private supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> | null = null

  constructor() {
    // Initialize supabase client lazily
  }

  private async getSupabase() {
    // If a client has been injected (for testing), use it
    if (this.supabase) {
      return this.supabase
    }
    // Otherwise, create a new client
    this.supabase = await createSupabaseServerClient()
    return this.supabase
  }

  // =====================================================
  // THREAD MANAGEMENT
  // =====================================================

  async createThread(threadData: z.infer<typeof ThreadSchema>, creatorId: string): Promise<MessageThread> {
    try {
      const validatedData = ThreadSchema.parse(threadData)
      
      // Add creator to participants if not already included
      const participants = validatedData.participants.includes(creatorId) 
        ? validatedData.participants 
        : [...validatedData.participants, creatorId]

      const supabase = await this.getSupabase()
      console.log('createThread: Using supabase client:', supabase.constructor.name)
      
      const { data: thread, error } = await supabase
        .from('message_threads')
        .insert({
          ...validatedData,
          created_by: creatorId,
          participants
        })
        .select(`
          *,
          participants_details:users(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .single()

      console.log('createThread: Insert result:', { data: thread, error })
      
      if (error) throw error

      return this.transformThreadData(thread)
    } catch (error) {
      console.error('Error creating thread:', error)
      throw new Error('Failed to create message thread')
    }
  }

  async getThreads(filters?: z.infer<typeof MessageQuerySchema>): Promise<{
    threads: MessageThread[]
    total: number
    pagination: {
      limit: number
      offset: number
      hasMore: boolean
    }
  }> {
    try {
      const validatedFilters = MessageQuerySchema.parse(filters || {})
      
      const supabase = await this.getSupabase()
      console.log('getThreads: Using supabase client:', supabase.constructor.name)
      let query = supabase
        .from('message_threads')
        .select(`
          *,
          participants_details:users(
            id,
            full_name,
            email,
            avatar_url
          )
        `, { count: 'exact' })

      // Apply filters
      if (validatedFilters.type) {
        query = query.eq('type', validatedFilters.type)
      }
      if (validatedFilters.partner_id) {
        query = query.eq('partner_id', validatedFilters.partner_id)
      }
      if (validatedFilters.organization_id) {
        query = query.eq('organization_id', validatedFilters.organization_id)
      }
      if (validatedFilters.search) {
        query = query.ilike('subject', `%${validatedFilters.search}%`)
      }

      // Only show active threads by default
      query = query.eq('is_active', true)

      console.log('getThreads: Executing query with filters:', validatedFilters)
      console.log('getThreads: About to call range with:', { offset: validatedFilters.offset, limit: validatedFilters.limit })
      const { data: threads, error, count } = await query
        .order('last_message_at', { ascending: false })
        .range(validatedFilters.offset, validatedFilters.offset + validatedFilters.limit - 1)
      
      console.log('getThreads: Query result:', { threads, error, count })

      if (error) throw error

      // Transform and enrich thread data
      const enrichedThreads = await Promise.all(
        threads.map(async (thread: any) => {
          const enriched = this.transformThreadData(thread)
          enriched.message_count = await this.getMessageCount(thread.id)
          enriched.unread_count = await this.getUnreadMessageCount(thread.id)
          enriched.last_message = await this.getLastMessage(thread.id)
          return enriched
        })
      )

      return {
        threads: enrichedThreads,
        total: count || enrichedThreads.length,
        pagination: {
          limit: validatedFilters.limit,
          offset: validatedFilters.offset,
          hasMore: (validatedFilters.offset + validatedFilters.limit) < (count || enrichedThreads.length)
        }
      }
    } catch (error) {
      console.error('Error fetching threads:', error)
      throw new Error('Failed to fetch message threads')
    }
  }

  async getThread(threadId: string): Promise<MessageThread | null> {
    try {
      const supabase = await this.getSupabase()
      const { data: thread, error } = await supabase
        .from('message_threads')
        .select(`
          *,
          participants_details:users(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('id', threadId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows returned
        throw error
      }

      const enriched = this.transformThreadData(thread)
      enriched.message_count = await this.getMessageCount(threadId)
      enriched.unread_count = await this.getUnreadMessageCount(threadId)
      enriched.last_message = await this.getLastMessage(threadId)

      return enriched
    } catch (error) {
      console.error('Error fetching thread:', error)
      throw new Error('Failed to fetch message thread')
    }
  }

  async updateThread(threadId: string, updates: Partial<z.infer<typeof ThreadSchema>>): Promise<MessageThread> {
    try {
      const supabase = await this.getSupabase()
      const { data: thread, error } = await supabase
        .from('message_threads')
        .update(updates)
        .eq('id', threadId)
        .select(`
          *,
          participants_details:users(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      return this.transformThreadData(thread)
    } catch (error) {
      console.error('Error updating thread:', error)
      throw new Error('Failed to update message thread')
    }
  }

  async archiveThread(threadId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      const { error } = await supabase
        .from('message_threads')
        .update({ is_archived: true, is_active: false })
        .eq('id', threadId)

      if (error) throw error
    } catch (error) {
      console.error('Error archiving thread:', error)
      throw new Error('Failed to archive message thread')
    }
  }

  // =====================================================
  // MESSAGE MANAGEMENT
  // =====================================================

  async sendMessage(messageData: z.infer<typeof MessageSchema>, senderId: string): Promise<Message> {
    try {
      const validatedData = MessageSchema.parse(messageData)

      // Validate message type constraints
      if (validatedData.type === 'external' && !validatedData.partner_id) {
        throw new Error('External messages require a partner_id')
      }
      if (validatedData.type === 'internal' && !validatedData.organization_id) {
        throw new Error('Internal messages require an organization_id')
      }

      const supabase = await this.getSupabase()
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          ...validatedData,
          sender_id: senderId,
          status: 'sent',
          delivered_at: new Date().toISOString()
        })
        .select(`
          *,
          sender:users(
            id,
            full_name,
            email,
            avatar_url
          ),
          recipient:users!messages_recipient_id_fkey(
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
          ),
          attachments:message_attachments(
            id,
            file_name,
            file_type,
            file_size,
            file_url,
            mime_type
          ),
          reactions:message_reactions(
            id,
            user_id,
            reaction_type,
            reaction_data,
            created_at,
            user:users!message_reactions_user_id_fkey(
              id,
              full_name,
              avatar_url
            )
          ),
          read_receipts:message_read_receipts(
            id,
            user_id,
            read_at,
            read_method,
            user:users!message_read_receipts_user_id_fkey(
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .single()

      if (error) throw error

      // Update thread's last_message_at
      if (validatedData.thread_id) {
        const supabase = await this.getSupabase()
        console.log('sendMessage: Updating thread last_message_at for thread_id:', validatedData.thread_id)
        const updateResult = await supabase
          .from('message_threads')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', validatedData.thread_id)
        console.log('sendMessage: Update result:', updateResult)
      }

      return this.transformMessageData(message)
    } catch (error) {
      console.error('Error sending message:', error)
      throw new Error('Failed to send message')
    }
  }

  async getMessages(filters?: z.infer<typeof MessageQuerySchema>): Promise<{
    messages: Message[]
    total: number
    pagination: {
      limit: number
      offset: number
      hasMore: boolean
    }
  }> {
    try {
      // Check if we're in demo mode (no real Supabase connection)
      if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co') {
        return this.getMockMessages(filters)
      }

      const validatedFilters = MessageQuerySchema.parse(filters || {})
      
      const supabase = await this.getSupabase()
      
      // First, check if the messages table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('messages')
        .select('id')
        .limit(1)
      
      if (tableError) {
        console.warn('Messages table does not exist, returning mock data:', tableError.message)
        return this.getMockMessages(filters)
      }
      
      let query = supabase
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
          ),
          attachments:message_attachments(
            id,
            file_name,
            file_type,
            file_size,
            file_url,
            mime_type
          ),
          reactions:message_reactions(
            id,
            user_id,
            reaction_type,
            reaction_data,
            created_at,
            user:users!user_id(
              id,
              full_name,
              avatar_url
            )
          ),
          read_receipts:message_read_receipts(
            id,
            user_id,
            read_at,
            read_method,
            user:users!user_id(
              id,
              full_name,
              avatar_url
            )
          )
        `, { count: 'exact' })

      // Apply filters
      if (validatedFilters.type) {
        query = query.eq('type', validatedFilters.type)
      }
      if (validatedFilters.thread_id) {
        query = query.eq('thread_id', validatedFilters.thread_id)
      }
      if (validatedFilters.partner_id) {
        query = query.eq('partner_id', validatedFilters.partner_id)
      }
      if (validatedFilters.organization_id) {
        query = query.eq('organization_id', validatedFilters.organization_id)
      }
      if (validatedFilters.unread_only) {
        query = query.eq('is_read', false)
      }
      if (validatedFilters.search) {
        query = query.or(`content.ilike.%${validatedFilters.search}%,subject.ilike.%${validatedFilters.search}%`)
      }
      if (validatedFilters.date_from) {
        query = query.gte('created_at', validatedFilters.date_from)
      }
      if (validatedFilters.date_to) {
        query = query.lte('created_at', validatedFilters.date_to)
      }

      const { data: messages, error, count } = await query
        .order('created_at', { ascending: false })
        .range(validatedFilters.offset, validatedFilters.offset + validatedFilters.limit - 1)

      if (error) {
        console.warn('Error fetching messages, falling back to mock data:', error.message)
        return this.getMockMessages(filters)
      }

      return {
        messages: messages.map((msg: any) => this.transformMessageData(msg)),
        total: count || 0,
        pagination: {
          limit: validatedFilters.limit,
          offset: validatedFilters.offset,
          hasMore: (validatedFilters.offset + validatedFilters.limit) < (count || 0)
        }
      }
    } catch (error) {
      console.warn('Error fetching messages, falling back to mock data:', error)
      return this.getMockMessages(filters)
    }
  }

  async getMessage(messageId: string): Promise<Message | null> {
    try {
      const supabase = await this.getSupabase()
      const { data: message, error } = await supabase
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
          ),
          attachments:message_attachments(
            id,
            file_name,
            file_type,
            file_size,
            file_url,
            mime_type
          ),
          reactions:message_reactions(
            id,
            user_id,
            reaction_type,
            reaction_data,
            created_at,
            user:users!user_id(
              id,
              full_name,
              avatar_url
            )
          ),
          read_receipts:message_read_receipts(
            id,
            user_id,
            read_at,
            read_method,
            user:users!user_id(
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', messageId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return this.transformMessageData(message)
    } catch (error) {
      console.error('Error fetching message:', error)
      throw new Error('Failed to fetch message')
    }
  }

  async updateMessage(messageId: string, updates: Partial<{
    is_read: boolean
    status: 'sent' | 'delivered' | 'read' | 'failed'
    read_at: string
    delivered_at: string
  }>): Promise<Message> {
    try {
      const supabase = await this.getSupabase()
      const { data: message, error } = await supabase
        .from('messages')
        .update(updates)
        .eq('id', messageId)
        .select(`
          *,
          sender:users(
            id,
            full_name,
            email,
            avatar_url
          ),
          recipient:users!messages_recipient_id_fkey(
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

      if (error) throw error

      return this.transformMessageData(message)
    } catch (error) {
      console.error('Error updating message:', error)
      throw new Error('Failed to update message')
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting message:', error)
      throw new Error('Failed to delete message')
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      const { error } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          status: 'read'
        })
        .eq('id', messageId)
        .eq('recipient_id', userId)

      if (error) throw error

      // Create read receipt
      const supabaseClient = await this.getSupabase()
      await supabaseClient
          .from('message_read_receipts')
          .upsert({
            message_id: messageId,
            user_id: userId,
            read_at: new Date().toISOString(),
            read_method: 'app'
          })
      // Mark notifications as read
      const supabaseNotif = await this.getSupabase()
      await supabaseNotif
        .from('message_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('message_id', messageId)
        .eq('user_id', userId)
    } catch (error) {
      console.error('Error marking message as read:', error)
      throw new Error('Failed to mark message as read')
    }
  }

  async markThreadAsRead(threadId: string, userId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      // Mark all unread messages in thread as read
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id')
        .eq('thread_id', threadId)
        .eq('recipient_id', userId)
        .eq('is_read', false)

      if (error) throw error

      if (messages.length > 0) {
        const messageIds = messages.map((m: any) => m.id)
        
        // Update messages
        await supabase
          .from('messages')
          .update({
            is_read: true,
            read_at: new Date().toISOString(),
            status: 'read'
          })
          .in('id', messageIds)

        // Create read receipts
        const readReceipts = messageIds.map((id: any) => ({
          message_id: id,
          user_id: userId,
          read_at: new Date().toISOString(),
          read_method: 'app'
        }))

        await supabase
          .from('message_read_receipts')
          .upsert(readReceipts)

        // Mark notifications as read
        await supabase
          .from('message_notifications')
          .update({
            is_read: true,
            read_at: new Date().toISOString()
          })
          .in('message_id', messageIds)
          .eq('user_id', userId)
      }
    } catch (error) {
      console.error('Error marking thread as read:', error)
      throw new Error('Failed to mark thread as read')
    }
  }

  // =====================================================
  // REACTIONS AND INTERACTIONS
  // =====================================================

  async addReaction(messageId: string, userId: string, reactionType: string, reactionData?: Record<string, any>): Promise<MessageReaction> {
    try {
      const supabase = await this.getSupabase()
      const { data: reaction, error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: userId,
          reaction_type: reactionType,
          reaction_data: reactionData || {}
        })
        .select(`
          *,
          user:users!message_reactions_user_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      return this.transformReactionData(reaction)
    } catch (error) {
      console.error('Error adding reaction:', error)
      throw new Error('Failed to add reaction')
    }
  }

  async removeReaction(messageId: string, userId: string, reactionType: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('reaction_type', reactionType)

      if (error) throw error
    } catch (error) {
      console.error('Error removing reaction:', error)
      throw new Error('Failed to remove reaction')
    }
  }

  // =====================================================
  // ATTACHMENTS
  // =====================================================

  async uploadAttachment(messageId: string, file: File, uploadUrl: string): Promise<MessageAttachment> {
    try {
      const supabase = await this.getSupabase()
      
      // Upload file to storage
      const fileName = `${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName)

      // Create attachment record
      const { data: attachment, error } = await supabase
        .from('message_attachments')
        .insert({
          message_id: messageId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: publicUrl,
          storage_path: uploadData.path,
          mime_type: file.type
        })
        .select()
        .single()

      if (error) throw error

      return this.transformAttachmentData(attachment)
    } catch (error) {
      console.error('Error uploading attachment:', error)
      throw new Error('Failed to upload attachment')
    }
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      const { data: attachment, error: fetchError } = await supabase
        .from('message_attachments')
        .select('storage_path')
        .eq('id', attachmentId)
        .single()

      if (fetchError) throw fetchError

      // Delete from storage
      if (attachment.storage_path) {
        await supabase.storage
          .from('message-attachments')
          .remove([attachment.storage_path])
      }

      // Delete from database
      const { error } = await supabase
        .from('message_attachments')
        .delete()
        .eq('id', attachmentId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting attachment:', error)
      throw new Error('Failed to delete attachment')
    }
  }

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  async getNotifications(userId: string, limit: number = 50, offset: number = 0): Promise<{
    notifications: MessageNotification[]
    total: number
    pagination: {
      limit: number
      offset: number
      hasMore: boolean
    }
  }> {
    try {
      const supabase = await this.getSupabase()
      const { data: notifications, error, count } = await supabase
        .from('message_notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return {
        notifications: notifications.map((n: any) => this.transformNotificationData(n)),
        total: count || 0,
        pagination: {
          limit,
          offset,
          hasMore: (offset + limit) < (count || 0)
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw new Error('Failed to fetch notifications')
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      const { error } = await supabase
        .from('message_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw new Error('Failed to mark notification as read')
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      const { error } = await supabase
        .from('message_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw new Error('Failed to mark all notifications as read')
    }
  }

  // =====================================================
  // ANALYTICS AND STATISTICS
  // =====================================================

  async getMessagingStats(userId: string, organizationId?: string, partnerId?: string): Promise<MessagingStats> {
    try {
      const supabase = await this.getSupabase()
      
      // Build base query
      let baseQuery = supabase.from('messages').select('*')
      
      if (organizationId) {
        baseQuery = baseQuery.eq('organization_id', organizationId)
      }
      if (partnerId) {
        baseQuery = baseQuery.eq('partner_id', partnerId)
      }

      // Get total messages
      const { count: totalMessages } = await baseQuery

      // Get unread messages
      const { count: unreadMessages } = await baseQuery
        .eq('recipient_id', userId)
        .eq('is_read', false)

      // Get threads stats
      let threadQuery = supabase.from('message_threads').select('*')
      if (organizationId) {
        threadQuery = threadQuery.eq('organization_id', organizationId)
      }
      if (partnerId) {
        threadQuery = threadQuery.eq('partner_id', partnerId)
      }

      const { count: totalThreads } = await threadQuery
      const { count: activeThreads } = await threadQuery.eq('is_active', true)

      // Get messages by type
      const { data: messagesByType } = await baseQuery
        .select('type')
      
      const typeCounts = messagesByType?.reduce((acc: Record<string, number>, msg: { type: string }) => {
        acc[msg.type] = (acc[msg.type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Get average response time
      const { data: responseTimes } = await supabase
        .from('messages')
        .select('created_at, read_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

      const avgResponseTime = responseTimes?.length 
        ? responseTimes
            .filter((msg: { read_at: string | null; created_at: string }) => msg.read_at !== null)
            .reduce((sum: number, msg: { read_at: string; created_at: string }) => {
              const responseTime = new Date(msg.read_at).getTime() - new Date(msg.created_at).getTime()
              return sum + responseTime
            }, 0) / responseTimes.filter((msg: { read_at: string | null }) => msg.read_at !== null).length / 1000 // Convert to seconds
        : 0

      // Get recent activity (last 7 days)
      const recentActivity: Array<{ date: string; message_count: number; thread_count: number }> = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const { count: messageCount } = await baseQuery
          .gte('created_at', dateStr + 'T00:00:00Z')
          .lt('created_at', dateStr + 'T23:59:59Z')
        
        const { count: threadCount } = await threadQuery
          .gte('created_at', dateStr + 'T00:00:00Z')
          .lt('created_at', dateStr + 'T23:59:59Z')

        recentActivity.push({
          date: dateStr,
          message_count: messageCount || 0,
          thread_count: threadCount || 0
        })
      }

      return {
        total_messages: totalMessages || 0,
        unread_messages: unreadMessages || 0,
        total_threads: totalThreads || 0,
        active_threads: activeThreads || 0,
        messages_by_type: typeCounts,
        response_time_avg: avgResponseTime,
        recent_activity: recentActivity
      }
    } catch (error) {
      console.error('Error fetching messaging stats:', error)
      throw new Error('Failed to fetch messaging statistics')
    }
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private transformMessageData(message: any): Message {
    if (!message) {
      throw new Error('Message data is null or undefined')
    }
    
    return {
      ...message,
      sender: message.sender && Array.isArray(message.sender) ? message.sender[0] : message.sender,
      recipient: message.recipient && Array.isArray(message.recipient) ? message.recipient[0] : message.recipient,
      partner: message.partner && Array.isArray(message.partner) ? message.partner[0] : message.partner,
      attachments: message.attachments || [],
      reactions: message.reactions || [],
      read_receipts: message.read_receipts || []
    } as Message
  }

  private transformThreadData(thread: any): MessageThread {
    if (!thread) {
      throw new Error('Thread data is null or undefined')
    }
    
    return {
      ...thread,
      participants_details: thread.participants_details || []
    } as MessageThread
  }

  private transformAttachmentData(attachment: any): MessageAttachment {
    return attachment as MessageAttachment
  }

  private transformReactionData(reaction: any): MessageReaction {
    return {
      ...reaction,
      user: reaction.user && Array.isArray(reaction.user) ? reaction.user[0] : reaction.user
    } as MessageReaction
  }

  private transformNotificationData(notification: any): MessageNotification {
    return notification as MessageNotification
  }

  private async getMessageCount(threadId: string): Promise<number> {
    try {
      const supabase = await this.getSupabase()
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', threadId)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error getting message count:', error)
      return 0
    }
  }

  private async getUnreadMessageCount(threadId: string): Promise<number> {
    try {
      const supabase = await this.getSupabase()
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', threadId)
        .eq('is_read', false)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error getting unread message count:', error)
      return 0
    }
  }

  private async getLastMessage(threadId: string): Promise<{
    content: string
    created_at: string
    sender_name: string
  } | null> {
    try {
      const supabase = await this.getSupabase()
      const { data: message, error } = await supabase
        .from('messages')
        .select(`
          content,
          created_at,
          sender:users(full_name)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return {
        content: message.content,
        created_at: message.created_at,
        sender_name: Array.isArray(message.sender) && message.sender.length > 0 ? message.sender[0].full_name : 'Unknown'
      }
    } catch (error) {
      console.error('Error getting last message:', error)
      return null
    }
  }

  /**
   * Mock messages for demo mode
   */
  private getMockMessages(filters?: any): {
    messages: Message[]
    total: number
    pagination: {
      limit: number
      offset: number
      hasMore: boolean
    }
  } {
    const mockMessages: Message[] = [
      {
        id: 'msg-1',
        type: 'internal',
        sender_id: 'user-1',
        recipient_id: 'user-2',
        content: 'Hello! I wanted to follow up on the custom ring order.',
        content_type: 'text',
        priority: 'normal',
        category: 'general',
        status: 'delivered',
        is_read: false,
        tags: [],
        metadata: {},
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sender: {
          id: 'user-1',
          full_name: 'Sarah Johnson',
          email: 'sarah@example.com',
          avatar_url: undefined
        },
        recipient: {
          id: 'user-2',
          full_name: 'Mike Chen',
          email: 'mike@example.com',
          avatar_url: undefined
        }
      },
      {
        id: 'msg-2',
        type: 'internal',
        sender_id: 'user-3',
        recipient_id: 'user-1',
        content: 'The diamond shipment has arrived. Ready for inspection.',
        content_type: 'text',
        priority: 'normal',
        category: 'general',
        status: 'delivered',
        is_read: false,
        tags: [],
        metadata: {},
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        sender: {
          id: 'user-3',
          full_name: 'Emma Wilson',
          email: 'emma@example.com',
          avatar_url: undefined
        },
        recipient: {
          id: 'user-1',
          full_name: 'Sarah Johnson',
          email: 'sarah@example.com',
          avatar_url: undefined
        }
      },
      {
        id: 'msg-3',
        type: 'internal',
        sender_id: 'user-2',
        recipient_id: 'user-4',
        content: 'Customer meeting scheduled for tomorrow at 2 PM.',
        content_type: 'text',
        priority: 'normal',
        category: 'general',
        status: 'delivered',
        is_read: false,
        tags: [],
        metadata: {},
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        sender: {
          id: 'user-2',
          full_name: 'Mike Chen',
          email: 'mike@example.com',
          avatar_url: undefined
        },
        recipient: {
          id: 'user-4',
          full_name: 'Lisa Rodriguez',
          email: 'lisa@example.com',
          avatar_url: undefined
        }
      }
    ]

    const limit = filters?.limit || 10
    const offset = filters?.offset || 0
    const unreadOnly = filters?.unread_only

    let filteredMessages = mockMessages
    if (unreadOnly) {
      filteredMessages = mockMessages.filter(msg => msg.status === 'delivered')
    }

    const paginatedMessages = filteredMessages.slice(offset, offset + limit)

    return {
      messages: paginatedMessages,
      total: filteredMessages.length,
      pagination: {
        limit,
        offset,
        hasMore: (offset + limit) < filteredMessages.length
      }
    }
  }
} 