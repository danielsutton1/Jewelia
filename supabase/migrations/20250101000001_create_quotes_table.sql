-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(100),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_address TEXT,
    total_amount DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_total DECIMAL(10,2) DEFAULT 0,
    deposit_required BOOLEAN DEFAULT true,
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    deposit_type VARCHAR(20) DEFAULT 'percentage',
    status VARCHAR(20) DEFAULT 'draft',
    description TEXT,
    valid_until DATE,
    notes TEXT,
    items JSONB,
    selected_tier VARCHAR(20) DEFAULT 'tier1',
    terms_and_conditions TEXT,
    assignee VARCHAR(100) DEFAULT 'Unassigned',
    stage VARCHAR(50) DEFAULT 'quoteSent',
    sent DATE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    converted_to_order BOOLEAN DEFAULT false,
    files JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON public.quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON public.quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Create policies for quotes table
CREATE POLICY "Enable read access for all users" ON public.quotes
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.quotes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON public.quotes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON public.quotes
    FOR DELETE USING (auth.role() = 'authenticated'); 