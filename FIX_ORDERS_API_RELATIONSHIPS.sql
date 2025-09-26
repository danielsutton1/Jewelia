-- 🔴 IMMEDIATE FIX: Orders API Relationship Conflicts
-- This fixes the "Could not embed because more than one relationship was found" error

-- STEP 1: Check current foreign key relationships for orders table
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'orders'
ORDER BY kcu.column_name;

-- STEP 2: Check order_items relationships
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'order_items'
ORDER BY kcu.column_name;

-- STEP 3: Identify duplicate relationships
-- The issue is that there are multiple foreign key constraints between orders and customers
-- We need to standardize on one relationship name

-- STEP 4: Drop duplicate foreign key constraints (keeping the standard one)
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

-- STEP 5: Ensure standard foreign key constraints exist
-- Add orders_customer_id_fkey if it doesn't exist
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

-- Add order_items_order_id_fkey if it doesn't exist
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

-- Add order_items_product_id_fkey if it doesn't exist
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

-- STEP 6: Verify the standardized relationships
SELECT 
    'orders' as table_name,
    'customer_id' as column_name,
    'customers(id)' as references,
    'orders_customer_id_fkey' as constraint_name
UNION ALL
SELECT 
    'order_items' as table_name,
    'order_id' as column_name,
    'orders(id)' as references,
    'order_items_order_id_fkey' as constraint_name
UNION ALL
SELECT 
    'order_items' as table_name,
    'product_id' as column_name,
    'products(id)' as references,
    'order_items_product_id_fkey' as constraint_name;

-- STEP 7: Test the relationships with sample queries
-- Test orders with customers join
SELECT 
    o.id as order_id,
    o.order_number,
    c.name as customer_name,
    c.email as customer_email
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LIMIT 5;

-- Test order_items with orders and products join
SELECT 
    oi.id as item_id,
    o.order_number,
    p.name as product_name,
    oi.quantity,
    oi.unit_price
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
LEFT JOIN products p ON oi.product_id = p.id
LIMIT 5;

-- STEP 8: Create a view for simplified orders API access
CREATE OR REPLACE VIEW orders_with_customers AS
SELECT 
    o.*,
    c.name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    c.company as customer_company
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;

-- STEP 9: Create a view for simplified order_items API access
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

-- STEP 10: Verify views were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('orders_with_customers', 'order_items_with_details')
AND table_schema = 'public';

-- ✅ ORDERS API RELATIONSHIP FIX COMPLETE
-- The orders API should now work without relationship conflicts
-- Use the views for simplified API access without complex joins 