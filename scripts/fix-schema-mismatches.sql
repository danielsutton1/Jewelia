-- Fix Schema Mismatches
-- This script creates the missing products table and aligns schema with frontend expectations

-- Create products table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,  -- Frontend expects stock_quantity
    status VARCHAR(50) DEFAULT 'active',
    images JSONB DEFAULT '[]'::jsonb,  -- Frontend expects images array
    min_stock INTEGER DEFAULT 0,
    material VARCHAR(100),
    gemstone VARCHAR(100),
    weight DECIMAL(8,3),
    dimensions JSONB,
    tags TEXT[],
    -- Diamond-specific fields
    carat_weight DECIMAL(6,3),
    clarity VARCHAR(20),
    color VARCHAR(20),
    cut VARCHAR(20),
    shape VARCHAR(20),
    certification VARCHAR(100),
    fluorescence VARCHAR(20),
    polish VARCHAR(20),
    symmetry VARCHAR(20),
    depth_percentage DECIMAL(5,2),
    table_percentage DECIMAL(5,2),
    measurements JSONB,
    origin VARCHAR(100),
    -- Additional fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to inventory table to match frontend expectations
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS material VARCHAR(100),
ADD COLUMN IF NOT EXISTS gemstone VARCHAR(100),
ADD COLUMN IF NOT EXISTS weight DECIMAL(8,3),
ADD COLUMN IF NOT EXISTS dimensions JSONB,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS carat_weight DECIMAL(6,3),
ADD COLUMN IF NOT EXISTS clarity VARCHAR(20),
ADD COLUMN IF NOT EXISTS color VARCHAR(20),
ADD COLUMN IF NOT EXISTS cut VARCHAR(20),
ADD COLUMN IF NOT EXISTS shape VARCHAR(20),
ADD COLUMN IF NOT EXISTS certification VARCHAR(100),
ADD COLUMN IF NOT EXISTS fluorescence VARCHAR(20),
ADD COLUMN IF NOT EXISTS polish VARCHAR(20),
ADD COLUMN IF NOT EXISTS symmetry VARCHAR(20),
ADD COLUMN IF NOT EXISTS depth_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS table_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS measurements JSONB,
ADD COLUMN IF NOT EXISTS origin VARCHAR(100);

-- Copy data from inventory to products table
INSERT INTO products (
    id, sku, name, description, category, price, cost, stock_quantity, 
    status, images, created_at, updated_at
)
SELECT 
    id, sku, name, description, category, price, cost, 
    COALESCE(quantity, 0) as stock_quantity,  -- Map quantity to stock_quantity
    CASE 
        WHEN status = 'in_stock' THEN 'active'
        WHEN status = 'low_stock' THEN 'active'
        WHEN status = 'out_of_stock' THEN 'inactive'
        WHEN status = 'on_order' THEN 'pending'
        ELSE 'active'
    END as status,
    '[]'::jsonb as images,  -- Default empty images array
    created_at, updated_at
FROM inventory
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);  -- Only if products table is empty

-- Update inventory table to use stock_quantity instead of quantity
-- First, copy quantity to stock_quantity if stock_quantity is 0
UPDATE inventory 
SET stock_quantity = quantity 
WHERE stock_quantity = 0 AND quantity > 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Create RLS policies for products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read products
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON products
    FOR SELECT USING (true);

-- Allow authenticated users to insert products
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON products
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to update products
CREATE POLICY IF NOT EXISTS "Enable update for authenticated users" ON products
    FOR UPDATE USING (true);

-- Allow authenticated users to delete products
CREATE POLICY IF NOT EXISTS "Enable delete for authenticated users" ON products
    FOR DELETE USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- Add some sample products if the table is empty
INSERT INTO products (sku, name, description, category, price, cost, stock_quantity, status, images)
VALUES 
    ('RING-001', 'Diamond Engagement Ring', 'Beautiful diamond engagement ring with 1 carat center stone', 'Rings', 8500.00, 4250.00, 5, 'active', '["https://example.com/ring1.jpg"]'::jsonb),
    ('NECK-001', 'Gold Necklace', 'Elegant 18k gold necklace with diamond accents', 'Necklaces', 3200.00, 1600.00, 8, 'active', '["https://example.com/necklace1.jpg"]'::jsonb),
    ('EARR-001', 'Pearl Earrings', 'Classic pearl drop earrings', 'Earrings', 450.00, 225.00, 12, 'active', '["https://example.com/earrings1.jpg"]'::jsonb),
    ('BRAC-001', 'Sapphire Bracelet', 'Tennis bracelet with blue sapphires', 'Bracelets', 2800.00, 1400.00, 3, 'active', '["https://example.com/bracelet1.jpg"]'::jsonb),
    ('WATCH-001', 'Luxury Watch', 'Swiss-made luxury timepiece', 'Watches', 12000.00, 6000.00, 2, 'active', '["https://example.com/watch1.jpg"]'::jsonb)
ON CONFLICT (sku) DO NOTHING;

-- Verify the changes
SELECT 'Schema fixes applied successfully' as status;
SELECT COUNT(*) as products_count FROM products;
SELECT COUNT(*) as inventory_count FROM inventory;
