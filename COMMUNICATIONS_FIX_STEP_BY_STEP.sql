-- 🔧 COMMUNICATIONS FIX - STEP BY STEP
-- Run these commands ONE AT A TIME in your Supabase SQL Editor
-- This is the SAFEST approach - you can stop at any step

-- =====================================================
-- STEP 1: Check if communications table exists
-- =====================================================
-- Run this first to see the current state

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'communications') 
        THEN '✅ Communications table EXISTS' 
        ELSE '❌ Communications table MISSING' 
    END as table_status;

-- =====================================================
-- STEP 2: Create communications table (if missing)
-- =====================================================
-- Only run this if Step 1 shows "MISSING"

CREATE TABLE IF NOT EXISTS communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID,
    recipient_id UUID,
    subject TEXT,
    content TEXT NOT NULL DEFAULT '',
    type TEXT DEFAULT 'email' CHECK (type IN ('email', 'sms', 'notification', 'internal', 'task')),
    status TEXT DEFAULT 'unread' CHECK (status IN ('draft', 'unread', 'read', 'sent', 'delivered', 'failed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    category TEXT DEFAULT 'general',
    due_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: Check table structure
-- =====================================================
-- Run this to see what columns exist

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'communications' 
ORDER BY ordinal_position;

-- =====================================================
-- STEP 4: Add missing columns (if needed)
-- =====================================================
-- Only run these if the columns are missing from Step 3

ALTER TABLE communications ADD COLUMN IF NOT EXISTS sender_id UUID;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS recipient_id UUID;
ALTER TABLE communications ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';

-- =====================================================
-- STEP 5: Add foreign key constraints (if needed)
-- =====================================================
-- Only run these if the constraints are missing

ALTER TABLE communications 
ADD CONSTRAINT IF NOT EXISTS communications_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE communications 
ADD CONSTRAINT IF NOT EXISTS communications_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- =====================================================
-- STEP 6: Create performance indexes
-- =====================================================
-- These are safe to run multiple times

CREATE INDEX IF NOT EXISTS idx_communications_sender_id ON communications(sender_id);
CREATE INDEX IF NOT EXISTS idx_communications_recipient_id ON communications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);

-- =====================================================
-- STEP 7: Enable RLS
-- =====================================================
-- This is safe to run

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 8: Create RLS policies
-- =====================================================
-- These are safe to run multiple times

DROP POLICY IF EXISTS "Users can view their communications" ON communications;
CREATE POLICY "Users can view their communications" ON communications
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            sender_id = auth.uid() OR 
            recipient_id = auth.uid() OR 
            auth.uid() IN (
                SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
            )
        )
    );

DROP POLICY IF EXISTS "Users can create communications" ON communications;
CREATE POLICY "Users can create communications" ON communications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- STEP 9: Add sample data (if table is empty)
-- =====================================================
-- Only run this if you want sample data

INSERT INTO communications (
    sender_id,
    recipient_id,
    subject,
    content,
    type,
    status,
    priority,
    category
)
SELECT 
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'Welcome to Jewelry CRM',
    'Welcome to your new jewelry management system! This is your first communication.',
    'internal',
    'read',
    'normal',
    'welcome'
WHERE NOT EXISTS (SELECT 1 FROM communications);

-- =====================================================
-- STEP 10: Final verification
-- =====================================================
-- Run this to confirm everything is working

SELECT 
    'Table exists' as check_item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'communications') 
         THEN '✅ PASS' ELSE '❌ FAIL' END as result
UNION ALL
SELECT 
    'sender_id column exists',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communications' AND column_name = 'sender_id') 
         THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
    'recipient_id column exists',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communications' AND column_name = 'recipient_id') 
         THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
    'content column exists',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communications' AND column_name = 'content') 
         THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
    'Foreign key constraints exist',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'communications' AND constraint_type = 'FOREIGN KEY') 
         THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
    'RLS is enabled',
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'communications' AND rowsecurity = true) 
         THEN '✅ PASS' ELSE '❌ FAIL' END
UNION ALL
SELECT 
    'RLS policies exist',
    CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communications') 
         THEN '✅ PASS' ELSE '❌ FAIL' END; 