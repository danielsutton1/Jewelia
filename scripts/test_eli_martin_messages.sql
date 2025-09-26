-- Test Script: Verify Eli Martin Can Send and Receive Messages
-- Run this after fixing the internal_messages table structure

-- Test 1: Check if Eli Martin exists and can be found
SELECT 'Test 1: Verifying Eli Martin exists' as test_step;
SELECT 
    id,
    full_name,
    email,
    role,
    department
FROM users 
WHERE full_name = 'Eli Martin';

-- Test 2: Check if the internal_messages table has the proper structure
SELECT 'Test 2: Verifying table structure' as test_step;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'internal_messages' 
AND column_name IN ('sender_id', 'recipient_id', 'subject', 'content', 'message_type', 'priority', 'status')
ORDER BY ordinal_position;

-- Test 3: Check if there are any existing messages for Eli Martin
SELECT 'Test 3: Checking existing messages for Eli Martin' as test_step;
SELECT 
    id,
    sender_id,
    recipient_id,
    subject,
    content,
    status,
    created_at
FROM internal_messages 
WHERE sender_id = 'b2c3d4e5-f6a7-8901-bcde-f23456789012' 
   OR recipient_id = 'b2c3d4e5-f6a7-8901-bcde-f23456789012'
ORDER BY created_at DESC;

-- Test 4: Insert a test message TO Eli Martin
SELECT 'Test 4: Inserting test message TO Eli Martin' as test_step;
INSERT INTO internal_messages (
    sender_id,
    recipient_id,
    subject,
    content,
    message_type,
    priority,
    status,
    company_id
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001', -- Michael Jones
    'b2c3d4e5-f6a7-8901-bcde-f23456789012', -- Eli Martin
    'Production Schedule Update',
    'Hi Eli! I wanted to update you on our production schedule. We have a new order for 50 engagement rings that needs to be completed by next Friday. Can you review the specifications and let me know if we can meet this deadline?',
    'urgent',
    'high',
    'unread',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

-- Test 5: Insert a test message FROM Eli Martin
SELECT 'Test 5: Inserting test message FROM Eli Martin' as test_step;
INSERT INTO internal_messages (
    sender_id,
    recipient_id,
    subject,
    content,
    message_type,
    priority,
    status,
    company_id
) VALUES (
    'b2c3d4e5-f6a7-8901-bcde-f23456789012', -- Eli Martin
    '550e8400-e29b-41d4-a716-446655440001', -- Michael Jones
    'Re: Production Schedule Update',
    'Hi Michael! I have reviewed the specifications for the 50 engagement rings. The design looks great and we should be able to meet the Friday deadline. I will start production immediately and keep you updated on our progress.',
    'general',
    'normal',
    'unread',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

-- Test 6: Verify all messages for Eli Martin
SELECT 'Test 6: Final verification - All messages for Eli Martin' as test_step;
SELECT 
    CASE 
        WHEN sender_id = 'b2c3d4e5-f6a7-8901-bcde-f23456789012' THEN 'SENT'
        ELSE 'RECEIVED'
    END as message_direction,
    id,
    subject,
    content,
    status,
    created_at
FROM internal_messages 
WHERE sender_id = 'b2c3d4e5-f6a7-8901-bcde-f23456789012' 
   OR recipient_id = 'b2c3d4e5-f6a7-8901-bcde-f23456789012'
ORDER BY created_at DESC;

-- Test 7: Count total messages in the system
SELECT 'Test 7: Total message count' as test_step;
SELECT 
    COUNT(*) as total_messages,
    COUNT(CASE WHEN status = 'unread' THEN 1 END) as unread_messages,
    COUNT(CASE WHEN sender_id = 'b2c3d4e5-f6a7-8901-bcde-f23456789012' THEN 1 END) as messages_from_eli,
    COUNT(CASE WHEN recipient_id = 'b2c3d4e5-f6a7-8901-bcde-f23456789012' THEN 1 END) as messages_to_eli
FROM internal_messages;
