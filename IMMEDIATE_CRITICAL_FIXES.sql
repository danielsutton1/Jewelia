-- 🔴 IMMEDIATE CRITICAL FIXES - JEWELIA CRM
-- This script fixes all critical API issues in the correct order
-- Run this script in your Supabase SQL editor

-- ========================================
-- STEP 1: Create Missing Database Functions
-- ========================================

-- Create the exec_sql function (for automated fixes)
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE sql;
    RAISE NOTICE '✅ Executed SQL: %', sql;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error executing SQL: % - %', sql, SQLERRM;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the update_customer_company function
CREATE OR REPLACE FUNCTION update_customer_company(customer_id UUID, company_name TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE customers 
    SET company = company_name, updated_at = NOW()
    WHERE id = customer_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Customer with ID % not found', customer_id;
    END IF;
    
    RAISE NOTICE '✅ Updated company for customer % to: %', customer_id, company_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- STEP 2: Fix Communications Foreign Keys
-- ========================================

-- Drop existing constraints if they exist (safe operation)
DO $$
BEGIN
    -- Drop sender_id constraint if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'communications' 
        AND constraint_name = 'communications_sender_id_fkey'
    ) THEN
        ALTER TABLE communications DROP CONSTRAINT communications_sender_id_fkey;
        RAISE NOTICE '✅ Dropped existing sender_id foreign key constraint';
    ELSE
        RAISE NOTICE 'ℹ️ No existing sender_id foreign key constraint found';
    END IF;

    -- Drop recipient_id constraint if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'communications' 
        AND constraint_name = 'communications_recipient_id_fkey'
    ) THEN
        ALTER TABLE communications DROP CONSTRAINT communications_recipient_id_fkey;
        RAISE NOTICE '✅ Dropped existing recipient_id foreign key constraint';
    ELSE
        RAISE NOTICE 'ℹ️ No existing recipient_id foreign key constraint found';
    END IF;
END $$;

-- Add correct foreign key constraints
ALTER TABLE communications 
ADD CONSTRAINT communications_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE communications 
ADD CONSTRAINT communications_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ========================================
-- STEP 3: Fix Orders API Relationships
-- ========================================

-- Drop duplicate foreign key constraints (keeping the standard one)
DO $$
BEGIN
    -- Drop the non-standard customer relationship if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'orders' 
        AND constraint_name = 'fk_orders_customer'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT fk_orders_customer;
        RAISE NOTICE '✅ Dropped duplicate fk_orders_customer constraint';
    ELSE
        RAISE NOTICE 'ℹ️ No duplicate fk_orders_customer constraint found';
    END IF;

    -- Drop the non-standard order_items relationship if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'order_items' 
        AND constraint_name = 'fk_order_items_order'
    ) THEN
        ALTER TABLE order_items DROP CONSTRAINT fk_order_items_order;
        RAISE NOTICE '✅ Dropped duplicate fk_order_items_order constraint';
    ELSE
        RAISE NOTICE 'ℹ️ No duplicate fk_order_items_order constraint found';
    END IF;
END $$;

-- Ensure standard foreign key constraints exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'orders' 
        AND constraint_name = 'orders_customer_id_fkey'
    ) THEN
        ALTER TABLE orders 
        ADD CONSTRAINT orders_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added orders_customer_id_fkey constraint';
    ELSE
        RAISE NOTICE 'ℹ️ orders_customer_id_fkey constraint already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'order_items' 
        AND constraint_name = 'order_items_order_id_fkey'
    ) THEN
        ALTER TABLE order_items 
        ADD CONSTRAINT order_items_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added order_items_order_id_fkey constraint';
    ELSE
        RAISE NOTICE 'ℹ️ order_items_order_id_fkey constraint already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'order_items' 
        AND constraint_name = 'order_items_product_id_fkey'
    ) THEN
        ALTER TABLE order_items 
        ADD CONSTRAINT order_items_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;
        RAISE NOTICE '✅ Added order_items_product_id_fkey constraint';
    ELSE
        RAISE NOTICE 'ℹ️ order_items_product_id_fkey constraint already exists';
    END IF;
END $$;

-- Create views for simplified API access
CREATE OR REPLACE VIEW orders_with_customers AS
SELECT 
    o.*,
    c.name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    c.company as customer_company
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;

CREATE OR REPLACE VIEW order_items_with_details AS
SELECT 
    oi.*,
    o.order_number,
    o.status as order_status,
    p.name as product_name,
    p.sku as product_sku,
    p.price as product_price
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
LEFT JOIN products p ON oi.product_id = p.id;

-- ========================================
-- STEP 4: Optimize RLS Policies
-- ========================================

-- Create optimized RLS policies for all core tables
-- Customers table
DROP POLICY IF EXISTS "Users can view customers" ON customers;
DROP POLICY IF EXISTS "Users can create customers" ON customers;
DROP POLICY IF EXISTS "Users can update customers" ON customers;
DROP POLICY IF EXISTS "Users can delete customers" ON customers;

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

-- Products table
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

-- Orders table
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

-- Order items table
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

-- Inventory table
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

-- Communications table
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

-- ========================================
-- STEP 5: Verification and Summary
-- ========================================

-- Verify all functions were created
SELECT 
    'Functions Created' as check_type,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('exec_sql', 'update_customer_company')
AND routine_schema = 'public'
ORDER BY routine_name;

-- Verify foreign key constraints
SELECT 
    'Foreign Keys' as check_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('communications', 'orders', 'order_items')
ORDER BY tc.table_name, kcu.column_name;

-- Verify RLS policies
SELECT 
    'RLS Policies' as check_type,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('customers', 'products', 'orders', 'order_items', 'inventory', 'communications')
GROUP BY tablename
ORDER BY tablename;

-- Verify views were created
SELECT 
    'Views Created' as check_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('orders_with_customers', 'order_items_with_details')
AND table_schema = 'public';

-- ========================================
-- ✅ ALL CRITICAL FIXES COMPLETE
-- ========================================

-- Summary of fixes applied:
-- 1. ✅ Created missing database functions (exec_sql, update_customer_company)
-- 2. ✅ Fixed communications foreign key relationships
-- 3. ✅ Resolved orders API relationship conflicts
-- 4. ✅ Optimized RLS policies for all core tables
-- 5. ✅ Created simplified views for API access

-- Your APIs should now work without the critical errors!
-- Test the following endpoints:
-- - /api/communications (should work without foreign key errors)
-- - /api/orders (should work without relationship conflicts)
-- - /api/customers (should work with update_customer_company function)
-- - /api/products (should work with proper RLS policies)
-- - /api/inventory (should work with proper RLS policies) 