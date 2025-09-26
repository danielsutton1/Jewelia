-- Create repair_status enum
CREATE TYPE repair_status AS ENUM ('received', 'in_progress', 'completed', 'delivered');

-- Note: customers table is created in 20240616_customers.sql with proper schema

-- Create repairs table
CREATE TABLE repairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    status repair_status DEFAULT 'received',
    description TEXT NOT NULL,
    estimated_completion DATE,
    actual_completion DATE,
    cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create triggers for updated_at
CREATE TRIGGER update_repairs_updated_at
    BEFORE UPDATE ON repairs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_repairs_customer_id ON repairs(customer_id);
CREATE INDEX idx_repairs_status ON repairs(status);
CREATE INDEX idx_repairs_estimated_completion ON repairs(estimated_completion);
CREATE INDEX idx_repairs_actual_completion ON repairs(actual_completion); 