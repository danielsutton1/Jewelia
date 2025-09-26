-- Check Actual Customers Table Schema
-- This will show us exactly what columns exist and their constraints

SELECT 'Current customers table schema:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN is_nullable = 'NO' THEN 'REQUIRED'
        ELSE 'OPTIONAL'
    END as constraint_type
FROM information_schema.columns 
WHERE table_name = 'customers' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if table exists and has any data
SELECT 'Table exists:' as info, EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'customers' AND table_schema = 'public'
) as table_exists;

SELECT 'Current row count:' as info, COUNT(*) as total_rows FROM customers;

-- Show a sample row to understand the data structure
SELECT 'Sample data:' as info;
SELECT * FROM customers LIMIT 1; 