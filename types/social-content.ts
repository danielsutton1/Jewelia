import { SocialProfile } from './social-profile'

export interface SocialPost {
  id: string
  user_id: string
  
  // Content Information
  content: string
  content_type: 'text' | 'image' | 'video' | 'link' | 'poll'
  media_urls: string[]
  link_preview?: LinkPreview
  
  // Engagement Stats (computed fields)
  like_count: number
  comment_count: number
  share_count: number
  view_count: number
  
  // Post Settings
  is_public: boolean
  allow_comments: boolean
  allow_shares: boolean
  is_pinned: boolean
  
  // Metadata
  tags: string[]
  location?: string
  mood?: string
  industry_context?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  published_at: string
  
  // Relations (populated when fetched)
  user?: SocialProfile
  comments?: SocialComment[]
  likes?: SocialPostLike[]
  shares?: SocialPostShare[]
  is_liked_by_user?: boolean
  is_bookmarked_by_user?: boolean
}

export interface SocialComment {
  id: string
  post_id: string
  user_id: string
  parent_comment_id?: string
  
  // Content
  content: string
  media_urls: string[]
  
  // Engagement
  like_count: number
  reply_count: number
  
  // Moderation
  is_edited: boolean
  is_hidden: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
  
  // Relations (populated when fetched)
  user?: SocialProfile
  post?: SocialPost
  parent_comment?: SocialComment
  replies?: SocialComment[]
  likes?: SocialCommentLike[]
  is_liked_by_user?: boolean
}

export interface SocialPostLike {
  id: string
  post_id: string
  user_id: string
  reaction_type: ReactionType
  created_at: string
  
  // Relations
  user?: SocialProfile
  post?: SocialPost
}

export interface SocialCommentLike {
  id: string
  comment_id: string
  user_id: string
  reaction_type: ReactionType
  created_at: string
  
  // Relations
  user?: SocialProfile
  comment?: SocialComment
}

export interface SocialPostShare {
  id: string
  original_post_id: string
  shared_by_user_id: string
  
  // Share context
  share_message?: string
  share_platform: 'internal' | 'external'
  
  // Timestamps
  created_at: string
  
  // Relations
  original_post?: SocialPost
  shared_by_user?: SocialProfile
}

export interface SocialPostView {
  id: string
  post_id: string
  viewer_user_id?: string
  
  // View analytics
  view_duration?: number
  view_source: 'feed' | 'profile' | 'search' | 'notification' | 'direct_link'
  
  // Timestamps
  created_at: string
  
  // Relations
  post?: SocialPost
  viewer?: SocialProfile
}

export interface SocialBookmark {
  id: string
  user_id: string
  post_id: string
  created_at: string
  
  // Relations
  user?: SocialProfile
  post?: SocialPost
}

export interface SocialContentReport {
  id: string
  reporter_user_id: string
  content_type: 'post' | 'comment'
  content_id: string
  
  // Report details
  report_reason: ReportReason
  report_details?: string
  status: ReportStatus
  moderator_notes?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  
  // Relations
  reporter?: SocialProfile
  reported_content?: SocialPost | SocialComment
}

export interface LinkPreview {
  url: string
  title: string
  description: string
  image_url?: string
  site_name?: string
  domain?: string
}

export type ReactionType = 'like' | 'love' | 'wow' | 'haha' | 'sad' | 'angry'

export type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other'

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'

// Content creation interfaces
export interface CreatePostRequest {
  content: string
  content_type?: 'text' | 'image' | 'video' | 'link' | 'poll'
  media_urls?: string[]
  link_preview?: LinkPreview
  is_public?: boolean
  allow_comments?: boolean
  allow_shares?: boolean
  tags?: string[]
  location?: string
  mood?: string
  industry_context?: string
}

export interface CreateCommentRequest {
  content: string
  media_urls?: string[]
  parent_comment_id?: string
}

export interface CreateLikeRequest {
  reaction_type?: ReactionType
}

export interface CreateShareRequest {
  share_message?: string
  share_platform?: 'internal' | 'external'
}

// Feed and discovery interfaces
export interface FeedFilters {
  content_type?: 'text' | 'image' | 'video' | 'link' | 'poll'
  tags?: string[]
  industry_context?: string
  location?: string
  mood?: string
  time_range?: 'today' | 'week' | 'month' | 'year'
  engagement_min?: number
}

export interface FeedResponse {
  posts: SocialPost[]
  has_more: boolean
  next_cursor?: string
  total_count: number
}

export interface ContentRecommendation {
  post: SocialPost
  score: number
  reason: string
  factors: {
    user_interest: number
    engagement_rate: number
    recency: number
    relevance: number
  }
}

// Engagement analytics
export interface EngagementMetrics {
  total_likes: number
  total_comments: number
  total_shares: number
  total_views: number
  engagement_rate: number
  reach: number
  impressions: number
}

export interface UserEngagementStats {
  user_id: string
  posts_created: number
  total_likes_received: number
  total_comments_received: number
  total_shares_received: number
  total_views_received: number
  engagement_rate: number
  top_posts: SocialPost[]
  recent_activity: (SocialPost | SocialComment)[]
}

// Content moderation
export interface ModerationAction {
  id: string
  moderator_id: string
  content_id: string
  content_type: 'post' | 'comment'
  action_type: 'hide' | 'delete' | 'warn' | 'ban'
  reason: string
  duration?: number // For temporary actions
  created_at: string
  
  // Relations
  moderator?: SocialProfile
  content?: SocialPost | SocialComment
}

// Poll system (for future enhancement)
export interface PollOption {
  id: string
  text: string
  vote_count: number
  percentage: number
}

export interface Poll {
  id: string
  question: string
  options: PollOption[]
  total_votes: number
  is_multiple_choice: boolean
  ends_at?: string
  created_at: string
}

// Content scheduling
export interface ScheduledPost {
  id: string
  user_id: string
  post_data: CreatePostRequest
  scheduled_for: string
  status: 'pending' | 'published' | 'cancelled' | 'failed'
  created_at: string
  published_at?: string
  error_message?: string
} 