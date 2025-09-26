-- Check current customers table schema
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there's any data in the table
SELECT COUNT(*) as total_customers FROM customers;

-- Show first few rows if any exist
SELECT * FROM customers LIMIT 3; 