-- Create call_logs table
CREATE TABLE call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255),
    customer_id UUID REFERENCES customers(id),
    staff_name VARCHAR(255),
    staff_id UUID REFERENCES users(id),
    call_type VARCHAR(50),
    duration VARCHAR(100),
    outcome VARCHAR(100),
    notes TEXT,
    summary TEXT,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_call_logs_updated_at
    BEFORE UPDATE ON call_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 