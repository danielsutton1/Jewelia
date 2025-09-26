// =====================================================
// PHASE 3: COMMUNITY FEATURES TYPES
// Communities, Events, Messaging, Moderation
// =====================================================

// =====================================================
// 1. COMMUNITIES & GROUPS
// =====================================================

export interface SocialCommunity {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatar_url?: string;
  banner_url?: string;
  category: CommunityCategory;
  privacy_level: PrivacyLevel;
  member_count: number;
  post_count: number;
  is_verified: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: CommunityRole;
  joined_at: string;
  is_active: boolean;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  user_id: string;
  title?: string;
  content: string;
  content_type: CommunityContentType;
  media_urls?: string[];
  tags?: string[];
  is_pinned: boolean;
  is_announcement: boolean;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export type CommunityCategory = 
  | 'jewelry_design'
  | 'gemology'
  | 'business'
  | 'education'
  | 'vintage_jewelry'
  | 'modern_design'
  | 'diamond_experts'
  | 'gemstone_specialists'
  | 'jewelry_repair'
  | 'appraisal'
  | 'other';

export type PrivacyLevel = 'public' | 'private' | 'secret';

export type CommunityRole = 'owner' | 'admin' | 'moderator' | 'member';

export type CommunityContentType = 'text' | 'image' | 'video' | 'link' | 'poll';

// =====================================================
// 2. EVENTS & CALENDAR
// =====================================================

export interface SocialEvent {
  id: string;
  title: string;
  description?: string;
  event_type: EventType;
  start_date: string;
  end_date: string;
  timezone: string;
  location_type: LocationType;
  location_address?: string;
  online_meeting_url?: string;
  max_participants?: number;
  current_participants: number;
  is_free: boolean;
  price?: number;
  currency: string;
  organizer_id: string;
  community_id?: string;
  is_featured: boolean;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: RSVPStatus;
  rsvp_at: string;
  notes?: string;
}

export type EventType = 'meetup' | 'workshop' | 'webinar' | 'conference' | 'networking' | 'other';

export type LocationType = 'online' | 'in_person' | 'hybrid';

export type EventStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type RSVPStatus = 'going' | 'not_going' | 'maybe';

// =====================================================
// 3. ENHANCED MESSAGING
// =====================================================

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: MessageType;
  media_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  media_url?: string;
  reply_to_message_id?: string;
  created_at: string;
}

export interface MessageThread {
  id: string;
  name?: string;
  thread_type: ThreadType;
  participants: string[];
  last_message_at: string;
  created_at: string;
}

export type MessageType = 'text' | 'image' | 'file' | 'voice';

export type ThreadType = 'direct' | 'group' | 'community';

// =====================================================
// 4. CONTENT MODERATION
// =====================================================

export interface CommunityGuideline {
  id: string;
  community_id?: string;
  title: string;
  content: string;
  category: GuidelineCategory;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContentReport {
  id: string;
  reporter_id: string;
  reported_content_type: ReportContentType;
  reported_content_id: string;
  report_reason: ReportReason;
  report_details?: string;
  report_status: ReportStatus;
  moderator_id?: string;
  moderation_notes?: string;
  moderation_action?: ModerationAction;
  action_duration?: string;
  created_at: string;
  updated_at: string;
}

export interface ModerationAction {
  id: string;
  moderator_id: string;
  action_type: ActionType;
  target_type: ModerationTargetType;
  target_id: string;
  reason: string;
  action_details?: string;
  duration?: string;
  created_at: string;
}

export type GuidelineCategory = 'general' | 'posting' | 'behavior' | 'commercial' | 'other';

export type ReportContentType = 'post' | 'comment' | 'user' | 'community' | 'event';

export type ReportReason = 
  | 'spam'
  | 'inappropriate'
  | 'harassment'
  | 'fake_news'
  | 'copyright'
  | 'commercial_solicitation'
  | 'impersonation'
  | 'other';

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export type ModerationActionType = 
  | 'warning'
  | 'content_removal'
  | 'temporary_ban'
  | 'permanent_ban'
  | 'no_action';

export type ActionType = 
  | 'content_removal'
  | 'user_warning'
  | 'user_suspension'
  | 'user_ban'
  | 'community_warning'
  | 'community_suspension'
  | 'content_approval';

export type ModerationTargetType = 'user' | 'post' | 'comment' | 'community' | 'event';

// =====================================================
// 5. REQUEST/RESPONSE TYPES
// =====================================================

// Community requests
export interface CreateCommunityRequest {
  name: string;
  slug: string;
  description?: string;
  category: CommunityCategory;
  privacy_level?: PrivacyLevel;
  avatar_url?: string;
  banner_url?: string;
}

export interface UpdateCommunityRequest {
  name?: string;
  description?: string;
  category?: CommunityCategory;
  privacy_level?: PrivacyLevel;
  avatar_url?: string;
  banner_url?: string;
}

export interface JoinCommunityRequest {
  community_id: string;
  role?: CommunityRole;
}

// Event requests
export interface CreateEventRequest {
  title: string;
  description?: string;
  event_type: EventType;
  start_date: string;
  end_date: string;
  timezone?: string;
  location_type: LocationType;
  location_address?: string;
  online_meeting_url?: string;
  max_participants?: number;
  is_free: boolean;
  price?: number;
  currency?: string;
  community_id?: string;
  is_featured?: boolean;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  event_type?: EventType;
  start_date?: string;
  end_date?: string;
  timezone?: string;
  location_type?: LocationType;
  location_address?: string;
  online_meeting_url?: string;
  max_participants?: number;
  is_free?: boolean;
  price?: number;
  currency?: string;
  is_featured?: boolean;
  status?: EventStatus;
}

export interface RSVPRequest {
  event_id: string;
  status: RSVPStatus;
  notes?: string;
}

// Messaging requests
export interface SendDirectMessageRequest {
  recipient_id: string;
  content: string;
  message_type?: MessageType;
  media_url?: string;
}

export interface SendGroupMessageRequest {
  group_id: string;
  content: string;
  message_type?: MessageType;
  media_url?: string;
  reply_to_message_id?: string;
}

export interface CreateMessageThreadRequest {
  name?: string;
  thread_type: ThreadType;
  participants: string[];
}

// Moderation requests
export interface CreateContentReportRequest {
  reported_content_type: ReportContentType;
  reported_content_id: string;
  report_reason: ReportReason;
  report_details?: string;
}

export interface UpdateReportStatusRequest {
  report_id: string;
  report_status: ReportStatus;
  moderation_notes?: string;
  moderation_action?: ModerationActionType;
  action_duration?: string;
}

export interface CreateModerationActionRequest {
  action_type: ActionType;
  target_type: ModerationTargetType;
  target_id: string;
  reason: string;
  action_details?: string;
  duration?: string;
}

// =====================================================
// 6. RESPONSE TYPES
// =====================================================

export interface CommunityResponse {
  community: SocialCommunity;
  member_count: number;
  post_count: number;
  is_member: boolean;
  user_role?: CommunityRole;
}

export interface CommunityListResponse {
  communities: SocialCommunity[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface EventResponse {
  event: SocialEvent;
  participant_count: number;
  user_rsvp?: RSVPStatus;
  organizer_profile?: any; // Will reference user profile
}

export interface EventListResponse {
  events: SocialEvent[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface MessageResponse {
  messages: (DirectMessage | GroupMessage)[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ThreadResponse {
  thread: MessageThread;
  messages: (DirectMessage | GroupMessage)[];
  participants: any[]; // Will reference user profiles
}

export interface ModerationResponse {
  reports: ContentReport[];
  total: number;
  pending_count: number;
  resolved_count: number;
}

// =====================================================
// 7. FILTER & SEARCH TYPES
// =====================================================

export interface CommunityFilters {
  category?: CommunityCategory;
  privacy_level?: PrivacyLevel;
  is_verified?: boolean;
  search?: string;
  sort_by?: 'name' | 'member_count' | 'post_count' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface EventFilters {
  event_type?: EventType;
  location_type?: LocationType;
  start_date_from?: string;
  start_date_to?: string;
  is_free?: boolean;
  community_id?: string;
  organizer_id?: string;
  search?: string;
  sort_by?: 'start_date' | 'title' | 'current_participants';
  sort_order?: 'asc' | 'desc';
}

export interface MessageFilters {
  thread_id?: string;
  sender_id?: string;
  recipient_id?: string;
  message_type?: MessageType;
  is_read?: boolean;
  search?: string;
  sort_by?: 'created_at';
  sort_order?: 'asc' | 'desc';
}

// =====================================================
// 8. UTILITY TYPES
// =====================================================

export interface CommunityStats {
  total_communities: number;
  total_members: number;
  total_posts: number;
  active_communities: number;
  top_categories: { category: CommunityCategory; count: number }[];
}

export interface EventStats {
  total_events: number;
  upcoming_events: number;
  total_participants: number;
  event_types: { type: EventType; count: number }[];
}

export interface MessagingStats {
  total_threads: number;
  total_messages: number;
  unread_messages: number;
  active_conversations: number;
}

export interface ModerationStats {
  total_reports: number;
  pending_reports: number;
  resolved_reports: number;
  reports_by_reason: { reason: ReportReason; count: number }[];
} 