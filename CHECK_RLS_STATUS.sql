-- Check RLS status on core business tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('customers', 'products', 'orders', 'inventory', 'communications')
ORDER BY tablename;

-- Check existing RLS policies
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
WHERE tablename IN ('customers', 'products', 'orders', 'inventory', 'communications')
ORDER BY tablename, policyname;

-- Check if company column exists in customers table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name = 'company';

-- Check if update_customer_company function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'update_customer_company'; 