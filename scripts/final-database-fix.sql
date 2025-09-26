-- Final Comprehensive Database Fix Script
-- This script fixes ALL current database issues in one go
-- Run this in your Supabase Dashboard SQL Editor

-- 1. FIX PRODUCTS TABLE - Add missing columns
DO $$
BEGIN
    -- Add sku column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'sku'
    ) THEN
        ALTER TABLE products ADD COLUMN sku TEXT;
        RAISE NOTICE 'Added sku column to products table';
    END IF;
    
    -- Add name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'name'
    ) THEN
        ALTER TABLE products ADD COLUMN name TEXT;
        RAISE NOTICE 'Added name column to products table';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'status'
    ) THEN
        ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE 'Added status column to products table';
    END IF;
END $$;

-- 2. FIX INVENTORY STATUS ENUM - Update existing data to use valid enum values
DO $$
BEGIN
    -- Update any 'active' status to 'in_stock'
    UPDATE inventory SET status = 'in_stock' WHERE status = 'active';
    
    -- Update any 'inactive' status to 'out_of_stock'
    UPDATE inventory SET status = 'out_of_stock' WHERE status = 'inactive';
    
    RAISE NOTICE 'Updated inventory status values to use valid enum values';
END $$;

-- 3. CREATE QUOTES TABLE (if it doesn't exist)
CREATE TABLE IF NOT EXISTS quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_number TEXT UNIQUE NOT NULL,
    customer_id UUID,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    total_amount DECIMAL(10,2) DEFAULT 0,
    valid_until DATE,
    notes TEXT,
    terms_conditions TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE QUOTE_ITEMS TABLE (if it doesn't exist)
CREATE TABLE IF NOT EXISTS quote_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID,
    product_id UUID,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ADD FOREIGN KEY CONSTRAINTS (if they don't exist)
DO $$
BEGIN
    -- Add foreign key for quotes.customer_id -> customers.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_quotes_customer_id' 
        AND table_name = 'quotes'
    ) THEN
        ALTER TABLE quotes 
        ADD CONSTRAINT fk_quotes_customer_id 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint: fk_quotes_customer_id';
    END IF;
    
    -- Add foreign key for quote_items.quote_id -> quotes.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_quote_items_quote_id' 
        AND table_name = 'quote_items'
    ) THEN
        ALTER TABLE quote_items 
        ADD CONSTRAINT fk_quote_items_quote_id 
        FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint: fk_quote_items_quote_id';
    END IF;
    
    -- Add foreign key for quote_items.product_id -> products.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_quote_items_product_id' 
        AND table_name = 'quote_items'
    ) THEN
        ALTER TABLE quote_items 
        ADD CONSTRAINT fk_quote_items_product_id 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint: fk_quote_items_product_id';
    END IF;
END $$;

-- 6. DROP DUPLICATE ORDERS FOREIGN KEY (if exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_orders_customer' 
        AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT fk_orders_customer;
        RAISE NOTICE 'Dropped duplicate foreign key constraint: fk_orders_customer';
    END IF;
END $$;

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);

-- 8. ENABLE ROW LEVEL SECURITY
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- 9. CREATE BASIC RLS POLICIES
DO $$
BEGIN
    -- Quotes policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Enable read access for authenticated users'
    ) THEN
        CREATE POLICY "Enable read access for authenticated users" ON quotes FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Enable insert access for authenticated users'
    ) THEN
        CREATE POLICY "Enable insert access for authenticated users" ON quotes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Enable update access for authenticated users'
    ) THEN
        CREATE POLICY "Enable update access for authenticated users" ON quotes FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    -- Quote items policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'quote_items' AND policyname = 'Enable read access for authenticated users'
    ) THEN
        CREATE POLICY "Enable read access for authenticated users" ON quote_items FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'quote_items' AND policyname = 'Enable insert access for authenticated users'
    ) THEN
        CREATE POLICY "Enable insert access for authenticated users" ON quote_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'quote_items' AND policyname = 'Enable update access for authenticated users'
    ) THEN
        CREATE POLICY "Enable update access for authenticated users" ON quote_items FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 10. GRANT PERMISSIONS
GRANT ALL ON quotes TO authenticated;
GRANT ALL ON quote_items TO authenticated;

-- 11. UPDATE EXISTING PRODUCTS WITH DEFAULT VALUES
DO $$
BEGIN
    UPDATE products SET 
        sku = COALESCE(sku, 'PROD-' || id::text),
        name = COALESCE(name, 'Product ' || id::text),
        status = COALESCE(status, 'active')
    WHERE sku IS NULL OR name IS NULL OR status IS NULL;
    
    RAISE NOTICE 'Database fix completed successfully!';
END $$; 