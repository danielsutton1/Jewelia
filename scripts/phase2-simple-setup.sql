-- 🚀 PHASE 2: SIMPLE SOCIAL CONTENT SYSTEM SETUP
-- This script creates the basic structure without complex foreign keys
-- Run this in your Supabase Dashboard SQL Editor

-- =====================================================
-- STEP 1: CHECK YOUR CURRENT DATABASE STRUCTURE
-- =====================================================

-- First, let's see what you have
SELECT 'Current database structure:' as info;

-- Check what tables exist
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name;

-- Check if you have any user-related tables
SELECT 'User tables found:' as info;
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name LIKE '%user%' 
AND table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name;

-- =====================================================
-- STEP 2: CREATE BASIC SOCIAL TABLES (NO FOREIGN KEYS YET)
-- =====================================================

SELECT 'Creating social content tables...' as info;

-- Social posts table
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT, -- Using TEXT instead of UUID to avoid foreign key issues
    
    -- Content Information
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video', 'link', 'poll')),
    media_urls TEXT[] DEFAULT '{}',
    
    -- Engagement Stats
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Post Settings
    is_public BOOLEAN DEFAULT true,
    allow_comments BOOLEAN DEFAULT true,
    allow_shares BOOLEAN DEFAULT true,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    location TEXT,
    industry_context TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post comments table
CREATE TABLE IF NOT EXISTS social_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID,
    user_id TEXT,
    parent_comment_id UUID,
    
    -- Content
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post likes table
CREATE TABLE IF NOT EXISTS social_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID,
    user_id TEXT,
    reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'wow', 'haha', 'sad', 'angry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique likes per user per post
    UNIQUE(post_id, user_id)
);

-- Post shares table
CREATE TABLE IF NOT EXISTS social_post_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_post_id UUID,
    shared_by_user_id TEXT,
    share_message TEXT,
    share_platform TEXT DEFAULT 'internal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content bookmarks table
CREATE TABLE IF NOT EXISTS social_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT,
    post_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique bookmarks per user per post
    UNIQUE(user_id, post_id)
);

SELECT 'Basic tables created successfully!' as success;

-- =====================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

SELECT 'Creating performance indexes...' as info;

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_content_type ON social_posts(content_type);
CREATE INDEX IF NOT EXISTS idx_social_posts_is_public ON social_posts(is_public);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_user_id ON social_comments(user_id);

-- Likes indexes
CREATE INDEX IF NOT EXISTS idx_social_post_likes_post_id ON social_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_likes_user_id ON social_post_likes(user_id);

-- Shares indexes
CREATE INDEX IF NOT EXISTS idx_social_post_shares_original_post_id ON social_post_shares(original_post_id);

-- Bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_social_bookmarks_user_id ON social_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_social_bookmarks_post_id ON social_bookmarks(post_id);

SELECT 'Indexes created successfully!' as success;

-- =====================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

SELECT 'Enabling Row Level Security...' as info;

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_bookmarks ENABLE ROW LEVEL SECURITY;

SELECT 'RLS enabled successfully!' as success;

-- =====================================================
-- STEP 5: CREATE BASIC RLS POLICIES
-- =====================================================

SELECT 'Creating security policies...' as info;

-- Posts policies
CREATE POLICY "Users can view public posts" ON social_posts
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create posts" ON social_posts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own posts" ON social_posts
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own posts" ON social_posts
    FOR DELETE USING (true);

-- Comments policies
CREATE POLICY "Users can view comments" ON social_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON social_comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own comments" ON social_comments
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own comments" ON social_comments
    FOR DELETE USING (true);

-- Likes policies
CREATE POLICY "Users can view likes" ON social_post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can create likes" ON social_post_likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own likes" ON social_post_likes
    FOR DELETE USING (true);

-- Shares policies
CREATE POLICY "Users can view shares" ON social_post_shares
    FOR SELECT USING (true);

CREATE POLICY "Users can create shares" ON social_post_shares
    FOR INSERT WITH CHECK (true);

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks" ON social_bookmarks
    FOR SELECT USING (true);

CREATE POLICY "Users can create bookmarks" ON social_bookmarks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own bookmarks" ON social_bookmarks
    FOR DELETE USING (true);

SELECT 'Security policies created successfully!' as success;

-- =====================================================
-- STEP 6: GRANT PERMISSIONS
-- =====================================================

SELECT 'Granting permissions...' as info;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON social_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON social_post_likes TO authenticated;
GRANT SELECT, INSERT ON social_post_shares TO authenticated;
GRANT SELECT, INSERT, DELETE ON social_bookmarks TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

SELECT 'Permissions granted successfully!' as success;

-- =====================================================
-- STEP 7: VERIFICATION
-- =====================================================

SELECT 'Verifying setup...' as info;

-- Verify tables were created
SELECT 
    table_name,
    row_count
FROM (
    SELECT 'social_posts' as table_name, COUNT(*) as row_count FROM social_posts
    UNION ALL
    SELECT 'social_comments', COUNT(*) FROM social_comments
    UNION ALL
    SELECT 'social_post_likes', COUNT(*) FROM social_post_likes
    UNION ALL
    SELECT 'social_post_shares', COUNT(*) FROM social_post_shares
    UNION ALL
    SELECT 'social_bookmarks', COUNT(*) FROM social_bookmarks
) t;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename LIKE 'social_%'
ORDER BY tablename;

-- =====================================================
-- STEP 8: SUCCESS MESSAGE
-- =====================================================

SELECT '🎉 PHASE 2 SETUP COMPLETE!' as status;
SELECT '✅ Basic social content system is ready!' as info;
SELECT '📝 You can now create posts, comments, and likes' as next_step;
SELECT '🔒 Security policies are in place' as security;
SELECT '🚀 Test it out in your application!' as testing; 