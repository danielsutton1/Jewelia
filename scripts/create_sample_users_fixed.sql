-- Create Sample Users for Internal Messaging System (Fixed Version)
-- This script first checks your table structure, then creates compatible INSERT statements

-- Step 1: Check what columns your users table actually has
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Step 2: Check if users table has any data
SELECT COUNT(*) as user_count FROM users;

-- Step 3: Insert the missing users (adjust columns based on Step 1 results)
-- This is a template - you'll need to modify it based on your actual table structure

-- Option A: If your table has basic columns only
INSERT INTO users (
    id,
    full_name,
    email
) VALUES 
(
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    'Test User',
    'test@jewelia.com'
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Michael Jones',
    'michael@jewelia.com'
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

-- Option B: If your table has more columns (uncomment and modify as needed)
-- INSERT INTO users (
--     id,
--     full_name,
--     email,
--     role,
--     jewelry_role,
--     department
-- ) VALUES 
-- (
--     'fdb2a122-d6ae-4e78-b277-3317e1a09132',
--     'Test User',
--     'test@jewelia.com',
--     'admin',
--     'admin',
--     'Management'
-- ),
-- (
--     '550e8400-e29b-41d4-a716-446655440001',
--     'Michael Jones',
--     'michael@jewelia.com',
--     'manager',
--     'manager',
--     'Sales'
-- )
-- ON CONFLICT (id) DO UPDATE SET
--     full_name = EXCLUDED.full_name,
--     email = EXCLUDED.email,
--     role = EXCLUDED.role,
--     jewelry_role = EXCLUDED.jewelry_role,
--     department = EXCLUDED.department;

-- Step 4: Verify the users were created
SELECT id, full_name, email 
FROM users 
WHERE id IN (
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    '550e8400-e29b-41d4-a716-446655440001'
);

-- Step 5: Test if the internal messages can now resolve user names
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

