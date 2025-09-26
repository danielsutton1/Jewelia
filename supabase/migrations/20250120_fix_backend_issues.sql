-- Fix Backend Issues Migration
-- This migration addresses all the critical backend issues found in the audit

-- 1. FIX PRODUCTS TABLE SCHEMA
-- Ensure all required columns exist with correct types
DO $$ BEGIN
    -- Add missing columns to products table
    ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(50) UNIQUE;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS name VARCHAR(255);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'general';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2) DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS max_stock_level INTEGER DEFAULT 1000;
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
        min_stock_level = COALESCE(min_stock_level, 5),
        max_stock_level = COALESCE(max_stock_level, 100)
    WHERE sku IS NULL OR name IS NULL;
    
EXCEPTION
    WHEN duplicate_column THEN 
        -- Columns already exist, continue
        NULL;
END $$;

-- 2. FIX INVENTORY TABLE SCHEMA
-- Update inventory table to match the service expectations
DO $$ BEGIN
    -- Add missing columns to inventory table
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10,2);
    
    -- Update existing inventory items to have unit_price if missing
    UPDATE inventory 
    SET unit_price = COALESCE(unit_price, price)
    WHERE unit_price IS NULL;
    
    -- Update existing inventory items to have unit_cost if missing
    UPDATE inventory 
    SET unit_cost = COALESCE(unit_cost, cost)
    WHERE unit_cost IS NULL;
    
EXCEPTION
    WHEN duplicate_column THEN 
        -- Columns already exist, continue
        NULL;
END $$;

-- 3. FIX INVENTORY STATUS ENUM
-- Create the correct inventory status enum that matches the service
DO $$ BEGIN
    CREATE TYPE inventory_status_new AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'discontinued');
    
    -- Update inventory table to use new enum
    ALTER TABLE inventory 
    ALTER COLUMN status TYPE inventory_status_new 
    USING 
        CASE 
            WHEN status = 'active' THEN 'in_stock'::inventory_status_new
            WHEN status = 'inactive' THEN 'discontinued'::inventory_status_new
            WHEN status = 'low_stock' THEN 'low_stock'::inventory_status_new
            WHEN status = 'out_of_stock' THEN 'out_of_stock'::inventory_status_new
            ELSE 'in_stock'::inventory_status_new
        END;
    
    -- Drop old enum if it exists
    DROP TYPE IF EXISTS inventory_status;
    
    -- Rename new enum to standard name
    ALTER TYPE inventory_status_new RENAME TO inventory_status;
    
EXCEPTION
    WHEN duplicate_object THEN 
        -- Enum already exists, continue
        NULL;
END $$;

-- 4. CREATE QUOTES TABLE (if it doesn't exist)
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

-- 5. CREATE INDEXES FOR PERFORMANCE
-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON inventory(created_at);

-- Quotes indexes
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_product_id ON quote_items(product_id);

-- 6. ENABLE RLS ON ALL TABLES
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES
-- Products policies
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

-- Inventory policies
DROP POLICY IF EXISTS "Enable read access for all users" ON inventory;
CREATE POLICY "Enable read access for all users" ON inventory
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON inventory;
CREATE POLICY "Enable insert for authenticated users" ON inventory
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON inventory;
CREATE POLICY "Enable update for authenticated users" ON inventory
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON inventory;
CREATE POLICY "Enable delete for authenticated users" ON inventory
    FOR DELETE USING (auth.role() = 'authenticated');

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

-- 8. GRANT PERMISSIONS
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON quotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON quote_items TO authenticated;

-- 9. INSERT SAMPLE DATA (if tables are empty)
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
    (SELECT id FROM customers LIMIT 1), 
    'sent', 
    2500.00, 
    CURRENT_DATE + INTERVAL '30 days', 
    'Another sample quote'
WHERE NOT EXISTS (SELECT 1 FROM quotes WHERE quote_number = 'Q-2025-002');

-- 10. CREATE TRIGGERS FOR UPDATED_AT
-- Products trigger
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inventory trigger
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at 
    BEFORE UPDATE ON inventory 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Quotes trigger
DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at 
    BEFORE UPDATE ON quotes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Quote items trigger
DROP TRIGGER IF EXISTS update_quote_items_updated_at ON quote_items;
CREATE TRIGGER update_quote_items_updated_at 
    BEFORE UPDATE ON quote_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 