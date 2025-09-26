-- 🧪 TEST CRITICAL FIXES - JEWELIA CRM
-- Run this script after applying the critical fixes to verify everything works

-- ========================================
-- TEST 1: Verify Database Functions
-- ========================================

-- Test exec_sql function
SELECT 
    'exec_sql function' as test_name,
    CASE 
        WHEN function_exists('exec_sql') THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

-- Test update_customer_company function
SELECT 
    'update_customer_company function' as test_name,
    CASE 
        WHEN function_exists('update_customer_company') THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

-- ========================================
-- TEST 2: Verify Communications Foreign Keys
-- ========================================

-- Test communications foreign key constraints
SELECT 
    'communications sender_id fkey' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'communications' 
            AND constraint_name = 'communications_sender_id_fkey'
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

SELECT 
    'communications recipient_id fkey' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'communications' 
            AND constraint_name = 'communications_recipient_id_fkey'
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

-- Test communications table access
SELECT 
    'communications table access' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM communications LIMIT 1) >= 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

-- ========================================
-- TEST 3: Verify Orders API Relationships
-- ========================================

-- Test orders foreign key constraints
SELECT 
    'orders customer_id fkey' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'orders' 
            AND constraint_name = 'orders_customer_id_fkey'
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

SELECT 
    'order_items order_id fkey' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'order_items' 
            AND constraint_name = 'order_items_order_id_fkey'
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

SELECT 
    'order_items product_id fkey' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'order_items' 
            AND constraint_name = 'order_items_product_id_fkey'
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

-- Test orders table access
SELECT 
    'orders table access' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM orders LIMIT 1) >= 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

-- Test order_items table access
SELECT 
    'order_items table access' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM order_items LIMIT 1) >= 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

-- Test views
SELECT 
    'orders_with_customers view' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'orders_with_customers'
            AND table_schema = 'public'
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

SELECT 
    'order_items_with_details view' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'order_items_with_details'
            AND table_schema = 'public'
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

-- ========================================
-- TEST 4: Verify RLS Policies
-- ========================================

-- Test RLS policies for each table
SELECT 
    'customers RLS policies' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'customers') >= 4 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

SELECT 
    'products RLS policies' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'products') >= 4 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

SELECT 
    'orders RLS policies' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'orders') >= 4 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

SELECT 
    'order_items RLS policies' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'order_items') >= 4 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

SELECT 
    'inventory RLS policies' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'inventory') >= 4 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

SELECT 
    'communications RLS policies' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'communications') >= 4 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

-- ========================================
-- TEST 5: Test Sample Queries
-- ========================================

-- Test communications query (should work without foreign key errors)
SELECT 
    'communications sample query' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM communications LIMIT 5) >= 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

-- Test orders with customers join (should work without relationship conflicts)
SELECT 
    'orders with customers join' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM orders o LEFT JOIN customers c ON o.customer_id = c.id LIMIT 5) >= 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

-- Test order_items with orders and products join
SELECT 
    'order_items with orders and products join' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM order_items oi LEFT JOIN orders o ON oi.order_id = o.id LEFT JOIN products p ON oi.product_id = p.id LIMIT 5) >= 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

-- Test view queries
SELECT 
    'orders_with_customers view query' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM orders_with_customers LIMIT 5) >= 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

SELECT 
    'order_items_with_details view query' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM order_items_with_details LIMIT 5) >= 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status;

-- ========================================
-- TEST 6: Function Tests
-- ========================================

-- Test update_customer_company function (with a safe test)
DO $$
DECLARE
    test_customer_id UUID;
BEGIN
    -- Get a test customer ID
    SELECT id INTO test_customer_id FROM customers LIMIT 1;
    
    IF test_customer_id IS NOT NULL THEN
        -- Test the function (this should not fail)
        PERFORM update_customer_company(test_customer_id, 'Test Company');
        RAISE NOTICE '✅ update_customer_company function test PASSED';
    ELSE
        RAISE NOTICE 'ℹ️ No customers found for testing update_customer_company function';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ update_customer_company function test FAILED: %', SQLERRM;
END $$;

-- ========================================
-- SUMMARY REPORT
-- ========================================

-- Count total tests and results
SELECT 
    'TEST SUMMARY' as summary_type,
    COUNT(*) as total_tests,
    COUNT(CASE WHEN status = '✅ PASS' THEN 1 END) as passed_tests,
    COUNT(CASE WHEN status = '❌ FAIL' THEN 1 END) as failed_tests
FROM (
    SELECT 'exec_sql function' as test_name, CASE WHEN function_exists('exec_sql') THEN '✅ PASS' ELSE '❌ FAIL' END as status
    UNION ALL
    SELECT 'update_customer_company function', CASE WHEN function_exists('update_customer_company') THEN '✅ PASS' ELSE '❌ FAIL' END
    UNION ALL
    SELECT 'communications sender_id fkey', CASE WHEN EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'communications' AND constraint_name = 'communications_sender_id_fkey') THEN '✅ PASS' ELSE '❌ FAIL' END
    UNION ALL
    SELECT 'communications recipient_id fkey', CASE WHEN EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'communications' AND constraint_name = 'communications_recipient_id_fkey') THEN '✅ PASS' ELSE '❌ FAIL' END
    UNION ALL
    SELECT 'orders customer_id fkey', CASE WHEN EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'orders' AND constraint_name = 'orders_customer_id_fkey') THEN '✅ PASS' ELSE '❌ FAIL' END
    UNION ALL
    SELECT 'order_items order_id fkey', CASE WHEN EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'order_items' AND constraint_name = 'order_items_order_id_fkey') THEN '✅ PASS' ELSE '❌ FAIL' END
    UNION ALL
    SELECT 'order_items product_id fkey', CASE WHEN EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'order_items' AND constraint_name = 'order_items_product_id_fkey') THEN '✅ PASS' ELSE '❌ FAIL' END
    UNION ALL
    SELECT 'customers RLS policies', CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'customers') >= 4 THEN '✅ PASS' ELSE '❌ FAIL' END
    UNION ALL
    SELECT 'products RLS policies', CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'products') >= 4 THEN '✅ PASS' ELSE '❌ FAIL' END
    UNION ALL
    SELECT 'orders RLS policies', CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'orders') >= 4 THEN '✅ PASS' ELSE '❌ FAIL' END
    UNION ALL
    SELECT 'order_items RLS policies', CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'order_items') >= 4 THEN '✅ PASS' ELSE '❌ FAIL' END
    UNION ALL
    SELECT 'inventory RLS policies', CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'inventory') >= 4 THEN '✅ PASS' ELSE '❌ FAIL' END
    UNION ALL
    SELECT 'communications RLS policies', CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'communications') >= 4 THEN '✅ PASS' ELSE '❌ FAIL' END
) as test_results;

-- ========================================
-- ✅ TESTING COMPLETE
-- ========================================

-- If all tests pass, your critical fixes are working correctly!
-- You can now test your API endpoints:
-- - /api/communications should work without foreign key errors
-- - /api/orders should work without relationship conflicts  
-- - /api/customers should work with update_customer_company function
-- - /api/products should work with proper RLS policies
-- - /api/inventory should work with proper RLS policies 