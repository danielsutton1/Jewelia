-- Migration: Create Internal Messages System
-- Date: 2025-01-15
-- Description: Create tables for internal messaging between users and admins

-- Create internal_messages table
CREATE TABLE IF NOT EXISTS internal_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'general' CHECK (message_type IN ('general', 'urgent', 'announcement', 'task', 'support')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'deleted')),
    is_admin_message BOOLEAN DEFAULT FALSE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    parent_message_id UUID REFERENCES internal_messages(id) ON DELETE CASCADE,
    attachments JSONB DEFAULT '[]',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create message_threads table for organizing conversations
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participants JSONB NOT NULL DEFAULT '[]', -- Array of user IDs
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    is_admin_thread BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create message_participants table for thread management
CREATE TABLE IF NOT EXISTS message_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('participant', 'admin', 'moderator')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(thread_id, user_id)
);

-- Create message_notifications table for real-time notifications
CREATE TABLE IF NOT EXISTS message_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES internal_messages(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) DEFAULT 'new_message' CHECK (notification_type IN ('new_message', 'mention', 'reply', 'admin_alert')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_internal_messages_sender_id ON internal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_recipient_id ON internal_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_company_id ON internal_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_status ON internal_messages(status);
CREATE INDEX IF NOT EXISTS idx_internal_messages_created_at ON internal_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_internal_messages_thread_id ON internal_messages(parent_message_id);

CREATE INDEX IF NOT EXISTS idx_message_threads_company_id ON message_threads(company_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_participants ON message_threads USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_message_threads_last_message_at ON message_threads(last_message_at);

CREATE INDEX IF NOT EXISTS idx_message_participants_thread_id ON message_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_message_participants_user_id ON message_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_message_notifications_user_id ON message_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_message_notifications_is_read ON message_notifications(is_read);

-- Add RLS policies
ALTER TABLE internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy for internal_messages
CREATE POLICY "Users can view messages they sent or received" ON internal_messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id OR
        EXISTS (
            SELECT 1 FROM message_participants mp 
            WHERE mp.thread_id = internal_messages.parent_message_id 
            AND mp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages" ON internal_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON internal_messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- RLS Policy for message_threads
CREATE POLICY "Users can view threads they participate in" ON message_threads
    FOR SELECT USING (
        auth.uid() = initiator_id OR
        EXISTS (
            SELECT 1 FROM message_participants mp 
            WHERE mp.thread_id = message_threads.id 
            AND mp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create threads" ON message_threads
    FOR INSERT WITH CHECK (auth.uid() = initiator_id);

-- RLS Policy for message_participants
CREATE POLICY "Users can view thread participants" ON message_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM message_threads mt 
            WHERE mt.id = message_participants.thread_id 
            AND (mt.initiator_id = auth.uid() OR 
                 EXISTS (
                     SELECT 1 FROM message_participants mp2 
                     WHERE mp2.thread_id = mt.id 
                     AND mp2.user_id = auth.uid()
                 ))
        )
    );

-- RLS Policy for message_notifications
CREATE POLICY "Users can view their own notifications" ON message_notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_messages(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    sender_id UUID,
    recipient_id UUID,
    subject VARCHAR,
    content TEXT,
    message_type VARCHAR,
    priority VARCHAR,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    sender_name VARCHAR,
    recipient_name VARCHAR,
    thread_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        im.id,
        im.sender_id,
        im.recipient_id,
        im.subject,
        im.content,
        im.message_type,
        im.priority,
        im.status,
        im.created_at,
        s.full_name as sender_name,
        r.full_name as recipient_name,
        im.parent_message_id as thread_id
    FROM internal_messages im
    JOIN users s ON im.sender_id = s.id
    JOIN users r ON im.recipient_id = r.id
    WHERE im.sender_id = user_uuid OR im.recipient_id = user_uuid
    ORDER BY im.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update thread last_message_at
CREATE OR REPLACE FUNCTION update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_message_id IS NOT NULL THEN
        UPDATE message_threads 
        SET last_message_at = NEW.created_at 
        WHERE id = NEW.parent_message_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_last_message
    AFTER INSERT ON internal_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_last_message();

-- Insert sample data for testing
INSERT INTO internal_messages (sender_id, recipient_id, subject, content, message_type, priority, company_id)
SELECT 
    u1.id as sender_id,
    u2.id as recipient_id,
    'Welcome to Jewelia CRM' as subject,
    'Welcome to the team! We''re excited to have you on board. Please review our internal communication guidelines.' as content,
    'announcement' as message_type,
    'normal' as priority,
    NULL as company_id
FROM users u1, users u2 
WHERE u1.email = 'test@jewelia.com' 
AND u2.email = 'test@jewelia.com'
AND u1.id != u2.id
LIMIT 1;

-- Verify the tables were created
SELECT 
    table_name, 
    column_count 
FROM (
    SELECT 'internal_messages' as table_name, COUNT(*) as column_count FROM information_schema.columns WHERE table_name = 'internal_messages'
    UNION ALL
    SELECT 'message_threads' as table_name, COUNT(*) as column_count FROM information_schema.columns WHERE table_name = 'message_threads'
    UNION ALL
    SELECT 'message_participants' as table_name, COUNT(*) as column_count FROM information_schema.columns WHERE table_name = 'message_participants'
    UNION ALL
    SELECT 'message_notifications' as table_name, COUNT(*) as column_count FROM information_schema.columns WHERE table_name = 'message_notifications'
) as table_info;

