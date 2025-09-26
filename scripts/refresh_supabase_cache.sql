-- Refresh Supabase PostgREST Schema Cache
-- This will force Supabase to reload the schema and recognize the new users

-- Option 1: Use NOTIFY (recommended)
NOTIFY pgrst, 'reload schema';

-- Option 2: Use the function (if available)
-- SELECT pgrst.reload_schema();

-- Option 3: Force a schema refresh by querying the users table
SELECT * FROM users LIMIT 1;

-- Option 4: Check if the new users are visible
SELECT 
    id, 
    full_name, 
    email, 
    role, 
    jewelry_role, 
    department,
    created_at
FROM users 
WHERE id IN (
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    '550e8400-e29b-41d4-a716-446655440001'
)
ORDER BY created_at DESC;

-- Option 5: Check total user count
SELECT COUNT(*) as total_users FROM users;

