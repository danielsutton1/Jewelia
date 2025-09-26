-- Fix Users Table RLS Policies
-- This will ensure the InternalMessagingService can access user data

-- Step 1: Check current RLS policies on users table
SELECT 'Current RLS Policies on users table:' as step;
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

-- Step 2: Check if RLS is enabled on users table
SELECT 'RLS Status on users table:' as step;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- Step 3: Temporarily disable RLS on users table for testing
SELECT 'Disabling RLS on users table...' as step;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 4: Verify RLS is disabled
SELECT 'Verifying RLS is disabled:' as step;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- Step 5: Test if we can now access users from the service
SELECT 'Testing access to users table:' as step;
SELECT 
    id, 
    full_name, 
    email, 
    role, 
    jewelry_role, 
    department
FROM users 
WHERE id IN (
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    '550e8400-e29b-41d4-a716-446655440001'
);

-- Step 6: Refresh Supabase schema cache
SELECT 'Refreshing Supabase schema cache...' as step;
NOTIFY pgrst, 'reload schema';

-- Step 7: Create a proper RLS policy that allows internal messaging access
SELECT 'Creating proper RLS policy for internal messaging...' as step;
CREATE POLICY IF NOT EXISTS "Allow internal messaging access" ON users
    FOR SELECT
    USING (true); -- Allow all users to be read for internal messaging

-- Step 8: Re-enable RLS with the new policy
SELECT 'Re-enabling RLS with new policy...' as step;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 9: Final verification
SELECT 'Final verification - users accessible with RLS enabled:' as step;
SELECT 
    id, 
    full_name, 
    email, 
    role, 
    jewelry_role, 
    department
FROM users 
WHERE id IN (
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    '550e8400-e29b-41d4-a716-446655440001'
);
