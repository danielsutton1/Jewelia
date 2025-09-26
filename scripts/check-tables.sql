-- Check if required tables exist
-- Run this in your Supabase Dashboard SQL Editor

SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('quotes', 'quote_items', 'order_items', 'products', 'customers', 'orders')
ORDER BY table_name; 