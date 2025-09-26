-- Test Internal Messaging System
-- Run this to verify everything is working

-- 1. Check if tables exist
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('internal_messages', 'users', 'businesses')
ORDER BY table_name, ordinal_position;

-- 2. Check if we have users
SELECT 
    id,
    email,
    full_name,
    jewelry_role,
    department,
    business_id
FROM users 
WHERE business_id IS NOT NULL;

-- 3. Check if we have businesses
SELECT * FROM businesses;

-- 4. Check if we have any existing messages
SELECT 
    id,
    sender_id,
    recipient_id,
    subject,
    content,
    message_type,
    priority,
    status,
    business_id,
    created_at
FROM internal_messages;

-- 5. Test inserting a new message
INSERT INTO internal_messages (
    sender_id, 
    recipient_id, 
    subject, 
    content, 
    message_type, 
    priority, 
    business_id
) VALUES (
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',  -- Test User (sender)
    '550e8400-e29b-41d4-a716-446655440001',   -- Michael Jones (recipient)
    'Test Message from SQL',
    'This is a test message to verify the internal messaging system is working.',
    'general',
    'normal',
    '550e8400-e29b-41d4-a716-446655440000'   -- Jewelia business
);

-- 6. Verify the message was inserted
SELECT 
    id,
    sender_id,
    recipient_id,
    subject,
    content,
    message_type,
    priority,
    status,
    business_id,
    created_at
FROM internal_messages 
WHERE subject = 'Test Message from SQL';

-- 7. Test querying messages for a specific user
SELECT 
    m.*,
    s.full_name as sender_name,
    r.full_name as recipient_name
FROM internal_messages m
JOIN users s ON m.sender_id = s.id
JOIN users r ON m.recipient_id = r.id
WHERE m.recipient_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY m.created_at DESC;

