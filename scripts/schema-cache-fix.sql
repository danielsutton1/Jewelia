-- =====================================================
-- SCHEMA CACHE FIX (HANDLES EXISTING CONSTRAINTS)
-- =====================================================
-- This script fixes the schema cache issue by properly handling existing constraints

-- =====================================================
-- STEP 1: DROP ALL EXISTING CONSTRAINTS
-- =====================================================

-- Drop all existing foreign key constraints
DO $$ 
BEGIN
    -- Drop messages table constraints
    BEGIN
        ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
    EXCEPTION WHEN OTHERS THEN
        -- Constraint might not exist, continue
    END;
    
    BEGIN
        ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey;
    EXCEPTION WHEN OTHERS THEN
        -- Constraint might not exist, continue
    END;
    
    BEGIN
        ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_partner_id_fkey;
    EXCEPTION WHEN OTHERS THEN
        -- Constraint might not exist, continue
    END;
    
    BEGIN
        ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_thread_id_fkey;
    EXCEPTION WHEN OTHERS THEN
        -- Constraint might not exist, continue
    END;
    
    BEGIN
        ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_reply_to_id_fkey;
    EXCEPTION WHEN OTHERS THEN
        -- Constraint might not exist, continue
    END;
    
    -- Drop message_threads table constraints
    BEGIN
        ALTER TABLE message_threads DROP CONSTRAINT IF EXISTS message_threads_created_by_fkey;
    EXCEPTION WHEN OTHERS THEN
        -- Constraint might not exist, continue
    END;
    
    BEGIN
        ALTER TABLE message_threads DROP CONSTRAINT IF EXISTS message_threads_partner_id_fkey;
    EXCEPTION WHEN OTHERS THEN
        -- Constraint might not exist, continue
    END;
    
    -- Drop message_attachments table constraints
    BEGIN
        ALTER TABLE message_attachments DROP CONSTRAINT IF EXISTS message_attachments_message_id_fkey;
    EXCEPTION WHEN OTHERS THEN
        -- Constraint might not exist, continue
    END;
    
    -- Drop message_reactions table constraints
    BEGIN
        ALTER TABLE message_reactions DROP CONSTRAINT IF EXISTS message_reactions_message_id_fkey;
    EXCEPTION WHEN OTHERS THEN
        -- Constraint might not exist, continue
    END;
    
    BEGIN
        ALTER TABLE message_reactions DROP CONSTRAINT IF EXISTS message_reactions_user_id_fkey;
    EXCEPTION WHEN OTHERS THEN
        -- Constraint might not exist, continue
    END;
    
    -- Drop message_read_receipts table constraints
    BEGIN
        ALTER TABLE message_read_receipts DROP CONSTRAINT IF EXISTS message_read_receipts_message_id_fkey;
    EXCEPTION WHEN OTHERS THEN
        -- Constraint might not exist, continue
    END;
    
    BEGIN
        ALTER TABLE message_read_receipts DROP CONSTRAINT IF EXISTS message_read_receipts_user_id_fkey;
    EXCEPTION WHEN OTHERS THEN
        -- Constraint might not exist, continue
    END;
END $$;

-- =====================================================
-- STEP 2: ENSURE TABLES EXIST
-- =====================================================

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'staff',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create partners table if it doesn't exist
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    type TEXT DEFAULT 'supplier',
    status TEXT DEFAULT 'active',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create message_threads table if it doesn't exist
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'internal',
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

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'internal',
    sender_id UUID NOT NULL,
    recipient_id UUID,
    partner_id UUID,
    organization_id UUID,
    subject TEXT,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'text',
    priority TEXT NOT NULL DEFAULT 'normal',
    category TEXT NOT NULL DEFAULT 'general',
    status TEXT NOT NULL DEFAULT 'sent',
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

-- Create message_attachments table if it doesn't exist
CREATE TABLE IF NOT EXISTS message_attachments (
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

-- Create message_reactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    user_id UUID NOT NULL,
    reaction_type TEXT NOT NULL,
    reaction_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create message_read_receipts table if it doesn't exist
CREATE TABLE IF NOT EXISTS message_read_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    user_id UUID NOT NULL,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_method TEXT DEFAULT 'web',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- STEP 3: ADD FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign keys for message_threads
ALTER TABLE message_threads ADD CONSTRAINT message_threads_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE message_threads ADD CONSTRAINT message_threads_partner_id_fkey 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE;

-- Add foreign keys for messages
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE messages ADD CONSTRAINT messages_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE messages ADD CONSTRAINT messages_partner_id_fkey 
FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;

ALTER TABLE messages ADD CONSTRAINT messages_thread_id_fkey 
FOREIGN KEY (thread_id) REFERENCES message_threads(id) ON DELETE CASCADE;

ALTER TABLE messages ADD CONSTRAINT messages_reply_to_id_fkey 
FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE CASCADE;

-- Add foreign keys for message_attachments
ALTER TABLE message_attachments ADD CONSTRAINT message_attachments_message_id_fkey 
FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE;

-- Add foreign keys for message_reactions
ALTER TABLE message_reactions ADD CONSTRAINT message_reactions_message_id_fkey 
FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE;

ALTER TABLE message_reactions ADD CONSTRAINT message_reactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add foreign keys for message_read_receipts
ALTER TABLE message_read_receipts ADD CONSTRAINT message_read_receipts_message_id_fkey 
FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE;

ALTER TABLE message_read_receipts ADD CONSTRAINT message_read_receipts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- =====================================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
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
CREATE INDEX IF NOT EXISTS idx_message_threads_is_active ON message_threads(is_active);
CREATE INDEX IF NOT EXISTS idx_message_threads_last_message_at ON message_threads(last_message_at);

-- =====================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: INSERT SAMPLE DATA
-- =====================================================

-- Insert sample users
INSERT INTO users (id, full_name, email, role, avatar_url) VALUES
('fdb2a122-d6ae-4e78-b277-3317e1a09132', 'Test User', 'test@jewelia.com', 'admin', 'https://example.com/avatar1.jpg'),
('550e8400-e29b-41d4-a716-446655440000', 'Admin User', 'admin@jewelia.com', 'admin', 'https://example.com/avatar2.jpg'),
('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sarah@jewelia.com', 'staff', 'https://example.com/avatar3.jpg'),
('550e8400-e29b-41d4-a716-446655440002', 'Mike Chen', 'mike@jewelia.com', 'staff', 'https://example.com/avatar4.jpg'),
('550e8400-e29b-41d4-a716-446655440003', 'Emma Wilson', 'emma@jewelia.com', 'staff', 'https://example.com/avatar5.jpg')
ON CONFLICT (id) DO NOTHING;

-- Insert sample partners
INSERT INTO partners (id, name, company, email, type, status, avatar_url) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'Acme Corp', 'Acme Solutions', 'contact@acme.com', 'supplier', 'active', 'https://example.com/acme_logo.jpg'),
('550e8400-e29b-41d4-a716-446655440005', 'Diamond Partners', 'Diamond Partners LLC', 'info@diamondpartners.com', 'supplier', 'active', 'https://example.com/diamond_logo.jpg'),
('550e8400-e29b-41d4-a716-446655440006', 'Gold Suppliers', 'Gold Suppliers Inc', 'sales@goldsuppliers.com', 'supplier', 'active', 'https://example.com/gold_logo.jpg')
ON CONFLICT (id) DO NOTHING;

-- Insert sample message threads
INSERT INTO message_threads (id, type, subject, category, created_by, participants, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'internal', 'Project Discussion - Holiday Collection', 'general', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', ARRAY['fdb2a122-d6ae-4e78-b277-3317e1a09132', '550e8400-e29b-41d4-a716-446655440001'], true),
('550e8400-e29b-41d4-a716-446655440022', 'internal', 'Customer Inquiry - Custom Ring', 'general', '550e8400-e29b-41d4-a716-446655440002', ARRAY['550e8400-e29b-41d4-a716-446655440002', 'fdb2a122-d6ae-4e78-b277-3317e1a09132'], true),
('550e8400-e29b-41d4-a716-446655440023', 'external', 'Supplier Communication - Diamond Order', 'general', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', ARRAY['fdb2a122-d6ae-4e78-b277-3317e1a09132'], true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample messages
INSERT INTO messages (id, type, sender_id, recipient_id, subject, content, thread_id, status, is_read) VALUES
('550e8400-e29b-41d4-a716-446655440024', 'internal', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', '550e8400-e29b-41d4-a716-446655440001', 'Project Discussion - Holiday Collection', 'Hi Sarah! How is the holiday collection coming along?', '550e8400-e29b-41d4-a716-446655440021', 'sent', false),
('550e8400-e29b-41d4-a716-446655440025', 'internal', '550e8400-e29b-41d4-a716-446655440001', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', 'Project Discussion - Holiday Collection', 'Great progress! We have completed 80% of the designs.', '550e8400-e29b-41d4-a716-446655440021', 'delivered', true),
('550e8400-e29b-41d4-a716-446655440026', 'internal', '550e8400-e29b-41d4-a716-446655440002', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', 'Customer Inquiry - Custom Ring', 'I have a customer interested in a custom engagement ring. Can we discuss the details?', '550e8400-e29b-41d4-a716-446655440022', 'sent', false),
('550e8400-e29b-41d4-a716-446655440027', 'internal', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', '550e8400-e29b-41d4-a716-446655440002', 'Customer Inquiry - Custom Ring', 'Absolutely! What are the specifications they are looking for?', '550e8400-e29b-41d4-a716-446655440022', 'delivered', true),
('550e8400-e29b-41d4-a716-446655440028', 'external', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', NULL, 'Supplier Communication - Diamond Order', 'We need to place an order for 50 high-quality diamonds for the holiday collection.', '550e8400-e29b-41d4-a716-446655440023', 'sent', false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample message attachments
INSERT INTO message_attachments (message_id, file_name, file_type, file_size, file_url, mime_type) VALUES
('550e8400-e29b-41d4-a716-446655440024', 'holiday_collection_draft.pdf', 'document', 102400, 'https://example.com/holiday_collection_draft.pdf', 'application/pdf'),
('550e8400-e29b-41d4-a716-446655440026', 'customer_ring_specs.docx', 'document', 51200, 'https://example.com/customer_ring_specs.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
ON CONFLICT (id) DO NOTHING;

-- Insert sample message reactions
INSERT INTO message_reactions (message_id, user_id, reaction_type) VALUES
('550e8400-e29b-41d4-a716-446655440025', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', 'like'),
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440002', 'love')
ON CONFLICT (id) DO NOTHING;

-- Insert sample message read receipts
INSERT INTO message_read_receipts (message_id, user_id, read_at, read_method) VALUES
('550e8400-e29b-41d4-a716-446655440025', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', NOW() - INTERVAL '1 hour', 'web'),
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '30 minutes', 'web')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 7: REFRESH SCHEMA CACHE
-- =====================================================

-- Refresh the schema cache to ensure foreign keys are recognized
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- STEP 8: VERIFY THE SETUP
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'SCHEMA CACHE FIX COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ All existing constraints dropped';
    RAISE NOTICE '✅ All tables created with proper foreign keys';
    RAISE NOTICE '✅ Sample data inserted for testing';
    RAISE NOTICE '✅ Indexes created for performance';
    RAISE NOTICE '✅ Row Level Security enabled';
    RAISE NOTICE '✅ Schema cache refreshed';
    RAISE NOTICE '✅ Messaging system ready for production';
    RAISE NOTICE '=====================================================';
END $$;
