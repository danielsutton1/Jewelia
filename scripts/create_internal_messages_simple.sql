-- Simplified Internal Messages Tables
-- Run this in your Supabase SQL Editor

-- Create internal_messages table
CREATE TABLE IF NOT EXISTS internal_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'unread',
    is_admin_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create message_threads table
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    initiator_id UUID NOT NULL,
    participants JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'active',
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create message_notifications table
CREATE TABLE IF NOT EXISTS message_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    message_id UUID NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'new_message',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_internal_messages_sender_id ON internal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_recipient_id ON internal_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_status ON internal_messages(status);

-- Insert a test message
INSERT INTO internal_messages (sender_id, recipient_id, subject, content, message_type, priority)
VALUES (
    (SELECT id FROM users WHERE email = 'test@jewelia.com' LIMIT 1),
    (SELECT id FROM users WHERE email = 'test@jewelia.com' LIMIT 1),
    'Welcome to Internal Messages',
    'This is a test message to verify the internal messaging system is working.',
    'general',
    'normal'
);

