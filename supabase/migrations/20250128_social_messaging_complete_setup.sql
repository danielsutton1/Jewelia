-- =====================================================
-- COMPLETE SOCIAL NETWORKING & MESSAGING SYSTEM SETUP
-- =====================================================
-- This migration ensures all social and messaging tables are properly created
-- and aligned with the service layer expectations

-- =====================================================
-- 1. SOCIAL NETWORKING FOUNDATION
-- =====================================================

-- User profile extensions for social features
CREATE TABLE IF NOT EXISTS user_profile_extensions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Professional Information
    company_name TEXT,
    job_title TEXT,
    industry TEXT,
    certifications TEXT[],
    awards TEXT[],
    
    -- Social Preferences
    interests TEXT[],
    preferred_networking_topics TEXT[],
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'away', 'offline')),
    
    -- Contact Preferences
    preferred_contact_method TEXT DEFAULT 'message' CHECK (preferred_contact_method IN ('message', 'email', 'phone', 'video_call')),
    response_time_expectation TEXT,
    
    -- Social Settings
    auto_accept_connections BOOLEAN DEFAULT false,
    allow_direct_messages BOOLEAN DEFAULT true,
    show_online_status BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User connections for following/followers
CREATE TABLE IF NOT EXISTS user_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    connection_status TEXT DEFAULT 'pending' CHECK (connection_status IN ('pending', 'accepted', 'rejected', 'blocked')),
    connection_type TEXT DEFAULT 'professional' CHECK (connection_type IN ('professional', 'personal', 'mentor', 'mentee')),
    request_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique connections
    UNIQUE(follower_id, following_id)
);

-- =====================================================
-- 2. SOCIAL CONTENT SYSTEM
-- =====================================================

-- Social posts table (main content)
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Content Information
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video', 'link', 'poll', 'showcase', 'achievement')),
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
    jewelry_category TEXT, -- Jewelry category for filtering
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ DEFAULT NOW()
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post likes table
CREATE TABLE IF NOT EXISTS social_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'wow', 'haha', 'sad', 'angry', 'fire', 'gem')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique likes per user per post
    UNIQUE(post_id, user_id)
);

-- Comment likes table
CREATE TABLE IF NOT EXISTS social_comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES social_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'wow', 'haha', 'sad', 'angry')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post views table (for analytics)
CREATE TABLE IF NOT EXISTS social_post_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    viewer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Can be anonymous
    view_duration INTEGER, -- Time spent viewing in seconds
    view_source TEXT, -- How they found the post (feed, profile, search, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post bookmarks table
CREATE TABLE IF NOT EXISTS social_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique bookmarks per user per post
    UNIQUE(post_id, user_id)
);

-- =====================================================
-- 3. UNIFIED MESSAGING SYSTEM
-- =====================================================

-- Create enums for message types, status, and priority
DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('internal', 'external', 'system', 'notification');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Message threads table
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type message_type NOT NULL DEFAULT 'internal',
    subject TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participants UUID[] NOT NULL DEFAULT '{}',
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type message_type NOT NULL DEFAULT 'internal',
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    subject TEXT,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'markdown')),
    priority message_priority NOT NULL DEFAULT 'normal',
    category TEXT NOT NULL DEFAULT 'general',
    status message_status NOT NULL DEFAULT 'sent',
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    reply_to_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Message attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT,
    mime_type TEXT,
    is_processed BOOLEAN NOT NULL DEFAULT false,
    processing_status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Message reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL,
    reaction_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- Message read receipts table
CREATE TABLE IF NOT EXISTS message_read_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Message notifications table
CREATE TABLE IF NOT EXISTS message_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL DEFAULT 'new_message',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

-- Social posts indexes
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_content_type ON social_posts(content_type);
CREATE INDEX IF NOT EXISTS idx_social_posts_is_public ON social_posts(is_public);
CREATE INDEX IF NOT EXISTS idx_social_posts_tags ON social_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_social_posts_jewelry_category ON social_posts(jewelry_category);

-- Social comments indexes
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_user_id ON social_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_parent_id ON social_comments(parent_comment_id);

-- Social likes indexes
CREATE INDEX IF NOT EXISTS idx_social_post_likes_post_id ON social_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_likes_user_id ON social_post_likes(user_id);

-- User connections indexes
CREATE INDEX IF NOT EXISTS idx_user_connections_follower ON user_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_following ON user_connections(following_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(connection_status);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Message threads indexes
CREATE INDEX IF NOT EXISTS idx_message_threads_participants ON message_threads USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_message_threads_last_message ON message_threads(last_message_at);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profile_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can only access their own data and public content)
CREATE POLICY "Users can view their own profile extensions" ON user_profile_extensions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own profile extensions" ON user_profile_extensions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public posts" ON social_posts
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own posts" ON social_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own posts" ON social_posts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public comments" ON social_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own comments" ON social_comments
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 6. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update engagement counts
CREATE OR REPLACE FUNCTION update_social_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'social_post_likes' THEN
            UPDATE social_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_TABLE_NAME = 'social_comments' THEN
            UPDATE social_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'social_post_likes' THEN
            UPDATE social_posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
        ELSIF TG_TABLE_NAME = 'social_comments' THEN
            UPDATE social_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for engagement counts
CREATE TRIGGER update_post_like_count
    AFTER INSERT OR DELETE ON social_post_likes
    FOR EACH ROW EXECUTE FUNCTION update_social_post_counts();

CREATE TRIGGER update_post_comment_count
    AFTER INSERT OR DELETE ON social_comments
    FOR EACH ROW EXECUTE FUNCTION update_social_post_counts();

-- Function to update message thread timestamps
CREATE OR REPLACE FUNCTION update_message_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE message_threads 
    SET last_message_at = NEW.created_at, updated_at = NOW()
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for message thread updates
CREATE TRIGGER update_thread_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_message_thread_timestamp();

-- =====================================================
-- 7. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample user profile extension if it doesn't exist
INSERT INTO user_profile_extensions (user_id, company_name, job_title, industry, interests)
SELECT 
    u.id,
    'Jewelia CRM',
    'Jewelry Professional',
    'Jewelry & Luxury Goods',
    ARRAY['Diamond Setting', 'Custom Design', 'Customer Service']
FROM auth.users u
WHERE u.email = 'admin@jewelia.com'
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample social post if no posts exist
INSERT INTO social_posts (user_id, content, content_type, tags, jewelry_category, is_public)
SELECT 
    u.id,
    'Welcome to Jewelia CRM! 🎉 This is our first social post showcasing our jewelry management platform.',
    'text',
    ARRAY['welcome', 'jewelry', 'crm'],
    'General',
    true
FROM auth.users u
WHERE u.email = 'admin@jewelia.com'
AND NOT EXISTS (SELECT 1 FROM social_posts LIMIT 1);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

