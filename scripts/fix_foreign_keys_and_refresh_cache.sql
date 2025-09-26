-- Fix Foreign Keys and Refresh Supabase Cache
-- This will resolve the "Could not find a relationship" error

-- Step 1: Drop existing foreign key constraints if they exist
DO $$ BEGIN
    ALTER TABLE internal_messages DROP CONSTRAINT IF EXISTS internal_messages_sender_id_fkey;
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE internal_messages DROP CONSTRAINT IF EXISTS internal_messages_recipient_id_fkey;
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

-- Step 2: Add foreign key constraints properly
ALTER TABLE internal_messages
ADD CONSTRAINT internal_messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE internal_messages
ADD CONSTRAINT internal_messages_recipient_id_fkey
FOREIGN KEY (recipient_id) REFERENCES users(id)
ON DELETE CASCADE;

-- Step 3: Refresh Supabase PostgREST schema cache
-- This is crucial for the joins to work properly
NOTIFY pgrst, 'reload schema';

-- Alternative method if NOTIFY doesn't work:
-- SELECT pgrst.reload_schema();

-- Step 4: Verify the constraints are working
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='internal_messages';

