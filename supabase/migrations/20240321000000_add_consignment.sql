-- Create enum types for consignment
CREATE TYPE consignment_status AS ENUM ('active', 'sold', 'returned', 'expired');
CREATE TYPE settlement_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');

-- Create consignors table
CREATE TABLE consignors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    commission_rate DECIMAL(5,2) NOT NULL,
    status TEXT DEFAULT 'active',
    tax_id TEXT,
    bank_account_info JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create consigned items table
CREATE TABLE IF NOT EXISTS consigned_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consignor_id UUID REFERENCES consignors(id),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    condition TEXT,
    price DECIMAL(10,2) NOT NULL,
    status consignment_status DEFAULT 'active',
    date_received DATE NOT NULL,
    end_date DATE NOT NULL,
    date_sold DATE,
    sale_price DECIMAL(10,2),
    settlement_id UUID,
    photos TEXT[] DEFAULT '{}',
    appraisal_value DECIMAL(10,2),
    appraisal_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create consignment settlements table
CREATE TABLE consignment_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consignor_id UUID REFERENCES consignors(id),
    total_amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    payout_amount DECIMAL(10,2) NOT NULL,
    status settlement_status DEFAULT 'pending',
    settlement_date DATE,
    payment_method TEXT,
    payment_reference TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create consignment settlement items table (to track which items are included in each settlement)
CREATE TABLE consignment_settlement_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_id UUID REFERENCES consignment_settlements(id),
    item_id UUID REFERENCES consigned_items(id),
    sale_price DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    payout_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_consignors_updated_at
    BEFORE UPDATE ON consignors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consigned_items_updated_at
    BEFORE UPDATE ON consigned_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consignment_settlements_updated_at
    BEFORE UPDATE ON consignment_settlements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_consignors_status ON consignors(status);
CREATE INDEX idx_consignors_email ON consignors(email);
CREATE INDEX idx_consigned_items_consignor_id ON consigned_items(consignor_id);
CREATE INDEX idx_consigned_items_status ON consigned_items(status);
CREATE INDEX idx_consigned_items_date_received ON consigned_items(date_received);
CREATE INDEX idx_consigned_items_end_date ON consigned_items(end_date);
CREATE INDEX idx_consignment_settlements_consignor_id ON consignment_settlements(consignor_id);
CREATE INDEX idx_consignment_settlements_status ON consignment_settlements(status);
CREATE INDEX idx_consignment_settlement_items_settlement_id ON consignment_settlement_items(settlement_id);
CREATE INDEX idx_consignment_settlement_items_item_id ON consignment_settlement_items(item_id); 