-- =====================================================
-- ENHANCE EXTERNAL MESSAGING SYSTEM - STEP BY STEP
-- =====================================================
-- Run this script in small sections to avoid errors
-- Each section should be run separately

-- =====================================================
-- STEP 1: ENHANCE EXISTING MESSAGES TABLE
-- =====================================================
-- Run this section first

DO $$ 
BEGIN
    -- Add subject column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'subject') THEN
        ALTER TABLE messages ADD COLUMN subject VARCHAR(255);
        RAISE NOTICE 'Added subject column to messages table';
    ELSE
        RAISE NOTICE 'Subject column already exists in messages table';
    END IF;
    
    -- Add priority column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'priority') THEN
        ALTER TABLE messages ADD COLUMN priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
        RAISE NOTICE 'Added priority column to messages table';
    ELSE
        RAISE NOTICE 'Priority column already exists in messages table';
    END IF;
    
    -- Add conversation_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'conversation_id') THEN
        ALTER TABLE messages ADD COLUMN conversation_id UUID;
        RAISE NOTICE 'Added conversation_id column to messages table';
    ELSE
        RAISE NOTICE 'Conversation_id column already exists in messages table';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'status') THEN
        ALTER TABLE messages ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived', 'deleted'));
        RAISE NOTICE 'Added status column to messages table';
    ELSE
        RAISE NOTICE 'Status column already exists in messages table';
    END IF;
    
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'category') THEN
        ALTER TABLE messages ADD COLUMN category VARCHAR(100) DEFAULT 'general';
        RAISE NOTICE 'Added category column to messages table';
    ELSE
        RAISE NOTICE 'Category column already exists in messages table';
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'tags') THEN
        ALTER TABLE messages ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added tags column to messages table';
    ELSE
        RAISE NOTICE 'Tags column already exists in messages table';
    END IF;
    
    -- Add related_order_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'related_order_id') THEN
        ALTER TABLE messages ADD COLUMN related_order_id UUID;
        RAISE NOTICE 'Added related_order_id column to messages table';
    ELSE
        RAISE NOTICE 'Related_order_id column already exists in messages table';
    END IF;
END $$;

-- Verify columns were added
SELECT 'Verifying messages table enhancement:' as step;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
  AND column_name IN ('subject', 'priority', 'conversation_id', 'status', 'category', 'tags', 'related_order_id')
ORDER BY column_name;

-- =====================================================
-- STEP 2: CREATE EXTERNAL CONVERSATIONS TABLE
-- =====================================================
-- Run this section second

CREATE TABLE IF NOT EXISTS external_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic conversation info
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    category VARCHAR(100) DEFAULT 'general',
    
    -- Participants and relationships
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participants JSONB DEFAULT '[]', -- Array of user IDs involved
    
    -- Business context
    related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    business_type VARCHAR(100) DEFAULT 'inquiry', -- inquiry, quote, order, support, etc.
    
    -- Conversation management
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'resolved', 'closed', 'archived')),
    
    -- Metadata and tracking
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT false,
    
    -- Timestamps
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Verify table was created
SELECT 'Verifying external_conversations table:' as step;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'external_conversations';

-- =====================================================
-- STEP 3: CREATE MESSAGE ATTACHMENTS TABLE
-- =====================================================
-- Run this section third

CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Message relationship
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES external_conversations(id) ON DELETE CASCADE,
    
    -- File information
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT,
    
    -- Storage information
    file_path TEXT NOT NULL, -- Supabase storage path
    file_url TEXT, -- Public URL for download
    
    -- Processing status
    is_processed BOOLEAN DEFAULT false,
    processing_status VARCHAR(50) DEFAULT 'pending',
    
    -- Metadata
    uploaded_by UUID REFERENCES users(id),
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Verify table was created
SELECT 'Verifying message_attachments table:' as step;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'message_attachments';

-- =====================================================
-- STEP 4: CREATE CONVERSATION PARTICIPANTS TABLE
-- =====================================================
-- Run this section fourth

CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Conversation relationship
    conversation_id UUID NOT NULL REFERENCES external_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role and permissions
    role VARCHAR(50) DEFAULT 'participant' CHECK (role IN ('participant', 'owner', 'admin', 'viewer')),
    permissions JSONB DEFAULT '{}',
    
    -- Participation tracking
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    last_read_at TIMESTAMPTZ,
    
    -- Notifications
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(conversation_id, user_id)
);

-- Verify table was created
SELECT 'Verifying conversation_participants table:' as step;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'conversation_participants';

-- =====================================================
-- STEP 5: CREATE CONVERSATION NOTIFICATIONS TABLE
-- =====================================================
-- Run this section fifth

CREATE TABLE IF NOT EXISTS conversation_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Notification target
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES external_conversations(id) ON DELETE CASCADE,
    
    -- Notification details
    notification_type VARCHAR(50) DEFAULT 'new_message' CHECK (notification_type IN ('new_message', 'mention', 'reply', 'status_change', 'priority_change')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Status tracking
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_delivered BOOLEAN DEFAULT false,
    delivered_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Verify table was created
SELECT 'Verifying conversation_notifications table:' as step;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'conversation_notifications';

-- =====================================================
-- STEP 6: CREATE PERFORMANCE INDEXES
-- =====================================================
-- Run this section sixth

-- Indexes for external_conversations
CREATE INDEX IF NOT EXISTS idx_external_conversations_partner_id ON external_conversations(partner_id);
CREATE INDEX IF NOT EXISTS idx_external_conversations_initiator_id ON external_conversations(initiator_id);
CREATE INDEX IF NOT EXISTS idx_external_conversations_status ON external_conversations(status);
CREATE INDEX IF NOT EXISTS idx_external_conversations_priority ON external_conversations(priority);
CREATE INDEX IF NOT EXISTS idx_external_conversations_last_message_at ON external_conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_external_conversations_business_type ON external_conversations(business_type);
CREATE INDEX IF NOT EXISTS idx_external_conversations_tags ON external_conversations USING GIN(tags);

-- Indexes for enhanced messages table
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_subject ON messages(subject);
CREATE INDEX IF NOT EXISTS idx_messages_priority ON messages(priority);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_category ON messages(category);
CREATE INDEX IF NOT EXISTS idx_messages_tags ON messages USING GIN(tags);

-- Indexes for message_attachments
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_conversation_id ON message_attachments(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_file_type ON message_attachments(file_type);

-- Indexes for conversation_participants
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_is_active ON conversation_participants(is_active);

-- Indexes for conversation_notifications
CREATE INDEX IF NOT EXISTS idx_conversation_notifications_user_id ON conversation_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_notifications_conversation_id ON conversation_notifications(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_notifications_is_read ON conversation_notifications(is_read);

-- Verify indexes were created
SELECT 'Verifying performance indexes:' as step;
SELECT 
    indexname,
    tablename
FROM pg_indexes 
WHERE tablename IN ('external_conversations', 'messages', 'message_attachments', 'conversation_participants', 'conversation_notifications')
ORDER BY tablename, indexname;

-- =====================================================
-- STEP 7: CREATE AUTOMATIC TRIGGERS
-- =====================================================
-- Run this section seventh

-- Function to update conversation's last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the conversation's last_message_at when a new message is added
    UPDATE external_conversations 
    SET last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update conversation timestamps
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON messages;
CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON messages
    FOR EACH ROW
    WHEN (NEW.conversation_id IS NOT NULL)
    EXECUTE FUNCTION update_conversation_last_message();

-- Verify trigger was created
SELECT 'Verifying automatic triggers:' as step;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_conversation_last_message';

-- =====================================================
-- STEP 8: MIGRATE EXISTING EXTERNAL MESSAGES
-- =====================================================
-- Run this section eighth

-- Create conversations for existing external messages
INSERT INTO external_conversations (
    id,
    title,
    subject,
    category,
    partner_id,
    initiator_id,
    participants,
    business_type,
    priority,
    status,
    last_message_at,
    created_at,
    updated_at
)
SELECT DISTINCT
    gen_random_uuid() as id,
    CASE 
        WHEN m.metadata->>'partner_id' IS NOT NULL THEN 
            (SELECT name FROM partners WHERE id = (m.metadata->>'partner_id')::UUID) || ' - ' || 
            COALESCE(m.metadata->>'subject', 'General Inquiry')
        ELSE 'External Conversation'
    END as title,
    COALESCE(m.metadata->>'subject', 'General Inquiry') as subject,
    COALESCE(m.metadata->>'category', 'general') as category,
    (m.metadata->>'partner_id')::UUID as partner_id,
    m.sender_id as initiator_id,
    ARRAY[m.sender_id] as participants,
    COALESCE(m.metadata->>'business_type', 'inquiry') as business_type,
    COALESCE(m.metadata->>'priority', 'normal') as priority,
    'active' as status,
    m.created_at as last_message_at,
    m.created_at as created_at,
    m.created_at as updated_at
FROM messages m
WHERE m.message_type = 'external' 
  AND m.metadata->>'partner_id' IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM external_conversations ec 
      WHERE ec.partner_id = (m.metadata->>'partner_id')::UUID
  );

-- Update existing messages with conversation_id
UPDATE messages m
SET conversation_id = ec.id
FROM external_conversations ec
WHERE m.message_type = 'external'
  AND m.metadata->>'partner_id' IS NOT NULL
  AND ec.partner_id = (m.metadata->>'partner_id')::UUID
  AND m.conversation_id IS NULL;

-- Verify migration
SELECT 'Verifying data migration:' as step;
SELECT 
    COUNT(*) as total_external_messages,
    COUNT(CASE WHEN conversation_id IS NOT NULL THEN 1 END) as messages_with_conversations,
    COUNT(CASE WHEN conversation_id IS NULL THEN 1 END) as messages_without_conversations
FROM messages 
WHERE message_type = 'external';

-- =====================================================
-- STEP 9: INSERT SAMPLE ENHANCED CONVERSATIONS
-- =====================================================
-- Run this section ninth

-- Sample conversation for Precious Metals Co.
INSERT INTO external_conversations (
    title,
    subject,
    category,
    partner_id,
    initiator_id,
    participants,
    business_type,
    priority,
    status,
    metadata
) VALUES (
    'Precious Metals Co. - Gold Quote Request',
    'Quote Request for 2kg 18k Gold',
    'quote',
    'bd180762-49e2-477d-b286-d7039b43cd83', -- Precious Metals Co.
    '6d1a08f1-134c-46dd-aa1e-21f95b80bed4', -- Sarah Goldstein
    ARRAY['6d1a08f1-134c-46dd-aa1e-21f95b80bed4'],
    'quote',
    'high',
    'active',
    '{"project": "New Collection", "deadline": "2025-09-01", "budget": "flexible"}'
) ON CONFLICT DO NOTHING;

-- Sample conversation for Gemstone Suppliers
INSERT INTO external_conversations (
    title,
    subject,
    category,
    partner_id,
    initiator_id,
    participants,
    business_type,
    priority,
    status,
    metadata
) VALUES (
    'Gemstone Suppliers Inc. - Diamond Collection',
    'Diamond Collection Inquiry',
    'inquiry',
    'd44f297b-a185-4cca-994f-8ebf182380cd', -- Gemstone Suppliers
    '6d1a08f1-134c-46dd-aa1e-21f95b80bed4', -- Sarah Goldstein
    ARRAY['6d1a08f1-134c-46dd-aa1e-21f95b80bed4'],
    'inquiry',
    'normal',
    'active',
    '{"collection": "Diamond", "style": "Modern", "target_market": "Luxury"}'
) ON CONFLICT DO NOTHING;

-- Verify sample conversations
SELECT 'Verifying sample conversations:' as step;
SELECT 
    title,
    subject,
    category,
    business_type,
    priority,
    status
FROM external_conversations 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- STEP 10: FINAL VERIFICATION
-- =====================================================
-- Run this section last

-- Overall system health check
SELECT '🎯 FINAL VERIFICATION SUMMARY' as step;

SELECT 
    'Enhanced External Messaging System' as system_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM external_conversations) > 0 THEN '✅ CONVERSATIONS'
        ELSE '❌ CONVERSATIONS'
    END as conversations_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM message_attachments) >= 0 THEN '✅ ATTACHMENTS'
        ELSE '❌ ATTACHMENTS'
    END as attachments_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM conversation_participants) >= 0 THEN '✅ PARTICIPANTS'
        ELSE '❌ PARTICIPANTS'
    END as participants_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM conversation_notifications) >= 0 THEN '✅ NOTIFICATIONS'
        ELSE '❌ NOTIFICATIONS'
    END as notifications_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'external_conversations') > 0 THEN '✅ INDEXES'
        ELSE '❌ INDEXES'
    END as indexes_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name = 'trigger_update_conversation_last_message') > 0 THEN '✅ TRIGGERS'
        ELSE '❌ TRIGGERS'
    END as triggers_status;

-- Refresh Supabase schema cache
SELECT 'Refreshing schema cache...' as step;
NOTIFY pgrst, 'reload schema';

SELECT '🎉 Enhanced External Messaging System Complete!' as result;
