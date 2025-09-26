-- 🔒 SAFE CRITICAL FIXES - JEWELIA CRM (FIXED)
-- This script is 100% NON-DESTRUCTIVE - it only adds missing elements
-- No DROP statements, no modifications to existing data
-- Run this safely in Supabase SQL Editor

-- ========================================
-- STEP 1: Create Missing Database Functions (SAFE)
-- ========================================

-- Create exec_sql function only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'exec_sql' 
        AND routine_schema = 'public'
    ) THEN
        CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
        RETURNS VOID AS $func$
        BEGIN
            EXECUTE sql;
            RAISE NOTICE '✅ Executed SQL: %', sql;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Error executing SQL: % - %', sql, SQLERRM;
                RAISE;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;
        RAISE NOTICE '✅ Created exec_sql function';
    ELSE
        RAISE NOTICE 'ℹ️ exec_sql function already exists';
    END IF;
END $$;

-- Create update_customer_company function only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'update_customer_company' 
        AND routine_schema = 'public'
    ) THEN
        CREATE OR REPLACE FUNCTION update_customer_company(customer_id UUID, company_name TEXT)
        RETURNS VOID AS $func$
        BEGIN
            UPDATE customers 
            SET company = company_name, updated_at = NOW()
            WHERE id = customer_id;
            
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Customer with ID % not found', customer_id;
            END IF;
            
            RAISE NOTICE '✅ Updated company for customer % to: %', customer_id, company_name;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;
        RAISE NOTICE '✅ Created update_customer_company function';
    ELSE
        RAISE NOTICE 'ℹ️ update_customer_company function already exists';
    END IF;
END $$;

-- ========================================
-- STEP 2: Add Communications Foreign Keys (SAFE)
-- ========================================

-- Add sender_id foreign key only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'communications' 
        AND constraint_name = 'communications_sender_id_fkey'
    ) THEN
        ALTER TABLE communications 
        ADD CONSTRAINT communications_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Added foreign key constraint for communications.sender_id';
    ELSE
        RAISE NOTICE 'ℹ️ communications.sender_id foreign key constraint already exists';
    END IF;
END $$;

-- Add recipient_id foreign key only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'communications' 
        AND constraint_name = 'communications_recipient_id_fkey'
    ) THEN
        ALTER TABLE communications 
        ADD CONSTRAINT communications_recipient_id_fkey 
        FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Added foreign key constraint for communications.recipient_id';
    ELSE
        RAISE NOTICE 'ℹ️ communications.recipient_id foreign key constraint already exists';
    END IF;
END $$;

-- ========================================
-- STEP 3: Add Orders Foreign Keys (SAFE)
-- ========================================

-- Add orders customer_id foreign key only if it doesn't exist
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
        RAISE NOTICE '✅ Added foreign key constraint for orders.customer_id';
    ELSE
        RAISE NOTICE 'ℹ️ orders.customer_id foreign key constraint already exists';
    END IF;
END $$;

-- Add order_items order_id foreign key only if it doesn't exist
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
        RAISE NOTICE '✅ Added foreign key constraint for order_items.order_id';
    ELSE
        RAISE NOTICE 'ℹ️ order_items.order_id foreign key constraint already exists';
    END IF;
END $$;

-- Add order_items product_id foreign key only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'order_items' 
        AND constraint_name = 'order_items_product_id_fkey'
    ) THEN
        ALTER TABLE order_items 
        ADD CONSTRAINT order_items_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Added foreign key constraint for order_items.product_id';
    ELSE
        RAISE NOTICE 'ℹ️ order_items.product_id foreign key constraint already exists';
    END IF;
END $$;

-- ========================================
-- STEP 4: Create Views for API Access (SAFE)
-- ========================================

-- Create orders_with_customers view only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'orders_with_customers' 
        AND table_schema = 'public'
    ) THEN
        CREATE VIEW orders_with_customers AS
        SELECT 
            o.*,
            c.name as customer_name,
            c.email as customer_email,
            c.phone as customer_phone,
            c.company as customer_company
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id;
        RAISE NOTICE '✅ Created orders_with_customers view';
    ELSE
        RAISE NOTICE 'ℹ️ orders_with_customers view already exists';
    END IF;
END $$;

-- Create order_items_with_details view only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'order_items_with_details' 
        AND table_schema = 'public'
    ) THEN
        CREATE VIEW order_items_with_details AS
        SELECT 
            oi.*,
            o.order_number,
            o.order_date,
            o.status as order_status,
            c.name as customer_name,
            p.name as product_name,
            p.sku as product_sku
        FROM order_items oi
        LEFT JOIN orders o ON oi.order_id = o.id
        LEFT JOIN customers c ON o.customer_id = c.id
        LEFT JOIN products p ON oi.product_id = p.id;
        RAISE NOTICE '✅ Created order_items_with_details view';
    ELSE
        RAISE NOTICE 'ℹ️ order_items_with_details view already exists';
    END IF;
END $$;

-- ========================================
-- STEP 5: Enable RLS on Tables (SAFE)
-- ========================================

-- Enable RLS on communications table
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- Enable RLS on customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on inventory table
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 6: Create RLS Policies (SAFE)
-- ========================================

-- Communications RLS policies (only create if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'communications' 
        AND policyname = 'Users can view their communications'
    ) THEN
        CREATE POLICY "Users can view their communications" ON communications
            FOR SELECT USING (
                auth.role() = 'authenticated' OR 
                auth.role() = 'service_role'
            );
        RAISE NOTICE '✅ Created communications view policy';
    ELSE
        RAISE NOTICE 'ℹ️ communications view policy already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'communications' 
        AND policyname = 'Users can create communications'
    ) THEN
        CREATE POLICY "Users can create communications" ON communications
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Created communications insert policy';
    ELSE
        RAISE NOTICE 'ℹ️ communications insert policy already exists';
    END IF;
END $$;

-- Customers RLS policies (only create if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customers' 
        AND policyname = 'Users can view customers'
    ) THEN
        CREATE POLICY "Users can view customers" ON customers
            FOR SELECT USING (
                auth.role() = 'authenticated' OR 
                auth.role() = 'service_role'
            );
        RAISE NOTICE '✅ Created customers view policy';
    ELSE
        RAISE NOTICE 'ℹ️ customers view policy already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customers' 
        AND policyname = 'Users can create customers'
    ) THEN
        CREATE POLICY "Users can create customers" ON customers
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Created customers insert policy';
    ELSE
        RAISE NOTICE 'ℹ️ customers insert policy already exists';
    END IF;
END $$;

-- Products RLS policies (only create if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' 
        AND policyname = 'Users can view products'
    ) THEN
        CREATE POLICY "Users can view products" ON products
            FOR SELECT USING (
                auth.role() = 'authenticated' OR 
                auth.role() = 'service_role'
            );
        RAISE NOTICE '✅ Created products view policy';
    ELSE
        RAISE NOTICE 'ℹ️ products view policy already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' 
        AND policyname = 'Users can create products'
    ) THEN
        CREATE POLICY "Users can create products" ON products
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Created products insert policy';
    ELSE
        RAISE NOTICE 'ℹ️ products insert policy already exists';
    END IF;
END $$;

-- Orders RLS policies (only create if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Users can view orders'
    ) THEN
        CREATE POLICY "Users can view orders" ON orders
            FOR SELECT USING (
                auth.role() = 'authenticated' OR 
                auth.role() = 'service_role'
            );
        RAISE NOTICE '✅ Created orders view policy';
    ELSE
        RAISE NOTICE 'ℹ️ orders view policy already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Users can create orders'
    ) THEN
        CREATE POLICY "Users can create orders" ON orders
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Created orders insert policy';
    ELSE
        RAISE NOTICE 'ℹ️ orders insert policy already exists';
    END IF;
END $$;

-- Order Items RLS policies (only create if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_items' 
        AND policyname = 'Users can view order items'
    ) THEN
        CREATE POLICY "Users can view order items" ON order_items
            FOR SELECT USING (
                auth.role() = 'authenticated' OR 
                auth.role() = 'service_role'
            );
        RAISE NOTICE '✅ Created order_items view policy';
    ELSE
        RAISE NOTICE 'ℹ️ order_items view policy already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_items' 
        AND policyname = 'Users can create order items'
    ) THEN
        CREATE POLICY "Users can create order items" ON order_items
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Created order_items insert policy';
    ELSE
        RAISE NOTICE 'ℹ️ order_items insert policy already exists';
    END IF;
END $$;

-- Inventory RLS policies (only create if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'inventory' 
        AND policyname = 'Users can view inventory'
    ) THEN
        CREATE POLICY "Users can view inventory" ON inventory
            FOR SELECT USING (
                auth.role() = 'authenticated' OR 
                auth.role() = 'service_role'
            );
        RAISE NOTICE '✅ Created inventory view policy';
    ELSE
        RAISE NOTICE 'ℹ️ inventory view policy already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'inventory' 
        AND policyname = 'Users can create inventory'
    ) THEN
        CREATE POLICY "Users can create inventory" ON inventory
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        RAISE NOTICE '✅ Created inventory insert policy';
    ELSE
        RAISE NOTICE 'ℹ️ inventory insert policy already exists';
    END IF;
END $$;

-- ========================================
-- STEP 7: Create Performance Indexes (SAFE)
-- ========================================

-- Create indexes only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_communications_sender_id'
    ) THEN
        CREATE INDEX idx_communications_sender_id ON communications(sender_id);
        RAISE NOTICE '✅ Created communications sender_id index';
    ELSE
        RAISE NOTICE 'ℹ️ communications sender_id index already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_communications_recipient_id'
    ) THEN
        CREATE INDEX idx_communications_recipient_id ON communications(recipient_id);
        RAISE NOTICE '✅ Created communications recipient_id index';
    ELSE
        RAISE NOTICE 'ℹ️ communications recipient_id index already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_orders_customer_id'
    ) THEN
        CREATE INDEX idx_orders_customer_id ON orders(customer_id);
        RAISE NOTICE '✅ Created orders customer_id index';
    ELSE
        RAISE NOTICE 'ℹ️ orders customer_id index already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_order_items_order_id'
    ) THEN
        CREATE INDEX idx_order_items_order_id ON order_items(order_id);
        RAISE NOTICE '✅ Created order_items order_id index';
    ELSE
        RAISE NOTICE 'ℹ️ order_items order_id index already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_order_items_product_id'
    ) THEN
        CREATE INDEX idx_order_items_product_id ON order_items(product_id);
        RAISE NOTICE '✅ Created order_items product_id index';
    ELSE
        RAISE NOTICE 'ℹ️ order_items product_id index already exists';
    END IF;
END $$;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SAFE CRITICAL FIXES COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ All missing database functions created';
    RAISE NOTICE '✅ All missing foreign key constraints added';
    RAISE NOTICE '✅ All missing views created';
    RAISE NOTICE '✅ RLS enabled on all core tables';
    RAISE NOTICE '✅ All missing RLS policies created';
    RAISE NOTICE '✅ All performance indexes created';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 No existing data was modified or deleted';
    RAISE NOTICE '🔒 No existing constraints were dropped';
    RAISE NOTICE '🔒 No existing policies were removed';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Test your API endpoints to verify fixes work!';
END $$; 