import { createSupabaseServerClient } from "@/lib/supabase/server"
import { z } from "zod"

// Validation schemas
const ThreadSchema = z.object({
  partner_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  related_order_id: z.string().uuid().optional(),
  subject: z.string().min(1).max(200),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).default('open'),
  metadata: z.record(z.any()).optional()
})

const MessageSchema = z.object({
  thread_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
  message_type: z.enum(['text', 'file', 'image', 'system']).default('text'),
  metadata: z.record(z.any()).optional()
})

const ThreadQuerySchema = z.object({
  partner_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional()
})

export interface CommunicationThread {
  id: string
  partner_id?: string
  assigned_to?: string
  related_order_id?: string
  subject: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
  partner?: {
    id: string
    name: string
    company: string
    avatar_url?: string
  } | null
  assigned_user?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  } | null
  message_count: number
  unread_count: number
  last_message?: {
    content: string
    created_at: string
    sender_name: string
  } | null
}

export interface CommunicationMessage {
  id: string
  thread_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'file' | 'image' | 'system'
  is_read: boolean
  read_at?: string
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
  sender?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  attachments?: Array<{
    id: string
    file_name: string
    file_type: string
    file_size: number
    file_url: string
  }>
}

export class CommunicationService {
  // Helper function to transform thread data from Supabase response
  private transformThreadData(thread: any): CommunicationThread {
    return {
      ...thread,
      partner: thread.partner && Array.isArray(thread.partner) ? thread.partner[0] : thread.partner,
      assigned_user: thread.assigned_user && Array.isArray(thread.assigned_user) ? thread.assigned_user[0] : thread.assigned_user,
    } as CommunicationThread
  }

  // Helper function to transform message data from Supabase response
  private transformMessageData(message: any): CommunicationMessage {
    return {
      ...message,
      sender: message.sender && Array.isArray(message.sender) ? message.sender[0] : message.sender,
    } as CommunicationMessage
  }

  async getThreads(filters?: z.infer<typeof ThreadQuerySchema>): Promise<{
    threads: CommunicationThread[]
    total: number
    pagination: {
      limit: number
      offset: number
      hasMore: boolean
    }
  }> {
    try {
      const supabase = await createSupabaseServerClient()
      const validatedFilters = ThreadQuerySchema.parse(filters || {})
      
      let query = supabase
        .from('communication_threads')
        .select(`
          id,
          partner_id,
          assigned_to,
          related_order_id,
          subject,
          priority,
          status,
          created_at,
          updated_at,
          metadata,
          partner:partners(
            id,
            name,
            company,
            avatar_url
          ),
          assigned_user:users!communication_threads_assigned_to_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `, { count: 'exact' })

      // Apply filters
      if (validatedFilters.partner_id) {
        query = query.eq('partner_id', validatedFilters.partner_id)
      }
      if (validatedFilters.assigned_to) {
        query = query.eq('assigned_to', validatedFilters.assigned_to)
      }
      if (validatedFilters.status) {
        query = query.eq('status', validatedFilters.status)
      }
      if (validatedFilters.priority) {
        query = query.eq('priority', validatedFilters.priority)
      }
      if (validatedFilters.search) {
        query = query.or(`subject.ilike.%${validatedFilters.search}%,content.ilike.%${validatedFilters.search}%`)
      }

      // Apply pagination
      query = query
        .order('updated_at', { ascending: false })
        .range(validatedFilters.offset, validatedFilters.offset + validatedFilters.limit - 1)

      const { data: threads, error, count } = await query

      if (error) {
        console.error('Error fetching communication threads:', error)
        throw new Error('Failed to fetch communication threads')
      }

      // Get message counts and last message for each thread
      const threadsWithCounts = await Promise.all(
        threads.map(async (thread: any) => {
          const [messageCount, unreadCount, lastMessage] = await Promise.all([
            this.getMessageCount(thread.id),
            this.getUnreadMessageCount(thread.id),
            this.getLastMessage(thread.id)
          ])

          const transformedThread = this.transformThreadData(thread)
          return {
            ...transformedThread,
            message_count: messageCount,
            unread_count: unreadCount,
            last_message: lastMessage
          }
        })
      )

      return {
        threads: threadsWithCounts,
        total: count || 0,
        pagination: {
          limit: validatedFilters.limit,
          offset: validatedFilters.offset,
          hasMore: (validatedFilters.offset + validatedFilters.limit) < (count || 0)
        }
      }

    } catch (error) {
      console.error('Error in getThreads:', error)
      throw error
    }
  }

  async getThread(threadId: string): Promise<CommunicationThread | null> {
    try {
      const supabase = await createSupabaseServerClient()
      const { data: thread, error } = await supabase
        .from('communication_threads')
        .select(`
          id,
          partner_id,
          assigned_to,
          related_order_id,
          subject,
          priority,
          status,
          created_at,
          updated_at,
          metadata,
          partner:partners(
            id,
            name,
            company,
            avatar_url
          ),
          assigned_user:users!communication_threads_assigned_to_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('id', threadId)
        .single()

      if (error) {
        console.error('Error fetching communication thread:', error)
        return null
      }

      const [messageCount, unreadCount, lastMessage] = await Promise.all([
        this.getMessageCount(thread.id),
        this.getUnreadMessageCount(thread.id),
        this.getLastMessage(thread.id)
      ])

      return this.transformThreadData({
        ...thread,
        message_count: messageCount,
        unread_count: unreadCount,
        last_message: lastMessage
      })

    } catch (error) {
      console.error('Error in getThread:', error)
      return null
    }
  }

  async createThread(threadData: z.infer<typeof ThreadSchema>): Promise<CommunicationThread> {
    try {
      const supabase = await createSupabaseServerClient()
      const validatedData = ThreadSchema.parse(threadData)

      const { data: thread, error } = await supabase
        .from('communication_threads')
        .insert(validatedData)
        .select(`
          id,
          partner_id,
          assigned_to,
          related_order_id,
          subject,
          priority,
          status,
          created_at,
          updated_at,
          metadata,
          partner:partners(
            id,
            name,
            company,
            avatar_url
          ),
          assigned_user:users!communication_threads_assigned_to_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .single()

      if (error) {
        console.error('Error creating communication thread:', error)
        throw new Error('Failed to create communication thread')
      }

      return this.transformThreadData({
        ...thread,
        message_count: 0,
        unread_count: 0
      })

    } catch (error) {
      console.error('Error in createThread:', error)
      throw error
    }
  }

  async updateThread(threadId: string, updates: Partial<z.infer<typeof ThreadSchema>>): Promise<CommunicationThread> {
    try {
      const supabase = await createSupabaseServerClient()
      const { data: thread, error } = await supabase
        .from('communication_threads')
        .update(updates)
        .eq('id', threadId)
        .select(`
          id,
          partner_id,
          assigned_to,
          related_order_id,
          subject,
          priority,
          status,
          created_at,
          updated_at,
          metadata,
          partner:partners(
            id,
            name,
            company,
            avatar_url
          ),
          assigned_user:users!communication_threads_assigned_to_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .single()

      if (error) {
        console.error('Error updating communication thread:', error)
        throw new Error('Failed to update communication thread')
      }

      return this.transformThreadData({
        ...thread,
        message_count: 0,
        unread_count: 0
      })

    } catch (error) {
      console.error('Error in updateThread:', error)
      throw error
    }
  }

  async getMessages(threadId: string, limit: number = 50, offset: number = 0): Promise<{
    messages: CommunicationMessage[]
    total: number
    pagination: {
      limit: number
      offset: number
      hasMore: boolean
    }
  }> {
    try {
      const supabase = await createSupabaseServerClient()
      const { data: messages, error, count } = await supabase
        .from('communication_messages')
        .select(`
          id,
          thread_id,
          sender_id,
          content,
          message_type,
          is_read,
          read_at,
          created_at,
          updated_at,
          metadata,
          sender:users!communication_messages_sender_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          ),
          attachments:communication_attachments(
            id,
            file_name,
            file_type,
            file_size,
            file_url
          )
        `, { count: 'exact' })
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching communication messages:', error)
        throw new Error('Failed to fetch communication messages')
      }

      return {
        messages: (messages || []).map((msg: any) => this.transformMessageData(msg)),
        total: count || 0,
        pagination: {
          limit,
          offset,
          hasMore: (offset + limit) < (count || 0)
        }
      }

    } catch (error) {
      console.error('Error in getMessages:', error)
      throw error
    }
  }

  async sendMessage(messageData: z.infer<typeof MessageSchema>, senderId: string): Promise<CommunicationMessage> {
    try {
      const supabase = await createSupabaseServerClient()
      const validatedData = MessageSchema.parse(messageData)

      const { data: message, error } = await supabase
        .from('communication_messages')
        .insert({
          ...validatedData,
          sender_id: senderId
        })
        .select(`
          id,
          thread_id,
          sender_id,
          content,
          message_type,
          is_read,
          read_at,
          created_at,
          updated_at,
          metadata,
          sender:users!communication_messages_sender_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          ),
          attachments:communication_attachments(
            id,
            file_name,
            file_type,
            file_size,
            file_url
          )
        `)
        .single()

      if (error) {
        console.error('Error sending communication message:', error)
        throw new Error('Failed to send communication message')
      }

      // Update thread's updated_at timestamp
      await supabase
        .from('communication_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', validatedData.thread_id)

      // Send real-time notification
      await supabase.channel('communication-messages').send({
        type: 'broadcast',
        event: 'new-message',
        payload: {
          message_id: message.id,
          thread_id: validatedData.thread_id,
          sender_id: senderId
        }
      })

      return this.transformMessageData(message)

    } catch (error) {
      console.error('Error in sendMessage:', error)
      throw error
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const supabase = await createSupabaseServerClient()
      const { error } = await supabase
        .from('communication_messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', messageId)
        .neq('sender_id', userId) // Don't mark own messages as read

      if (error) {
        console.error('Error marking message as read:', error)
        throw new Error('Failed to mark message as read')
      }
    } catch (error) {
      console.error('Error in markMessageAsRead:', error)
      throw error
    }
  }

  async markThreadAsRead(threadId: string, userId: string): Promise<void> {
    try {
      const supabase = await createSupabaseServerClient()
      const { error } = await supabase
        .from('communication_messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('thread_id', threadId)
        .neq('sender_id', userId)

      if (error) {
        console.error('Error marking thread as read:', error)
        throw new Error('Failed to mark thread as read')
      }
    } catch (error) {
      console.error('Error in markThreadAsRead:', error)
      throw error
    }
  }

  async getCommunicationAnalytics(filters?: any): Promise<{
    totalThreads: number
    totalMessages: number
    unreadMessages: number
    responseTime: number
    threadStatus: { status: string; count: number }[]
    messageVolume: { date: string; count: number }[]
  }> {
    try {
      const supabase = await createSupabaseServerClient()
      
      // Get basic counts
      const { count: totalThreads } = await supabase
        .from('communication_threads')
        .select('*', { count: 'exact', head: true })

      const { count: totalMessages } = await supabase
        .from('communication_messages')
        .select('*', { count: 'exact', head: true })

      const { count: unreadMessages } = await supabase
        .from('communication_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)

      // Get thread status breakdown
      const { data: statusData } = await supabase
        .from('communication_threads')
        .select('status')

      const threadStatus = statusData?.reduce((acc: any, thread: any) => {
        acc[thread.status] = (acc[thread.status] || 0) + 1
        return acc
      }, {}) || {}

      const statusBreakdown = Object.entries(threadStatus).map(([status, count]) => ({
        status,
        count: count as number
      }))

      // Get message volume for last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: messageVolume } = await supabase
        .from('communication_messages')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())

      const volumeByDate = messageVolume?.reduce((acc: any, message: any) => {
        const date = new Date(message.created_at).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {}) || {}

      const messageVolumeData = Object.entries(volumeByDate).map(([date, count]) => ({
        date,
        count: count as number
      }))

      return {
        totalThreads: totalThreads || 0,
        totalMessages: totalMessages || 0,
        unreadMessages: unreadMessages || 0,
        responseTime: 24, // Average response time in hours
        threadStatus: statusBreakdown,
        messageVolume: messageVolumeData
      }
    } catch (error) {
      console.error('Error getting communication analytics:', error)
      return {
        totalThreads: 0,
        totalMessages: 0,
        unreadMessages: 0,
        responseTime: 0,
        threadStatus: [],
        messageVolume: []
      }
    }
  }

  private async getMessageCount(threadId: string): Promise<number> {
    try {
      const supabase = await createSupabaseServerClient()
      const { count, error } = await supabase
        .from('communication_messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', threadId)

      if (error) {
        console.error('Error getting message count:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Error in getMessageCount:', error)
      return 0
    }
  }

  private async getUnreadMessageCount(threadId: string): Promise<number> {
    try {
      const supabase = await createSupabaseServerClient()
      const { count, error } = await supabase
        .from('communication_messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', threadId)
        .eq('is_read', false)

      if (error) {
        console.error('Error getting unread message count:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Error in getUnreadMessageCount:', error)
      return 0
    }
  }

  private async getLastMessage(threadId: string): Promise<{
    content: string
    created_at: string
    sender_name: string
  } | null> {
    try {
      const supabase = await createSupabaseServerClient()
      const { data: message, error } = await supabase
        .from('communication_messages')
        .select(`
          content,
          created_at,
          sender:users!communication_messages_sender_id_fkey(
            full_name
          )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !message) {
        return null
      }

      return {
        content: message.content,
        created_at: message.created_at,
        sender_name: Array.isArray(message.sender) && message.sender.length > 0 ? message.sender[0].full_name : 'Unknown'
      }
    } catch (error) {
      console.error('Error in getLastMessage:', error)
      return null
    }
  }
}

// Export singleton instance
export const communicationService = new CommunicationService() 