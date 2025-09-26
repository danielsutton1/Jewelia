-- =====================================================
-- FIX MESSAGES TABLE SCHEMA FOR ENHANCED MESSAGING
-- =====================================================
-- This script adds the missing columns to the messages table

-- Add missing columns to messages table
DO $$ 
BEGIN
    -- Add message_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'message_type') THEN
        ALTER TABLE messages ADD COLUMN message_type VARCHAR(20) DEFAULT 'external';
        RAISE NOTICE 'Added message_type column to messages table';
    ELSE
        RAISE NOTICE 'message_type column already exists in messages table';
    END IF;

    -- Add sender_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender_id') THEN
        ALTER TABLE messages ADD COLUMN sender_id UUID REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added sender_id column to messages table';
    ELSE
        RAISE NOTICE 'sender_id column already exists in messages table';
    END IF;

    -- Add conversation_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'conversation_id') THEN
        ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES external_conversations(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added conversation_id column to messages table';
    ELSE
        RAISE NOTICE 'conversation_id column already exists in messages table';
    END IF;

    -- Add partner_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'partner_id') THEN
        ALTER TABLE messages ADD COLUMN partner_id UUID REFERENCES partners(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added partner_id column to messages table';
    ELSE
        RAISE NOTICE 'partner_id column already exists in messages table';
    END IF;

    -- Add subject column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'subject') THEN
        ALTER TABLE messages ADD COLUMN subject VARCHAR(255);
        RAISE NOTICE 'Added subject column to messages table';
    ELSE
        RAISE NOTICE 'subject column already exists in messages table';
    END IF;

    -- Add content column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'content') THEN
        ALTER TABLE messages ADD COLUMN content TEXT;
        RAISE NOTICE 'Added content column to messages table';
    ELSE
        RAISE NOTICE 'content column already exists in messages table';
    END IF;

    -- Add content_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'content_type') THEN
        ALTER TABLE messages ADD COLUMN content_type VARCHAR(50) DEFAULT 'text';
        RAISE NOTICE 'Added content_type column to messages table';
    ELSE
        RAISE NOTICE 'content_type column already exists in messages table';
    END IF;

    -- Add priority column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'priority') THEN
        ALTER TABLE messages ADD COLUMN priority VARCHAR(20) DEFAULT 'normal';
        RAISE NOTICE 'Added priority column to messages table';
    ELSE
        RAISE NOTICE 'priority column already exists in messages table';
    END IF;

    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'tags') THEN
        ALTER TABLE messages ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added tags column to messages table';
    ELSE
        RAISE NOTICE 'tags column already exists in messages table';
    END IF;

    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'metadata') THEN
        ALTER TABLE messages ADD COLUMN metadata JSONB DEFAULT '{}';
        RAISE NOTICE 'Added metadata column to messages table';
    ELSE
        RAISE NOTICE 'metadata column already exists in messages table';
    END IF;

    -- Add is_read column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_read') THEN
        ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_read column to messages table';
    ELSE
        RAISE NOTICE 'is_read column already exists in messages table';
    END IF;

    -- Add read_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'read_at') THEN
        ALTER TABLE messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added read_at column to messages table';
    ELSE
        RAISE NOTICE 'read_at column already exists in messages table';
    END IF;

    -- Add delivered_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'delivered_at') THEN
        ALTER TABLE messages ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added delivered_at column to messages table';
    ELSE
        RAISE NOTICE 'delivered_at column already exists in messages table';
    END IF;

    -- Add thread_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'thread_id') THEN
        ALTER TABLE messages ADD COLUMN thread_id UUID;
        RAISE NOTICE 'Added thread_id column to messages table';
    ELSE
        RAISE NOTICE 'thread_id column already exists in messages table';
    END IF;

    -- Add reply_to_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'reply_to_id') THEN
        ALTER TABLE messages ADD COLUMN reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added reply_to_id column to messages table';
    ELSE
        RAISE NOTICE 'reply_to_id column already exists in messages table';
    END IF;

    -- Add related_order_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'related_order_id') THEN
        ALTER TABLE messages ADD COLUMN related_order_id UUID;
        RAISE NOTICE 'Added related_order_id column to messages table';
    ELSE
        RAISE NOTICE 'related_order_id column already exists in messages table';
    END IF;

    -- Add related_project_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'related_project_id') THEN
        ALTER TABLE messages ADD COLUMN related_project_id UUID;
        RAISE NOTICE 'Added related_project_id column to messages table';
    ELSE
        RAISE NOTICE 'related_project_id column already exists in messages table';
    END IF;

END $$;

-- Add constraints for enum values
ALTER TABLE messages 
    ADD CONSTRAINT messages_message_type_check 
    CHECK (message_type IN ('external', 'internal'));

ALTER TABLE messages 
    ADD CONSTRAINT messages_content_type_check 
    CHECK (content_type IN ('text', 'html', 'markdown', 'image', 'file'));

ALTER TABLE messages 
    ADD CONSTRAINT messages_priority_check 
    CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_partner_id ON messages(partner_id);
CREATE INDEX IF NOT EXISTS idx_messages_priority ON messages(priority);
CREATE INDEX IF NOT EXISTS idx_messages_category ON messages(category);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add sender_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_sender_id_fkey'
    ) THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added sender_id foreign key constraint';
    ELSE
        RAISE NOTICE 'sender_id foreign key constraint already exists';
    END IF;

    -- Add conversation_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_conversation_id_fkey'
    ) THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_conversation_id_fkey 
        FOREIGN KEY (conversation_id) REFERENCES external_conversations(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added conversation_id foreign key constraint';
    ELSE
        RAISE NOTICE 'conversation_id foreign key constraint already exists';
    END IF;

    -- Add partner_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_partner_id_fkey'
    ) THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_partner_id_fkey 
        FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added partner_id foreign key constraint';
    ELSE
        RAISE NOTICE 'partner_id foreign key constraint already exists';
    END IF;
END $$;

-- Update existing messages to have default values
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

COMMIT;
