// 🚀 Social Network Types for Jewelia CRM
// Comprehensive type definitions for Phase 1 social features

export type ContentType = 'text' | 'image' | 'video' | 'link' | 'poll' | 'showcase' | 'achievement';
export type PostVisibility = 'public' | 'connections' | 'private';
export type ReactionType = 'like' | 'love' | 'wow' | 'haha' | 'sad' | 'angry' | 'fire' | 'gem';
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';
export type ConnectionType = 'professional' | 'personal' | 'mentor' | 'mentee';
export type RequestType = 'connection' | 'mentorship' | 'collaboration';
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type ActivityType = 'post_created' | 'comment_added' | 'like_given' | 'connection_made' | 'achievement_unlocked';
export type AvailabilityStatus = 'available' | 'busy' | 'away' | 'offline';
export type ContactMethod = 'message' | 'email' | 'phone' | 'video_call';

// =====================================================
// USER PROFILE TYPES
// =====================================================

export interface SocialLinks {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  website?: string;
  portfolio?: string;
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'connections' | 'private';
  contact_visibility: 'public' | 'connections' | 'private';
  activity_visibility: 'public' | 'connections' | 'private';
  show_online_status: boolean;
  allow_direct_messages: boolean;
  show_location: boolean;
  show_specialties: boolean;
}

export interface SocialStats {
  followers: number;
  following: number;
  posts: number;
  likes_received: number;
  comments_received: number;
  shares_received: number;
  views_received: number;
}

export interface UserProfileExtension {
  id: string;
  user_id: string;
  
  // Professional Information
  company_name?: string;
  job_title?: string;
  industry?: string;
  certifications?: string[];
  awards?: string[];
  
  // Social Preferences
  interests?: string[];
  preferred_networking_topics?: string[];
  availability_status: AvailabilityStatus;
  
  // Contact Preferences
  preferred_contact_method: ContactMethod;
  response_time_expectation: string;
  
  // Social Settings
  auto_accept_connections: boolean;
  allow_direct_messages: boolean;
  show_online_status: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface ExtendedUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  
  // Social Fields
  bio?: string;
  avatar_url?: string;
  cover_image_url?: string;
  location?: string;
  website?: string;
  social_links: SocialLinks;
  specialties: string[];
  years_experience?: number;
  is_public_profile: boolean;
  privacy_settings: PrivacySettings;
  social_stats: SocialStats;
  
  // Profile Extension
  profile_extension?: UserProfileExtension;
  
  created_at: string;
  updated_at: string;
}

// =====================================================
// SOCIAL POST TYPES
// =====================================================

export interface SocialPost {
  id: string;
  user_id: string;
  
  // Content Information
  content: string;
  content_type: ContentType;
  media_urls: string[];
  
  // Post Settings
  visibility: PostVisibility;
  allow_comments: boolean;
  allow_shares: boolean;
  is_featured: boolean;
  
  // Engagement Stats
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
  save_count: number;
  
  // Metadata
  tags: string[];
  location?: string;
  industry_context?: string;
  jewelry_category?: string;
  price_range?: string;
  
  // Moderation
  is_approved: boolean;
  moderation_status: string;
  reported_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  scheduled_at?: string;
  published_at: string;
  
  // Computed fields
  user?: ExtendedUser;
  is_liked?: boolean;
  user_reaction?: ReactionType;
  is_bookmarked?: boolean;
}

export interface CreatePostRequest {
  content: string;
  content_type: ContentType;
  media_urls?: string[];
  visibility: PostVisibility;
  allow_comments?: boolean;
  allow_shares?: boolean;
  tags?: string[];
  location?: string;
  industry_context?: string;
  jewelry_category?: string;
  price_range?: string;
  scheduled_at?: string;
}

export interface UpdatePostRequest {
  content?: string;
  media_urls?: string[];
  visibility?: PostVisibility;
  allow_comments?: boolean;
  allow_shares?: boolean;
  tags?: string[];
  location?: string;
  industry_context?: string;
  jewelry_category?: string;
  price_range?: string;
}

// =====================================================
// SOCIAL INTERACTION TYPES
// =====================================================

export interface SocialComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  
  // Content
  content: string;
  media_urls: string[];
  
  // Engagement
  like_count: number;
  reply_count: number;
  
  // Moderation
  is_approved: boolean;
  reported_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Computed fields
  user?: ExtendedUser;
  replies?: SocialComment[];
  is_liked?: boolean;
  user_reaction?: ReactionType;
}

export interface CreateCommentRequest {
  post_id: string;
  content: string;
  media_urls?: string[];
  parent_comment_id?: string;
}

export interface UpdateCommentRequest {
  content?: string;
  media_urls?: string[];
}

export interface SocialPostLike {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
  
  // Computed fields
  user?: ExtendedUser;
}

export interface SocialPostShare {
  id: string;
  original_post_id: string;
  shared_by_user_id: string;
  share_message?: string;
  share_visibility: PostVisibility;
  created_at: string;
  
  // Computed fields
  original_post?: SocialPost;
  user?: ExtendedUser;
}

export interface SocialBookmark {
  id: string;
  user_id: string;
  post_id: string;
  folder: string;
  notes?: string;
  created_at: string;
  
  // Computed fields
  post?: SocialPost;
}

export interface CreateBookmarkRequest {
  post_id: string;
  folder?: string;
  notes?: string;
}

// =====================================================
// USER CONNECTION TYPES
// =====================================================

export interface UserConnection {
  id: string;
  follower_id: string;
  following_id: string;
  connection_status: ConnectionStatus;
  connection_type: ConnectionType;
  
  // Connection metadata
  mutual_interests?: string[];
  connection_strength: number;
  last_interaction?: string;
  
  created_at: string;
  updated_at: string;
  
  // Computed fields
  follower?: ExtendedUser;
  following?: ExtendedUser;
}

export interface ConnectionRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  message?: string;
  request_type: RequestType;
  status: RequestStatus;
  
  created_at: string;
  updated_at: string;
  
  // Computed fields
  requester?: ExtendedUser;
  recipient?: ExtendedUser;
}

export interface CreateConnectionRequest {
  recipient_id: string;
  message?: string;
  request_type?: RequestType;
}

export interface UpdateConnectionRequest {
  status: RequestStatus;
  message?: string;
}

// =====================================================
// ACTIVITY LOG TYPES
// =====================================================

export interface UserActivityLog {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  activity_data?: Record<string, any>;
  visibility: PostVisibility;
  created_at: string;
  
  // Computed fields
  user?: ExtendedUser;
}

// =====================================================
// FEED AND DISCOVERY TYPES
// =====================================================

export interface FeedFilters {
  content_types?: ContentType[];
  jewelry_categories?: string[];
  tags?: string[];
  location?: string;
  price_range?: string;
  visibility?: PostVisibility;
  user_id?: string;
  following_only?: boolean;
}

export interface FeedSortOptions {
  sort_by: 'latest' | 'trending' | 'most_liked' | 'most_commented' | 'most_shared';
  sort_order: 'asc' | 'desc';
}

export interface FeedResponse {
  posts: SocialPost[];
  has_more: boolean;
  next_cursor?: string;
  total_count: number;
}

export interface DiscoveryFilters {
  specialties?: string[];
  location?: string;
  industry?: string;
  years_experience?: {
    min?: number;
    max?: number;
  };
  connection_status?: ConnectionStatus;
  is_online?: boolean;
}

export interface UserRecommendation {
  user: ExtendedUser;
  compatibility_score: number;
  mutual_interests: string[];
  mutual_connections: number;
  recent_activity: string;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export interface SocialNetworkStats {
  total_users: number;
  total_posts: number;
  total_connections: number;
  active_users_today: number;
  posts_today: number;
  connections_today: number;
  top_categories: Array<{
    category: string;
    post_count: number;
  }>;
  trending_tags: Array<{
    tag: string;
    usage_count: number;
  }>;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export interface ReactionCounts {
  like: number;
  love: number;
  wow: number;
  haha: number;
  sad: number;
  angry: number;
  fire: number;
  gem: number;
}

export interface PostAnalytics {
  post_id: string;
  views: number;
  unique_views: number;
  engagement_rate: number;
  reach: number;
  impressions: number;
  time_spent: number;
  shares: number;
  saves: number;
}

export interface UserEngagement {
  user_id: string;
  posts_created: number;
  likes_given: number;
  comments_made: number;
  shares_made: number;
  connections_made: number;
  engagement_score: number;
  last_activity: string;
}

// =====================================================
// EVENT TYPES FOR REAL-TIME FEATURES
// =====================================================

export interface SocialEvent {
  type: 'post_created' | 'post_updated' | 'post_deleted' | 'comment_added' | 'like_added' | 'connection_made';
  data: any;
  timestamp: string;
  user_id: string;
}

export interface NotificationEvent {
  type: 'new_connection' | 'new_comment' | 'new_like' | 'new_share' | 'connection_accepted';
  data: any;
  user_id: string;
  timestamp: string;
  is_read: boolean;
} 