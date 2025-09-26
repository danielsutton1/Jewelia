-- Check Current Customers Table Schema
-- This will show us exactly what columns exist

SELECT 'Current customers table schema:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'customers' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if table exists and has any data
SELECT 'Table exists:' as info, EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'customers' AND table_schema = 'public'
) as table_exists;

SELECT 'Current row count:' as info, COUNT(*) as total_rows FROM customers; 