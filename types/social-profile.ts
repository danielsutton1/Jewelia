export interface SocialProfile {
  id: string
  user_id: string
  
  // Basic Profile Information
  display_name: string
  username: string
  bio: string
  avatar_url: string
  cover_image_url: string
  
  // Social Information
  website_url?: string
  location?: string
  company?: string
  job_title?: string
  industry?: string
  
  // Social Stats
  follower_count: number
  following_count: number
  post_count: number
  like_count: number
  
  // Social Links
  social_links: {
    linkedin?: string
    twitter?: string
    instagram?: string
    facebook?: string
    youtube?: string
    tiktok?: string
    website?: string
  }
  
  // Profile Settings
  is_public: boolean
  show_online_status: boolean
  allow_messages: boolean
  allow_follows: boolean
  
  // Verification & Badges
  is_verified: boolean
  badges: string[]
  
  // Timestamps
  created_at: string
  updated_at: string
  last_active_at: string
}

export interface UserConnection {
  id: string
  follower_id: string
  following_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
  
  // Connection metadata
  follower?: SocialProfile
  following?: SocialProfile
}

export interface UserRelationship {
  id: string
  user_a_id: string
  user_b_id: string
  relationship_type: 'friend' | 'colleague' | 'mentor' | 'mentee' | 'partner'
  status: 'pending' | 'accepted' | 'rejected'
  mutual_connection: boolean
  created_at: string
  updated_at: string
  
  // Relationship metadata
  user_a?: SocialProfile
  user_b?: SocialProfile
}

export interface SocialPreferences {
  id: string
  user_id: string
  
  // Notification Preferences
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  
  // Privacy Preferences
  profile_visibility: 'public' | 'connections' | 'private'
  show_online_status: boolean
  show_last_active: boolean
  allow_search: boolean
  
  // Content Preferences
  content_language: string[]
  content_categories: string[]
  content_rating: 'all' | 'family' | 'professional'
  
  // Connection Preferences
  auto_accept_connections: boolean
  allow_connection_requests: boolean
  allow_messages_from: 'all' | 'connections' | 'none'
  
  created_at: string
  updated_at: string
}

export interface SocialActivity {
  id: string
  user_id: string
  activity_type: 'post' | 'comment' | 'like' | 'share' | 'follow' | 'connection'
  target_type?: 'post' | 'comment' | 'user' | 'group'
  target_id?: string
  metadata: Record<string, any>
  is_public: boolean
  created_at: string
}

export interface SocialBadge {
  id: string
  name: string
  description: string
  icon_url: string
  category: 'achievement' | 'verification' | 'participation' | 'expertise'
  criteria: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  awarded_at: string
  awarded_by?: string
  expires_at?: string
  
  // Badge metadata
  badge?: SocialBadge
} 