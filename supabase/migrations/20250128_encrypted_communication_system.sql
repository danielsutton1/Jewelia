-- 🔐 ENCRYPTED COMMUNICATION SYSTEM MIGRATION
-- This migration extends the existing messaging system with:
-- 1. End-to-end encryption for messages and files
-- 2. Video call infrastructure
-- 3. Enhanced security protocols
-- 4. Message retention policies
-- 5. Group conversation encryption

-- =====================================================
-- 1. ENCRYPTION KEY MANAGEMENT
-- =====================================================

-- User encryption keys table
CREATE TABLE IF NOT EXISTS user_encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Key pair for asymmetric encryption
    public_key TEXT NOT NULL,
    encrypted_private_key TEXT NOT NULL, -- Encrypted with user's master key
    
    -- Master key for encrypting private keys
    master_key_hash TEXT NOT NULL,
    master_key_salt TEXT NOT NULL,
    
    -- Key metadata
    key_version INTEGER DEFAULT 1,
    key_algorithm TEXT DEFAULT 'RSA-4096',
    key_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    key_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Security metadata
    last_rotated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rotation_interval_days INTEGER DEFAULT 90,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared encryption keys for conversations
CREATE TABLE IF NOT EXISTS conversation_encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    
    -- Encrypted symmetric key for the conversation
    encrypted_symmetric_key TEXT NOT NULL,
    key_algorithm TEXT DEFAULT 'AES-256-GCM',
    
    -- Key metadata
    key_version INTEGER DEFAULT 1,
    key_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    key_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Access control
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
    
    -- User's encrypted access to the conversation key
    encrypted_access_key TEXT NOT NULL,
    
    -- Access metadata
    access_granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_expires_at TIMESTAMP WITH TIME ZONE,
    access_level TEXT DEFAULT 'full' CHECK (access_level IN ('read', 'write', 'full', 'admin')),
    
    -- Security
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, conversation_key_id)
);

-- =====================================================
-- 2. ENCRYPTED MESSAGES EXTENSION
-- =====================================================

-- Add encryption fields to existing messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS encrypted_content TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS signature TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS iv TEXT; -- Initialization vector for AES
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false;

-- Encrypted message metadata
CREATE TABLE IF NOT EXISTS encrypted_message_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    
    -- Encryption details
    encryption_algorithm TEXT NOT NULL DEFAULT 'AES-256-GCM',
    key_id UUID REFERENCES conversation_encryption_keys(id) ON DELETE SET NULL,
    
    -- Security metadata
    content_hash TEXT NOT NULL,
    signature TEXT NOT NULL,
    signature_algorithm TEXT DEFAULT 'RSA-SHA256',
    signed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verification_timestamp TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ENCRYPTED FILE SHARING
-- =====================================================

-- Encrypted file storage
CREATE TABLE IF NOT EXISTS encrypted_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_file_id UUID REFERENCES message_attachments(id) ON DELETE CASCADE,
    
    -- File encryption
    encrypted_file_url TEXT NOT NULL,
    encrypted_file_size BIGINT NOT NULL,
    encryption_algorithm TEXT DEFAULT 'AES-256-GCM',
    
    -- Key management
    encryption_key_id UUID REFERENCES conversation_encryption_keys(id) ON DELETE SET NULL,
    file_iv TEXT NOT NULL, -- Initialization vector
    
    -- File metadata (encrypted)
    encrypted_metadata TEXT,
    metadata_iv TEXT,
    
    -- Security
    file_hash TEXT NOT NULL,
    signature TEXT,
    
    -- Access control
    access_expires_at TIMESTAMP WITH TIME ZONE,
    max_downloads INTEGER,
    current_downloads INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File access logs for security auditing
CREATE TABLE IF NOT EXISTS file_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES encrypted_files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Access details
    access_type TEXT NOT NULL CHECK (access_type IN ('download', 'view', 'share', 'delete')),
    access_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Security context
    session_id TEXT,
    is_authorized BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. VIDEO CALL INFRASTRUCTURE
-- =====================================================

-- Video call sessions
CREATE TABLE IF NOT EXISTS video_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    
    -- Call details
    call_type TEXT DEFAULT 'video' CHECK (call_type IN ('audio', 'video', 'screen_share')),
    status TEXT DEFAULT 'initiating' CHECK (status IN ('initiating', 'ringing', 'connected', 'ended', 'failed')),
    
    -- Participants
    initiator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    participants UUID[] DEFAULT '{}',
    
    -- Call metadata
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Technical details
    room_id TEXT UNIQUE NOT NULL,
    recording_url TEXT,
    recording_encrypted BOOLEAN DEFAULT true,
    
    -- Security
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
    
    -- Participation details
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Technical details
    device_info JSONB DEFAULT '{}',
    network_info JSONB DEFAULT '{}',
    quality_metrics JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_muted BOOLEAN DEFAULT false,
    is_video_enabled BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(call_id, user_id)
);

-- =====================================================
-- 5. GROUP CONVERSATIONS
-- =====================================================

-- Group conversation management
CREATE TABLE IF NOT EXISTS group_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    
    -- Group details
    group_name VARCHAR(255) NOT NULL,
    group_description TEXT,
    group_avatar_url TEXT,
    
    -- Group settings
    is_public BOOLEAN DEFAULT false,
    allow_invites BOOLEAN DEFAULT true,
    require_approval BOOLEAN DEFAULT false,
    max_members INTEGER DEFAULT 100,
    
    -- Encryption
    encryption_enabled BOOLEAN DEFAULT true,
    encryption_key_id UUID REFERENCES conversation_encryption_keys(id) ON DELETE SET NULL,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group members with roles
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES group_conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Member details
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Permissions
    can_invite BOOLEAN DEFAULT false,
    can_remove_members BOOLEAN DEFAULT false,
    can_edit_group BOOLEAN DEFAULT false,
    can_delete_messages BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_muted BOOLEAN DEFAULT false,
    notification_preferences JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(group_id, user_id)
);

-- =====================================================
-- 6. MESSAGE RETENTION POLICIES
-- =====================================================

-- Retention policies
CREATE TABLE IF NOT EXISTS retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Policy details
    policy_name VARCHAR(255) NOT NULL,
    policy_description TEXT,
    
    -- Retention rules
    message_retention_days INTEGER DEFAULT 2555, -- 7 years
    file_retention_days INTEGER DEFAULT 1825, -- 5 years
    call_recording_retention_days INTEGER DEFAULT 1095, -- 3 years
    
    -- Deletion behavior
    auto_delete_enabled BOOLEAN DEFAULT true,
    archive_before_delete BOOLEAN DEFAULT true,
    notify_before_deletion BOOLEAN DEFAULT true,
    deletion_notice_days INTEGER DEFAULT 30,
    
    -- Compliance
    compliance_requirements TEXT[] DEFAULT '{}',
    legal_hold_enabled BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message archival
CREATE TABLE IF NOT EXISTS archived_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    
    -- Archival details
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archived_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    archive_reason TEXT DEFAULT 'retention_policy',
    
    -- Original message data (encrypted if needed)
    message_data JSONB NOT NULL,
    encryption_key_id UUID REFERENCES conversation_encryption_keys(id) ON DELETE SET NULL,
    
    -- Metadata
    thread_id UUID,
    conversation_id UUID,
    retention_policy_id UUID REFERENCES retention_policies(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. ENHANCED NOTIFICATIONS
-- =====================================================

-- Encrypted notification preferences
CREATE TABLE IF NOT EXISTS encrypted_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Preferences (encrypted)
    encrypted_preferences TEXT NOT NULL,
    preferences_iv TEXT NOT NULL,
    
    -- Notification types
    message_notifications BOOLEAN DEFAULT true,
    call_notifications BOOLEAN DEFAULT true,
    file_notifications BOOLEAN DEFAULT true,
    group_notifications BOOLEAN DEFAULT true,
    
    -- Delivery methods
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    in_app_enabled BOOLEAN DEFAULT true,
    
    -- Timing preferences
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    timezone TEXT DEFAULT 'UTC',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. SECURITY AUDIT LOGS
-- =====================================================

-- Encryption audit logs
CREATE TABLE IF NOT EXISTS encryption_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Action details
    action_type TEXT NOT NULL CHECK (action_type IN ('key_generated', 'key_rotated', 'key_revoked', 'message_encrypted', 'message_decrypted', 'file_encrypted', 'file_decrypted')),
    target_type TEXT CHECK (target_type IN ('message', 'file', 'conversation', 'user', 'group')),
    target_id UUID,
    
    -- Security context
    encryption_algorithm TEXT,
    key_version INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. INDEXES FOR PERFORMANCE
-- =====================================================

-- Encryption keys indexes
CREATE INDEX idx_user_encryption_keys_user_id ON user_encryption_keys(user_id);
CREATE INDEX idx_user_encryption_keys_version ON user_encryption_keys(key_version);
CREATE INDEX idx_conversation_encryption_keys_conversation_id ON conversation_encryption_keys(conversation_id);
CREATE INDEX idx_user_conversation_keys_user_id ON user_conversation_keys(user_id);
CREATE INDEX idx_user_conversation_keys_conversation_key_id ON user_conversation_keys(conversation_key_id);

-- Encrypted messages indexes
CREATE INDEX idx_messages_encryption_version ON messages(encryption_version);
CREATE INDEX idx_messages_is_encrypted ON messages(is_encrypted);
CREATE INDEX idx_encrypted_message_metadata_message_id ON encrypted_message_metadata(message_id);

-- Encrypted files indexes
CREATE INDEX idx_encrypted_files_original_file_id ON encrypted_files(original_file_id);
CREATE INDEX idx_encrypted_files_encryption_key_id ON encrypted_files(encryption_key_id);
CREATE INDEX idx_file_access_logs_file_id ON file_access_logs(file_id);
CREATE INDEX idx_file_access_logs_user_id ON file_access_logs(user_id);

-- Video call indexes
CREATE INDEX idx_video_calls_conversation_id ON video_calls(conversation_id);
CREATE INDEX idx_video_calls_status ON video_calls(status);
CREATE INDEX idx_video_calls_initiator_id ON video_calls(initiator_id);
CREATE INDEX idx_video_calls_room_id ON video_calls(room_id);
CREATE INDEX idx_video_call_participants_call_id ON video_call_participants(call_id);
CREATE INDEX idx_video_call_participants_user_id ON video_call_participants(user_id);

-- Group conversation indexes
CREATE INDEX idx_group_conversations_thread_id ON group_conversations(thread_id);
CREATE INDEX idx_group_conversations_created_by ON group_conversations(created_by);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_role ON group_members(role);

-- Retention and archival indexes
CREATE INDEX idx_retention_policies_organization_id ON retention_policies(organization_id);
CREATE INDEX idx_archived_messages_original_message_id ON archived_messages(original_message_id);
CREATE INDEX idx_archived_messages_archived_at ON archived_messages(archived_at);

-- Audit log indexes
CREATE INDEX idx_encryption_audit_logs_user_id ON encryption_audit_logs(user_id);
CREATE INDEX idx_encryption_audit_logs_action_type ON encryption_audit_logs(action_type);
CREATE INDEX idx_encryption_audit_logs_created_at ON encryption_audit_logs(created_at DESC);

-- =====================================================
-- 10. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update encryption key timestamps
CREATE OR REPLACE FUNCTION update_encryption_key_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log encryption actions
CREATE OR REPLACE FUNCTION log_encryption_action(
    p_user_id UUID,
    p_action_type TEXT,
    p_target_type TEXT DEFAULT NULL,
    p_target_id UUID DEFAULT NULL,
    p_encryption_algorithm TEXT DEFAULT NULL,
    p_key_version INTEGER DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO encryption_audit_logs (
        user_id, action_type, target_type, target_id,
        encryption_algorithm, key_version, success, error_message
    ) VALUES (
        p_user_id, p_action_type, p_target_type, p_target_id,
        p_encryption_algorithm, p_key_version, p_success, p_error_message
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check message retention
CREATE OR REPLACE FUNCTION check_message_retention()
RETURNS TRIGGER AS $$
DECLARE
    v_retention_days INTEGER;
    v_organization_id UUID;
BEGIN
    -- Get organization ID from the message thread
    SELECT organization_id INTO v_organization_id
    FROM message_threads
    WHERE id = NEW.thread_id;
    
    -- Get retention policy
    SELECT message_retention_days INTO v_retention_days
    FROM retention_policies
    WHERE organization_id = v_organization_id
    AND is_active = true
    LIMIT 1;
    
    -- If retention policy exists and message is old enough
    IF v_retention_days IS NOT NULL AND 
       NEW.created_at < NOW() - INTERVAL '1 day' * v_retention_days THEN
        
        -- Archive the message
        INSERT INTO archived_messages (
            original_message_id, message_data, thread_id, conversation_id
        ) VALUES (
            NEW.id, to_jsonb(NEW), NEW.thread_id, NEW.thread_id
        );
        
        -- Delete the original message
        DELETE FROM messages WHERE id = NEW.id;
        
        RETURN NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. APPLY TRIGGERS
-- =====================================================

-- Apply encryption key update trigger
CREATE TRIGGER update_encryption_key_timestamp_trigger
    BEFORE UPDATE ON user_encryption_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_encryption_key_timestamp();

CREATE TRIGGER update_conversation_encryption_key_timestamp_trigger
    BEFORE UPDATE ON conversation_encryption_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_encryption_key_timestamp();

-- Apply message retention trigger
CREATE TRIGGER check_message_retention_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION check_message_retention();

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on encryption tables
ALTER TABLE user_encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_conversation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_message_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE encryption_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_encryption_keys
CREATE POLICY "Users can view their own encryption keys" ON user_encryption_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own encryption keys" ON user_encryption_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own encryption keys" ON user_encryption_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for conversation_encryption_keys
CREATE POLICY "Users can view conversation keys they have access to" ON conversation_encryption_keys
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_conversation_keys uck
            WHERE uck.conversation_key_id = conversation_encryption_keys.id
            AND uck.user_id = auth.uid()
            AND uck.is_revoked = false
        )
    );

-- RLS Policies for encrypted_files
CREATE POLICY "Users can access encrypted files they have permission for" ON encrypted_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_conversation_keys uck
            JOIN conversation_encryption_keys cek ON cek.id = uck.conversation_key_id
            JOIN message_attachments ma ON ma.id = encrypted_files.original_file_id
            JOIN messages m ON m.id = ma.message_id
            WHERE m.thread_id = cek.conversation_id
            AND uck.user_id = auth.uid()
            AND uck.is_revoked = false
        )
    );

-- RLS Policies for video_calls
CREATE POLICY "Users can view video calls they participate in" ON video_calls
    FOR SELECT USING (
        auth.uid() = ANY(participants) OR auth.uid() = initiator_id
    );

-- RLS Policies for group_conversations
CREATE POLICY "Users can view groups they are members of" ON group_conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_members gm
            WHERE gm.group_id = group_conversations.id
            AND gm.user_id = auth.uid()
            AND gm.is_active = true
        )
    );

-- =====================================================
-- 13. FINAL COMMENTS
-- =====================================================

COMMENT ON TABLE user_encryption_keys IS 'Stores user encryption key pairs for end-to-end encryption';
COMMENT ON TABLE conversation_encryption_keys IS 'Stores symmetric encryption keys for conversations';
COMMENT ON TABLE user_conversation_keys IS 'Maps users to their access to conversation encryption keys';
COMMENT ON TABLE encrypted_message_metadata IS 'Stores encryption metadata for encrypted messages';
COMMENT ON TABLE encrypted_files IS 'Stores encrypted file information and access control';
COMMENT ON TABLE video_calls IS 'Manages video call sessions and encryption';
COMMENT ON TABLE group_conversations IS 'Manages group conversations with encryption support';
COMMENT ON TABLE retention_policies IS 'Defines message and file retention policies';
COMMENT ON TABLE encryption_audit_logs IS 'Audit trail for all encryption-related actions';

-- Migration completed successfully
-- 🔐 Encrypted Communication System is now ready!
