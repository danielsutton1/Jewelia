-- =====================================================
-- COMPREHENSIVE MESSAGING SYSTEM FIX
-- =====================================================
-- This script fixes all messaging foreign key issues and schema problems

-- First, let's check what tables exist and their current structure
DO $$
BEGIN
    RAISE NOTICE 'Starting messaging system fix...';
END $$;

-- =====================================================
-- 1. DROP AND RECREATE MESSAGES TABLE WITH PROPER CONSTRAINTS
-- =====================================================

-- Drop existing messages table if it exists (this will cascade to dependent objects)
DROP TABLE IF EXISTS messages CASCADE;

-- Create messages table with proper foreign key constraints
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type message_type NOT NULL DEFAULT 'internal',
    sender_id UUID NOT NULL,
    recipient_id UUID,
    partner_id UUID,
    organization_id UUID,
    subject TEXT,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'markdown')),
    priority message_priority NOT NULL DEFAULT 'normal',
    category TEXT NOT NULL DEFAULT 'general',
    status message_status NOT NULL DEFAULT 'sent',
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    thread_id UUID,
    reply_to_id UUID,
    related_order_id UUID,
    related_task_id UUID,
    related_project_id UUID,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraints with explicit names
ALTER TABLE messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT messages_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add other foreign key constraints if the referenced tables exist
DO $$
BEGIN
    -- Check if partners table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partners') THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_partner_id_fkey 
        FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;
    END IF;
    
    -- Check if organizations table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_organization_id_fkey 
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;
    END IF;
    
    -- Check if orders table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_related_order_id_fkey 
        FOREIGN KEY (related_order_id) REFERENCES orders(id) ON DELETE SET NULL;
    END IF;
    
    -- Check if tasks table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_related_task_id_fkey 
        FOREIGN KEY (related_task_id) REFERENCES tasks(id) ON DELETE SET NULL;
    END IF;
    
    -- Check if projects table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_related_project_id_fkey 
        FOREIGN KEY (related_project_id) REFERENCES projects(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add self-referencing foreign key for reply_to_id
ALTER TABLE messages 
ADD CONSTRAINT messages_reply_to_id_fkey 
FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE CASCADE;

-- =====================================================
-- 2. CREATE MESSAGE_THREADS TABLE
-- =====================================================

-- Drop existing message_threads table if it exists
DROP TABLE IF EXISTS message_threads CASCADE;

-- Create message_threads table
CREATE TABLE message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type message_type NOT NULL DEFAULT 'internal',
    subject TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    created_by UUID NOT NULL,
    participants UUID[] NOT NULL DEFAULT '{}',
    partner_id UUID,
    organization_id UUID,
    department_id UUID,
    related_order_id UUID,
    related_project_id UUID,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraints for message_threads
ALTER TABLE message_threads 
ADD CONSTRAINT message_threads_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add other foreign key constraints if the referenced tables exist
DO $$
BEGIN
    -- Check if partners table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partners') THEN
        ALTER TABLE message_threads 
        ADD CONSTRAINT message_threads_partner_id_fkey 
        FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE;
    END IF;
    
    -- Check if organizations table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
        ALTER TABLE message_threads 
        ADD CONSTRAINT message_threads_organization_id_fkey 
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
    
    -- Check if departments table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'departments') THEN
        ALTER TABLE message_threads 
        ADD CONSTRAINT message_threads_department_id_fkey 
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
    END IF;
    
    -- Check if orders table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        ALTER TABLE message_threads 
        ADD CONSTRAINT message_threads_related_order_id_fkey 
        FOREIGN KEY (related_order_id) REFERENCES orders(id) ON DELETE SET NULL;
    END IF;
    
    -- Check if projects table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        ALTER TABLE message_threads 
        ADD CONSTRAINT message_threads_related_project_id_fkey 
        FOREIGN KEY (related_project_id) REFERENCES projects(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key constraint for thread_id in messages table
ALTER TABLE messages 
ADD CONSTRAINT messages_thread_id_fkey 
FOREIGN KEY (thread_id) REFERENCES message_threads(id) ON DELETE CASCADE;

-- =====================================================
-- 3. CREATE MESSAGE ATTACHMENTS TABLE
-- =====================================================

-- Drop existing message_attachments table if it exists
DROP TABLE IF EXISTS message_attachments CASCADE;

-- Create message_attachments table
CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
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

-- Add foreign key constraint
ALTER TABLE message_attachments 
ADD CONSTRAINT message_attachments_message_id_fkey 
FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE;

-- =====================================================
-- 4. CREATE MESSAGE REACTIONS TABLE
-- =====================================================

-- Drop existing message_reactions table if it exists
DROP TABLE IF EXISTS message_reactions CASCADE;

-- Create message_reactions table
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    user_id UUID NOT NULL,
    reaction_type TEXT NOT NULL,
    reaction_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE message_reactions 
ADD CONSTRAINT message_reactions_message_id_fkey 
FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE;

ALTER TABLE message_reactions 
ADD CONSTRAINT message_reactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- =====================================================
-- 5. CREATE MESSAGE READ RECEIPTS TABLE
-- =====================================================

-- Drop existing message_read_receipts table if it exists
DROP TABLE IF EXISTS message_read_receipts CASCADE;

-- Create message_read_receipts table
CREATE TABLE message_read_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    user_id UUID NOT NULL,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_method TEXT DEFAULT 'web',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE message_read_receipts 
ADD CONSTRAINT message_read_receipts_message_id_fkey 
FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE;

ALTER TABLE message_read_receipts 
ADD CONSTRAINT message_read_receipts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- =====================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Indexes for message_threads table
CREATE INDEX IF NOT EXISTS idx_message_threads_created_by ON message_threads(created_by);
CREATE INDEX IF NOT EXISTS idx_message_threads_partner_id ON message_threads(partner_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_organization_id ON message_threads(organization_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_is_active ON message_threads(is_active);
CREATE INDEX IF NOT EXISTS idx_message_threads_last_message_at ON message_threads(last_message_at);

-- Indexes for message_attachments table
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);

-- Indexes for message_reactions table
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);

-- Indexes for message_read_receipts table
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user_id ON message_read_receipts(user_id);

-- =====================================================
-- 7. CREATE ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages table
CREATE POLICY "Users can view messages they sent or received" ON messages
    FOR SELECT USING (
        sender_id = auth.uid() OR 
        recipient_id = auth.uid() OR
        recipient_id IS NULL
    );

CREATE POLICY "Users can insert messages they send" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update messages they sent" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete messages they sent" ON messages
    FOR DELETE USING (sender_id = auth.uid());

-- RLS policies for message_threads table
CREATE POLICY "Users can view threads they participate in" ON message_threads
    FOR SELECT USING (
        created_by = auth.uid() OR 
        auth.uid() = ANY(participants)
    );

CREATE POLICY "Users can create threads" ON message_threads
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update threads they created" ON message_threads
    FOR UPDATE USING (created_by = auth.uid());

-- RLS policies for message_attachments table
CREATE POLICY "Users can view attachments for messages they can see" ON message_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages 
            WHERE messages.id = message_attachments.message_id 
            AND (messages.sender_id = auth.uid() OR messages.recipient_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert attachments for their messages" ON message_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM messages 
            WHERE messages.id = message_attachments.message_id 
            AND messages.sender_id = auth.uid()
        )
    );

-- RLS policies for message_reactions table
CREATE POLICY "Users can view reactions for messages they can see" ON message_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages 
            WHERE messages.id = message_reactions.message_id 
            AND (messages.sender_id = auth.uid() OR messages.recipient_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert their own reactions" ON message_reactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reactions" ON message_reactions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions" ON message_reactions
    FOR DELETE USING (user_id = auth.uid());

-- RLS policies for message_read_receipts table
CREATE POLICY "Users can view read receipts for messages they can see" ON message_read_receipts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages 
            WHERE messages.id = message_read_receipts.message_id 
            AND (messages.sender_id = auth.uid() OR messages.recipient_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert their own read receipts" ON message_read_receipts
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 8. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_threads_updated_at 
    BEFORE UPDATE ON message_threads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_attachments_updated_at 
    BEFORE UPDATE ON message_attachments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. INSERT SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample message thread
INSERT INTO message_threads (id, type, subject, category, created_by, participants, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'internal',
    'Test Conversation',
    'general',
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    ARRAY['fdb2a122-d6ae-4e78-b277-3317e1a09132'],
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert sample messages
INSERT INTO messages (id, type, sender_id, recipient_id, subject, content, thread_id, status)
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'internal',
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    'Test Message',
    'This is a test message to verify the messaging system is working.',
    '550e8400-e29b-41d4-a716-446655440001',
    'sent'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 10. VERIFY THE FIX
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Messaging system fix completed successfully!';
    RAISE NOTICE 'Tables created: messages, message_threads, message_attachments, message_reactions, message_read_receipts';
    RAISE NOTICE 'Foreign key constraints: All properly configured with explicit names';
    RAISE NOTICE 'Indexes: Performance indexes created';
    RAISE NOTICE 'RLS Policies: Security policies enabled';
    RAISE NOTICE 'Sample data: Test messages inserted';
END $$;
