import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation Schemas
const CreateMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.string().min(1, 'Type is required'),
  meeting_date: z.string().min(1, 'Meeting date is required'),
  attendees: z.string().optional(),
  location: z.string().optional(),
  status: z.string().default('scheduled'),
  notes: z.string().optional(),
});

const UpdateMeetingSchema = CreateMeetingSchema.partial();

const MeetingFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sort_by: z.enum(['meeting_date', 'title', 'created_at']).default('meeting_date'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

// Interfaces
export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  type: string;
  meeting_date: string;
  attendees: string | null;
  location: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingListResponse {
  meetings: Meeting[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class MeetingService {
  /**
   * List meetings with filtering and pagination
   */
  async list(filters?: z.infer<typeof MeetingFiltersSchema>, page = 1, limit = 20): Promise<MeetingListResponse> {
    try {
      const validatedFilters = MeetingFiltersSchema.parse(filters || {});
      
      let query = supabase
        .from('meeting_briefs')
        .select('*', { count: 'exact' });

      // Apply filters
      if (validatedFilters.search) {
        query = query.or(`title.ilike.%${validatedFilters.search}%,description.ilike.%${validatedFilters.search}%,attendees.ilike.%${validatedFilters.search}%`);
      }
      
      if (validatedFilters.status) {
        query = query.eq('status', validatedFilters.status);
      }
      
      if (validatedFilters.type) {
        query = query.eq('type', validatedFilters.type);
      }
      
      if (validatedFilters.start_date) {
        query = query.gte('meeting_date', validatedFilters.start_date);
      }
      
      if (validatedFilters.end_date) {
        query = query.lte('meeting_date', validatedFilters.end_date);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Apply sorting
      query = query.order(validatedFilters.sort_by, { ascending: validatedFilters.sort_order === 'asc' });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch meetings: ${error.message}`);
      }

      const meetings = (data || []).map(meeting => this.mapMeetingFromDB(meeting));
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        meetings,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Error in meetings.list:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Get a single meeting by ID
   */
  async get(meetingId: string): Promise<Meeting | null> {
    try {
      const { data, error } = await supabase
        .from('meeting_briefs')
        .select('*')
        .eq('id', meetingId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Meeting not found
        }
        throw new Error(`Failed to fetch meeting: ${error.message}`);
      }

      return this.mapMeetingFromDB(data);
    } catch (error) {
      console.error('Error in meetings.get:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Create a new meeting
   */
  async create(meetingData: z.infer<typeof CreateMeetingSchema>): Promise<Meeting> {
    try {
      const validatedData = CreateMeetingSchema.parse(meetingData);
      
      const { data, error } = await supabase
        .from('meeting_briefs')
        .insert({
          ...validatedData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create meeting: ${error.message}`);
      }

      return this.mapMeetingFromDB(data);
    } catch (error) {
      console.error('Error in meetings.create:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Update a meeting
   */
  async update(meetingId: string, updates: z.infer<typeof UpdateMeetingSchema>): Promise<Meeting> {
    try {
      const validatedUpdates = UpdateMeetingSchema.parse(updates);
      
      const { data, error } = await supabase
        .from('meeting_briefs')
        .update({
          ...validatedUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', meetingId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update meeting: ${error.message}`);
      }

      return this.mapMeetingFromDB(data);
    } catch (error) {
      console.error('Error in meetings.update:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Delete a meeting
   */
  async delete(meetingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('meeting_briefs')
        .delete()
        .eq('id', meetingId);

      if (error) {
        throw new Error(`Failed to delete meeting: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in meetings.delete:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Get meeting statistics
   */
  async getStatistics(): Promise<{
    total_meetings: number;
    upcoming_meetings: number;
    completed_meetings: number;
    cancelled_meetings: number;
    type_breakdown: { type: string; count: number }[];
  }> {
    try {
      const { data, error } = await supabase
        .from('meeting_briefs')
        .select('meeting_date, status, type');

      if (error) {
        throw new Error(`Failed to fetch meeting statistics: ${error.message}`);
      }

      const meetings = data || [];
      const now = new Date();
      
      const total_meetings = meetings.length;
      const upcoming_meetings = meetings.filter(m => new Date(m.meeting_date) > now && m.status !== 'cancelled').length;
      const completed_meetings = meetings.filter(m => m.status === 'completed').length;
      const cancelled_meetings = meetings.filter(m => m.status === 'cancelled').length;

      // Type breakdown
      const typeMap = new Map<string, number>();
      meetings.forEach(meeting => {
        if (meeting.type) {
          typeMap.set(meeting.type, (typeMap.get(meeting.type) || 0) + 1);
        }
      });

      const type_breakdown = Array.from(typeMap.entries()).map(([type, count]) => ({
        type,
        count
      }));

      return {
        total_meetings,
        upcoming_meetings,
        completed_meetings,
        cancelled_meetings,
        type_breakdown
      };
    } catch (error) {
      console.error('Error in meetings.getStatistics:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Map database meeting to frontend format
   */
  private mapMeetingFromDB(dbMeeting: any): Meeting {
    return {
      id: dbMeeting.id,
      title: dbMeeting.title,
      description: dbMeeting.description,
      type: dbMeeting.type,
      meeting_date: dbMeeting.meeting_date,
      attendees: dbMeeting.attendees,
      location: dbMeeting.location,
      status: dbMeeting.status,
      notes: dbMeeting.notes,
      created_at: dbMeeting.created_at,
      updated_at: dbMeeting.updated_at,
    }
  }

  async getAnalytics(): Promise<{
    totalMeetings: number
    upcomingMeetings: number
    completedMeetings: number
    averageDuration: number
    typeBreakdown: { type: string; count: number }[]
  }> {
    try {
      const { count: totalMeetings } = await supabase
        .from('meeting_briefs')
        .select('*', { count: 'exact', head: true })

      const { count: upcomingMeetings } = await supabase
        .from('meeting_briefs')
        .select('*', { count: 'exact', head: true })
        .gte('meeting_date', new Date().toISOString())

      const { count: completedMeetings } = await supabase
        .from('meeting_briefs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      const { data: typeData } = await supabase
        .from('meeting_briefs')
        .select('type')

      const typeBreakdown = typeData?.reduce((acc: any, meeting) => {
        acc[meeting.type] = (acc[meeting.type] || 0) + 1
        return acc
      }, {}) || {}

      return {
        totalMeetings: totalMeetings || 0,
        upcomingMeetings: upcomingMeetings || 0,
        completedMeetings: completedMeetings || 0,
        averageDuration: 60,
        typeBreakdown: Object.entries(typeBreakdown).map(([type, count]) => ({
          type,
          count: count as number
        }))
      }
    } catch (error) {
      console.error('Error getting meeting analytics:', error)
      return {
        totalMeetings: 0,
        upcomingMeetings: 0,
        completedMeetings: 0,
        averageDuration: 0,
        typeBreakdown: []
      }
    }
  }

  async getUpcomingMeetings(limit = 10): Promise<Meeting[]> {
    try {
      const { data, error } = await supabase
        .from('meeting_briefs')
        .select('*')
        .gte('meeting_date', new Date().toISOString())
        .order('meeting_date', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error fetching upcoming meetings:', error)
        return []
      }

      return data?.map(meeting => this.mapMeetingFromDB(meeting)) || []
    } catch (error) {
      console.error('Error in getUpcomingMeetings:', error)
      return []
    }
  }

  async createActionItem(meetingId: string, actionItem: {
    title: string
    description?: string
    assigned_to?: string
    due_date?: string
    priority?: string
  }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('meeting_action_items')
        .insert({
          meeting_id: meetingId,
          title: actionItem.title,
          description: actionItem.description,
          assigned_to: actionItem.assigned_to,
          due_date: actionItem.due_date,
          priority: actionItem.priority || 'medium',
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating action item:', error)
        throw new Error('Failed to create action item')
      }

      return data
    } catch (error) {
      console.error('Error in createActionItem:', error)
      throw error
    }
  }

  async getActionItems(meetingId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('meeting_action_items')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching action items:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getActionItems:', error)
      return []
    }
  }

  async updateActionItem(actionItemId: string, updates: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('meeting_action_items')
        .update(updates)
        .eq('id', actionItemId)
        .select()
        .single()

      if (error) {
        console.error('Error updating action item:', error)
        throw new Error('Failed to update action item')
      }

      return data
    } catch (error) {
      console.error('Error in updateActionItem:', error)
      throw error
    }
  }

  async createFollowUp(meetingId: string, followUp: {
    title: string
    description?: string
    due_date?: string
    priority?: string
  }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('meeting_follow_ups')
        .insert({
          meeting_id: meetingId,
          title: followUp.title,
          description: followUp.description,
          due_date: followUp.due_date,
          priority: followUp.priority || 'medium',
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating follow-up:', error)
        throw new Error('Failed to create follow-up')
      }

      return data
    } catch (error) {
      console.error('Error in createFollowUp:', error)
      throw error
    }
  }

  async getFollowUps(meetingId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('meeting_follow_ups')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching follow-ups:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getFollowUps:', error)
      return []
    }
  }

  async updateFollowUp(followUpId: string, updates: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('meeting_follow_ups')
        .update(updates)
        .eq('id', followUpId)
        .select()
        .single()

      if (error) {
        console.error('Error updating follow-up:', error)
        throw new Error('Failed to update follow-up')
      }

      return data
    } catch (error) {
      console.error('Error in updateFollowUp:', error)
      throw error
    }
  }
} 