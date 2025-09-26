-- Add missing tables for sales workflow
-- Migration: 20250812_add_sales_workflow_tables.sql

-- Create designs table
CREATE TABLE IF NOT EXISTS designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    design_id VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES customers(id),
    designer VARCHAR(255),
    approval_status VARCHAR(50) DEFAULT 'pending',
    quote_status VARCHAR(50) DEFAULT 'not-started',
    priority VARCHAR(50) DEFAULT 'medium',
    estimated_value DECIMAL(10,2) DEFAULT 0,
    materials JSONB DEFAULT '[]',
    complexity VARCHAR(50) DEFAULT 'moderate',
    next_action TEXT,
    assigned_to VARCHAR(255),
    due_date TIMESTAMP WITH TIME ZONE,
    files JSONB DEFAULT '[]',
    notes TEXT,
    call_log_id UUID REFERENCES call_logs(id),
    source_call_log JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES customers(id),
    design_id UUID REFERENCES designs(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    valid_until TIMESTAMP WITH TIME ZONE,
    items JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add some sample data to call_logs if it's empty
INSERT INTO call_logs (call_number, customer_name, staff_name, call_type, duration, outcome, notes, status)
SELECT 
    'CL-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 6, '0'),
    'Customer ' || ROW_NUMBER() OVER (),
    'Staff Member ' || (ROW_NUMBER() OVER () % 3 + 1),
    'incoming',
    '5 minutes',
    'follow_up_required',
    'Customer interested in custom jewelry design',
    'completed'
FROM generate_series(1, 5) AS n
WHERE NOT EXISTS (SELECT 1 FROM call_logs LIMIT 1);

-- Add some sample designs
INSERT INTO designs (design_id, client_name, designer, approval_status, quote_status, priority, estimated_value, complexity, next_action, assigned_to, due_date, notes)
SELECT 
    'DS-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 4, '0'),
    'Customer ' || ROW_NUMBER() OVER (),
    'Designer ' || (ROW_NUMBER() OVER () % 2 + 1),
    CASE (ROW_NUMBER() OVER () % 3)
        WHEN 0 THEN 'pending'
        WHEN 1 THEN 'approved'
        ELSE 'rejected'
    END,
    CASE (ROW_NUMBER() OVER () % 3)
        WHEN 0 THEN 'not-started'
        WHEN 1 THEN 'in-progress'
        ELSE 'completed'
    END,
    CASE (ROW_NUMBER() OVER () % 3)
        WHEN 0 THEN 'high'
        WHEN 1 THEN 'medium'
        ELSE 'low'
    END,
    (ROW_NUMBER() OVER () * 1000)::DECIMAL(10,2),
    CASE (ROW_NUMBER() OVER () % 3)
        WHEN 0 THEN 'complex'
        WHEN 1 THEN 'moderate'
        ELSE 'simple'
    END,
    CASE (ROW_NUMBER() OVER () % 3)
        WHEN 0 THEN 'Design review'
        WHEN 1 THEN 'Client approval'
        ELSE 'Production ready'
    END,
    'Designer ' || (ROW_NUMBER() OVER () % 2 + 1),
    CURRENT_DATE + INTERVAL '7 days',
    'Sample design for customer ' || ROW_NUMBER() OVER ()
FROM generate_series(1, 8) AS n
WHERE NOT EXISTS (SELECT 1 FROM designs LIMIT 1);

-- Add some sample quotes
INSERT INTO quotes (quote_id, client_name, total_amount, status, valid_until, notes)
SELECT 
    'Q-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 4, '0'),
    'Customer ' || ROW_NUMBER() OVER (),
    (ROW_NUMBER() OVER () * 1500)::DECIMAL(10,2),
    CASE (ROW_NUMBER() OVER () % 3)
        WHEN 0 THEN 'draft'
        WHEN 1 THEN 'sent'
        ELSE 'accepted'
    END,
    CURRENT_DATE + INTERVAL '30 days',
    'Sample quote for customer ' || ROW_NUMBER() OVER ()
FROM generate_series(1, 6) AS n
WHERE NOT EXISTS (SELECT 1 FROM quotes LIMIT 1);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_designs_client_id ON designs(client_id);
CREATE INDEX IF NOT EXISTS idx_designs_status ON designs(approval_status, quote_status);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_customer_id ON call_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);
