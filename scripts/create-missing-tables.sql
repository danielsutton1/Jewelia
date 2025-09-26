-- Create Missing Tables Script
-- This script creates the quotes and orders tables that are missing

-- 1. CREATE QUOTES TABLE
CREATE TABLE IF NOT EXISTS quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'draft',
    total_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATE QUOTE_ITEMS TABLE
CREATE TABLE IF NOT EXISTS quote_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE ORDERS TABLE (if not exists)
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    total_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    order_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE ORDER_ITEMS TABLE (if not exists)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ADD INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 7. CREATE BASIC RLS POLICIES (allow all for now)
CREATE POLICY "Allow all on quotes" ON quotes FOR ALL USING (true);
CREATE POLICY "Allow all on quote_items" ON quote_items FOR ALL USING (true);
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all on order_items" ON order_items FOR ALL USING (true);

-- 8. VERIFICATION
DO $$
BEGIN
    RAISE NOTICE 'Tables created successfully!';
    RAISE NOTICE 'quotes table: %', (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes'));
    RAISE NOTICE 'quote_items table: %', (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'quote_items'));
    RAISE NOTICE 'orders table: %', (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'orders'));
    RAISE NOTICE 'order_items table: %', (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items'));
END $$; 