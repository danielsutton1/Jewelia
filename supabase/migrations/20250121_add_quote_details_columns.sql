-- Add additional columns to quotes table for comprehensive quote data
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_total DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_type TEXT DEFAULT 'percentage',
ADD COLUMN IF NOT EXISTS selected_tier TEXT DEFAULT 'tier1',
ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_quotes_customer_name ON quotes(customer_name);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_email ON quotes(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotes_status_created ON quotes(status, created_at); 