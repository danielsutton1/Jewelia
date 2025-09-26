-- 🔧 UNIFIED MESSAGING SYSTEM MIGRATION
-- This migration consolidates all messaging functionality into a unified system
-- Supports both internal (admin-to-users) and external (admin-to-admin) messaging

-- =====================================================
-- 1. CREATE UNIFIED MESSAGING TABLES
-- =====================================================

-- Create message_types enum
CREATE TYPE message_type AS ENUM ('internal', 'external', 'system', 'notification');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read', 'failed');
CREATE TYPE message_priority AS ENUM ('low', 'normal', 'high', 'urgent');

-- Main messages table (unified for both internal and external)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Message classification
    type message_type NOT NULL DEFAULT 'internal',
    category VARCHAR(100) DEFAULT 'general',
    priority message_priority DEFAULT 'normal',
    
    -- Sender and recipient
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- For external messages (admin-to-admin)
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    partner_relationship_id UUID REFERENCES partner_relationships(id) ON DELETE CASCADE,
    
    -- For internal messages (admin-to-users)
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    
    -- Message content
    subject VARCHAR(255),
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'markdown')),
    
    -- Message metadata
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Status tracking
    status message_status DEFAULT 'sent',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Threading support
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    
    -- Related entities
    related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_message_type CHECK (
        (type = 'external' AND partner_id IS NOT NULL) OR
        (type = 'internal' AND organization_id IS NOT NULL) OR
        (type = 'system') OR
        (type = 'notification')
    )
);

-- Message threads for conversation grouping
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Thread classification
    type message_type NOT NULL,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    
    -- Thread participants
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    participants UUID[] DEFAULT '{}', -- Array of user IDs
    
    -- For external threads
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    
    -- For internal threads
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    
    -- Thread metadata
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Thread status
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    
    -- Related entities
    related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message attachments
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    
    -- File information
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    
    -- Storage metadata
    storage_path TEXT,
    mime_type VARCHAR(100),
    
    -- File processing
    is_processed BOOLEAN DEFAULT false,
    processing_status VARCHAR(50) DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message reactions
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Reaction data
    reaction_type VARCHAR(50) NOT NULL, -- 'like', 'love', 'laugh', 'wow', 'sad', 'angry'
    reaction_data JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(message_id, user_id, reaction_type)
);

-- Message read receipts
CREATE TABLE IF NOT EXISTS message_read_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Read status
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_method VARCHAR(50) DEFAULT 'app', -- 'app', 'email', 'web'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(message_id, user_id)
);

-- Message notifications
CREATE TABLE IF NOT EXISTS message_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification data
    notification_type VARCHAR(50) NOT NULL, -- 'new_message', 'mention', 'reply', 'reaction'
    title VARCHAR(255) NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}',
    
    -- Delivery status
    is_sent BOOLEAN DEFAULT false,
    is_delivered BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    
    -- Delivery methods
    email_sent BOOLEAN DEFAULT false,
    push_sent BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Messages table indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_type ON messages(type);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_partner_id ON messages(partner_id);
CREATE INDEX idx_messages_organization_id ON messages(organization_id);
CREATE INDEX idx_messages_related_order_id ON messages(related_order_id);

-- Threads table indexes
CREATE INDEX idx_message_threads_type ON message_threads(type);
CREATE INDEX idx_message_threads_partner_id ON message_threads(partner_id);
CREATE INDEX idx_message_threads_organization_id ON message_threads(organization_id);
CREATE INDEX idx_message_threads_last_message_at ON message_threads(last_message_at);
CREATE INDEX idx_message_threads_is_active ON message_threads(is_active);

-- Attachments table indexes
CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX idx_message_attachments_file_type ON message_attachments(file_type);

-- Reactions table indexes
CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON message_reactions(user_id);

-- Read receipts table indexes
CREATE INDEX idx_message_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX idx_message_read_receipts_user_id ON message_read_receipts(user_id);

-- Notifications table indexes
CREATE INDEX idx_message_notifications_user_id ON message_notifications(user_id);
CREATE INDEX idx_message_notifications_is_read ON message_notifications(is_read);
CREATE INDEX idx_message_notifications_created_at ON message_notifications(created_at);

-- =====================================================
-- 3. CREATE TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update thread last_message_at
CREATE OR REPLACE FUNCTION update_thread_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE message_threads
    SET last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notifications for new messages
CREATE OR REPLACE FUNCTION create_message_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for recipient
    IF NEW.recipient_id IS NOT NULL THEN
        INSERT INTO message_notifications (
            message_id,
            user_id,
            notification_type,
            title,
            body,
            data
        ) VALUES (
            NEW.id,
            NEW.recipient_id,
            'new_message',
            CASE 
                WHEN NEW.subject IS NOT NULL THEN NEW.subject
                ELSE 'New Message'
            END,
            LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
            jsonb_build_object(
                'sender_id', NEW.sender_id,
                'message_type', NEW.type,
                'thread_id', NEW.thread_id
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_threads_updated_at
    BEFORE UPDATE ON message_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_attachments_updated_at
    BEFORE UPDATE ON message_attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thread_last_message_at
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_last_message_at();

CREATE TRIGGER create_message_notifications
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION create_message_notifications();

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- Messages policies
CREATE POLICY "Users can view messages they sent or received"
    ON messages FOR SELECT
    TO authenticated
    USING (
        sender_id = auth.uid() OR 
        recipient_id = auth.uid() OR
        (type = 'internal' AND organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )) OR
        (type = 'external' AND partner_id IN (
            SELECT partner_id FROM partner_relationships 
            WHERE (partner_a = auth.uid() OR partner_b = auth.uid()) 
            AND status = 'active'
        ))
    );

CREATE POLICY "Users can insert messages"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = auth.uid() AND
        (
            (type = 'internal' AND organization_id IN (
                SELECT organization_id FROM organization_members 
                WHERE user_id = auth.uid()
            )) OR
            (type = 'external' AND partner_id IN (
                SELECT partner_id FROM partner_relationships 
                WHERE (partner_a = auth.uid() OR partner_b = auth.uid()) 
                AND status = 'active'
            ))
        )
    );

CREATE POLICY "Users can update their own messages"
    ON messages FOR UPDATE
    TO authenticated
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- Threads policies
CREATE POLICY "Users can view threads they participate in"
    ON message_threads FOR SELECT
    TO authenticated
    USING (
        created_by = auth.uid() OR
        auth.uid() = ANY(participants) OR
        (type = 'internal' AND organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )) OR
        (type = 'external' AND partner_id IN (
            SELECT partner_id FROM partner_relationships 
            WHERE (partner_a = auth.uid() OR partner_b = auth.uid()) 
            AND status = 'active'
        ))
    );

-- Attachments policies (inherit from parent message)
CREATE POLICY "Users can view attachments for messages they can access"
    ON message_attachments FOR SELECT
    TO authenticated
    USING (
        message_id IN (
            SELECT id FROM messages 
            WHERE sender_id = auth.uid() OR 
                  recipient_id = auth.uid() OR
                  (type = 'internal' AND organization_id IN (
                      SELECT organization_id FROM organization_members 
                      WHERE user_id = auth.uid()
                  )) OR
                  (type = 'external' AND partner_id IN (
                      SELECT partner_id FROM partner_relationships 
                      WHERE (partner_a = auth.uid() OR partner_b = auth.uid()) 
                      AND status = 'active'
                  ))
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
    ON message_notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
    ON message_notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 6. MIGRATE EXISTING DATA (OPTIONAL)
-- =====================================================

-- This section can be used to migrate data from old tables
-- Uncomment and modify as needed

/*
-- Migrate partner_messages to new messages table
INSERT INTO messages (
    id, type, sender_id, recipient_id, partner_id, content, 
    content_type, created_at, updated_at, metadata
)
SELECT 
    id, 'external', sender_id, recipient_id, partner_id, content,
    'text', created_at, updated_at, metadata
FROM partner_messages
ON CONFLICT (id) DO NOTHING;

-- Migrate communication_messages to new messages table
INSERT INTO messages (
    id, type, sender_id, content, content_type, thread_id,
    created_at, updated_at, metadata
)
SELECT 
    id, 'internal', sender_id, content, 'text', thread_id,
    created_at, created_at, '{}'::jsonb
FROM communication_messages
ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- 7. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM messages
        WHERE recipient_id = user_id 
        AND is_read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
    message_ids UUID[],
    user_id UUID
)
RETURNS VOID AS $$
BEGIN
    UPDATE messages
    SET is_read = true,
        read_at = NOW(),
        updated_at = NOW()
    WHERE id = ANY(message_ids)
    AND recipient_id = user_id;
    
    -- Update read receipts
    INSERT INTO message_read_receipts (message_id, user_id, read_at)
    SELECT id, user_id, NOW()
    FROM messages
    WHERE id = ANY(message_ids)
    AND recipient_id = user_id
    ON CONFLICT (message_id, user_id) DO NOTHING;
    
    -- Mark notifications as read
    UPDATE message_notifications
    SET is_read = true,
        read_at = NOW()
    WHERE message_id = ANY(message_ids)
    AND user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation history
CREATE OR REPLACE FUNCTION get_conversation_history(
    thread_id UUID,
    user_id UUID,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    message_id UUID,
    sender_id UUID,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN,
    sender_name TEXT,
    sender_avatar TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.sender_id,
        m.content,
        m.created_at,
        m.is_read,
        u.full_name,
        u.avatar_url
    FROM messages m
    LEFT JOIN auth.users u ON m.sender_id = u.id
    WHERE m.thread_id = thread_id
    AND (
        m.sender_id = user_id OR 
        m.recipient_id = user_id OR
        user_id = ANY(
            SELECT participants FROM message_threads WHERE id = thread_id
        )
    )
    ORDER BY m.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for recent conversations
CREATE VIEW recent_conversations AS
SELECT 
    mt.id as thread_id,
    mt.subject,
    mt.type,
    mt.last_message_at,
    mt.participants,
    COUNT(m.id) as message_count,
    COUNT(CASE WHEN m.is_read = false AND m.recipient_id = auth.uid() THEN 1 END) as unread_count,
    (
        SELECT content 
        FROM messages 
        WHERE thread_id = mt.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) as last_message_content
FROM message_threads mt
LEFT JOIN messages m ON mt.id = m.thread_id
WHERE auth.uid() = ANY(mt.participants)
   OR mt.created_by = auth.uid()
GROUP BY mt.id, mt.subject, mt.type, mt.last_message_at, mt.participants;

-- View for message statistics
CREATE VIEW message_statistics AS
SELECT 
    type,
    COUNT(*) as total_messages,
    COUNT(CASE WHEN is_read = true THEN 1 END) as read_messages,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread_messages,
    AVG(EXTRACT(EPOCH FROM (read_at - created_at))) as avg_response_time_seconds
FROM messages
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY type;

-- Grant permissions
GRANT SELECT ON recent_conversations TO authenticated;
GRANT SELECT ON message_statistics TO authenticated;

-- =====================================================
-- 9. FINAL CLEANUP
-- =====================================================

-- Add comments for documentation
COMMENT ON TABLE messages IS 'Unified messaging table for internal and external communications';
COMMENT ON TABLE message_threads IS 'Message threads for grouping conversations';
COMMENT ON TABLE message_attachments IS 'File attachments for messages';
COMMENT ON TABLE message_reactions IS 'User reactions to messages (like, love, etc.)';
COMMENT ON TABLE message_read_receipts IS 'Track when users read messages';
COMMENT ON TABLE message_notifications IS 'Notifications for new messages and mentions';

COMMENT ON COLUMN messages.type IS 'Message type: internal (admin-to-users), external (admin-to-admin), system, notification';
COMMENT ON COLUMN messages.partner_id IS 'For external messages, references the partner relationship';
COMMENT ON COLUMN messages.organization_id IS 'For internal messages, references the organization';
COMMENT ON COLUMN messages.thread_id IS 'Groups messages into conversations';
COMMENT ON COLUMN messages.reply_to_id IS 'For threaded replies, references the parent message';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Unified messaging system migration completed successfully!';
    RAISE NOTICE '📧 Tables created: messages, message_threads, message_attachments, message_reactions, message_read_receipts, message_notifications';
    RAISE NOTICE '🔒 RLS policies configured for security';
    RAISE NOTICE '⚡ Indexes created for performance';
    RAISE NOTICE '🔄 Triggers and functions set up for automation';
END $$; 