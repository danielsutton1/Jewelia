-- Minimal Database Fix Script
-- This script only fixes the immediate errors without changing existing structure
-- Run this in your Supabase Dashboard SQL Editor

-- =====================================================
-- 1. CHECK WHAT WE HAVE FIRST
-- =====================================================

-- Check what tables exist
SELECT 'Current tables:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check products table structure
SELECT 'Products table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check inventory table structure
SELECT 'Inventory table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'inventory' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 2. ADD MISSING COLUMNS TO INVENTORY TABLE
-- =====================================================

-- Add unit_price column to inventory if it doesn't exist
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0;

-- Add value column to inventory if it doesn't exist (computed column)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory' 
        AND column_name = 'value' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE inventory ADD COLUMN value DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED;
    END IF;
END $$;

-- Add status column to inventory if it doesn't exist
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock', 'discontinued'));

-- =====================================================
-- 3. CREATE MISSING TABLES
-- =====================================================

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice', 'video')),
    is_read BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    thread_id UUID,
    parent_message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message_threads table if it doesn't exist
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT,
    participants UUID[] NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for now)
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on message_threads" ON message_threads FOR ALL USING (true);

-- =====================================================
-- 6. VERIFICATION
-- =====================================================

-- Verify tables exist
SELECT 'Tables created successfully:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('messages', 'message_threads')
ORDER BY table_name;

-- Verify inventory columns
SELECT 'Inventory columns:' as status;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'inventory' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Minimal database fix completed!' as final_status;
