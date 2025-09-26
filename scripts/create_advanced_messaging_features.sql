-- Create Advanced Messaging Features for Jewelia CRM
-- This script sets up notifications, file attachments, and message threads

-- Step 1: Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'message' CHECK (type IN ('message', 'mention', 'system', 'alert')),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    related_id UUID,
    related_type VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create message_attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES internal_messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create message_threads table
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    participants UUID[] NOT NULL DEFAULT '{}',
    last_message_id UUID REFERENCES internal_messages(id),
    last_message_at TIMESTAMP WITH TIME ZONE,
    message_count INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create thread_participants table
CREATE TABLE IF NOT EXISTS thread_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    is_admin BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    UNIQUE(thread_id, user_id)
);

-- Step 5: Add missing columns to internal_messages table
DO $$ 
BEGIN
    -- Add thread_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_messages' AND column_name = 'thread_id') THEN
        ALTER TABLE internal_messages ADD COLUMN thread_id UUID REFERENCES message_threads(id);
    END IF;
    
    -- Add parent_message_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_messages' AND column_name = 'parent_message_id') THEN
        ALTER TABLE internal_messages ADD COLUMN parent_message_id UUID REFERENCES internal_messages(id);
    END IF;
END $$;

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_related ON notifications(related_id, related_type);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_uploaded_by ON message_attachments(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_message_threads_participants ON message_threads USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_message_threads_status ON message_threads(status);
CREATE INDEX IF NOT EXISTS idx_message_threads_updated_at ON message_threads(updated_at);

CREATE INDEX IF NOT EXISTS idx_thread_participants_thread_id ON thread_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user_id ON thread_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_internal_messages_thread_id ON internal_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_parent_id ON internal_messages(parent_message_id);

-- Step 7: Create RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Step 8: Create RLS policies for message_attachments
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments for messages they have access to" ON message_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internal_messages 
            WHERE id = message_attachments.message_id 
            AND (sender_id = auth.uid() OR recipient_id = auth.uid())
        )
    );

CREATE POLICY "Users can upload attachments to their own messages" ON message_attachments
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own attachments" ON message_attachments
    FOR DELETE USING (uploaded_by = auth.uid());

-- Step 9: Create RLS policies for message_threads
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view threads they participate in" ON message_threads
    FOR SELECT USING (
        auth.uid() = ANY(participants)
    );

CREATE POLICY "Users can create threads" ON message_threads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Thread admins can update threads" ON message_threads
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM thread_participants 
            WHERE thread_id = message_threads.id 
            AND user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Step 10: Create RLS policies for thread_participants
ALTER TABLE thread_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants in threads they're part of" ON thread_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM message_threads 
            WHERE id = thread_participants.thread_id 
            AND auth.uid() = ANY(participants)
        )
    );

CREATE POLICY "Thread admins can manage participants" ON thread_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM thread_participants tp
            WHERE tp.thread_id = thread_participants.thread_id 
            AND tp.user_id = auth.uid() 
            AND tp.is_admin = true
        )
    );

-- Step 11: Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_thread_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Update thread metadata when messages are added/removed
    IF TG_OP = 'INSERT' THEN
        UPDATE message_threads 
        SET 
            message_count = message_count + 1,
            last_message_id = NEW.id,
            last_message_at = NEW.created_at,
            updated_at = NOW()
        WHERE id = NEW.thread_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE message_threads 
        SET 
            message_count = GREATEST(message_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.thread_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 12: Create triggers for automatic updates
CREATE TRIGGER trigger_update_thread_metadata
    AFTER INSERT OR DELETE ON internal_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_metadata();

-- Step 13: Create function to update thread participants array
CREATE OR REPLACE FUNCTION update_thread_participants_array()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the participants array in message_threads when thread_participants changes
    IF TG_OP = 'INSERT' THEN
        UPDATE message_threads 
        SET participants = array_append(participants, NEW.user_id)
        WHERE id = NEW.thread_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE message_threads 
        SET participants = array_remove(participants, OLD.user_id)
        WHERE id = OLD.thread_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 14: Create trigger for thread participants array updates
CREATE TRIGGER trigger_update_thread_participants_array
    AFTER INSERT OR DELETE ON thread_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_participants_array();

-- Step 15: Insert sample data for testing
INSERT INTO message_threads (id, title, subject, participants, status) VALUES
(
    'thread-001',
    'Design Team Discussion',
    'Weekly design review and feedback',
    ARRAY['fdb2a122-d6ae-4e78-b277-3317e1a09132', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
    'active'
),
(
    'thread-002',
    'Sales Updates',
    'Daily sales reports and customer updates',
    ARRAY['550e8400-e29b-41d4-a716-446655440001', 'c3d4e5f6-g7h8-9012-cdef-g34567890123'],
    'active'
);

-- Step 16: Insert sample thread participants
INSERT INTO thread_participants (thread_id, user_id, is_admin, can_edit) VALUES
('thread-001', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', true, true),
('thread-001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, false),
('thread-002', '550e8400-e29b-41d4-a716-446655440001', true, true),
('thread-002', 'c3d4e5f6-g7h8-9012-cdef-g34567890123', false, false);

-- Step 17: Refresh Supabase schema cache
NOTIFY pgrst, 'reload schema';

-- Step 18: Verify all tables were created
SELECT 'Verifying table creation:' as step;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('notifications', 'message_attachments', 'message_threads', 'thread_participants')
ORDER BY table_name;

-- Step 19: Show sample data
SELECT 'Sample thread data:' as step;
SELECT 
    t.title,
    t.subject,
    t.participants,
    t.status,
    t.message_count
FROM message_threads t
ORDER BY t.created_at DESC;
