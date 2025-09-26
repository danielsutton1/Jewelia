-- Safe performance indexes - only create for existing tables/columns

-- Customers table indexes (we know these exist)
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON customers(customer_type);

-- Communications table indexes (we know these exist)
CREATE INDEX IF NOT EXISTS idx_communications_sender_id ON communications(sender_id);
CREATE INDEX IF NOT EXISTS idx_communications_recipient_id ON communications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);

-- Check which other tables exist before creating indexes
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    -- Check if products table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'products' AND table_schema = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Check if specific columns exist before creating indexes
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sku') THEN
            CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category') THEN
            CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price') THEN
            CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
        END IF;
        
        RAISE NOTICE '✅ Created indexes for products table';
    ELSE
        RAISE NOTICE 'ℹ️ Products table does not exist, skipping indexes';
    END IF;
    
    -- Check if orders table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'orders' AND table_schema = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Check if specific columns exist before creating indexes
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
            CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_number') THEN
            CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
            CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);
        END IF;
        
        RAISE NOTICE '✅ Created indexes for orders table';
    ELSE
        RAISE NOTICE 'ℹ️ Orders table does not exist, skipping indexes';
    END IF;
    
    -- Check if inventory table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'inventory' AND table_schema = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Check if specific columns exist before creating indexes
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'product_id') THEN
            CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'location') THEN
            CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory(location);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'quantity') THEN
            CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'last_updated') THEN
            CREATE INDEX IF NOT EXISTS idx_inventory_last_updated ON inventory(last_updated);
        END IF;
        
        RAISE NOTICE '✅ Created indexes for inventory table';
    ELSE
        RAISE NOTICE 'ℹ️ Inventory table does not exist, skipping indexes';
    END IF;
    
END $$;

-- Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('customers', 'products', 'orders', 'inventory', 'communications')
ORDER BY tablename, indexname; 