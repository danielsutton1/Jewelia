-- Fix Quotes Table - Add missing quotes table
-- This script only adds the quotes table without conflicting with existing policies

-- Create quotes table if it doesn't exist
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'expired')),
    description TEXT,
    valid_until DATE,
    notes TEXT,
    items JSONB DEFAULT '[]',
    assignee_id UUID REFERENCES users(id),
    sent_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON quotes(valid_until);

-- Enable Row Level Security
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can view quotes') THEN
        CREATE POLICY "Users can view quotes" ON quotes FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can create quotes') THEN
        CREATE POLICY "Users can create quotes" ON quotes FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can update quotes') THEN
        CREATE POLICY "Users can update quotes" ON quotes FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can delete quotes') THEN
        CREATE POLICY "Users can delete quotes" ON quotes FOR DELETE USING (true);
    END IF;
END $$;

-- Create trigger for updating timestamps
CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample quotes data
INSERT INTO quotes (quote_number, customer_id, total_amount, status, description, valid_until, items) VALUES
('Q-2025-001', (SELECT id FROM customers LIMIT 1), 2500.00, 'draft', 'Diamond engagement ring quote', CURRENT_DATE + INTERVAL '30 days', '[{"name": "Diamond Ring", "price": 2500.00, "quantity": 1}]'),
('Q-2025-002', (SELECT id FROM customers LIMIT 1 OFFSET 1), 1800.00, 'sent', 'Pearl necklace quote', CURRENT_DATE + INTERVAL '15 days', '[{"name": "Pearl Necklace", "price": 1800.00, "quantity": 1}]'),
('Q-2025-003', (SELECT id FROM customers LIMIT 1 OFFSET 2), 3200.00, 'accepted', 'Sapphire earrings quote', CURRENT_DATE + INTERVAL '7 days', '[{"name": "Sapphire Earrings", "price": 3200.00, "quantity": 1}]')
ON CONFLICT (quote_number) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Quotes table created successfully with sample data!';
END $$; 