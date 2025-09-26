-- 🚀 SOCIAL NETWORK FOUNDATION SETUP
-- Run this script in your Supabase Dashboard SQL Editor
-- This will create all the necessary tables and security policies

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

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Social profiles indexes
CREATE INDEX IF NOT EXISTS idx_social_profiles_user_id ON social_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_social_profiles_username ON social_profiles(username);
CREATE INDEX IF NOT EXISTS idx_social_profiles_is_public ON social_profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_social_profiles_industry ON social_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_social_profiles_location ON social_profiles(location);

-- User connections indexes
CREATE INDEX IF NOT EXISTS idx_user_connections_follower_id ON user_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_following_id ON user_connections(following_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);
CREATE INDEX IF NOT EXISTS idx_user_connections_created_at ON user_connections(created_at);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all social tables
ALTER TABLE social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_preferences ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE RLS POLICIES
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

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON social_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_preferences TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 6. VERIFICATION
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
    SELECT 'social_preferences', COUNT(*) FROM social_preferences
) t;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('social_profiles', 'user_connections', 'social_preferences')
ORDER BY tablename;

-- =====================================================
-- 7. SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert a sample social profile for testing (replace with your user ID)
-- INSERT INTO social_profiles (user_id, display_name, username, bio, industry) 
-- VALUES (
--     'YOUR_USER_ID_HERE', 
--     'Jewelry Professional', 
--     'jewelry_pro', 
--     'Passionate about creating beautiful jewelry and connecting with industry professionals.', 
--     'Jewelry Design'
-- );

-- =====================================================
-- 8. NEXT STEPS
-- =====================================================

-- After running this script:
-- 1. Test the API endpoints at /api/social/profiles
-- 2. Create a social profile for your user
-- 3. Test connection functionality
-- 4. Move to Phase 2: Core Social Features

SELECT '✅ Social Network Foundation Setup Complete!' as status; 