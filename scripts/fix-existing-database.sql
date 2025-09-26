-- Fix Existing Database Script
-- This script works with your existing database structure
-- Run this in your Supabase Dashboard SQL Editor

-- =====================================================
-- 1. CHECK EXISTING STRUCTURE FIRST
-- =====================================================

-- Check what tables exist and their structure
SELECT 'Current database structure:' as info;
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check customers table structure
SELECT 'Customers table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'customers' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if inventory table exists and its structure
SELECT 'Inventory table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'inventory' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 2. ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add missing columns to inventory table (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory' AND table_schema = 'public') THEN
        -- Add missing columns to inventory table
        ALTER TABLE inventory ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0;
        ALTER TABLE inventory ADD COLUMN IF NOT EXISTS value DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED;
        ALTER TABLE inventory ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock', 'discontinued'));
        ALTER TABLE inventory ADD COLUMN IF NOT EXISTS location TEXT;
        ALTER TABLE inventory ADD COLUMN IF NOT EXISTS notes TEXT;
        
        RAISE NOTICE 'Inventory table columns added successfully';
    ELSE
        RAISE NOTICE 'Inventory table does not exist, creating it...';
        
        -- Create inventory table if it doesn't exist
        CREATE TABLE inventory (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            sku TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            quantity INTEGER DEFAULT 0,
            unit_price DECIMAL(10,2) DEFAULT 0,
            value DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
            status TEXT DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock', 'discontinued')),
            location TEXT,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- =====================================================
-- 3. CREATE MISSING TABLES (if they don't exist)
-- =====================================================

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 1000,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    supplier_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
    total_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded', 'failed')),
    shipping_address TEXT,
    billing_address TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice', 'video')),
    is_read BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    thread_id UUID,
    parent_message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message_threads table if it doesn't exist
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT,
    participants UUID[] NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products_in_production_pipeline table if it doesn't exist
CREATE TABLE IF NOT EXISTS products_in_production_pipeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "Start Date" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "End Date" TIMESTAMP WITH TIME ZONE,
    "Product Name" TEXT NOT NULL,
    "Status" TEXT DEFAULT 'in_progress' CHECK ("Status" IN ('pending', 'in_progress', 'completed', 'cancelled')),
    "Priority" TEXT DEFAULT 'medium' CHECK ("Priority" IN ('low', 'medium', 'high', 'urgent')),
    "Assigned To" TEXT,
    "Notes" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. INSERT SAMPLE DATA (only if tables are empty)
-- =====================================================

-- Insert sample products (only if products table is empty)
INSERT INTO products (id, sku, name, description, category, price, cost, stock, status) 
SELECT * FROM (VALUES
    ('550e8400-e29b-41d4-a716-446655440010', 'RING-001', 'Diamond Engagement Ring', 'Beautiful diamond engagement ring', 'Rings', 8500.00, 5000.00, 5, 'active'),
    ('550e8400-e29b-41d4-a716-446655440011', 'NECK-001', 'Gold Necklace', 'Elegant gold necklace', 'Necklaces', 2500.00, 1500.00, 10, 'active'),
    ('550e8400-e29b-41d4-a716-446655440012', 'EARR-001', 'Pearl Earrings', 'Classic pearl earrings', 'Earrings', 800.00, 400.00, 15, 'active')
) AS v(id, sku, name, description, category, price, cost, stock, status)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- Insert sample inventory (only if inventory table is empty)
INSERT INTO inventory (id, sku, name, description, category, quantity, unit_price, status) 
SELECT * FROM (VALUES
    ('550e8400-e29b-41d4-a716-446655440020', 'RING-001', 'Diamond Engagement Ring', 'Beautiful diamond engagement ring', 'Rings', 5, 8500.00, 'in_stock'),
    ('550e8400-e29b-41d4-a716-446655440021', 'NECK-001', 'Gold Necklace', 'Elegant gold necklace', 'Necklaces', 10, 2500.00, 'in_stock'),
    ('550e8400-e29b-41d4-a716-446655440022', 'EARR-001', 'Pearl Earrings', 'Classic pearl earrings', 'Earrings', 15, 800.00, 'in_stock')
) AS v(id, sku, name, description, category, quantity, unit_price, status)
WHERE NOT EXISTS (SELECT 1 FROM inventory LIMIT 1);

-- =====================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_in_production_pipeline ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for now - you can restrict later)
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on inventory" ON inventory FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on order_items" ON order_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on message_threads" ON message_threads FOR ALL USING (true);
CREATE POLICY "Allow all operations on products_in_production_pipeline" ON products_in_production_pipeline FOR ALL USING (true);

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Verify tables exist
SELECT 'Tables created successfully:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('customers', 'products', 'inventory', 'orders', 'order_items', 'messages', 'message_threads', 'products_in_production_pipeline')
ORDER BY table_name;

-- Verify sample data
SELECT 'Sample data inserted:' as status;
SELECT 'Products:' as table_name, count(*) as count FROM products
UNION ALL
SELECT 'Inventory:', count(*) FROM inventory
UNION ALL
SELECT 'Orders:', count(*) FROM orders
UNION ALL
SELECT 'Order Items:', count(*) FROM order_items;

SELECT 'Database setup completed successfully!' as final_status;
