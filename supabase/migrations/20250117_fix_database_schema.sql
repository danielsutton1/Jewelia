-- Fix Database Schema Issues Migration
-- This migration fixes all the missing tables and columns causing API errors

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
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to products table
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
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id UUID;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix inventory_status enum
DO $$ 
BEGIN
    -- Drop the existing enum if it exists with wrong values
    DROP TYPE IF EXISTS inventory_status CASCADE;
    
    -- Create the correct enum
    CREATE TYPE inventory_status AS ENUM ('active', 'inactive', 'discontinued', 'out_of_stock', 'low_stock');
    
    -- Update inventory table to use the correct enum
    ALTER TABLE inventory ALTER COLUMN status TYPE inventory_status USING status::text::inventory_status;
EXCEPTION
    WHEN duplicate_object THEN
        -- Enum already exists, just update the inventory table
        ALTER TABLE inventory ALTER COLUMN status TYPE inventory_status USING status::text::inventory_status;
END $$;

-- Create order_status_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES quotes(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_search_vector ON orders USING gin(search_vector);

-- Create triggers for search vector updates
CREATE OR REPLACE FUNCTION update_orders_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.order_number, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.customer_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.notes, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_search_vector_update
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_search_vector();

-- Grant necessary permissions
GRANT ALL ON quotes TO authenticated;
GRANT ALL ON quote_items TO authenticated;
GRANT ALL ON order_status_history TO authenticated;
GRANT ALL ON audit_logs TO authenticated;
GRANT ALL ON order_reviews TO authenticated;

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own quotes" ON quotes
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own quotes" ON quotes
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own quotes" ON quotes
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can view quote items for their quotes" ON quote_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quotes 
            WHERE quotes.id = quote_items.quote_id 
            AND quotes.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert quote items for their quotes" ON quote_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM quotes 
            WHERE quotes.id = quote_items.quote_id 
            AND quotes.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can view order status history for their orders" ON order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_status_history.order_id 
            AND orders.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert order status history for their orders" ON order_status_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_status_history.order_id 
            AND orders.created_by = auth.uid()
        )
    );

-- Insert sample data for testing
INSERT INTO quotes (quote_number, customer_id, status, total_amount, valid_until, notes)
VALUES 
    ('Q-2024-001', (SELECT id FROM customers LIMIT 1), 'draft', 1500.00, CURRENT_DATE + INTERVAL '30 days', 'Sample quote for testing'),
    ('Q-2024-002', (SELECT id FROM customers LIMIT 1), 'sent', 2500.00, CURRENT_DATE + INTERVAL '30 days', 'Another sample quote')
ON CONFLICT (quote_number) DO NOTHING;

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