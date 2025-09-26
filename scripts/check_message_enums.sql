-- Check what enum values are available for message_type and priority
-- This will help identify any schema mismatches

-- Check if the enum types exist
SELECT 
    typname,
    enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE typname IN ('message_type', 'priority', 'message_status')
ORDER BY typname, enumsortorder;

-- Check the internal_messages table structure
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'internal_messages'
ORDER BY ordinal_position;

-- Check if there are any constraints
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'internal_messages'::regclass;

-- Check the actual data in internal_messages
SELECT DISTINCT 
    message_type,
    priority,
    status
FROM internal_messages;

