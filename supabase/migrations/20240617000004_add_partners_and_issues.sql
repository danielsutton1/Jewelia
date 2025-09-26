-- Note: partners table is created in 20240615000009_partners.sql

-- Issues Table
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open', -- e.g. 'open', 'in_progress', 'resolved', 'closed'
    priority TEXT DEFAULT 'medium', -- e.g. 'low', 'medium', 'high', 'urgent'
    reported_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    related_order_id UUID REFERENCES orders(id),
    related_partner_id UUID REFERENCES partners(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_related_partner_id ON issues(related_partner_id); 