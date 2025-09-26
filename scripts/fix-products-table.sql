-- Fix Products Table - Safe Migration
-- This script adds missing columns to the products table without destructive operations

-- 1. ADD MISSING COLUMNS TO PRODUCTS TABLE
DO $$ BEGIN
    -- Add missing columns to products table (only if they don't exist)
    ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(50);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS name VARCHAR(255);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'general';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2) DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS material VARCHAR(100);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS gemstone VARCHAR(100);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(8,3);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];
    ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[];
    ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
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
        min_stock_level = COALESCE(min_stock_level, 5)
    WHERE sku IS NULL OR name IS NULL;
    
EXCEPTION
    WHEN duplicate_column THEN 
        -- Columns already exist, continue
        NULL;
END $$;

-- 2. CREATE INDEXES FOR PERFORMANCE (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- 3. ENABLE RLS ON PRODUCTS TABLE
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 4. CREATE BASIC RLS POLICIES (DROP IF EXISTS FIRST)
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON products;
CREATE POLICY "Enable insert for authenticated users" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON products;
CREATE POLICY "Enable update for authenticated users" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON products;
CREATE POLICY "Enable delete for authenticated users" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- 5. GRANT PERMISSIONS
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;

-- 6. INSERT SAMPLE DATA IF TABLE IS EMPTY
INSERT INTO products (sku, name, description, category, price, cost, stock_quantity, material, gemstone, weight, dimensions, tags, status)
SELECT * FROM (VALUES
    ('RING-001', 'Diamond Engagement Ring', 'Beautiful 1 carat diamond engagement ring in white gold', 'rings', 2500.00, 1500.00, 5, 'White Gold', 'Diamond', 3.5, '6.5mm x 6.5mm', ARRAY['engagement', 'diamond', 'white-gold'], 'active'),
    ('NECK-001', 'Pearl Necklace', 'Elegant freshwater pearl necklace with 18k gold clasp', 'necklaces', 450.00, 250.00, 12, '18k Gold', 'Pearl', 8.2, '18 inches', ARRAY['pearl', 'necklace', 'elegant'], 'active'),
    ('EARR-001', 'Sapphire Stud Earrings', 'Classic sapphire stud earrings in yellow gold', 'earrings', 350.00, 200.00, 8, 'Yellow Gold', 'Sapphire', 2.1, '4mm', ARRAY['sapphire', 'studs', 'classic'], 'active'),
    ('BRAC-001', 'Tennis Bracelet', 'Diamond tennis bracelet with 3 carats total weight', 'bracelets', 1800.00, 1200.00, 3, 'White Gold', 'Diamond', 12.5, '7 inches', ARRAY['tennis', 'diamond', 'luxury'], 'active'),
    ('WATCH-001', 'Luxury Watch', 'Premium automatic watch with leather strap', 'watches', 1200.00, 800.00, 4, 'Stainless Steel', NULL, 85.0, '42mm', ARRAY['watch', 'automatic', 'luxury'], 'active')
) AS v(sku, name, description, category, price, cost, stock_quantity, material, gemstone, weight, dimensions, tags, status)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE products.sku = v.sku);

-- 7. VERIFICATION QUERY
SELECT 
    'Products table fixed successfully!' as status,
    COUNT(*) as total_products,
    COUNT(CASE WHEN sku IS NOT NULL THEN 1 END) as products_with_sku,
    COUNT(CASE WHEN name IS NOT NULL THEN 1 END) as products_with_name,
    COUNT(CASE WHEN status IS NOT NULL THEN 1 END) as products_with_status
FROM products; 