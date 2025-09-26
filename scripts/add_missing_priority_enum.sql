-- Add the missing priority enum
-- This will fix the priority field validation errors

-- Create the priority enum type
CREATE TYPE priority AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);

-- Check if the internal_messages table has the priority column
-- If not, add it
DO $$ BEGIN
    ALTER TABLE internal_messages ADD COLUMN priority priority DEFAULT 'normal';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Verify the enum was created
SELECT 
    typname,
    enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE typname = 'priority'
ORDER BY enumsortorder;

-- Verify the table structure
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'internal_messages'
AND column_name = 'priority';

