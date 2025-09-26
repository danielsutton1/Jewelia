-- 🔍 COMMUNICATIONS TABLE STRUCTURE CHECK
-- This will show us what columns exist and what's missing

-- =====================================================
-- STEP 1: Check current table structure
-- =====================================================

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'communications' 
ORDER BY ordinal_position;

-- =====================================================
-- STEP 2: Check if foreign key constraints exist
-- =====================================================

SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'communications' 
    AND tc.constraint_type = 'FOREIGN KEY';

-- =====================================================
-- STEP 3: Check if RLS is enabled
-- =====================================================

SELECT 
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'communications';

-- =====================================================
-- STEP 4: Check if RLS policies exist
-- =====================================================

SELECT 
    policyname,
    cmd,
    permissive,
    CASE 
        WHEN policyname IS NOT NULL THEN '✅ Policy Exists'
        ELSE '❌ No Policies'
    END as policy_status
FROM pg_policies 
WHERE tablename = 'communications';

-- =====================================================
-- STEP 5: Check if indexes exist
-- =====================================================

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'communications';

-- =====================================================
-- STEP 6: Test the API query structure
-- =====================================================

-- This simulates what the API is trying to do
SELECT 
    'Testing sender_id column' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'communications' AND column_name = 'sender_id'
        ) THEN '✅ sender_id exists'
        ELSE '❌ sender_id missing'
    END as result
UNION ALL
SELECT 
    'Testing recipient_id column',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'communications' AND column_name = 'recipient_id'
        ) THEN '✅ recipient_id exists'
        ELSE '❌ recipient_id missing'
    END
UNION ALL
SELECT 
    'Testing content column',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'communications' AND column_name = 'content'
        ) THEN '✅ content exists'
        ELSE '❌ content missing'
    END
UNION ALL
SELECT 
    'Testing foreign key relationships',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'communications' AND constraint_type = 'FOREIGN KEY'
        ) THEN '✅ Foreign keys exist'
        ELSE '❌ Foreign keys missing'
    END; 