-- Create internal messaging tables for Jewelia CRM
-- This migration sets up the complete messaging system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create internal_messages table
CREATE TABLE IF NOT EXISTS internal_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'general' CHECK (message_type IN ('general', 'urgent', 'announcement', 'task', 'support')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'deleted')),
    is_admin_message BOOLEAN NOT NULL DEFAULT false,
    company_id UUID,
    order_id UUID,
    parent_message_id UUID,
    thread_id UUID,
    attachments JSONB DEFAULT '[]'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create message_threads table
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    initiator_id UUID NOT NULL,
    participants UUID[] NOT NULL,
    company_id UUID,
    is_admin_thread BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES internal_messages(id) ON DELETE CASCADE,
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

-- Create message_notifications table
CREATE TABLE IF NOT EXISTS message_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES internal_messages(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL,
    notification_type TEXT NOT NULL DEFAULT 'new_message',
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_internal_messages_sender_id ON internal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_recipient_id ON internal_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_status ON internal_messages(status);
CREATE INDEX IF NOT EXISTS idx_internal_messages_created_at ON internal_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_internal_messages_thread_id ON internal_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_participants ON message_threads USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_notifications_recipient_id ON message_notifications(recipient_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_internal_messages_updated_at BEFORE UPDATE ON internal_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_threads_updated_at BEFORE UPDATE ON message_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_attachments_updated_at BEFORE UPDATE ON message_attachments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_notifications_updated_at BEFORE UPDATE ON message_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO internal_messages (sender_id, recipient_id, subject, content, message_type, priority, is_admin_message) VALUES
    ('fdb2a122-d6ae-4e78-b277-3317e1a09132', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', 'Welcome to Jewelia CRM', 'Welcome to the internal messaging system! This is your first message.', 'announcement', 'normal', true),
    ('fdb2a122-d6ae-4e78-b277-3317e1a09132', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', 'System Setup Complete', 'Your internal messaging system has been successfully configured.', 'general', 'normal', true);

-- Create RLS policies (if you want to enable Row Level Security)
-- ALTER TABLE internal_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT ALL ON internal_messages TO authenticated;
GRANT ALL ON message_threads TO authenticated;
GRANT ALL ON message_attachments TO authenticated;
GRANT ALL ON message_notifications TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
