-- 🚀 PHASE 1: SOCIAL NETWORK FOUNDATION
-- This script implements the core social network foundation for Jewelia CRM
-- Run this in your Supabase Dashboard SQL Editor

-- =====================================================
-- STEP 1: EXTEND USER PROFILES WITH SOCIAL FIELDS
-- =====================================================

-- Add social fields to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS 
    bio TEXT;

ALTER TABLE users ADD COLUMN IF NOT EXISTS 
    avatar_url TEXT;

ALTER TABLE users ADD COLUMN IF NOT EXISTS 
    cover_image_url TEXT;

ALTER TABLE users ADD COLUMN IF NOT EXISTS 
    location TEXT;

ALTER TABLE users ADD COLUMN IF NOT EXISTS 
    website TEXT;

ALTER TABLE users ADD COLUMN IF NOT EXISTS 
    social_links JSONB DEFAULT '{}';

ALTER TABLE users ADD COLUMN IF NOT EXISTS 
    specialties TEXT[] DEFAULT '{}';

ALTER TABLE users ADD COLUMN IF NOT EXISTS 
    years_experience INTEGER;

ALTER TABLE users ADD COLUMN IF NOT EXISTS 
    is_public_profile BOOLEAN DEFAULT false;

ALTER TABLE users ADD COLUMN IF NOT EXISTS 
    privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "contact_visibility": "connections", "activity_visibility": "public"}';

ALTER TABLE users ADD COLUMN IF NOT EXISTS 
    social_stats JSONB DEFAULT '{"followers": 0, "following": 0, "posts": 0, "likes_received": 0}';

-- Create user_profile_extensions table for additional social data
CREATE TABLE IF NOT EXISTS user_profile_extensions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Professional Information
    company_name TEXT,
    job_title TEXT,
    industry TEXT,
    certifications TEXT[],
    awards TEXT[],
    
    -- Social Preferences
    interests TEXT[],
    preferred_networking_topics TEXT[],
    availability_status TEXT DEFAULT 'available',
    
    -- Contact Preferences
    preferred_contact_method TEXT DEFAULT 'message',
    response_time_expectation TEXT DEFAULT '24h',
    
    -- Social Settings
    auto_accept_connections BOOLEAN DEFAULT false,
    allow_direct_messages BOOLEAN DEFAULT true,
    show_online_status BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: IMPLEMENT SOCIAL FEED SYSTEM
-- =====================================================

-- Create social posts table (enhanced version)
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content Information
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video', 'link', 'poll', 'showcase', 'achievement')),
    media_urls TEXT[] DEFAULT '{}',
    
    -- Post Settings
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
    allow_comments BOOLEAN DEFAULT true,
    allow_shares BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Engagement Stats
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    location TEXT,
    industry_context TEXT,
    jewelry_category TEXT,
    price_range TEXT,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT true,
    moderation_status TEXT DEFAULT 'approved',
    reported_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced social comments table
CREATE TABLE IF NOT EXISTS social_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES social_comments(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT true,
    reported_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced social interactions table
CREATE TABLE IF NOT EXISTS social_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'wow', 'haha', 'sad', 'angry', 'fire', 'gem')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(post_id, user_id)
);

-- Create social shares table
CREATE TABLE IF NOT EXISTS social_post_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    shared_by_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    share_message TEXT,
    share_visibility TEXT DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social bookmarks table
CREATE TABLE IF NOT EXISTS social_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    folder TEXT DEFAULT 'general',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, post_id)
);

-- =====================================================
-- STEP 3: CREATE BASIC SOCIAL INTERACTIONS
-- =====================================================

-- Create user connections/following system
CREATE TABLE IF NOT EXISTS user_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    connection_status TEXT DEFAULT 'pending' CHECK (connection_status IN ('pending', 'accepted', 'rejected', 'blocked')),
    connection_type TEXT DEFAULT 'professional' CHECK (connection_type IN ('professional', 'personal', 'mentor', 'mentee')),
    
    -- Connection metadata
    mutual_interests TEXT[],
    connection_strength INTEGER DEFAULT 1,
    last_interaction TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id)
);

-- Create connection requests table
CREATE TABLE IF NOT EXISTS connection_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    request_type TEXT DEFAULT 'connection' CHECK (request_type IN ('connection', 'mentorship', 'collaboration')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(requester_id, recipient_id)
);

-- Create user activity log for social feed
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('post_created', 'comment_added', 'like_given', 'connection_made', 'achievement_unlocked')),
    activity_data JSONB,
    visibility TEXT DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 4: CREATE PERFORMANCE INDEXES
-- =====================================================

-- Social posts indexes
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_visibility ON social_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_social_posts_content_type ON social_posts(content_type);
CREATE INDEX IF NOT EXISTS idx_social_posts_tags ON social_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_social_posts_jewelry_category ON social_posts(jewelry_category);
CREATE INDEX IF NOT EXISTS idx_social_posts_is_featured ON social_posts(is_featured);

-- Social interactions indexes
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_user_id ON social_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_social_post_likes_post_id ON social_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_likes_user_id ON social_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_social_post_shares_original_post_id ON social_post_shares(original_post_id);

-- User connections indexes
CREATE INDEX IF NOT EXISTS idx_user_connections_follower_id ON user_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_following_id ON user_connections(following_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(connection_status);
CREATE INDEX IF NOT EXISTS idx_connection_requests_requester_id ON connection_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_recipient_id ON connection_requests(recipient_id);

-- Activity and profile indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_is_public_profile ON users(is_public_profile);
CREATE INDEX IF NOT EXISTS idx_users_specialties ON users USING GIN(specialties);

-- =====================================================
-- STEP 5: CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update social stats when posts are created/deleted
CREATE OR REPLACE FUNCTION update_user_social_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users 
        SET social_stats = jsonb_set(
            COALESCE(social_stats, '{}'),
            '{posts}',
            to_jsonb((COALESCE(social_stats->>'posts', '0')::int + 1))
        )
        WHERE id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users 
        SET social_stats = jsonb_set(
            COALESCE(social_stats, '{}'),
            '{posts}',
            to_jsonb(GREATEST((COALESCE(social_stats->>'posts', '0')::int - 1), 0))
        )
        WHERE id = OLD.user_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update post engagement counts
CREATE OR REPLACE FUNCTION update_post_engagement_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'social_post_likes' THEN
            UPDATE social_posts 
            SET like_count = like_count + 1
            WHERE id = NEW.post_id;
        ELSIF TG_TABLE_NAME = 'social_comments' THEN
            UPDATE social_posts 
            SET comment_count = comment_count + 1
            WHERE id = NEW.post_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'social_post_likes' THEN
            UPDATE social_posts 
            SET like_count = GREATEST(like_count - 1, 0)
            WHERE id = OLD.post_id;
        ELSIF TG_TABLE_NAME = 'social_comments' THEN
            UPDATE social_posts 
            SET comment_count = GREATEST(comment_count - 1, 0)
            WHERE id = OLD.post_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_user_social_stats
    AFTER INSERT OR DELETE ON social_posts
    FOR EACH ROW EXECUTE FUNCTION update_user_social_stats();

CREATE TRIGGER trigger_update_post_like_count
    AFTER INSERT OR DELETE ON social_post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_engagement_counts();

CREATE TRIGGER trigger_update_post_comment_count
    AFTER INSERT OR DELETE ON social_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_engagement_counts();

-- =====================================================
-- STEP 6: CREATE ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all social tables
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_extensions ENABLE ROW LEVEL SECURITY;

-- Social posts policies
CREATE POLICY "Users can view public posts" ON social_posts
    FOR SELECT USING (visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own posts" ON social_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON social_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON social_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Social comments policies
CREATE POLICY "Users can view comments on visible posts" ON social_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_posts 
            WHERE id = social_comments.post_id 
            AND (visibility = 'public' OR auth.uid() = user_id)
        )
    );

CREATE POLICY "Users can create comments" ON social_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON social_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON social_comments
    FOR DELETE USING (auth.uid() = user_id);

-- User connections policies
CREATE POLICY "Users can view their own connections" ON user_connections
    FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create connection requests" ON user_connections
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can update their own connections" ON user_connections
    FOR UPDATE USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- =====================================================
-- STEP 7: INSERT SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample social posts (only if you want to test with sample data)
-- Uncomment the following lines if you want sample data:

/*
INSERT INTO social_posts (user_id, content, content_type, tags, jewelry_category, visibility) VALUES
('your-user-id-here', 'Just finished this beautiful engagement ring! 💍✨', 'showcase', ARRAY['engagement ring', 'diamond', 'custom'], 'rings', 'public'),
('your-user-id-here', 'Excited to share our latest collection of vintage-inspired pieces', 'text', ARRAY['vintage', 'collection', 'jewelry'], 'general', 'public');
*/

-- =====================================================
-- STEP 8: VERIFICATION QUERIES
-- =====================================================

-- Verify the new structure
SELECT '✅ Database schema updated successfully!' as status;

-- Check new user columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('bio', 'avatar_url', 'cover_image_url', 'location', 'website', 'social_links', 'specialties', 'years_experience', 'is_public_profile', 'privacy_settings', 'social_stats')
ORDER BY column_name;

-- Check new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profile_extensions', 'social_posts', 'social_comments', 'social_post_likes', 'social_post_shares', 'social_bookmarks', 'user_connections', 'connection_requests', 'user_activity_log')
ORDER BY table_name;

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('social_posts', 'social_comments', 'user_connections')
ORDER BY tablename, indexname;

SELECT '🚀 Phase 1 Foundation Complete! Ready for frontend implementation.' as next_steps; 