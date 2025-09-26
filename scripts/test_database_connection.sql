-- Test Database Connection and Users Table Access
-- This will help us debug why the service can't find users

-- Test 1: Check if we can access the users table
SELECT 'Test 1: Basic users table access' as test_name;
SELECT COUNT(*) as total_users FROM users;

-- Test 2: Check if our specific users exist
SELECT 'Test 2: Check specific users' as test_name;
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

-- Test 3: Check if we can query with the exact same query the service uses
SELECT 'Test 3: Test service query' as test_name;
SELECT 
    id, 
    full_name, 
    email
FROM users 
WHERE id IN (
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    '550e8400-e29b-41d4-a716-446655440001'
);

-- Test 4: Check table permissions
SELECT 'Test 4: Check table permissions' as test_name;
SELECT 
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'users' 
AND grantee = current_user;

-- Test 5: Check if there are any RLS policies blocking access
SELECT 'Test 5: Check RLS policies' as test_name;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

