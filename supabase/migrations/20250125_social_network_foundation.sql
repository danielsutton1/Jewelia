-- 🔧 SOCIAL NETWORK FOUNDATION MIGRATION
-- This migration creates the core social networking database structure
-- Extends the existing CRM system with social features

-- =====================================================
-- 1. CREATE SOCIAL PROFILE TABLES
-- =====================================================

-- Social profiles table (extends existing users)
CREATE TABLE IF NOT EXISTS social_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Basic Profile Information
    display_name VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    cover_image_url TEXT,
    
    -- Social Information
    website_url TEXT,
    location VARCHAR(255),
    company VARCHAR(255),
    job_title VARCHAR(255),
    industry VARCHAR(100),
    
    -- Social Stats (computed fields)
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- Social Links (JSONB for flexibility)
    social_links JSONB DEFAULT '{}',
    
    -- Profile Settings
    is_public BOOLEAN DEFAULT true,
    show_online_status BOOLEAN DEFAULT true,
    allow_messages BOOLEAN DEFAULT true,
    allow_follows BOOLEAN DEFAULT true,
    
    -- Verification & Badges
    is_verified BOOLEAN DEFAULT false,
    badges TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User connections table (followers/following)
CREATE TABLE IF NOT EXISTS user_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique connections
    UNIQUE(follower_id, following_id)
);

-- User relationships table (more specific than connections)
CREATE TABLE IF NOT EXISTS user_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_a_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_b_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_type TEXT DEFAULT 'friend' CHECK (relationship_type IN ('friend', 'colleague', 'mentor', 'mentee', 'partner')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    mutual_connection BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique relationships
    UNIQUE(user_a_id, user_b_id)
);

-- Social preferences table
CREATE TABLE IF NOT EXISTS social_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Notification Preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    
    -- Privacy Preferences
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'connections', 'private')),
    show_online_status BOOLEAN DEFAULT true,
    show_last_active BOOLEAN DEFAULT true,
    allow_search BOOLEAN DEFAULT true,
    
    -- Content Preferences
    content_language TEXT[] DEFAULT '{en}',
    content_categories TEXT[] DEFAULT '{}',
    content_rating TEXT DEFAULT 'all' CHECK (content_rating IN ('all', 'family', 'professional')),
    
    -- Connection Preferences
    auto_accept_connections BOOLEAN DEFAULT false,
    allow_connection_requests BOOLEAN DEFAULT true,
    allow_messages_from TEXT DEFAULT 'connections' CHECK (allow_messages_from IN ('all', 'connections', 'none')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social activity table (user activity feed)
CREATE TABLE IF NOT EXISTS social_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('post', 'comment', 'like', 'share', 'follow', 'connection')),
    target_type TEXT CHECK (target_type IN ('post', 'comment', 'user', 'group')),
    target_id UUID,
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social badges table
CREATE TABLE IF NOT EXISTS social_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    category TEXT DEFAULT 'achievement' CHECK (category IN ('achievement', 'verification', 'participation', 'expertise')),
    criteria TEXT,
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges table (junction table)
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES social_badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    awarded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure unique user-badge combinations
    UNIQUE(user_id, badge_id)
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Social profiles indexes
CREATE INDEX idx_social_profiles_user_id ON social_profiles(user_id);
CREATE INDEX idx_social_profiles_username ON social_profiles(username);
CREATE INDEX idx_social_profiles_is_public ON social_profiles(is_public);
CREATE INDEX idx_social_profiles_industry ON social_profiles(industry);
CREATE INDEX idx_social_profiles_location ON social_profiles(location);

-- User connections indexes
CREATE INDEX idx_user_connections_follower_id ON user_connections(follower_id);
CREATE INDEX idx_user_connections_following_id ON user_connections(following_id);
CREATE INDEX idx_user_connections_status ON user_connections(status);
CREATE INDEX idx_user_connections_created_at ON user_connections(created_at);

-- User relationships indexes
CREATE INDEX idx_user_relationships_user_a_id ON user_relationships(user_a_id);
CREATE INDEX idx_user_relationships_user_b_id ON user_relationships(user_b_id);
CREATE INDEX idx_user_relationships_type ON user_relationships(relationship_type);
CREATE INDEX idx_user_relationships_status ON user_relationships(status);

-- Social activities indexes
CREATE INDEX idx_social_activities_user_id ON social_activities(user_id);
CREATE INDEX idx_social_activities_type ON social_activities(activity_type);
CREATE INDEX idx_social_activities_target ON social_activities(target_type, target_id);
CREATE INDEX idx_social_activities_created_at ON social_activities(created_at DESC);
CREATE INDEX idx_social_activities_public ON social_activities(is_public, created_at DESC);

-- User badges indexes
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_awarded_at ON user_badges(awarded_at DESC);

-- =====================================================
-- 3. CREATE TRIGGERS FOR COMPUTED FIELDS
-- =====================================================

-- Function to update follower count
CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE social_profiles 
        SET follower_count = follower_count + 1,
            updated_at = NOW()
        WHERE user_id = NEW.following_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE social_profiles 
        SET follower_count = GREATEST(follower_count - 1, 0),
            updated_at = NOW()
        WHERE user_id = OLD.following_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update following count
CREATE OR REPLACE FUNCTION update_following_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE social_profiles 
        SET following_count = following_count + 1,
            updated_at = NOW()
        WHERE user_id = NEW.follower_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE social_profiles 
        SET following_count = GREATEST(following_count - 1, 0),
            updated_at = NOW()
        WHERE user_id = OLD.follower_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update last active timestamp
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE social_profiles 
    SET last_active_at = NOW()
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_follower_count
    AFTER INSERT OR DELETE ON user_connections
    FOR EACH ROW EXECUTE FUNCTION update_follower_count();

CREATE TRIGGER trigger_update_following_count
    AFTER INSERT OR DELETE ON user_connections
    FOR EACH ROW EXECUTE FUNCTION update_following_count();

CREATE TRIGGER trigger_update_last_active
    AFTER INSERT ON social_activities
    FOR EACH ROW EXECUTE FUNCTION update_last_active();

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all social tables
ALTER TABLE social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- Social profiles policies
CREATE POLICY "Users can view public profiles" ON social_profiles
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON social_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON social_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User connections policies
CREATE POLICY "Users can view their connections" ON user_connections
    FOR SELECT USING (
        auth.uid() = follower_id OR 
        auth.uid() = following_id
    );

CREATE POLICY "Users can create connections" ON user_connections
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can update their connections" ON user_connections
    FOR UPDATE USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can delete their connections" ON user_connections
    FOR DELETE USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Social preferences policies
CREATE POLICY "Users can view their own preferences" ON social_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences" ON social_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Social activities policies
CREATE POLICY "Users can view public activities" ON social_activities
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" ON social_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" ON social_activities
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities" ON social_activities
    FOR DELETE USING (auth.uid() = user_id);

-- Social badges policies (public read, admin write)
CREATE POLICY "Anyone can view badges" ON social_badges
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage badges" ON social_badges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- User badges policies
CREATE POLICY "Users can view their own badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Only admins can award badges" ON user_badges
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- =====================================================
-- 6. INSERT DEFAULT BADGES
-- =====================================================

INSERT INTO social_badges (name, description, icon_url, category, criteria, rarity) VALUES
('First Connection', 'Made your first connection on the platform', '/badges/first-connection.svg', 'participation', 'Connect with another user', 'common'),
('Active User', 'Been active on the platform for 30 days', '/badges/active-user.svg', 'participation', 'Use the platform for 30 consecutive days', 'common'),
('Network Builder', 'Connected with 50+ users', '/badges/network-builder.svg', 'achievement', 'Reach 50 connections', 'rare'),
('Community Leader', 'Created and managed a successful community', '/badges/community-leader.svg', 'expertise', 'Lead a community with 100+ members', 'epic'),
('Verified Professional', 'Verified professional in the jewelry industry', '/badges/verified-professional.svg', 'verification', 'Complete professional verification process', 'legendary')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON social_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_relationships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_activities TO authenticated;
GRANT SELECT ON social_badges TO authenticated;
GRANT SELECT ON user_badges TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 8. VERIFICATION
-- =====================================================

-- Verify tables were created
SELECT 
    table_name,
    row_count
FROM (
    SELECT 'social_profiles' as table_name, COUNT(*) as row_count FROM social_profiles
    UNION ALL
    SELECT 'user_connections', COUNT(*) FROM user_connections
    UNION ALL
    SELECT 'user_relationships', COUNT(*) FROM user_relationships
    UNION ALL
    SELECT 'social_preferences', COUNT(*) FROM social_preferences
    UNION ALL
    SELECT 'social_activities', COUNT(*) FROM social_activities
    UNION ALL
    SELECT 'social_badges', COUNT(*) FROM social_badges
    UNION ALL
    SELECT 'user_badges', COUNT(*) FROM user_badges
) t;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename LIKE 'social_%' OR tablename LIKE 'user_%'
ORDER BY tablename; 