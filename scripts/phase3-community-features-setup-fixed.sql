-- =====================================================
-- PHASE 3: COMMUNITY FEATURES SETUP (FIXED VERSION)
-- Groups, Events, Enhanced Messaging, Content Moderation
-- =====================================================

-- 1. GROUPS & COMMUNITIES SYSTEM
-- =====================================================

-- Community groups table
CREATE TABLE IF NOT EXISTS social_communities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    category VARCHAR(100) NOT NULL, -- 'jewelry_design', 'gemology', 'business', 'education', etc.
    privacy_level VARCHAR(20) DEFAULT 'public' CHECK (privacy_level IN ('public', 'private', 'secret')),
    member_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community members with roles
CREATE TABLE IF NOT EXISTS social_community_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID NOT NULL REFERENCES social_communities(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(community_id, user_id)
);

-- Community posts (separate from main social posts)
CREATE TABLE IF NOT EXISTS social_community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID NOT NULL REFERENCES social_communities(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video', 'link', 'poll')),
    media_urls TEXT[],
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT false,
    is_announcement BOOLEAN DEFAULT false,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. EVENTS & CALENDAR SYSTEM
-- =====================================================

-- Social events table
CREATE TABLE IF NOT EXISTS social_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('meetup', 'workshop', 'webinar', 'conference', 'networking', 'other')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    location_type VARCHAR(20) DEFAULT 'online' CHECK (location_type IN ('online', 'in_person', 'hybrid')),
    location_address TEXT,
    online_meeting_url TEXT,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT true,
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    organizer_id TEXT NOT NULL,
    community_id UUID REFERENCES social_communities(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event participants and RSVPs
CREATE TABLE IF NOT EXISTS social_event_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES social_events(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'maybe' CHECK (status IN ('going', 'not_going', 'maybe')),
    rsvp_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    UNIQUE(event_id, user_id)
);

-- 3. ENHANCED MESSAGING SYSTEM
-- =====================================================

-- Direct messages between users
CREATE TABLE IF NOT EXISTS social_direct_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL,
    recipient_id TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice')),
    media_url TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group chat messages
CREATE TABLE IF NOT EXISTS social_group_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL, -- This will reference a community or custom group
    sender_id TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice')),
    media_url TEXT,
    reply_to_message_id UUID REFERENCES social_group_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message threads for organization
CREATE TABLE IF NOT EXISTS social_message_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255),
    thread_type VARCHAR(20) DEFAULT 'direct' CHECK (thread_type IN ('direct', 'group', 'community')),
    participants TEXT[] NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CONTENT MODERATION SYSTEM
-- =====================================================

-- Community guidelines
CREATE TABLE IF NOT EXISTS social_community_guidelines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID REFERENCES social_communities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'posting', 'behavior', 'commercial', 'other')),
    is_active BOOLEAN DEFAULT true,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced content reports table (extends existing social_content_reports)
-- Note: We'll add new columns to the existing table instead of creating a new one
ALTER TABLE IF EXISTS social_content_reports 
ADD COLUMN IF NOT EXISTS reported_content_type VARCHAR(20) CHECK (reported_content_type IN ('post', 'comment', 'user', 'community', 'event'));

ALTER TABLE IF EXISTS social_content_reports 
ADD COLUMN IF NOT EXISTS report_status VARCHAR(20) DEFAULT 'pending' CHECK (report_status IN ('pending', 'investigating', 'resolved', 'dismissed'));

ALTER TABLE IF EXISTS social_content_reports 
ADD COLUMN IF NOT EXISTS moderation_action VARCHAR(50) CHECK (moderation_action IN (
    'warning', 'content_removal', 'temporary_ban', 'permanent_ban', 'no_action'
));

ALTER TABLE IF EXISTS social_content_reports 
ADD COLUMN IF NOT EXISTS action_duration INTERVAL;

-- Moderation actions log
CREATE TABLE IF NOT EXISTS social_moderation_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    moderator_id TEXT NOT NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'content_removal', 'user_warning', 'user_suspension', 'user_ban', 
        'community_warning', 'community_suspension', 'content_approval'
    )),
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('user', 'post', 'comment', 'community', 'event')),
    target_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    action_details TEXT,
    duration INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Community indexes
CREATE INDEX IF NOT EXISTS idx_communities_category ON social_communities(category);
CREATE INDEX IF NOT EXISTS idx_communities_privacy ON social_communities(privacy_level);
CREATE INDEX IF NOT EXISTS idx_communities_created_by ON social_communities(created_by);
CREATE INDEX IF NOT EXISTS idx_communities_slug ON social_communities(slug);

-- Community members indexes
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON social_community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_role ON social_community_members(role);
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON social_community_members(community_id);

-- Community posts indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_community_id ON social_community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON social_community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON social_community_posts(created_at);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_start_date ON social_events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON social_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON social_events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_community_id ON social_events(community_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON social_events(status);

-- Event participants indexes
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON social_event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON social_event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON social_event_participants(status);

-- Messaging indexes
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_recipient ON social_direct_messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON social_direct_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON social_group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_sender_id ON social_group_messages(sender_id);

-- Moderation indexes
CREATE INDEX IF NOT EXISTS idx_moderation_actions_moderator_id ON social_moderation_actions(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_target_type_id ON social_moderation_actions(target_type, target_id);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update community member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE social_communities 
        SET member_count = member_count + 1 
        WHERE id = NEW.community_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE social_communities 
        SET member_count = member_count - 1 
        WHERE id = OLD.community_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_community_member_count
    AFTER INSERT OR DELETE ON social_community_members
    FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- Update community post count
CREATE OR REPLACE FUNCTION update_community_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE social_communities 
        SET post_count = post_count + 1 
        WHERE id = NEW.community_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE social_communities 
        SET post_count = post_count - 1 
        WHERE id = OLD.community_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_community_post_count
    AFTER INSERT OR DELETE ON social_community_posts
    FOR EACH ROW EXECUTE FUNCTION update_community_post_count();

-- Update event participant count
CREATE OR REPLACE FUNCTION update_event_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'going' THEN
        UPDATE social_events 
        SET current_participants = current_participants + 1 
        WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'going' AND NEW.status = 'going' THEN
            UPDATE social_events 
            SET current_participants = current_participants + 1 
            WHERE id = NEW.event_id;
        ELSIF OLD.status = 'going' AND NEW.status != 'going' THEN
            UPDATE social_events 
            SET current_participants = current_participants - 1 
            WHERE id = NEW.event_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'going' THEN
        UPDATE social_events 
        SET current_participants = current_participants - 1 
        WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_event_participant_count
    AFTER INSERT OR UPDATE OR DELETE ON social_event_participants
    FOR EACH ROW EXECUTE FUNCTION update_event_participant_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE social_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_community_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_moderation_actions ENABLE ROW LEVEL SECURITY;

-- Community policies
CREATE POLICY "Communities are viewable by everyone" ON social_communities
    FOR SELECT USING (true);

CREATE POLICY "Users can create communities" ON social_communities
    FOR INSERT WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Community owners can update their communities" ON social_communities
    FOR UPDATE USING (auth.uid()::text = created_by);

CREATE POLICY "Community owners can delete their communities" ON social_communities
    FOR DELETE USING (auth.uid()::text = created_by);

-- Community members policies
CREATE POLICY "Community members are viewable by everyone" ON social_community_members
    FOR SELECT USING (true);

CREATE POLICY "Users can join communities" ON social_community_members
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own membership" ON social_community_members
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can leave communities" ON social_community_members
    FOR DELETE USING (auth.uid()::text = user_id);

-- Community posts policies
CREATE POLICY "Community posts are viewable by community members" ON social_community_posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_community_members 
            WHERE community_id = social_community_posts.community_id 
            AND user_id = auth.uid()::text
        )
    );

CREATE POLICY "Community members can create posts" ON social_community_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM social_community_members 
            WHERE community_id = social_community_posts.community_id 
            AND user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update their own posts" ON social_community_posts
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own posts" ON social_community_posts
    FOR DELETE USING (auth.uid()::text = user_id);

-- Events policies
CREATE POLICY "Events are viewable by everyone" ON social_events
    FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON social_events
    FOR INSERT WITH CHECK (auth.uid()::text = organizer_id);

CREATE POLICY "Event organizers can update their events" ON social_events
    FOR UPDATE USING (auth.uid()::text = organizer_id);

CREATE POLICY "Event organizers can delete their events" ON social_events
    FOR DELETE USING (auth.uid()::text = organizer_id);

-- Event participants policies
CREATE POLICY "Event participants are viewable by everyone" ON social_event_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can RSVP to events" ON social_event_participants
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own RSVPs" ON social_event_participants
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can cancel their RSVPs" ON social_event_participants
    FOR DELETE USING (auth.uid()::text = user_id);

-- Messaging policies
CREATE POLICY "Users can view messages they sent or received" ON social_direct_messages
    FOR SELECT USING (
        auth.uid()::text = sender_id OR auth.uid()::text = recipient_id
    );

CREATE POLICY "Users can send messages" ON social_direct_messages
    FOR INSERT WITH CHECK (auth.uid()::text = sender_id);

CREATE POLICY "Users can update their own messages" ON social_direct_messages
    FOR UPDATE USING (auth.uid()::text = sender_id);

CREATE POLICY "Users can delete their own messages" ON social_direct_messages
    FOR DELETE USING (auth.uid()::text = sender_id);

-- Group messages policies
CREATE POLICY "Group messages are viewable by group members" ON social_group_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_message_threads 
            WHERE id = social_group_messages.group_id 
            AND auth.uid()::text = ANY(participants)
        )
    );

CREATE POLICY "Group members can send messages" ON social_group_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM social_message_threads 
            WHERE id = social_group_messages.group_id 
            AND auth.uid()::text = ANY(participants)
        )
    );

-- Moderation actions policies
CREATE POLICY "Moderators can view moderation actions" ON social_moderation_actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_community_members 
            WHERE user_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Moderators can create moderation actions" ON social_moderation_actions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM social_community_members 
            WHERE user_id = auth.uid()::text 
            AND role IN ('admin', 'moderator')
        )
    );

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON social_communities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_community_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_community_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_event_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_direct_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_group_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_message_threads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_community_guidelines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_moderation_actions TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '🎉 PHASE 3 COMMUNITY FEATURES SETUP COMPLETE!' as status;
SELECT '🏘️ Communities and groups are ready!' as communities;
SELECT '📅 Events and calendar system is active!' as events;
SELECT '💬 Enhanced messaging is configured!' as messaging;
SELECT '🛡️ Content moderation system is ready!' as moderation;
SELECT '🚀 Test the new community features!' as next_step; 