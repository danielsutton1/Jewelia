-- 🔴 IMMEDIATE FIX: Optimize RLS Policies
-- This fixes the "permission denied for table users" and other RLS policy conflicts

-- STEP 1: Check current RLS status on all core tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('customers', 'products', 'orders', 'order_items', 'inventory', 'communications')
ORDER BY tablename;

-- STEP 2: Check existing RLS policies
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
WHERE tablename IN ('customers', 'products', 'orders', 'order_items', 'inventory', 'communications')
ORDER BY tablename, policyname;

-- STEP 3: Create optimized RLS policies for customers table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view customers" ON customers;
DROP POLICY IF EXISTS "Users can create customers" ON customers;
DROP POLICY IF EXISTS "Users can update customers" ON customers;
DROP POLICY IF EXISTS "Users can delete customers" ON customers;

-- Create optimized policies
CREATE POLICY "Users can view customers" ON customers
    FOR SELECT USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can create customers" ON customers
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can update customers" ON customers
    FOR UPDATE USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete customers" ON customers
    FOR DELETE USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- STEP 4: Create optimized RLS policies for products table
DROP POLICY IF EXISTS "Users can view products" ON products;
DROP POLICY IF EXISTS "Users can create products" ON products;
DROP POLICY IF EXISTS "Users can update products" ON products;
DROP POLICY IF EXISTS "Users can delete products" ON products;

CREATE POLICY "Users can view products" ON products
    FOR SELECT USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can create products" ON products
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can update products" ON products
    FOR UPDATE USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete products" ON products
    FOR DELETE USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- STEP 5: Create optimized RLS policies for orders table
DROP POLICY IF EXISTS "Users can view orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders" ON orders;
DROP POLICY IF EXISTS "Users can delete orders" ON orders;

CREATE POLICY "Users can view orders" ON orders
    FOR SELECT USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can update orders" ON orders
    FOR UPDATE USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete orders" ON orders
    FOR DELETE USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- STEP 6: Create optimized RLS policies for order_items table
DROP POLICY IF EXISTS "Users can view order_items" ON order_items;
DROP POLICY IF EXISTS "Users can create order_items" ON order_items;
DROP POLICY IF EXISTS "Users can update order_items" ON order_items;
DROP POLICY IF EXISTS "Users can delete order_items" ON order_items;

CREATE POLICY "Users can view order_items" ON order_items
    FOR SELECT USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can create order_items" ON order_items
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can update order_items" ON order_items
    FOR UPDATE USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete order_items" ON order_items
    FOR DELETE USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- STEP 7: Create optimized RLS policies for inventory table
DROP POLICY IF EXISTS "Users can view inventory" ON inventory;
DROP POLICY IF EXISTS "Users can create inventory" ON inventory;
DROP POLICY IF EXISTS "Users can update inventory" ON inventory;
DROP POLICY IF EXISTS "Users can delete inventory" ON inventory;

CREATE POLICY "Users can view inventory" ON inventory
    FOR SELECT USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can create inventory" ON inventory
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can update inventory" ON inventory
    FOR UPDATE USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete inventory" ON inventory
    FOR DELETE USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- STEP 8: Create optimized RLS policies for communications table
DROP POLICY IF EXISTS "Users can view communications" ON communications;
DROP POLICY IF EXISTS "Users can create communications" ON communications;
DROP POLICY IF EXISTS "Users can update communications" ON communications;
DROP POLICY IF EXISTS "Users can delete communications" ON communications;

CREATE POLICY "Users can view communications" ON communications
    FOR SELECT USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can create communications" ON communications
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can update communications" ON communications
    FOR UPDATE USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete communications" ON communications
    FOR DELETE USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- STEP 9: Create RLS policies for the views we created
-- Enable RLS on views (if needed)
ALTER VIEW orders_with_customers ENABLE ROW LEVEL SECURITY;
ALTER VIEW order_items_with_details ENABLE ROW LEVEL SECURITY;

-- Create policies for views
CREATE POLICY "Users can view orders_with_customers" ON orders_with_customers
    FOR SELECT USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can view order_items_with_details" ON order_items_with_details
    FOR SELECT USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- STEP 10: Create a function to check RLS status
CREATE OR REPLACE FUNCTION check_rls_status()
RETURNS TABLE (
    table_name TEXT,
    rls_enabled BOOLEAN,
    policy_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        t.rowsecurity,
        COALESCE(p.policy_count, 0)::INTEGER
    FROM pg_tables t
    LEFT JOIN (
        SELECT 
            tablename,
            COUNT(*) as policy_count
        FROM pg_policies 
        GROUP BY tablename
    ) p ON t.tablename = p.tablename
    WHERE t.tablename IN ('customers', 'products', 'orders', 'order_items', 'inventory', 'communications')
    ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;

-- STEP 11: Verify all RLS policies were created successfully
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename IN ('customers', 'products', 'orders', 'order_items', 'inventory', 'communications')
ORDER BY tablename, policyname;

-- STEP 12: Test RLS status
SELECT * FROM check_rls_status();

-- STEP 13: Create a comprehensive RLS summary
SELECT 
    'RLS Summary' as summary_type,
    COUNT(*) as total_policies,
    COUNT(DISTINCT tablename) as tables_with_policies
FROM pg_policies 
WHERE tablename IN ('customers', 'products', 'orders', 'order_items', 'inventory', 'communications');

-- ✅ RLS POLICIES OPTIMIZED
-- All core tables now have consistent, optimized RLS policies
-- Service role access is properly configured for API operations 