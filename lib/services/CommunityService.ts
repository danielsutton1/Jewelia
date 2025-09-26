import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  SocialCommunity,
  CommunityMember,
  CommunityPost,
  SocialEvent,
  EventParticipant,
  DirectMessage,
  GroupMessage,
  MessageThread,
  CommunityGuideline,
  ContentReport,
  ModerationAction,
  CreateCommunityRequest,
  UpdateCommunityRequest,
  JoinCommunityRequest,
  CreateEventRequest,
  UpdateEventRequest,
  RSVPRequest,
  SendDirectMessageRequest,
  SendGroupMessageRequest,
  CreateMessageThreadRequest,
  CreateContentReportRequest,
  UpdateReportStatusRequest,
  CreateModerationActionRequest,
  CommunityFilters,
  EventFilters,
  MessageFilters,
  CommunityListResponse,
  EventListResponse,
  MessageResponse,
  ThreadResponse,
  ModerationResponse,
  CommunityStats,
  EventStats,
  MessagingStats,
  ModerationStats
} from '@/types/community-features';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const createCommunitySchema = z.object({
  name: z.string().min(1, 'Community name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  category: z.enum(['jewelry_design', 'gemology', 'business', 'education', 'vintage_jewelry', 'modern_design', 'diamond_experts', 'gemstone_specialists', 'jewelry_repair', 'appraisal', 'other']),
  privacy_level: z.enum(['public', 'private', 'secret']).default('public'),
  avatar_url: z.string().url().optional(),
  banner_url: z.string().url().optional()
});

const updateCommunitySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  category: z.enum(['jewelry_design', 'gemology', 'business', 'education', 'vintage_jewelry', 'modern_design', 'diamond_experts', 'gemstone_specialists', 'jewelry_repair', 'appraisal', 'other']).optional(),
  privacy_level: z.enum(['public', 'private', 'secret']).optional(),
  avatar_url: z.string().url().optional(),
  banner_url: z.string().url().optional()
});

const createEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(255),
  description: z.string().optional(),
  event_type: z.enum(['meetup', 'workshop', 'webinar', 'conference', 'networking', 'other']),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  timezone: z.string().default('UTC'),
  location_type: z.enum(['online', 'in_person', 'hybrid']).default('online'),
  location_address: z.string().optional(),
  online_meeting_url: z.string().url().optional(),
  max_participants: z.number().positive().optional(),
  is_free: z.boolean().default(true),
  price: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  community_id: z.string().uuid().optional(),
  is_featured: z.boolean().default(false)
});

const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  message_type: z.enum(['text', 'image', 'file', 'voice']).default('text'),
  media_url: z.string().url().optional()
});

const createReportSchema = z.object({
  reported_content_type: z.enum(['post', 'comment', 'user', 'community', 'event']),
  reported_content_id: z.string().min(1, 'Content ID is required'),
  report_reason: z.enum(['spam', 'inappropriate', 'harassment', 'fake_news', 'copyright', 'commercial_solicitation', 'impersonation', 'other']),
  report_details: z.string().optional()
});

// =====================================================
// COMMUNITY SERVICE
// =====================================================

export class CommunityService {
  private supabase;

  constructor() {
    this.supabase = createSupabaseServerClient() as any;
  }

  // =====================================================
  // COMMUNITY MANAGEMENT
  // =====================================================

  async createCommunity(data: CreateCommunityRequest, userId: string): Promise<SocialCommunity> {
    const validatedData = createCommunitySchema.parse(data);
    
    const { data: community, error } = await this.supabase
      .from('social_communities')
      .insert({
        ...validatedData,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create community: ${error.message}`);
    
    // Auto-join the creator as owner
    await this.joinCommunity(community.id, userId, 'owner');
    
    return community;
  }

  async getCommunity(communityId: string): Promise<SocialCommunity | null> {
    const { data, error } = await this.supabase
      .from('social_communities')
      .select('*')
      .eq('id', communityId)
      .single();

    if (error) return null;
    return data;
  }

  async getCommunityBySlug(slug: string): Promise<SocialCommunity | null> {
    const { data, error } = await this.supabase
      .from('social_communities')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data;
  }

  async updateCommunity(communityId: string, data: UpdateCommunityRequest, userId: string): Promise<SocialCommunity> {
    const validatedData = updateCommunitySchema.parse(data);
    
    const { data: community, error } = await this.supabase
      .from('social_communities')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', communityId)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update community: ${error.message}`);
    return community;
  }

  async deleteCommunity(communityId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('social_communities')
      .delete()
      .eq('id', communityId)
      .eq('created_by', userId);

    if (error) throw new Error(`Failed to delete community: ${error.message}`);
  }

  async listCommunities(filters: CommunityFilters = {}, page = 1, limit = 20): Promise<CommunityListResponse> {
    let query = this.supabase
      .from('social_communities')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.privacy_level) {
      query = query.eq('privacy_level', filters.privacy_level);
    }
    if (filters.is_verified !== undefined) {
      query = query.eq('is_verified', filters.is_verified);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: communities, error, count } = await query;

    if (error) throw new Error(`Failed to fetch communities: ${error.message}`);

    return {
      communities: communities || [],
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit
    };
  }

  // =====================================================
  // COMMUNITY MEMBERSHIP
  // =====================================================

  async joinCommunity(communityId: string, userId: string, role: 'owner' | 'admin' | 'moderator' | 'member' = 'member'): Promise<CommunityMember> {
    const { data: member, error } = await this.supabase
      .from('social_community_members')
      .insert({
        community_id: communityId,
        user_id: userId,
        role
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to join community: ${error.message}`);
    return member;
  }

  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('social_community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to leave community: ${error.message}`);
  }

  async getCommunityMembers(communityId: string, page = 1, limit = 50): Promise<CommunityMember[]> {
    const { data, error } = await this.supabase
      .from('social_community_members')
      .select('*')
      .eq('community_id', communityId)
      .eq('is_active', true)
      .order('joined_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new Error(`Failed to fetch community members: ${error.message}`);
    return data || [];
  }

  async getUserCommunities(userId: string): Promise<SocialCommunity[]> {
    const { data, error } = await this.supabase
      .from('social_community_members')
      .select(`
        social_communities.*
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('joined_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch user communities: ${error.message}`);
    return data || [];
  }

  // =====================================================
  // COMMUNITY POSTS
  // =====================================================

  async createCommunityPost(communityId: string, userId: string, content: string, title?: string): Promise<CommunityPost> {
    const { data: post, error } = await this.supabase
      .from('social_community_posts')
      .insert({
        community_id: communityId,
        user_id: userId,
        title,
        content,
        content_type: 'text'
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create community post: ${error.message}`);
    return post;
  }

  async getCommunityPosts(communityId: string, page = 1, limit = 20): Promise<CommunityPost[]> {
    const { data, error } = await this.supabase
      .from('social_community_posts')
      .select('*')
      .eq('community_id', communityId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new Error(`Failed to fetch community posts: ${error.message}`);
    return data || [];
  }

  // =====================================================
  // EVENTS & CALENDAR
  // =====================================================

  async createEvent(data: CreateEventRequest, userId: string): Promise<SocialEvent> {
    const validatedData = createEventSchema.parse(data);
    
    const { data: event, error } = await this.supabase
      .from('social_events')
      .insert({
        ...validatedData,
        organizer_id: userId
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create event: ${error.message}`);
    return event;
  }

  async getEvent(eventId: string): Promise<SocialEvent | null> {
    const { data, error } = await this.supabase
      .from('social_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) return null;
    return data;
  }

  async updateEvent(eventId: string, data: UpdateEventRequest, userId: string): Promise<SocialEvent> {
    const { data: event, error } = await this.supabase
      .from('social_events')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .eq('organizer_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update event: ${error.message}`);
    return event;
  }

  async deleteEvent(eventId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('social_events')
      .delete()
      .eq('id', eventId)
      .eq('organizer_id', userId);

    if (error) throw new Error(`Failed to delete event: ${error.message}`);
  }

  async listEvents(filters: EventFilters = {}, page = 1, limit = 20): Promise<EventListResponse> {
    let query = this.supabase
      .from('social_events')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.event_type) {
      query = query.eq('event_type', filters.event_type);
    }
    if (filters.location_type) {
      query = query.eq('location_type', filters.location_type);
    }
    if (filters.start_date_from) {
      query = query.gte('start_date', filters.start_date_from);
    }
    if (filters.start_date_to) {
      query = query.lte('start_date', filters.start_date_to);
    }
    if (filters.is_free !== undefined) {
      query = query.eq('is_free', filters.is_free);
    }
    if (filters.community_id) {
      query = query.eq('community_id', filters.community_id);
    }
    if (filters.organizer_id) {
      query = query.eq('organizer_id', filters.organizer_id);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'start_date';
    const sortOrder = filters.sort_order || 'asc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: events, error, count } = await query;

    if (error) throw new Error(`Failed to fetch events: ${error.message}`);

    return {
      events: events || [],
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit
    };
  }

  async rsvpToEvent(eventId: string, userId: string, status: 'going' | 'not_going' | 'maybe', notes?: string): Promise<EventParticipant> {
    const { data: participant, error } = await this.supabase
      .from('social_event_participants')
      .upsert({
        event_id: eventId,
        user_id: userId,
        status,
        notes,
        rsvp_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to RSVP to event: ${error.message}`);
    return participant;
  }

  async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    const { data, error } = await this.supabase
      .from('social_event_participants')
      .select('*')
      .eq('event_id', eventId)
      .order('rsvp_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch event participants: ${error.message}`);
    return data || [];
  }

  // =====================================================
  // MESSAGING SYSTEM
  // =====================================================

  async sendDirectMessage(data: SendDirectMessageRequest, senderId: string): Promise<DirectMessage> {
    const validatedData = sendMessageSchema.parse(data);
    
    const { data: message, error } = await this.supabase
      .from('social_direct_messages')
      .insert({
        sender_id: senderId,
        recipient_id: data.recipient_id,
        ...validatedData
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to send message: ${error.message}`);
    return message;
  }

  async sendGroupMessage(data: SendGroupMessageRequest, senderId: string): Promise<GroupMessage> {
    const validatedData = sendMessageSchema.parse(data);
    
    const { data: message, error } = await this.supabase
      .from('social_group_messages')
      .insert({
        group_id: data.group_id,
        sender_id: senderId,
        ...validatedData
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to send group message: ${error.message}`);
    return message;
  }

  async getDirectMessages(userId1: string, userId2: string, page = 1, limit = 50): Promise<DirectMessage[]> {
    const { data, error } = await this.supabase
      .from('social_direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new Error(`Failed to fetch direct messages: ${error.message}`);
    return data || [];
  }

  async getGroupMessages(groupId: string, page = 1, limit = 50): Promise<GroupMessage[]> {
    const { data, error } = await this.supabase
      .from('social_group_messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new Error(`Failed to fetch group messages: ${error.message}`);
    return data || [];
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('social_direct_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('recipient_id', userId);

    if (error) throw new Error(`Failed to mark message as read: ${error.message}`);
  }

  // =====================================================
  // CONTENT MODERATION
  // =====================================================

  async createContentReport(data: CreateContentReportRequest, userId: string): Promise<ContentReport> {
    const validatedData = createReportSchema.parse(data);
    
    const { data: report, error } = await this.supabase
      .from('social_content_reports')
      .insert({
        ...validatedData,
        reporter_id: userId
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create content report: ${error.message}`);
    return report;
  }

  async getContentReports(status?: string, page = 1, limit = 50): Promise<ContentReport[]> {
    let query = this.supabase
      .from('social_content_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('report_status', status);
    }

    query = query.range((page - 1) * limit, page * limit - 1);

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch content reports: ${error.message}`);
    return data || [];
  }

  async updateReportStatus(reportId: string, status: string, moderatorId: string, notes?: string): Promise<ContentReport> {
    const { data: report, error } = await this.supabase
      .from('social_content_reports')
      .update({
        report_status: status,
        moderator_id: moderatorId,
        moderation_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update report status: ${error.message}`);
    return report;
  }

  async createModerationAction(data: CreateModerationActionRequest, moderatorId: string): Promise<ModerationAction> {
    const { data: action, error } = await this.supabase
      .from('social_moderation_actions')
      .insert({
        ...data,
        moderator_id: moderatorId
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create moderation action: ${error.message}`);
    return action;
  }

  // =====================================================
  // STATISTICS & ANALYTICS
  // =====================================================

  async getCommunityStats(): Promise<CommunityStats> {
    const { data: communities, error: communitiesError } = await this.supabase
      .from('social_communities')
      .select('category');

    if (communitiesError) throw new Error(`Failed to fetch community stats: ${communitiesError.message}`);

    const { data: members, error: membersError } = await this.supabase
      .from('social_community_members')
      .select('id');

    if (membersError) throw new Error(`Failed to fetch member stats: ${membersError.message}`);

    const { data: posts, error: postsError } = await this.supabase
      .from('social_community_posts')
      .select('id');

    if (postsError) throw new Error(`Failed to fetch post stats: ${postsError.message}`);

    // Calculate category counts
    const categoryCounts = communities?.reduce((acc: any, community: any) => {
      acc[community.category] = (acc[community.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category: category as any, count: count as number }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 5);

    return {
      total_communities: communities?.length || 0,
      total_members: members?.length || 0,
      total_posts: posts?.length || 0,
      active_communities: communities?.filter((c: any) => c.member_count > 0).length || 0,
      top_categories: topCategories
    };
  }

  async getEventStats(): Promise<EventStats> {
    const { data: events, error: eventsError } = await this.supabase
      .from('social_events')
      .select('event_type, start_date, current_participants');

    if (eventsError) throw new Error(`Failed to fetch event stats: ${eventsError.message}`);

    const now = new Date();
    const upcomingEvents = events?.filter((event: any) => new Date(event.start_date) > now).length || 0;

    // Calculate event type counts
    const typeCounts = events?.reduce((acc: any, event: any) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const eventTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({ type: type as any, count: count as number }))
      .sort((a, b) => (b.count as number) - (a.count as number));

    const totalParticipants = events?.reduce((sum: number, event: any) => sum + (event.current_participants || 0), 0) || 0;

    return {
      total_events: events?.length || 0,
      upcoming_events: upcomingEvents,
      total_participants: totalParticipants,
      event_types: eventTypes
    };
  }

  async getMessagingStats(userId: string): Promise<MessagingStats> {
    const { data: threads, error: threadsError } = await this.supabase
      .from('social_message_threads')
      .select('id')
      .contains('participants', [userId]);

    if (threadsError) throw new Error(`Failed to fetch thread stats: ${threadsError.message}`);

    const { data: messages, error: messagesError } = await this.supabase
      .from('social_direct_messages')
      .select('id, is_read')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);

    if (messagesError) throw new Error(`Failed to fetch message stats: ${messagesError.message}`);

    const unreadMessages = messages?.filter((msg: any) => !msg.is_read && msg.recipient_id === userId).length || 0;

    return {
      total_threads: threads?.length || 0,
      total_messages: messages?.length || 0,
      unread_messages: unreadMessages,
      active_conversations: threads?.length || 0
    };
  }

  async getModerationStats(): Promise<ModerationStats> {
    const { data: reports, error: reportsError } = await this.supabase
      .from('social_content_reports')
      .select('report_reason, report_status');

    if (reportsError) throw new Error(`Failed to fetch moderation stats: ${reportsError.message}`);

    const pendingCount = reports?.filter((r: any) => r.report_status === 'pending').length || 0;
    const resolvedCount = reports?.filter((r: any) => r.report_status === 'resolved').length || 0;

    // Calculate reports by reason
    const reasonCounts = reports?.reduce((acc: any, report: any) => {
      acc[report.report_reason] = (acc[report.report_reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const reportsByReason = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason: reason as any, count: count as number }))
      .sort((a, b) => (b.count as number) - (a.count as number));

    return {
      total_reports: reports?.length || 0,
      pending_reports: pendingCount,
      resolved_reports: resolvedCount,
      reports_by_reason: reportsByReason
    };
  }
} 