-- Safe conversion of priority column to priority enum
-- This handles the default value conversion properly

-- Step 1: Create the priority enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE priority AS ENUM (
        'low',
        'normal',
        'high',
        'urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Remove the default value temporarily
ALTER TABLE internal_messages ALTER COLUMN priority DROP DEFAULT;

-- Step 3: Convert the column type
ALTER TABLE internal_messages 
ALTER COLUMN priority TYPE priority 
USING 
    CASE 
        WHEN priority = 'low' THEN 'low'::priority
        WHEN priority = 'normal' THEN 'normal'::priority
        WHEN priority = 'high' THEN 'high'::priority
        WHEN priority = 'urgent' THEN 'urgent'::priority
        ELSE 'normal'::priority
    END;

-- Step 4: Add the default value back with proper enum type
ALTER TABLE internal_messages ALTER COLUMN priority SET DEFAULT 'normal'::priority;

-- Step 5: Verify the conversion
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'internal_messages'
AND column_name = 'priority';

-- Step 6: Test inserting a message with priority
INSERT INTO internal_messages (
    sender_id, 
    recipient_id, 
    subject, 
    content, 
    message_type, 
    priority, 
    business_id
) VALUES (
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    '550e8400-e29b-41d4-a716-446655440001',
    'Test Priority Conversion',
    'This message tests if the priority enum conversion worked.',
    'general',
    'high',
    '550e8400-e29b-41d4-a716-446655440000'
);

-- Step 7: Verify the test message
SELECT 
    id,
    subject,
    priority,
    created_at
FROM internal_messages 
WHERE subject = 'Test Priority Conversion';

