// =====================================================
// PHASE 4: SOCIAL ANALYTICS & INSIGHTS TYPES
// =====================================================

export interface SocialEngagementMetrics {
  // Post engagement
  total_posts: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_views: number;
  
  // Engagement rates
  engagement_rate: number; // (likes + comments + shares) / views
  like_rate: number; // likes / views
  comment_rate: number; // comments / views
  share_rate: number; // shares / views
  
  // User engagement
  active_users: number;
  new_users: number;
  returning_users: number;
  
  // Content performance
  top_performing_posts: number;
  viral_posts: number; // posts with >1000% engagement rate
  trending_topics: string[];
  
  // Time-based metrics
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  
  // Community metrics
  total_communities: number;
  active_communities: number;
  community_growth_rate: number;
  
  // Event metrics
  total_events: number;
  event_participation_rate: number;
  average_event_attendees: number;
}

export interface UserEngagementProfile {
  user_id: string;
  username: string;
  avatar_url?: string;
  
  // Engagement stats
  posts_created: number;
  total_likes_received: number;
  total_comments_received: number;
  total_shares_received: number;
  total_views_received: number;
  
  // Activity metrics
  last_active: string;
  days_since_joined: number;
  engagement_frequency: 'high' | 'medium' | 'low';
  
  // Content performance
  average_engagement_rate: number;
  best_performing_post_id?: string;
  viral_posts_count: number;
  
  // Community involvement
  communities_joined: number;
  communities_created: number;
  moderator_roles: number;
  
  // Event participation
  events_attended: number;
  events_created: number;
  rsvp_rate: number;
}

export interface ContentPerformanceMetrics {
  post_id: string;
  content_preview: string;
  author_id: string;
  author_name: string;
  
  // Engagement metrics
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagement_rate: number;
  
  // Performance indicators
  is_viral: boolean;
  is_trending: boolean;
  reach_multiplier: number; // how many times the post reached beyond author's network
  
  // Time-based metrics
  created_at: string;
  time_to_viral?: number; // hours to reach viral threshold
  peak_engagement_time?: string;
  
  // Audience insights
  audience_demographics: AudienceDemographics;
  engagement_by_hour: HourlyEngagement[];
  top_engagers: TopEngager[];
}

export interface AudienceDemographics {
  age_groups: { [key: string]: number };
  locations: { [key: string]: number };
  interests: { [key: string]: number };
  activity_levels: { [key: string]: number };
}

export interface HourlyEngagement {
  hour: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

export interface TopEngager {
  user_id: string;
  username: string;
  engagement_type: 'like' | 'comment' | 'share';
  engagement_count: number;
  influence_score: number;
}

export interface CommunityAnalytics {
  community_id: string;
  community_name: string;
  
  // Growth metrics
  member_count: number;
  member_growth_rate: number;
  new_members_this_month: number;
  
  // Engagement metrics
  active_members: number;
  posts_this_month: number;
  average_engagement_rate: number;
  
  // Content metrics
  total_posts: number;
  total_comments: number;
  content_quality_score: number;
  
  // Retention metrics
  member_retention_rate: number;
  churn_rate: number;
  average_member_lifespan: number;
  
  // Activity patterns
  peak_activity_hours: number[];
  most_active_days: string[];
  seasonal_trends: SeasonalTrend[];
}

export interface SeasonalTrend {
  month: string;
  member_growth: number;
  engagement_rate: number;
  content_volume: number;
}

export interface EventAnalytics {
  event_id: string;
  event_title: string;
  
  // Attendance metrics
  total_registrations: number;
  actual_attendees: number;
  attendance_rate: number;
  no_show_rate: number;
  
  // Engagement metrics
  pre_event_engagement: number;
  during_event_engagement: number;
  post_event_engagement: number;
  
  // Satisfaction metrics
  average_rating: number;
  feedback_count: number;
  recommendation_rate: number;
  
  // Financial metrics
  revenue_generated: number;
  cost_per_attendee: number;
  roi: number;
}

export interface TrendingTopic {
  topic: string;
  mentions: number;
  growth_rate: number;
  related_posts: number;
  engagement_rate: number;
  sentiment_score: number; // -1 to 1 (negative to positive)
}

export interface SocialInsights {
  // Key performance indicators
  kpis: {
    total_engagement: number;
    engagement_rate: number;
    user_growth_rate: number;
    content_quality_score: number;
    community_health_score: number;
  };
  
  // Trends and patterns
  trends: {
    top_growing_communities: CommunityAnalytics[];
    viral_content: ContentPerformanceMetrics[];
    trending_topics: TrendingTopic[];
    user_engagement_patterns: UserEngagementProfile[];
  };
  
  // Recommendations
  recommendations: {
    content_strategy: string[];
    community_management: string[];
    user_engagement: string[];
    monetization_opportunities: string[];
  };
  
  // Risk indicators
  risks: {
    declining_engagement: boolean;
    user_churn_warning: boolean;
    content_quality_issues: boolean;
    community_moderation_needed: boolean;
  };
}

export interface AnalyticsTimeRange {
  start_date: string;
  end_date: string;
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface AnalyticsFilters {
  user_ids?: string[];
  community_ids?: string[];
  content_types?: string[];
  engagement_thresholds?: {
    min_likes?: number;
    min_comments?: number;
    min_shares?: number;
    min_views?: number;
  };
  date_range?: AnalyticsTimeRange;
}

export interface AnalyticsExport {
  format: 'csv' | 'json' | 'excel' | 'pdf';
  data: SocialEngagementMetrics | UserEngagementProfile[] | ContentPerformanceMetrics[];
  generated_at: string;
  filters_applied: AnalyticsFilters;
} 