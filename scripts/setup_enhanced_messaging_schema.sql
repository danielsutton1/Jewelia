-- =====================================================
-- ENHANCED MESSAGING SYSTEM DATABASE SCHEMA
-- =====================================================
-- This script sets up the database tables needed for the enhanced messaging system

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS message_attachments CASCADE;
DROP TABLE IF EXISTS conversation_notifications CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS external_conversations CASCADE;

-- Create external_conversations table
CREATE TABLE IF NOT EXISTS external_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    initiator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    participants UUID[] DEFAULT '{}',
    business_type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (business_type IN ('inquiry', 'quote', 'order', 'support', 'general')),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'resolved', 'closed', 'archived')),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT FALSE,
    related_order_id UUID,
    related_project_id UUID,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_type VARCHAR(20) NOT NULL DEFAULT 'external' CHECK (message_type IN ('external', 'internal')),
    conversation_id UUID REFERENCES external_conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'markdown', 'image', 'file')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    thread_id UUID,
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    related_order_id UUID,
    related_project_id UUID,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES external_conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'participant' CHECK (role IN ('owner', 'admin', 'participant', 'viewer')),
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Create conversation_notifications table
CREATE TABLE IF NOT EXISTS conversation_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES external_conversations(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('new_message', 'mention', 'reply', 'status_change', 'priority_change')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES external_conversations(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    mime_type VARCHAR(100),
    file_path TEXT NOT NULL,
    file_url TEXT,
    is_processed BOOLEAN DEFAULT FALSE,
    processing_status VARCHAR(50) DEFAULT 'pending',
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_external_conversations_partner_id ON external_conversations(partner_id);
CREATE INDEX IF NOT EXISTS idx_external_conversations_initiator_id ON external_conversations(initiator_id);
CREATE INDEX IF NOT EXISTS idx_external_conversations_status ON external_conversations(status);
CREATE INDEX IF NOT EXISTS idx_external_conversations_priority ON external_conversations(priority);
CREATE INDEX IF NOT EXISTS idx_external_conversations_category ON external_conversations(category);
CREATE INDEX IF NOT EXISTS idx_external_conversations_business_type ON external_conversations(business_type);
CREATE INDEX IF NOT EXISTS idx_external_conversations_last_message_at ON external_conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_external_conversations_participants ON external_conversations USING GIN(participants);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_partner_id ON messages(partner_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON messages(reply_to_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_is_active ON conversation_participants(is_active);

CREATE INDEX IF NOT EXISTS idx_conversation_notifications_user_id ON conversation_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_notifications_conversation_id ON conversation_notifications(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_notifications_is_read ON conversation_notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_conversation_id ON message_attachments(conversation_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_external_conversations_updated_at 
    BEFORE UPDATE ON external_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_participants_updated_at 
    BEFORE UPDATE ON conversation_participants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_notifications_updated_at 
    BEFORE UPDATE ON conversation_notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_attachments_updated_at 
    BEFORE UPDATE ON message_attachments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update last_message_at when messages are inserted
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE external_conversations 
    SET last_message_at = NEW.created_at, updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Insert sample data for testing
INSERT INTO external_conversations (
    title, subject, category, partner_id, initiator_id, 
    business_type, priority, status, tags, metadata
) VALUES 
(
    'Gold Collection Inquiry',
    '2kg 18k Gold Collection Inquiry',
    'inquiry',
    'd44f297b-a185-4cca-994f-8ebf182380cd',
    '6d1a08f1-134c-46dd-aa1e-21f95b80bed4',
    'inquiry',
    'high',
    'active',
    ARRAY['gold', 'collection', 'urgent'],
    '{}'
),
(
    'Sample Quote Request',
    'Inquiry about custom jewelry design',
    'inquiry',
    'bd180762-49e2-477d-b286-d7039b43cd83',
    '6d1a08f1-134c-46dd-aa1e-21f95b80bed4',
    'inquiry',
    'high',
    'active',
    ARRAY['urgent', 'custom-design'],
    '{"budget": "5000-10000", "source": "website"}'
);

-- Insert sample messages
INSERT INTO messages (
    message_type, conversation_id, sender_id, partner_id,
    content, priority, category, tags
) VALUES 
(
    'external',
    (SELECT id FROM external_conversations WHERE title = 'Gold Collection Inquiry' LIMIT 1),
    '6d1a08f1-134c-46dd-aa1e-21f95b80bed4',
    'd44f297b-a185-4cca-994f-8ebf182380cd',
    'Hello! I am interested in purchasing 2kg of 18k gold for our jewelry collection. Can you provide pricing and availability?',
    'high',
    'inquiry',
    ARRAY['gold', 'collection', 'urgent']
),
(
    'external',
    (SELECT id FROM external_conversations WHERE title = 'Sample Quote Request' LIMIT 1),
    '6d1a08f1-134c-46dd-aa1e-21f95b80bed4',
    'bd180762-49e2-477d-b286-d7039b43cd83',
    'Hi there! I need a quote for custom jewelry design services. Budget range is $5,000-$10,000. What can you offer?',
    'high',
    'inquiry',
    ARRAY['urgent', 'custom-design']
);

-- Update participants arrays
UPDATE external_conversations 
SET participants = ARRAY['6d1a08f1-134c-46dd-aa1e-21f95b80bed4']
WHERE initiator_id = '6d1a08f1-134c-46dd-aa1e-21f95b80bed4';

-- Insert conversation participants
INSERT INTO conversation_participants (conversation_id, user_id, role)
SELECT id, initiator_id, 'owner'
FROM external_conversations
WHERE initiator_id IS NOT NULL;

COMMIT;
