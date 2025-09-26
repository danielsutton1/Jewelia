-- Comprehensive Database Fix Script
-- This script fixes all high priority database issues in one go
-- Run this in your Supabase Dashboard SQL Editor

-- 1. CREATE QUOTES TABLE (if it doesn't exist)
CREATE TABLE IF NOT EXISTS quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    total_amount DECIMAL(10,2) DEFAULT 0,
    valid_until DATE,
    notes TEXT,
    terms_conditions TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quote_items table
CREATE TABLE IF NOT EXISTS quote_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FIX PRODUCTS TABLE - Add missing columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_stock_level INTEGER DEFAULT 1000;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. FIX INVENTORY STATUS ENUM
-- Create the correct enum type
DO $$ BEGIN
    CREATE TYPE inventory_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'discontinued');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update inventory table to use correct enum values
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'status') THEN
        -- First, update any 'active' values to 'in_stock'
        UPDATE inventory SET status = 'in_stock' WHERE status = 'active';
        
        -- Then alter the column type
        ALTER TABLE inventory ALTER COLUMN status TYPE inventory_status USING 
            CASE 
                WHEN status = 'in_stock' THEN 'in_stock'::inventory_status
                WHEN status = 'low_stock' THEN 'low_stock'::inventory_status
                WHEN status = 'out_of_stock' THEN 'out_of_stock'::inventory_status
                WHEN status = 'discontinued' THEN 'discontinued'::inventory_status
                ELSE 'in_stock'::inventory_status
            END;
    END IF;
END $$;

-- 4. CREATE INDEXES FOR PERFORMANCE
-- Quotes indexes
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);

-- Quote items indexes
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_product_id ON quote_items(product_id);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES
-- Quotes policies
DROP POLICY IF EXISTS "Users can view quotes" ON quotes;
CREATE POLICY "Users can view quotes" ON quotes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create quotes" ON quotes;
CREATE POLICY "Users can create quotes" ON quotes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update quotes" ON quotes;
CREATE POLICY "Users can update quotes" ON quotes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete quotes" ON quotes;
CREATE POLICY "Users can delete quotes" ON quotes FOR DELETE USING (true);

-- Quote items policies
DROP POLICY IF EXISTS "Users can view quote items" ON quote_items;
CREATE POLICY "Users can view quote items" ON quote_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage quote items" ON quote_items;
CREATE POLICY "Users can manage quote items" ON quote_items FOR ALL USING (true);

-- Products policies
DROP POLICY IF EXISTS "Users can view products" ON products;
CREATE POLICY "Users can view products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create products" ON products;
CREATE POLICY "Users can create products" ON products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update products" ON products;
CREATE POLICY "Users can update products" ON products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete products" ON products;
CREATE POLICY "Users can delete products" ON products FOR DELETE USING (true);

-- 7. GRANT PERMISSIONS
GRANT SELECT, INSERT, UPDATE, DELETE ON quotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON quote_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;

-- 8. INSERT SAMPLE DATA
-- Sample quotes
INSERT INTO quotes (quote_number, customer_id, status, total_amount, valid_until, notes)
SELECT 
    'Q-2025-001', 
    (SELECT id FROM customers LIMIT 1), 
    'draft', 
    1500.00, 
    CURRENT_DATE + INTERVAL '30 days', 
    'Sample quote for testing'
WHERE NOT EXISTS (SELECT 1 FROM quotes WHERE quote_number = 'Q-2025-001');

INSERT INTO quotes (quote_number, customer_id, status, total_amount, valid_until, notes)
SELECT 
    'Q-2025-002', 
    (SELECT id FROM customers LIMIT 1 OFFSET 1), 
    'sent', 
    2500.00, 
    CURRENT_DATE + INTERVAL '15 days', 
    'Another sample quote'
WHERE NOT EXISTS (SELECT 1 FROM quotes WHERE quote_number = 'Q-2025-002');

-- Update existing products with sample data if they don't have required fields
UPDATE products 
SET 
    sku = COALESCE(sku, 'SKU-' || id::text),
    name = COALESCE(name, 'Product ' || id::text),
    status = COALESCE(status, 'active'),
    description = COALESCE(description, 'Sample product description'),
    category = COALESCE(category, 'General'),
    price = COALESCE(price, 100.00),
    cost = COALESCE(cost, 50.00),
    stock_quantity = COALESCE(stock_quantity, 10),
    min_stock_level = COALESCE(min_stock_level, 5),
    max_stock_level = COALESCE(max_stock_level, 100)
WHERE sku IS NULL OR name IS NULL;

-- 9. SUCCESS MESSAGE
DO $$
BEGIN
    RAISE NOTICE '✅ Comprehensive database fix completed successfully!';
    RAISE NOTICE '✅ Quotes table created with sample data';
    RAISE NOTICE '✅ Products table schema fixed';
    RAISE NOTICE '✅ Inventory status enum corrected';
    RAISE NOTICE '✅ All indexes and policies created';
END $$; 