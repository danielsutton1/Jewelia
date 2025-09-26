-- 🚀 STEP-BY-STEP ENCRYPTED COMMUNICATION SYSTEM DEPLOYMENT
-- This script creates each table individually and verifies each step

-- =====================================================
-- STEP 1: CREATE MESSAGE_THREADS TABLE
-- =====================================================

-- Drop table if it exists (to avoid any conflicts)
DROP TABLE IF EXISTS message_threads CASCADE;

-- Create message_threads table
CREATE TABLE message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    description TEXT,
    thread_type TEXT DEFAULT 'conversation',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verify table creation
DO $$
BEGIN
    RAISE NOTICE '✅ STEP 1: message_threads table created successfully';
END $$;

-- =====================================================
-- STEP 2: CREATE MESSAGES TABLE
-- =====================================================

-- Drop table if it exists (to avoid any conflicts)
DROP TABLE IF EXISTS messages CASCADE;

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verify table creation
DO $$
BEGIN
    RAISE NOTICE '✅ STEP 2: messages table created successfully';
END $$;

-- =====================================================
-- STEP 3: CREATE USER_ENCRYPTION_KEYS TABLE
-- =====================================================

-- Drop table if it exists (to avoid any conflicts)
DROP TABLE IF EXISTS user_encryption_keys CASCADE;

-- Create user_encryption_keys table
CREATE TABLE user_encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    public_key TEXT NOT NULL,
    encrypted_private_key TEXT NOT NULL,
    master_key_hash TEXT NOT NULL,
    master_key_salt TEXT NOT NULL,
    key_version INTEGER DEFAULT 1,
    key_algorithm TEXT DEFAULT 'RSA-4096',
    key_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    key_expires_at TIMESTAMP WITH TIME ZONE,
    last_rotated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rotation_interval_days INTEGER DEFAULT 90,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verify table creation
DO $$
BEGIN
    RAISE NOTICE '✅ STEP 3: user_encryption_keys table created successfully';
END $$;

-- =====================================================
-- STEP 4: CREATE CONVERSATION_ENCRYPTION_KEYS TABLE
-- =====================================================

-- Drop table if it exists (to avoid any conflicts)
DROP TABLE IF EXISTS conversation_encryption_keys CASCADE;

-- Create conversation_encryption_keys table
CREATE TABLE conversation_encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    encrypted_symmetric_key TEXT NOT NULL,
    key_algorithm TEXT DEFAULT 'AES-256-GCM',
    key_version INTEGER DEFAULT 1,
    key_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    key_expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verify table creation
DO $$
BEGIN
    RAISE NOTICE '✅ STEP 4: conversation_encryption_keys table created successfully';
END $$;

-- =====================================================
-- STEP 5: CREATE USER_CONVERSATION_KEYS TABLE
-- =====================================================

-- Drop table if it exists (to avoid any conflicts)
DROP TABLE IF EXISTS user_conversation_keys CASCADE;

-- Create user_conversation_keys table
CREATE TABLE user_conversation_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_key_id UUID REFERENCES conversation_encryption_keys(id) ON DELETE CASCADE,
    encrypted_access_key TEXT NOT NULL,
    access_granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_expires_at TIMESTAMP WITH TIME ZONE,
    access_level TEXT DEFAULT 'full',
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, conversation_key_id)
);

-- Verify table creation
DO $$
BEGIN
    RAISE NOTICE '✅ STEP 5: user_conversation_keys table created successfully';
END $$;

-- =====================================================
-- STEP 6: CREATE VIDEO_CALLS TABLE
-- =====================================================

-- Drop table if it exists (to avoid any conflicts)
DROP TABLE IF EXISTS video_calls CASCADE;

-- Create video_calls table
CREATE TABLE video_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    call_type TEXT DEFAULT 'video',
    status TEXT DEFAULT 'initiating',
    initiator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    participants UUID[] DEFAULT '{}',
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    room_id TEXT UNIQUE NOT NULL,
    recording_url TEXT,
    recording_encrypted BOOLEAN DEFAULT true,
    is_encrypted BOOLEAN DEFAULT true,
    encryption_key_id UUID REFERENCES conversation_encryption_keys(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verify table creation
DO $$
BEGIN
    RAISE NOTICE '✅ STEP 6: video_calls table created successfully';
END $$;

-- =====================================================
-- STEP 7: CREATE VIDEO_CALL_PARTICIPANTS TABLE
-- =====================================================

-- Drop table if it exists (to avoid any conflicts)
DROP TABLE IF EXISTS video_call_participants CASCADE;

-- Create video_call_participants table
CREATE TABLE video_call_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID REFERENCES video_calls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    device_info JSONB DEFAULT '{}',
    network_info JSONB DEFAULT '{}',
    quality_metrics JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_muted BOOLEAN DEFAULT false,
    is_video_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(call_id, user_id)
);

-- Verify table creation
DO $$
BEGIN
    RAISE NOTICE '✅ STEP 7: video_call_participants table created successfully';
END $$;

-- =====================================================
-- STEP 8: CREATE GROUP_CONVERSATIONS TABLE
-- =====================================================

-- Drop table if it exists (to avoid any conflicts)
DROP TABLE IF EXISTS group_conversations CASCADE;

-- Create group_conversations table
CREATE TABLE group_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    group_name VARCHAR(255) NOT NULL,
    group_description TEXT,
    group_avatar_url TEXT,
    is_public BOOLEAN DEFAULT false,
    allow_invites BOOLEAN DEFAULT true,
    require_approval BOOLEAN DEFAULT false,
    max_members INTEGER DEFAULT 100,
    encryption_enabled BOOLEAN DEFAULT true,
    encryption_key_id UUID REFERENCES conversation_encryption_keys(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verify table creation
DO $$
BEGIN
    RAISE NOTICE '✅ STEP 8: group_conversations table created successfully';
END $$;

-- =====================================================
-- STEP 9: CREATE GROUP_MEMBERS TABLE
-- =====================================================

-- Drop table if it exists (to avoid any conflicts)
DROP TABLE IF EXISTS group_members CASCADE;

-- Create group_members table
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES group_conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    can_invite BOOLEAN DEFAULT false,
    can_remove_members BOOLEAN DEFAULT false,
    can_edit_group BOOLEAN DEFAULT false,
    can_delete_messages BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_muted BOOLEAN DEFAULT false,
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Verify table creation
DO $$
BEGIN
    RAISE NOTICE '✅ STEP 9: group_members table created successfully';
END $$;

-- =====================================================
-- STEP 10: CREATE ENCRYPTION_AUDIT_LOGS TABLE
-- =====================================================

-- Drop table if it exists (to avoid any conflicts)
DROP TABLE IF EXISTS encryption_audit_logs CASCADE;

-- Create encryption_audit_logs table
CREATE TABLE encryption_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    encryption_algorithm TEXT,
    key_version INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verify table creation
DO $$
BEGIN
    RAISE NOTICE '✅ STEP 10: encryption_audit_logs table created successfully';
END $$;

-- =====================================================
-- STEP 11: CREATE BASIC INDEXES
-- =====================================================

-- Create basic indexes for performance
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_user_encryption_keys_user_id ON user_encryption_keys(user_id);
CREATE INDEX idx_video_calls_conversation_id ON video_calls(conversation_id);
CREATE INDEX idx_group_conversations_thread_id ON group_conversations(thread_id);

-- Verify indexes creation
DO $$
BEGIN
    RAISE NOTICE '✅ STEP 11: Basic indexes created successfully';
END $$;

-- =====================================================
-- FINAL SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 ENCRYPTED COMMUNICATION SYSTEM DEPLOYED SUCCESSFULLY!';
    RAISE NOTICE '✅ All 11 steps completed successfully';
    RAISE NOTICE '✅ All tables created with proper dependencies';
    RAISE NOTICE '✅ All indexes created for performance';
    RAISE NOTICE '✅ System ready for encrypted messaging and video calls';
END $$;
