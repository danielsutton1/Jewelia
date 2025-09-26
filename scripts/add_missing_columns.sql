-- Add missing columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'external';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS partner_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS subject VARCHAR(255);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) DEFAULT 'text';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS thread_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS related_order_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS related_project_id UUID;

-- Update existing messages to have proper values
UPDATE messages SET 
    message_type = COALESCE(message_type, 'external'),
    content_type = COALESCE(content_type, 'text'),
    priority = COALESCE(priority, 'normal'),
    tags = COALESCE(tags, '{}'),
    metadata = COALESCE(metadata, '{}'),
    is_read = COALESCE(is_read, FALSE)
WHERE message_type IS NULL 
   OR content_type IS NULL 
   OR priority IS NULL 
   OR tags IS NULL 
   OR metadata IS NULL 
   OR is_read IS NULL;

-- Link messages to conversations
UPDATE messages 
SET conversation_id = '4edbb664-0ada-491a-95b7-2e0bddd10565',
    partner_id = 'd44f297b-a185-4cca-994f-8ebf182380cd',
    subject = CASE 
        WHEN LENGTH(content) > 50 THEN LEFT(content, 50) || '...'
        ELSE content
    END
WHERE conversation_id IS NULL;

COMMIT;
