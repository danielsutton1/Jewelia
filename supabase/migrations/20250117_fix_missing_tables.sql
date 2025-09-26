-- Fix Missing Tables and Schema Issues Migration
-- This migration creates missing tables and fixes schema issues

-- Create quotes table
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
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix products table schema issues
-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id UUID;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_stock INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix inventory table schema issues
-- Update inventory_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE inventory_status AS ENUM ('active', 'inactive', 'discontinued', 'out_of_stock');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update inventory table to use correct enum
ALTER TABLE inventory ALTER COLUMN status TYPE inventory_status USING status::inventory_status;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_product_id ON quote_items(product_id);

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Add RLS policies for quotes
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quotes" ON quotes
    FOR SELECT USING (true);

CREATE POLICY "Users can create quotes" ON quotes
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own quotes" ON quotes
    FOR UPDATE USING (auth.uid() = created_by);

-- Add RLS policies for quote_items
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quote items" ON quote_items
    FOR SELECT USING (true);

CREATE POLICY "Users can manage quote items" ON quote_items
    FOR ALL USING (true);

-- Add RLS policies for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Users can manage products" ON products
    FOR ALL USING (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON quotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON quote_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT USAGE ON SEQUENCE quotes_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE quote_items_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE products_id_seq TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE quotes IS 'Customer quotes for products and services';
COMMENT ON TABLE quote_items IS 'Individual items within a quote';
COMMENT ON COLUMN quotes.quote_number IS 'Unique quote identifier';
COMMENT ON COLUMN quotes.valid_until IS 'Date until which the quote is valid';
COMMENT ON COLUMN products.status IS 'Product availability status';
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - unique product identifier';
COMMENT ON COLUMN products.reorder_point IS 'Minimum stock level before reordering'; 