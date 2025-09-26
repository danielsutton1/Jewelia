-- Manual Quotes Table Setup
-- Run this SQL in your Supabase Dashboard SQL Editor

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_product_id ON quote_items(product_id);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view quotes" ON quotes FOR SELECT USING (true);
CREATE POLICY "Users can create quotes" ON quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update quotes" ON quotes FOR UPDATE USING (true);
CREATE POLICY "Users can delete quotes" ON quotes FOR DELETE USING (true);

CREATE POLICY "Users can view quote items" ON quote_items FOR SELECT USING (true);
CREATE POLICY "Users can manage quote items" ON quote_items FOR ALL USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON quotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON quote_items TO authenticated;

-- Add sample data
INSERT INTO quotes (quote_number, customer_id, status, total_amount, valid_until, notes)
VALUES 
    ('Q-2025-001', (SELECT id FROM customers LIMIT 1), 'draft', 1500.00, CURRENT_DATE + INTERVAL '30 days', 'Sample quote for testing'),
    ('Q-2025-002', (SELECT id FROM customers LIMIT 1), 'sent', 2500.00, CURRENT_DATE + INTERVAL '30 days', 'Another sample quote')
ON CONFLICT (quote_number) DO NOTHING;

-- Success message
SELECT 'Quotes table created successfully with sample data!' as message; 