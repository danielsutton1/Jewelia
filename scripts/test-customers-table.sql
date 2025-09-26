-- Test script to see what's in the customers table
-- Run this in Supabase SQL Editor

-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'customers'
) as table_exists;

-- Show all columns in customers table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Count records
SELECT COUNT(*) as total_customers FROM customers;

-- Show first few records (if any)
SELECT * FROM customers LIMIT 3; 