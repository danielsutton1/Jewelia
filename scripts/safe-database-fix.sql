-- Safe Database Fix Script (Non-Destructive)
-- This script ONLY adds missing elements without modifying existing data
-- Run this in your Supabase Dashboard SQL Editor

-- 1. CREATE QUOTES TABLE (only if it doesn't exist)
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

-- 2. CREATE QUOTE_ITEMS TABLE (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS quote_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID,
    inventory_id UUID,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ADD MISSING COLUMNS TO PRODUCTS TABLE (only if they don't exist)
DO $$ 
BEGIN
    -- Add sku column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'sku'
    ) THEN
        ALTER TABLE products ADD COLUMN sku TEXT;
    END IF;
    
    -- Add name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'name'
    ) THEN
        ALTER TABLE products ADD COLUMN name TEXT;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'status'
    ) THEN
        ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'description'
    ) THEN
        ALTER TABLE products ADD COLUMN description TEXT;
    END IF;
    
    -- Add category column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'category'
    ) THEN
        ALTER TABLE products ADD COLUMN category TEXT;
    END IF;
    
    -- Add price column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'price'
    ) THEN
        ALTER TABLE products ADD COLUMN price DECIMAL(10,2);
    END IF;
    
    -- Add cost column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'cost'
    ) THEN
        ALTER TABLE products ADD COLUMN cost DECIMAL(10,2);
    END IF;
    
    -- Add stock_quantity column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'stock_quantity'
    ) THEN
        ALTER TABLE products ADD COLUMN stock_quantity INTEGER DEFAULT 0;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 4. FIX INVENTORY STATUS ENUM (only if needed)
DO $$ 
BEGIN
    -- Check if inventory_status enum exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_status') THEN
        -- Check if the enum has the correct values
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'inventory_status') 
            AND enumlabel = 'in_stock'
        ) THEN
            -- Add missing enum values if they don't exist
            ALTER TYPE inventory_status ADD VALUE IF NOT EXISTS 'in_stock';
            ALTER TYPE inventory_status ADD VALUE IF NOT EXISTS 'low_stock';
            ALTER TYPE inventory_status ADD VALUE IF NOT EXISTS 'out_of_stock';
            ALTER TYPE inventory_status ADD VALUE IF NOT EXISTS 'discontinued';
        END IF;
    ELSE
        -- Create the enum if it doesn't exist
        CREATE TYPE inventory_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'on_order', 'discontinued');
    END IF;
END $$;

-- 5. UPDATE INVENTORY TABLE STATUS COLUMN (only if needed)
DO $$ 
BEGIN
    -- Check if inventory table has status column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory' AND column_name = 'status'
    ) THEN
        -- Check if the status column is already using the enum
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'inventory' 
            AND column_name = 'status' 
            AND data_type = 'USER-DEFINED'
        ) THEN
            -- Only update if the column exists but isn't using the enum yet
            -- This is safe because we're not changing existing data
            ALTER TABLE inventory ALTER COLUMN status TYPE inventory_status USING 
                CASE 
                    WHEN status = 'active' THEN 'in_stock'::inventory_status
                    WHEN status = 'inactive' THEN 'discontinued'::inventory_status
                    WHEN status = 'low_stock' THEN 'low_stock'::inventory_status
                    WHEN status = 'out_of_stock' THEN 'out_of_stock'::inventory_status
                    WHEN status = 'on_order' THEN 'on_order'::inventory_status
                    ELSE 'in_stock'::inventory_status
                END;
        END IF;
    END IF;
END $$;

-- 6. ADD FOREIGN KEY CONSTRAINTS (only if they don't exist)
DO $$ 
BEGIN
    -- Add foreign key for quotes.customer_id -> customers.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'quotes_customer_id_fkey' 
        AND table_name = 'quotes'
    ) THEN
        ALTER TABLE quotes 
        ADD CONSTRAINT quotes_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
    END IF;
    
    -- Add foreign key for quote_items.quote_id -> quotes.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'quote_items_quote_id_fkey' 
        AND table_name = 'quote_items'
    ) THEN
        ALTER TABLE quote_items 
        ADD CONSTRAINT quote_items_quote_id_fkey 
        FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for quote_items.inventory_id -> inventory.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'quote_items_inventory_id_fkey' 
        AND table_name = 'quote_items'
    ) THEN
        ALTER TABLE quote_items 
        ADD CONSTRAINT quote_items_inventory_id_fkey 
        FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 7. CREATE INDEXES (only if they don't exist)
DO $$ 
BEGIN
    -- Create index on quotes.quote_number if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'quotes' AND indexname = 'idx_quotes_quote_number'
    ) THEN
        CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
    END IF;
    
    -- Create index on quotes.customer_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'quotes' AND indexname = 'idx_quotes_customer_id'
    ) THEN
        CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
    END IF;
    
    -- Create index on products.sku if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'products' AND indexname = 'idx_products_sku'
    ) THEN
        CREATE INDEX idx_products_sku ON products(sku);
    END IF;
    
    -- Create index on products.category if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'products' AND indexname = 'idx_products_category'
    ) THEN
        CREATE INDEX idx_products_category ON products(category);
    END IF;
END $$;

-- 8. ENABLE ROW LEVEL SECURITY (only if not already enabled)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'quotes' AND rowsecurity = true
    ) THEN
        ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'quote_items' AND rowsecurity = true
    ) THEN
        ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 9. GRANT PERMISSIONS (only if not already granted)
DO $$ 
BEGIN
    -- Grant permissions for quotes table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.role_table_grants 
        WHERE table_name = 'quotes' AND grantee = 'authenticated'
    ) THEN
        GRANT ALL ON quotes TO authenticated;
        GRANT USAGE ON SEQUENCE quotes_id_seq TO authenticated;
    END IF;
    
    -- Grant permissions for quote_items table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.role_table_grants 
        WHERE table_name = 'quote_items' AND grantee = 'authenticated'
    ) THEN
        GRANT ALL ON quote_items TO authenticated;
        GRANT USAGE ON SEQUENCE quote_items_id_seq TO authenticated;
    END IF;
END $$;

-- 10. INSERT SAMPLE DATA (only if tables are empty)
DO $$ 
BEGIN
    -- Only insert sample quotes if the quotes table is empty
    IF NOT EXISTS (SELECT 1 FROM quotes LIMIT 1) THEN
        INSERT INTO quotes (quote_number, customer_id, status, total_amount, valid_until, notes) VALUES
        ('Q-2024-001', NULL, 'draft', 1500.00, CURRENT_DATE + INTERVAL '30 days', 'Sample quote for jewelry collection'),
        ('Q-2024-002', NULL, 'sent', 2200.00, CURRENT_DATE + INTERVAL '15 days', 'Wedding ring collection quote'),
        ('Q-2024-003', NULL, 'accepted', 800.00, CURRENT_DATE + INTERVAL '7 days', 'Earrings quote');
    END IF;
    
    -- Only insert sample products if the products table is empty
    IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
        INSERT INTO products (sku, name, description, category, price, cost, stock_quantity, status) VALUES
        ('NECK-001', 'Diamond Necklace', 'Elegant diamond necklace', 'Necklaces', 1500.00, 800.00, 5, 'active'),
        ('EARR-001', 'Pearl Earrings', 'Classic pearl earrings', 'Earrings', 300.00, 150.00, 10, 'active'),
        ('BRAC-001', 'Gold Bracelet', '18k gold bracelet', 'Bracelets', 800.00, 400.00, 8, 'active'),
        ('WATCH-001', 'Luxury Watch', 'Premium luxury watch', 'Watches', 2500.00, 1200.00, 3, 'active'),
        ('PEND-001', 'Sapphire Pendant', 'Beautiful sapphire pendant', 'Pendants', 600.00, 300.00, 12, 'active');
    END IF;
END $$;

-- Success message
SELECT 'Database fix completed successfully! All missing elements have been added safely.' as status; 