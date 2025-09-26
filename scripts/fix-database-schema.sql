-- Comprehensive Database Schema Fix
-- This script fixes all the missing columns that are causing API errors

-- 1. FIX PRODUCTS TABLE SCHEMA
DO $$ BEGIN
    -- Add missing columns to products table if they don't exist
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
    WHERE sku IS NULL OR name IS NULL OR stock_quantity IS NULL;
    
EXCEPTION
    WHEN duplicate_column THEN 
        -- Columns already exist, continue
        NULL;
END $$;

-- 2. FIX INVENTORY TABLE SCHEMA
DO $$ BEGIN
    -- Add missing columns to inventory table if they don't exist
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10,2);
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
    
    -- Update existing inventory items to have unit_price if missing
    UPDATE inventory 
    SET unit_price = COALESCE(unit_price, price)
    WHERE unit_price IS NULL;
    
    -- Update existing inventory items to have unit_cost if missing
    UPDATE inventory 
    SET unit_cost = COALESCE(unit_cost, cost)
    WHERE unit_cost IS NULL;
    
    -- Update stock_quantity to match quantity if stock_quantity is missing
    UPDATE inventory 
    SET stock_quantity = COALESCE(stock_quantity, quantity)
    WHERE stock_quantity IS NULL;
    
EXCEPTION
    WHEN duplicate_column THEN 
        -- Columns already exist, continue
        NULL;
END $$;

-- 3. FIX DESIGNS TABLE SCHEMA (if it exists)
DO $$ BEGIN
    -- Add created_at column to designs table if it doesn't exist
    ALTER TABLE designs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE designs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
EXCEPTION
    WHEN undefined_table THEN 
        -- Table doesn't exist, continue
        NULL;
    WHEN duplicate_column THEN 
        -- Columns already exist, continue
        NULL;
END $$;

-- 4. CREATE MISSING TABLES IF THEY DON'T EXIST
-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    price DECIMAL(10,2) DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 1000,
    material VARCHAR(100),
    gemstone VARCHAR(100),
    weight DECIMAL(8,3),
    dimensions VARCHAR(100),
    images TEXT[],
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ADD SAMPLE DATA IF PRODUCTS TABLE IS EMPTY
INSERT INTO products (sku, name, description, category, price, cost, stock_quantity, status)
SELECT 
    'SKU-SAMPLE-1',
    'Sample Product 1',
    'This is a sample product for testing',
    'General',
    99.99,
    49.99,
    25,
    'active'
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- 6. VERIFY THE FIX
SELECT 
    'Products table columns:' as info,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('stock_quantity', 'sku', 'name', 'status', 'price', 'cost')
ORDER BY column_name;

SELECT 
    'Inventory table columns:' as info,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'inventory' 
AND column_name IN ('stock_quantity', 'unit_price', 'unit_cost')
ORDER BY column_name;

-- 7. SHOW SAMPLE DATA
SELECT 
    'Sample products:' as info,
    id, 
    name, 
    sku, 
    price, 
    stock_quantity, 
    status
FROM products 
LIMIT 5;
