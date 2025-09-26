-- Order Management Enhancement Migration
-- This migration adds advanced features for order management including:
-- - Audit logging
-- - Order reviews for fraud detection
-- - Performance optimizations
-- - Enhanced indexing

-- Create quotes table first (if it doesn't exist)
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
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued'));

-- Create audit_logs table for comprehensive audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for audit_logs for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Create order_reviews table for fraud detection and manual review
CREATE TABLE IF NOT EXISTS order_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_data JSONB NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for order_reviews
CREATE INDEX IF NOT EXISTS idx_order_reviews_status ON order_reviews(status);
CREATE INDEX IF NOT EXISTS idx_order_reviews_reason ON order_reviews(reason);
CREATE INDEX IF NOT EXISTS idx_order_reviews_created_at ON order_reviews(created_at);

-- Add new columns to orders table for enhanced functionality
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES quotes(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for full-text search on orders
CREATE INDEX IF NOT EXISTS idx_orders_search_vector ON orders USING GIN(search_vector);

-- Create trigger to update search_vector
CREATE OR REPLACE FUNCTION update_orders_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.order_number, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.notes, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.shipping_address, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_search_vector_update
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_search_vector();

-- Add performance optimization indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_date_range ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_customer_date ON orders(customer_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(status, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_date ON orders(payment_status, order_date DESC);

-- Add RLS policies for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.role = 'admin'
        )
    );

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Add RLS policies for order_reviews
ALTER TABLE order_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage order reviews" ON order_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.role = 'admin'
        )
    );

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

-- Create function to flag high-value orders for review
CREATE OR REPLACE FUNCTION flag_high_value_orders()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total_amount > 10000 THEN
        INSERT INTO order_reviews (order_data, reason, status)
        VALUES (to_jsonb(NEW), 'High value order', 'pending');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER flag_high_value_orders_trigger
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION flag_high_value_orders();

-- Create function to update order statistics cache
CREATE OR REPLACE FUNCTION update_order_statistics_cache()
RETURNS TRIGGER AS $$
BEGIN
    -- This function can be extended to update cached statistics
    -- For now, it's a placeholder for future optimization
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_statistics_cache_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_order_statistics_cache();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON order_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON quotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON quote_items TO authenticated; 