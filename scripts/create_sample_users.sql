-- Create Sample Users for Internal Messaging System
-- This will add the users that are referenced in your internal messages

-- Step 1: Check if users table exists and has data
SELECT COUNT(*) as user_count FROM users;

-- Step 2: Insert the missing users if they don't exist
INSERT INTO users (
    id,
    full_name,
    email,
    role,
    jewelry_role,
    department,
    is_active,
    created_at,
    updated_at
) VALUES 
(
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    'Test User',
    'test@jewelia.com',
    'admin',
    'admin',
    'Management',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Michael Jones',
    'michael@jewelia.com',
    'manager',
    'manager',
    'Sales',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    jewelry_role = EXCLUDED.jewelry_role,
    department = EXCLUDED.department,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- Step 3: Verify the users were created
SELECT id, full_name, email, role, jewelry_role, department, is_active 
FROM users 
WHERE id IN (
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    '550e8400-e29b-41d4-a716-446655440001'
);

-- Step 4: Check if the internal messages can now resolve user names
SELECT 
    im.id,
    im.subject,
    im.sender_id,
    sender.full_name as sender_name,
    im.recipient_id,
    recipient.full_name as recipient_name
FROM internal_messages im
LEFT JOIN users sender ON im.sender_id = sender.id
LEFT JOIN users recipient ON im.recipient_id = recipient.id
WHERE im.id = '2b727a2f-9150-473e-bb86-82e5d78b0482';

