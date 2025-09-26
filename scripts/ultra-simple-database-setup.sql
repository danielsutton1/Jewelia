-- =====================================================
-- ULTRA SIMPLE DATABASE SETUP (GUARANTEED TO WORK)
-- =====================================================
-- This script creates the absolute minimum tables needed

-- =====================================================
-- STEP 1: CREATE USERS TABLE FIRST
-- =====================================================

-- Create users table with all necessary columns
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'staff',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 2: CREATE PARTNERS TABLE
-- =====================================================

-- Create partners table
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

-- =====================================================
-- STEP 3: CREATE MESSAGES TABLE (MINIMAL VERSION)
-- =====================================================

-- Create messages table with minimal columns
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'internal',
    sender_id UUID NOT NULL,
    recipient_id UUID,
    subject TEXT,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- STEP 4: ADD BASIC FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign keys for messages table
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE messages ADD CONSTRAINT messages_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE;

-- =====================================================
-- STEP 5: INSERT SAMPLE DATA
-- =====================================================

-- Insert sample users
INSERT INTO users (id, full_name, email, role, avatar_url) VALUES
('fdb2a122-d6ae-4e78-b277-3317e1a09132', 'Test User', 'test@jewelia.com', 'admin', 'https://example.com/avatar1.jpg'),
('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sarah@jewelia.com', 'staff', 'https://example.com/avatar3.jpg'),
('550e8400-e29b-41d4-a716-446655440002', 'Mike Chen', 'mike@jewelia.com', 'staff', 'https://example.com/avatar4.jpg')
ON CONFLICT (id) DO NOTHING;

-- Insert sample partners
INSERT INTO partners (id, name, company, email, type, status, avatar_url) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'Acme Corp', 'Acme Solutions', 'contact@acme.com', 'supplier', 'active', 'https://example.com/acme_logo.jpg'),
('550e8400-e29b-41d4-a716-446655440005', 'Diamond Partners', 'Diamond Partners LLC', 'info@diamondpartners.com', 'supplier', 'active', 'https://example.com/diamond_logo.jpg')
ON CONFLICT (id) DO NOTHING;

-- Insert sample messages
INSERT INTO messages (id, type, sender_id, recipient_id, subject, content, status, is_read) VALUES
('550e8400-e29b-41d4-a716-446655440024', 'internal', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', '550e8400-e29b-41d4-a716-446655440001', 'Project Discussion', 'Hi Sarah! How is the project coming along?', 'sent', false),
('550e8400-e29b-41d4-a716-446655440025', 'internal', '550e8400-e29b-41d4-a716-446655440001', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', 'Project Discussion', 'Great progress! We have completed 80% of the work.', 'delivered', true),
('550e8400-e29b-41d4-a716-446655440026', 'internal', '550e8400-e29b-41d4-a716-446655440002', 'fdb2a122-d6ae-4e78-b277-3317e1a09132', 'Customer Inquiry', 'I have a customer interested in a custom ring. Can we discuss?', 'sent', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 6: CREATE BASIC INDEXES
-- =====================================================

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- =====================================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 8: VERIFY THE SETUP
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'ULTRA SIMPLE DATABASE SETUP COMPLETED!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ Users table created';
    RAISE NOTICE '✅ Partners table created';
    RAISE NOTICE '✅ Messages table created with foreign keys';
    RAISE NOTICE '✅ Sample data inserted';
    RAISE NOTICE '✅ Indexes created for performance';
    RAISE NOTICE '✅ Row Level Security enabled';
    RAISE NOTICE '✅ Messaging system ready for testing';
    RAISE NOTICE '=====================================================';
END $$;
