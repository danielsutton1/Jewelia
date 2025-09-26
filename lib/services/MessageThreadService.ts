import { createClient } from '@supabase/supabase-js'

export interface MessageThread {
  id: string
  title: string
  subject: string
  participants: string[]
  last_message_id?: string
  last_message_at?: string
  message_count: number
  status: 'active' | 'archived' | 'closed'
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export interface ThreadParticipant {
  thread_id: string
  user_id: string
  joined_at: string
  last_read_at?: string
  is_admin: boolean
  can_edit: boolean
}

export interface ThreadFilters {
  status?: 'active' | 'archived' | 'closed'
  participant_id?: string
  search?: string
  limit?: number
  offset?: number
}

export class MessageThreadService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Create a new thread
  async createThread(
    title: string,
    subject: string,
    participants: string[],
    createdBy: string,
    metadata?: Record<string, any>
  ): Promise<MessageThread | null> {
    try {
      // Create the thread
      const { data: thread, error: threadError } = await this.supabase
        .from('message_threads')
        .insert({
          title,
          subject,
          participants,
          status: 'active',
          message_count: 0,
          metadata
        })
        .select()
        .single()

      if (threadError) throw threadError

      // Add participants to the thread
      const participantRecords = participants.map(userId => ({
        thread_id: thread.id,
        user_id: userId,
        joined_at: new Date().toISOString(),
        is_admin: userId === createdBy,
        can_edit: userId === createdBy
      }))

      const { error: participantError } = await this.supabase
        .from('thread_participants')
        .insert(participantRecords)

      if (participantError) throw participantError

      console.log('✅ Thread created successfully:', thread)
      return thread
    } catch (error) {
      console.error('Error creating thread:', error)
      return null
    }
  }

  // Get threads for a user
  async getUserThreads(userId: string, filters: ThreadFilters = {}): Promise<MessageThread[]> {
    try {
      let query = this.supabase
        .from('message_threads')
        .select(`
          *,
          thread_participants!inner(user_id),
          internal_messages(
            id,
            content,
            created_at,
            sender_id
          )
        `)
        .eq('thread_participants.user_id', userId)
        .order('updated_at', { ascending: false })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`)
      }
      if (filters.limit) {
        query = query.limit(filters.limit)
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      // Process and format the data
      return (data || []).map(thread => ({
        ...thread,
        participants: thread.thread_participants?.map((p: any) => p.user_id) || [],
        last_message_id: thread.internal_messages?.[0]?.id,
        last_message_at: thread.internal_messages?.[0]?.created_at,
        message_count: thread.internal_messages?.length || 0
      }))
    } catch (error) {
      console.error('Error fetching user threads:', error)
      return []
    }
  }

  // Get a specific thread with all messages
  async getThread(threadId: string, userId: string): Promise<MessageThread | null> {
    try {
      // Verify user has access to this thread
      const { data: participant, error: participantError } = await this.supabase
        .from('thread_participants')
        .select('*')
        .eq('thread_id', threadId)
        .eq('user_id', userId)
        .single()

      if (participantError || !participant) {
        throw new Error('Access denied to thread')
      }

      // Get thread details
      const { data: thread, error: threadError } = await this.supabase
        .from('message_threads')
        .select(`
          *,
          thread_participants(
            user_id,
            joined_at,
            last_read_at,
            is_admin,
            can_edit
          )
        `)
        .eq('id', threadId)
        .single()

      if (threadError) throw threadError

      // Get messages in the thread
      const { data: messages, error: messagesError } = await this.supabase
        .from('internal_messages')
        .select(`
          *,
          sender:users!internal_messages_sender_id_fkey(full_name, email),
          recipient:users!internal_messages_recipient_id_fkey(full_name, email)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      // Update last read timestamp for the user
      await this.updateLastRead(threadId, userId)

      return {
        ...thread,
        participants: thread.thread_participants?.map((p: any) => p.user_id) || [],
        last_message_id: messages?.[messages.length - 1]?.id,
        last_message_at: messages?.[messages.length - 1]?.created_at,
        message_count: messages?.length || 0
      }
    } catch (error) {
      console.error('Error fetching thread:', error)
      return null
    }
  }

  // Add message to thread
  async addMessageToThread(
    threadId: string,
    messageId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Verify user has access to this thread
      const { data: participant, error: participantError } = await this.supabase
        .from('thread_participants')
        .select('*')
        .eq('thread_id', threadId)
        .eq('user_id', userId)
        .single()

      if (participantError || !participant) {
        throw new Error('Access denied to thread')
      }

      // Update message with thread_id
      const { error: messageError } = await this.supabase
        .from('internal_messages')
        .update({ thread_id: threadId })
        .eq('id', messageId)

      if (messageError) throw messageError

      // Update thread metadata
      const { error: threadError } = await this.supabase
        .from('message_threads')
        .update({
          updated_at: new Date().toISOString(),
          last_message_id: messageId,
          last_message_at: new Date().toISOString()
        })
        .eq('id', threadId)

      if (threadError) throw threadError

      console.log('✅ Message added to thread successfully')
      return true
    } catch (error) {
      console.error('Error adding message to thread:', error)
      return false
    }
  }

  // Add participant to thread
  async addParticipantToThread(
    threadId: string,
    userId: string,
    addedBy: string
  ): Promise<boolean> {
    try {
      // Verify the person adding has admin rights
      const { data: adminParticipant, error: adminError } = await this.supabase
        .from('thread_participants')
        .select('is_admin')
        .eq('thread_id', threadId)
        .eq('user_id', addedBy)
        .single()

      if (adminError || !adminParticipant?.is_admin) {
        throw new Error('Only thread admins can add participants')
      }

      // Check if user is already a participant
      const { data: existingParticipant } = await this.supabase
        .from('thread_participants')
        .select('user_id')
        .eq('thread_id', threadId)
        .eq('user_id', userId)
        .single()

      if (existingParticipant) {
        console.log('User already a participant in this thread')
        return true
      }

      // Add participant
      const { error: participantError } = await this.supabase
        .from('thread_participants')
        .insert({
          thread_id: threadId,
          user_id: userId,
          joined_at: new Date().toISOString(),
          is_admin: false,
          can_edit: false
        })

      if (participantError) throw participantError

      // Update thread participants list
      const { data: thread, error: threadError } = await this.supabase
        .from('message_threads')
        .select('participants')
        .eq('id', threadId)
        .single()

      if (threadError) throw threadError

      const updatedParticipants = [...(thread.participants || []), userId]
      
      const { error: updateError } = await this.supabase
        .from('message_threads')
        .update({ participants: updatedParticipants })
        .eq('id', threadId)

      if (updateError) throw updateError

      console.log('✅ Participant added to thread successfully')
      return true
    } catch (error) {
      console.error('Error adding participant to thread:', error)
      return false
    }
  }

  // Remove participant from thread
  async removeParticipantFromThread(
    threadId: string,
    userId: string,
    removedBy: string
  ): Promise<boolean> {
    try {
      // Verify the person removing has admin rights
      const { data: adminParticipant, error: adminError } = await this.supabase
        .from('thread_participants')
        .select('is_admin')
        .eq('thread_id', threadId)
        .eq('user_id', removedBy)
        .single()

      if (adminError || !adminParticipant?.is_admin) {
        throw new Error('Only thread admins can remove participants')
      }

      // Remove participant
      const { error: participantError } = await this.supabase
        .from('thread_participants')
        .delete()
        .eq('thread_id', threadId)
        .eq('user_id', userId)

      if (participantError) throw participantError

      // Update thread participants list
      const { data: thread, error: threadError } = await this.supabase
        .from('message_threads')
        .select('participants')
        .eq('id', threadId)
        .single()

      if (threadError) throw threadError

      const updatedParticipants = (thread.participants || []).filter((id: any) => id !== userId)
      
      const { error: updateError } = await this.supabase
        .from('message_threads')
        .update({ participants: updatedParticipants })
        .eq('id', threadId)

      if (updateError) throw updateError

      console.log('✅ Participant removed from thread successfully')
      return true
    } catch (error) {
      console.error('Error removing participant from thread:', error)
      return false
    }
  }

  // Update thread status
  async updateThreadStatus(
    threadId: string,
    status: 'active' | 'archived' | 'closed',
    userId: string
  ): Promise<boolean> {
    try {
      // Verify user has admin rights
      const { data: adminParticipant, error: adminError } = await this.supabase
        .from('thread_participants')
        .select('is_admin')
        .eq('thread_id', threadId)
        .eq('user_id', userId)
        .single()

      if (adminError || !adminParticipant?.is_admin) {
        throw new Error('Only thread admins can update thread status')
      }

      const { error } = await this.supabase
        .from('message_threads')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', threadId)

      if (error) throw error

      console.log('✅ Thread status updated successfully')
      return true
    } catch (error) {
      console.error('Error updating thread status:', error)
      return false
    }
  }

  // Update last read timestamp for a user
  private async updateLastRead(threadId: string, userId: string): Promise<void> {
    try {
      await this.supabase
        .from('thread_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .eq('user_id', userId)
    } catch (error) {
      console.error('Error updating last read timestamp:', error)
    }
  }

  // Get thread statistics
  async getThreadStats(threadId: string): Promise<{
    message_count: number
    participant_count: number
    last_activity: string | null
    unread_count: number
  } | null> {
    try {
      const { data: thread, error: threadError } = await this.supabase
        .from('message_threads')
        .select('message_count, participants, updated_at')
        .eq('id', threadId)
        .single()

      if (threadError) throw threadError

      return {
        message_count: thread.message_count || 0,
        participant_count: (thread.participants || []).length,
        last_activity: thread.updated_at,
        unread_count: 0 // This would need to be calculated based on user's last_read_at
      }
    } catch (error) {
      console.error('Error fetching thread stats:', error)
      return null
    }
  }
}

// Export singleton instance
export const messageThreadService = new MessageThreadService()
