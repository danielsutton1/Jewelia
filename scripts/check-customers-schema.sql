-- Check the actual schema of the customers table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check what data exists in the customers table
SELECT * FROM customers LIMIT 5; 