-- Create billing tables
CREATE TABLE IF NOT EXISTS billing_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_type_id INTEGER REFERENCES resource_types(id),
    rate_type VARCHAR(50) NOT NULL, -- 'hourly', 'daily', 'fixed'
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    effective_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
    subtotal DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_invoice_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES billing_invoices(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id),
    resource_id UUID REFERENCES resources(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES billing_invoices(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reference_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_billing_rates_resource_type ON billing_rates(resource_type_id);
CREATE INDEX idx_billing_invoices_customer ON billing_invoices(customer_id);
CREATE INDEX idx_billing_invoices_status ON billing_invoices(status);
CREATE INDEX idx_billing_invoice_items_invoice ON billing_invoice_items(invoice_id);
CREATE INDEX idx_billing_invoice_items_work_order ON billing_invoice_items(work_order_id);
CREATE INDEX idx_billing_invoice_items_resource ON billing_invoice_items(resource_id);
CREATE INDEX idx_billing_payments_invoice ON billing_payments(invoice_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_billing_rates_updated_at
    BEFORE UPDATE ON billing_rates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_invoices_updated_at
    BEFORE UPDATE ON billing_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_invoice_items_updated_at
    BEFORE UPDATE ON billing_invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_payments_updated_at
    BEFORE UPDATE ON billing_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE billing_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_payments ENABLE ROW LEVEL SECURITY;

-- Billing rates policies
CREATE POLICY "Billing rates are viewable by authenticated users"
    ON billing_rates FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Billing rates are insertable by authenticated users"
    ON billing_rates FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Billing rates are updatable by authenticated users"
    ON billing_rates FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Billing invoices policies
CREATE POLICY "Billing invoices are viewable by authenticated users"
    ON billing_invoices FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Billing invoices are insertable by authenticated users"
    ON billing_invoices FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Billing invoices are updatable by authenticated users"
    ON billing_invoices FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Billing invoice items policies
CREATE POLICY "Billing invoice items are viewable by authenticated users"
    ON billing_invoice_items FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Billing invoice items are insertable by authenticated users"
    ON billing_invoice_items FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Billing invoice items are updatable by authenticated users"
    ON billing_invoice_items FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Billing payments policies
CREATE POLICY "Billing payments are viewable by authenticated users"
    ON billing_payments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Billing payments are insertable by authenticated users"
    ON billing_payments FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Billing payments are updatable by authenticated users"
    ON billing_payments FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true); 