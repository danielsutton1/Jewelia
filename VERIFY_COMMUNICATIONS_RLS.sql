-- Verify RLS is enabled on communications table
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'communications';

-- Check existing RLS policies on communications table
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'communications'
ORDER BY policyname;

-- Check all tables RLS status
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('customers', 'products', 'orders', 'inventory', 'communications')
ORDER BY tablename;

-- Count total RLS policies across all core tables
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('customers', 'products', 'orders', 'inventory', 'communications')
GROUP BY tablename
ORDER BY tablename; 