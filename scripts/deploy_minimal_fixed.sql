-- 🚀 MINIMAL ENCRYPTED COMMUNICATION SYSTEM DEPLOYMENT
-- This script creates only the essential tables in the correct order

-- =====================================================
-- STEP 1: CREATE BASE TABLES FIRST
-- =====================================================

-- Create message_threads table
CREATE TABLE IF NOT EXISTS message_threads (
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

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
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

-- =====================================================
-- STEP 2: CREATE ENCRYPTION TABLES
-- =====================================================

-- User encryption keys
CREATE TABLE IF NOT EXISTS user_encryption_keys (
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

-- Conversation encryption keys
CREATE TABLE IF NOT EXISTS conversation_encryption_keys (
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

-- User access to conversation keys
CREATE TABLE IF NOT EXISTS user_conversation_keys (
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

-- =====================================================
-- STEP 3: CREATE VIDEO CALL TABLES
-- =====================================================

-- Video call sessions
CREATE TABLE IF NOT EXISTS video_calls (
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

-- Video call participants
CREATE TABLE IF NOT EXISTS video_call_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID REFERENCES video_calls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- =====================================================
-- STEP 4: CREATE GROUP CONVERSATION TABLES
-- =====================================================

-- Group conversations
CREATE TABLE IF NOT EXISTS group_conversations (
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

-- Group members
CREATE TABLE IF NOT EXISTS group_members (
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

-- =====================================================
-- STEP 5: CREATE AUDIT LOG TABLE
-- =====================================================

-- Encryption audit logs
CREATE TABLE IF NOT EXISTS encryption_audit_logs (
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

-- =====================================================
-- STEP 6: CREATE BASIC INDEXES
-- =====================================================

-- Basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_encryption_keys_user_id ON user_encryption_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_conversation_id ON video_calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_group_conversations_thread_id ON group_conversations(thread_id);

-- =====================================================
-- STEP 7: SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 MINIMAL ENCRYPTED COMMUNICATION SYSTEM DEPLOYED!';
    RAISE NOTICE '✅ Base tables created';
    RAISE NOTICE '✅ Encryption tables created';
    RAISE NOTICE '✅ Video call tables created';
    RAISE NOTICE '✅ Group conversation tables created';
    RAISE NOTICE '✅ Basic indexes created';
    RAISE NOTICE '✅ System ready for encrypted messaging and video calls';
END $$;
