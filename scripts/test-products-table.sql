-- Test script to check products table structure
-- Run this in your Supabase SQL Editor

-- Check if products table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'products'
) as table_exists;

-- If table exists, show its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- Check if there are any rows in the products table
SELECT COUNT(*) as product_count FROM products;

-- Try to select from products table to see what happens
SELECT id, sku, name, status FROM products LIMIT 1; 