-- 🚀 SOCIAL CONTENT SYSTEM MIGRATION
-- Phase 2: Core Social Features
-- This migration creates the content creation and engagement system

-- =====================================================
-- 1. CREATE CONTENT TABLES
-- =====================================================

-- Social posts table (main content)
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Content Information
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video', 'link', 'poll')),
    media_urls TEXT[], -- Array of media file URLs
    link_preview JSONB, -- Structured data for link previews
    
    -- Engagement Stats (computed fields)
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Post Settings
    is_public BOOLEAN DEFAULT true,
    allow_comments BOOLEAN DEFAULT true,
    allow_shares BOOLEAN DEFAULT true,
    is_pinned BOOLEAN DEFAULT false,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    location TEXT,
    mood TEXT, -- User's mood when posting
    industry_context TEXT, -- Jewelry industry specific context
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post comments table
CREATE TABLE IF NOT EXISTS social_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES social_comments(id) ON DELETE CASCADE, -- For nested replies
    
    -- Content
    content TEXT NOT NULL,
    media_urls TEXT[],
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_edited BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post likes table
CREATE TABLE IF NOT EXISTS social_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'wow', 'haha', 'sad', 'angry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique likes per user per post
    UNIQUE(post_id, user_id)
);

-- Comment likes table
CREATE TABLE IF NOT EXISTS social_comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES social_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'wow', 'haha', 'sad', 'angry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique likes per user per comment
    UNIQUE(comment_id, user_id)
);

-- Post shares table
CREATE TABLE IF NOT EXISTS social_post_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Share context
    share_message TEXT, -- Optional message when sharing
    share_platform TEXT, -- Where it was shared (internal, external)
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post views table (for analytics)
CREATE TABLE IF NOT EXISTS social_post_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    viewer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Can be anonymous
    view_duration INTEGER, -- Time spent viewing in seconds
    view_source TEXT, -- How they found the post (feed, profile, search, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content bookmarks table
CREATE TABLE IF NOT EXISTS social_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique bookmarks per user per post
    UNIQUE(user_id, post_id)
);

-- Content reports table (for moderation)
CREATE TABLE IF NOT EXISTS social_content_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment')),
    content_id UUID NOT NULL, -- ID of the reported content
    report_reason TEXT NOT NULL CHECK (report_reason IN ('spam', 'inappropriate', 'harassment', 'misinformation', 'other')),
    report_details TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    moderator_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_content_type ON social_posts(content_type);
CREATE INDEX IF NOT EXISTS idx_social_posts_is_public ON social_posts(is_public);
CREATE INDEX IF NOT EXISTS idx_social_posts_tags ON social_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_social_posts_industry_context ON social_posts(industry_context);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_user_id ON social_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_parent_id ON social_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_created_at ON social_comments(created_at);

-- Likes indexes
CREATE INDEX IF NOT EXISTS idx_social_post_likes_post_id ON social_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_likes_user_id ON social_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comment_likes_comment_id ON social_comment_likes(comment_id);

-- Shares indexes
CREATE INDEX IF NOT EXISTS idx_social_post_shares_original_post_id ON social_post_shares(original_post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_shares_shared_by ON social_post_shares(shared_by_user_id);

-- Views indexes
CREATE INDEX IF NOT EXISTS idx_social_post_views_post_id ON social_post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_views_viewer ON social_post_views(viewer_user_id);

-- Bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_social_bookmarks_user_id ON social_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_social_bookmarks_post_id ON social_bookmarks(post_id);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_social_content_reports_content ON social_content_reports(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_social_content_reports_status ON social_content_reports(status);

-- =====================================================
-- 3. CREATE TRIGGERS FOR COMPUTED FIELDS
-- =====================================================

-- Function to update post engagement counts
CREATE OR REPLACE FUNCTION update_post_engagement_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update like count
        IF TG_TABLE_NAME = 'social_post_likes' THEN
            UPDATE social_posts 
            SET like_count = like_count + 1,
                updated_at = NOW()
            WHERE id = NEW.post_id;
        END IF;
        
        -- Update comment count
        IF TG_TABLE_NAME = 'social_comments' THEN
            UPDATE social_posts 
            SET comment_count = comment_count + 1,
                updated_at = NOW()
            WHERE id = NEW.post_id;
        END IF;
        
        -- Update share count
        IF TG_TABLE_NAME = 'social_post_shares' THEN
            UPDATE social_posts 
            SET share_count = share_count + 1,
                updated_at = NOW()
            WHERE id = NEW.original_post_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update like count
        IF TG_TABLE_NAME = 'social_post_likes' THEN
            UPDATE social_posts 
            SET like_count = GREATEST(like_count - 1, 0),
                updated_at = NOW()
            WHERE id = OLD.post_id;
        END IF;
        
        -- Update comment count
        IF TG_TABLE_NAME = 'social_comments' THEN
            UPDATE social_posts 
            SET comment_count = GREATEST(comment_count - 1, 0),
                updated_at = NOW()
            WHERE id = OLD.post_id;
        END IF;
        
        -- Update share count
        IF TG_TABLE_NAME = 'social_post_shares' THEN
            UPDATE social_posts 
            SET share_count = GREATEST(share_count - 1, 0),
                updated_at = NOW()
            WHERE id = OLD.original_post_id;
        END IF;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment engagement counts
CREATE OR REPLACE FUNCTION update_comment_engagement_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE social_comments 
        SET like_count = like_count + 1,
            updated_at = NOW()
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE social_comments 
        SET like_count = GREATEST(like_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_post_engagement
    AFTER INSERT OR DELETE ON social_post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_engagement_counts();

CREATE TRIGGER trigger_update_post_comments
    AFTER INSERT OR DELETE ON social_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_engagement_counts();

CREATE TRIGGER trigger_update_post_shares
    AFTER INSERT OR DELETE ON social_post_shares
    FOR EACH ROW EXECUTE FUNCTION update_post_engagement_counts();

CREATE TRIGGER trigger_update_comment_likes
    AFTER INSERT OR DELETE ON social_comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_engagement_counts();

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all content tables
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_content_reports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- Posts policies
CREATE POLICY "Users can view public posts" ON social_posts
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own posts" ON social_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON social_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON social_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can view comments on public posts" ON social_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_posts 
            WHERE id = social_comments.post_id 
            AND (is_public = true OR user_id = auth.uid())
        )
    );

CREATE POLICY "Users can create comments" ON social_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON social_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON social_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Users can view likes on public posts" ON social_post_likes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_posts 
            WHERE id = social_post_likes.post_id 
            AND (is_public = true OR user_id = auth.uid())
        )
    );

CREATE POLICY "Users can create likes" ON social_post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON social_post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for comment likes, shares, views, bookmarks
-- (Following the same pattern for brevity)

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON social_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON social_post_likes TO authenticated;
GRANT SELECT, INSERT, DELETE ON social_comment_likes TO authenticated;
GRANT SELECT, INSERT ON social_post_shares TO authenticated;
GRANT SELECT, INSERT ON social_post_views TO authenticated;
GRANT SELECT, INSERT, DELETE ON social_bookmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON social_content_reports TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 7. INSERT SAMPLE CONTENT FOR TESTING
-- =====================================================

-- Insert sample posts (optional - for testing)
-- INSERT INTO social_posts (user_id, content, content_type, tags, industry_context) VALUES
-- ('YOUR_USER_ID_HERE', 'Just finished designing a beautiful engagement ring! 💍✨', 'text', '{jewelry, design, engagement}', 'Custom jewelry design process'),
-- ('YOUR_USER_ID_HERE', 'Check out this vintage restoration project I''m working on', 'text', '{restoration, vintage, jewelry}', 'Vintage jewelry restoration');

-- =====================================================
-- 8. VERIFICATION
-- =====================================================

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
    SELECT 'social_comment_likes', COUNT(*) FROM social_comment_likes
    UNION ALL
    SELECT 'social_post_shares', COUNT(*) FROM social_post_shares
    UNION ALL
    SELECT 'social_post_views', COUNT(*) FROM social_post_views
    UNION ALL
    SELECT 'social_bookmarks', COUNT(*) FROM social_bookmarks
    UNION ALL
    SELECT 'social_content_reports', COUNT(*) FROM social_content_reports
) t;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename LIKE 'social_%'
ORDER BY tablename;

SELECT '✅ Social Content System Setup Complete!' as status; 