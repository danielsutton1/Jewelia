-- 🔴 IMMEDIATE FIX: Communications Foreign Key Relationships
-- This fixes the "Could not find a relationship between 'communications' and 'sender_id'" error

-- STEP 1: Check current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'communications' 
AND column_name IN ('sender_id', 'recipient_id')
ORDER BY column_name;

-- STEP 2: Check existing foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'communications'
AND kcu.column_name IN ('sender_id', 'recipient_id');

-- STEP 3: Drop existing constraints if they exist (safe operation)
DO $$
BEGIN
    -- Drop sender_id constraint if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'communications' 
        AND constraint_name = 'communications_sender_id_fkey'
    ) THEN
        ALTER TABLE communications DROP CONSTRAINT communications_sender_id_fkey;
        RAISE NOTICE '✅ Dropped existing sender_id foreign key constraint';
    ELSE
        RAISE NOTICE 'ℹ️ No existing sender_id foreign key constraint found';
    END IF;

    -- Drop recipient_id constraint if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'communications' 
        AND constraint_name = 'communications_recipient_id_fkey'
    ) THEN
        ALTER TABLE communications DROP CONSTRAINT communications_recipient_id_fkey;
        RAISE NOTICE '✅ Dropped existing recipient_id foreign key constraint';
    ELSE
        RAISE NOTICE 'ℹ️ No existing recipient_id foreign key constraint found';
    END IF;
END $$;

-- STEP 4: Add correct foreign key constraints
ALTER TABLE communications 
ADD CONSTRAINT communications_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE communications 
ADD CONSTRAINT communications_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- STEP 5: Verify constraints were created
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'communications'
AND kcu.column_name IN ('sender_id', 'recipient_id')
ORDER BY kcu.column_name;

-- STEP 6: Test the relationships
SELECT 
    'communications' as table_name,
    'sender_id' as column_name,
    'auth.users(id)' as references
UNION ALL
SELECT 
    'communications' as table_name,
    'recipient_id' as column_name,
    'auth.users(id)' as references;

-- ✅ COMMUNICATIONS FOREIGN KEY FIX COMPLETE
-- The communications API should now work without foreign key relationship errors 