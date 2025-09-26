-- =====================================================
-- MIGRATE EXISTING MESSAGES TO ENHANCED STRUCTURE
-- =====================================================
-- This script migrates existing messages to work with the enhanced messaging system

-- First, let's create a temporary table to store the migration data
CREATE TEMP TABLE message_migration AS
SELECT 
    m.id,
    m.message_type,
    m.sender_id,
    m.content,
    m.created_at,
    -- Assign to the first external conversation for now
    (SELECT id FROM external_conversations LIMIT 1) as conversation_id,
    -- Assign to the first partner for now
    (SELECT id FROM partners LIMIT 1) as partner_id,
    -- Extract subject from content (first 50 characters)
    CASE 
        WHEN LENGTH(m.content) > 50 THEN LEFT(m.content, 50) || '...'
        ELSE m.content
    END as subject,
    -- Set default values for new columns
    'text' as content_type,
    'normal' as priority,
    'general' as category,
    'active' as status,
    '{}'::text[] as tags,
    '{}'::jsonb as metadata,
    FALSE as is_read,
    NULL::timestamp with time zone as read_at,
    NULL::timestamp with time zone as delivered_at,
    NULL::uuid as thread_id,
    NULL::uuid as reply_to_id,
    NULL::uuid as related_order_id,
    NULL::uuid as related_project_id
FROM messages m
WHERE m.conversation_id IS NULL;

-- Update existing messages with the new structure
UPDATE messages 
SET 
    conversation_id = mm.conversation_id,
    partner_id = mm.partner_id,
    subject = mm.subject,
    content_type = mm.content_type,
    priority = mm.priority,
    category = mm.category,
    status = mm.status,
    tags = mm.tags,
    metadata = mm.metadata,
    is_read = mm.is_read,
    read_at = mm.read_at,
    delivered_at = mm.delivered_at,
    thread_id = mm.thread_id,
    reply_to_id = mm.read_at,
    related_order_id = mm.related_order_id,
    related_project_id = mm.related_project_id
FROM message_migration mm
WHERE messages.id = mm.id;

-- Clean up temporary table
DROP TABLE message_migration;

-- Now let's create some sample conversations and link messages to them
-- Create a conversation for the gold inquiry
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
    'Diamond Collection Inquiry',
    'Diamond Collection Catalog Request',
    'inquiry',
    'd44f297b-a185-4cca-994f-8ebf182380cd',
    '6d1a08f1-134c-46dd-aa1e-21f95b80bed4',
    'inquiry',
    'normal',
    'active',
    ARRAY['diamonds', 'catalog', 'inquiry'],
    '{}'
),
(
    'General Communication',
    'General Business Communication',
    'general',
    'bd180762-49e2-477d-b286-d7039b43cd83',
    '6d1a08f1-134c-46dd-aa1e-21f95b80bed4',
    'general',
    'normal',
    'active',
    ARRAY['general', 'communication'],
    '{}'
)
ON CONFLICT DO NOTHING;

-- Link existing messages to conversations based on content
UPDATE messages 
SET 
    conversation_id = (
        CASE 
            WHEN content ILIKE '%gold%' OR content ILIKE '%18k%' THEN 
                (SELECT id FROM external_conversations WHERE title = 'Gold Collection Inquiry' LIMIT 1)
            WHEN content ILIKE '%diamond%' OR content ILIKE '%catalog%' THEN 
                (SELECT id FROM external_conversations WHERE title = 'Diamond Collection Inquiry' LIMIT 1)
            ELSE 
                (SELECT id FROM external_conversations WHERE title = 'General Communication' LIMIT 1)
        END
    ),
    partner_id = (
        CASE 
            WHEN content ILIKE '%gold%' OR content ILIKE '%18k%' OR content ILIKE '%diamond%' OR content ILIKE '%catalog%' THEN 
                'd44f297b-a185-4cca-994f-8ebf182380cd'
            ELSE 
                'bd180762-49e2-477d-b286-d7039b43cd83'
        END
    ),
    subject = CASE 
        WHEN LENGTH(content) > 50 THEN LEFT(content, 50) || '...'
        ELSE content
    END,
    content_type = 'text',
    priority = 'normal',
    category = 'general',
    status = 'active',
    tags = '{}',
    metadata = '{}',
    is_read = FALSE
WHERE conversation_id IS NULL;

-- Update participants arrays
UPDATE external_conversations 
SET participants = ARRAY['6d1a08f1-134c-46dd-aa1e-21f95b80bed4']
WHERE initiator_id = '6d1a08f1-134c-46dd-aa1e-21f95b80bed4';

-- Insert conversation participants
INSERT INTO conversation_participants (conversation_id, user_id, role)
SELECT id, initiator_id, 'owner'
FROM external_conversations
WHERE initiator_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Update conversation last_message_at based on actual messages
UPDATE external_conversations 
SET last_message_at = (
    SELECT MAX(created_at) 
    FROM messages 
    WHERE conversation_id = external_conversations.id
)
WHERE id IN (SELECT DISTINCT conversation_id FROM messages WHERE conversation_id IS NOT NULL);

COMMIT;
