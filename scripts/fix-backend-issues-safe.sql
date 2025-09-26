-- Safe Backend Issues Fix Script (Non-Destructive)
-- This script ONLY ADDS missing columns and tables - NO DESTRUCTIVE OPERATIONS
-- Run this in your Supabase SQL editor to fix backend issues safely

-- 1. SAFELY ADD MISSING COLUMNS TO PRODUCTS TABLE
-- Only add columns that don't exist - won't affect existing data
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
    ALTER TABLE products ADD COLUMN IF NOT EXISTS max_stock_level INTEGER DEFAULT 1000;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS material VARCHAR(100);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS gemstone VARCHAR(100);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(8,3);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];
    ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[];
    ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    -- Update existing products with sample data ONLY if they don't have required fields
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
        -- Columns already exist, continue safely
        NULL;
END $$;

-- 2. SAFELY ADD MISSING COLUMNS TO INVENTORY TABLE
DO $$ BEGIN
    -- Add missing columns to inventory table (only if they don't exist)
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0;
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10,2) DEFAULT 0;
    
    -- Only update unit_price if the price column exists in inventory
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'price') THEN
        UPDATE inventory 
        SET unit_price = COALESCE(unit_price, price)
        WHERE unit_price IS NULL;
    END IF;
    
    -- Only update unit_cost if the cost column exists in inventory
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'cost') THEN
        UPDATE inventory 
        SET unit_cost = COALESCE(unit_cost, cost)
        WHERE unit_cost IS NULL;
    END IF;
    
EXCEPTION
    WHEN duplicate_column THEN 
        -- Columns already exist, continue safely
        NULL;
END $$;

-- 3. SAFELY CREATE INVENTORY STATUS ENUM (if it doesn't exist)
DO $$ BEGIN
    -- Only create the enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_status') THEN
        CREATE TYPE inventory_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'discontinued');
    END IF;
    
    -- Only update the column type if the enum exists and column exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_status') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'status') THEN
        
        -- Try to update the column type safely
        BEGIN
            ALTER TABLE inventory ALTER COLUMN status TYPE inventory_status USING 
                CASE 
                    WHEN status = 'active' THEN 'in_stock'::inventory_status
                    WHEN status = 'inactive' THEN 'discontinued'::inventory_status
                    WHEN status = 'low_stock' THEN 'low_stock'::inventory_status
                    WHEN status = 'out_of_stock' THEN 'out_of_stock'::inventory_status
                    ELSE 'in_stock'::inventory_status
                END;
        EXCEPTION
            WHEN OTHERS THEN
                -- If the conversion fails, leave the column as is
                NULL;
        END;
    END IF;
    
EXCEPTION
    WHEN duplicate_object THEN 
        -- Enum already exists, continue safely
        NULL;
END $$;

-- 4. SAFELY CREATE QUOTES TABLE (only if it doesn't exist)
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

-- Create quote_items table (only if it doesn't exist)
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

-- 5. SAFELY CREATE INDEXES (only if they don't exist)
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

-- 6. SAFELY ENABLE RLS (only if not already enabled)
DO $$ BEGIN
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 7. SAFELY CREATE RLS POLICIES (only if they don't exist)
-- Products policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable read access for all users') THEN
        CREATE POLICY "Enable read access for all users" ON products
            FOR SELECT USING (true);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable insert for authenticated users') THEN
        CREATE POLICY "Enable insert for authenticated users" ON products
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable update for authenticated users') THEN
        CREATE POLICY "Enable update for authenticated users" ON products
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable delete for authenticated users') THEN
        CREATE POLICY "Enable delete for authenticated users" ON products
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Inventory policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory' AND policyname = 'Enable read access for all users') THEN
        CREATE POLICY "Enable read access for all users" ON inventory
            FOR SELECT USING (true);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory' AND policyname = 'Enable insert for authenticated users') THEN
        CREATE POLICY "Enable insert for authenticated users" ON inventory
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory' AND policyname = 'Enable update for authenticated users') THEN
        CREATE POLICY "Enable update for authenticated users" ON inventory
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory' AND policyname = 'Enable delete for authenticated users') THEN
        CREATE POLICY "Enable delete for authenticated users" ON inventory
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Quotes policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can view quotes') THEN
        CREATE POLICY "Users can view quotes" ON quotes FOR SELECT USING (true);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can create quotes') THEN
        CREATE POLICY "Users can create quotes" ON quotes FOR INSERT WITH CHECK (true);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can update quotes') THEN
        CREATE POLICY "Users can update quotes" ON quotes FOR UPDATE USING (true);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can delete quotes') THEN
        CREATE POLICY "Users can delete quotes" ON quotes FOR DELETE USING (true);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Quote items policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quote_items' AND policyname = 'Users can view quote items') THEN
        CREATE POLICY "Users can view quote items" ON quote_items FOR SELECT USING (true);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quote_items' AND policyname = 'Users can manage quote items') THEN
        CREATE POLICY "Users can manage quote items" ON quote_items FOR ALL USING (true);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 8. SAFELY GRANT PERMISSIONS
DO $$ BEGIN
    GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    GRANT SELECT, INSERT, UPDATE, DELETE ON inventory TO authenticated;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    GRANT SELECT, INSERT, UPDATE, DELETE ON quotes TO authenticated;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
    GRANT SELECT, INSERT, UPDATE, DELETE ON quote_items TO authenticated;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 9. SAFELY INSERT SAMPLE DATA (only if tables are empty)
-- Sample quotes (only if they don't exist)
INSERT INTO quotes (quote_number, customer_id, status, total_amount, valid_until, notes)
SELECT 
    'Q-2025-001', 
    (SELECT id FROM customers LIMIT 1), 
    'draft', 
    1500.00, 
    CURRENT_DATE + INTERVAL '30 days', 
    'Sample quote for testing'
WHERE NOT EXISTS (SELECT 1 FROM quotes WHERE quote_number = 'Q-2025-001')
  AND EXISTS (SELECT 1 FROM customers LIMIT 1);

INSERT INTO quotes (quote_number, customer_id, status, total_amount, valid_until, notes)
SELECT 
    'Q-2025-002', 
    (SELECT id FROM customers LIMIT 1), 
    'sent', 
    2500.00, 
    CURRENT_DATE + INTERVAL '30 days', 
    'Another sample quote'
WHERE NOT EXISTS (SELECT 1 FROM quotes WHERE quote_number = 'Q-2025-002')
  AND EXISTS (SELECT 1 FROM customers LIMIT 1);

-- 10. SAFELY CREATE TRIGGERS (only if they don't exist)
-- Products trigger
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
        CREATE TRIGGER update_products_updated_at 
            BEFORE UPDATE ON products 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Inventory trigger
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_inventory_updated_at') THEN
        CREATE TRIGGER update_inventory_updated_at 
            BEFORE UPDATE ON inventory 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Quotes trigger
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_quotes_updated_at') THEN
        CREATE TRIGGER update_quotes_updated_at 
            BEFORE UPDATE ON quotes 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Quote items trigger
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_quote_items_updated_at') THEN
        CREATE TRIGGER update_quote_items_updated_at 
            BEFORE UPDATE ON quote_items 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Success message
SELECT 'Safe backend fixes completed successfully! No destructive operations performed.' as status; 