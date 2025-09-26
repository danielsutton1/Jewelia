-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'expired')),
    description TEXT,
    valid_until DATE,
    notes TEXT,
    items JSONB DEFAULT '[]',
    assignee_id UUID,
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

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view quotes" ON quotes;
CREATE POLICY "Users can view quotes" ON quotes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create quotes" ON quotes;
CREATE POLICY "Users can create quotes" ON quotes
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update quotes" ON quotes;
CREATE POLICY "Users can update quotes" ON quotes
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete quotes" ON quotes;
CREATE POLICY "Users can delete quotes" ON quotes
    FOR DELETE USING (true);

-- Create trigger for updating timestamps
DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample quotes for testing
INSERT INTO quotes (quote_number, customer_id, total_amount, status, notes, valid_until)
SELECT 
    'Q-2025-001', 
    (SELECT id FROM customers LIMIT 1), 
    1500.00, 
    'draft', 
    'Sample quote for testing',
    CURRENT_DATE + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM quotes WHERE quote_number = 'Q-2025-001');

INSERT INTO quotes (quote_number, customer_id, total_amount, status, notes, valid_until)
SELECT 
    'Q-2025-002', 
    (SELECT id FROM customers LIMIT 1), 
    2500.00, 
    'sent', 
    'Another sample quote',
    CURRENT_DATE + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM quotes WHERE quote_number = 'Q-2025-002');

INSERT INTO quotes (quote_number, customer_id, total_amount, status, notes, valid_until)
SELECT 
    'Q-2025-003', 
    (SELECT id FROM customers LIMIT 1), 
    3200.00, 
    'accepted', 
    'Third sample quote',
    CURRENT_DATE + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM quotes WHERE quote_number = 'Q-2025-003'); 