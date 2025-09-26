-- Partner Directory table
CREATE TABLE IF NOT EXISTS partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID REFERENCES organizations(id),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    contact_email VARCHAR(200),
    contact_phone VARCHAR(50),
    website VARCHAR(200),
    description TEXT,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_partners_org_id ON partners(org_id);
CREATE INDEX idx_partners_name ON partners(name);
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_status ON partners(status);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_partners_updated_at();

-- Enable RLS
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Policies: allow org members to view, org admins to insert/update/delete
CREATE POLICY "Partners are viewable by org members"
    ON partners FOR SELECT
    TO authenticated
    USING (
        org_id IS NULL OR EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.user_id = auth.uid() AND om.org_id = partners.org_id
        )
    );

CREATE POLICY "Partners are insertable by org admins"
    ON partners FOR INSERT
    TO authenticated
    WITH CHECK (
        org_id IS NULL OR EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.user_id = auth.uid() AND om.org_id = partners.org_id AND om.role = 'admin'
        )
    );

CREATE POLICY "Partners are updatable by org admins"
    ON partners FOR UPDATE
    TO authenticated
    USING (
        org_id IS NULL OR EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.user_id = auth.uid() AND om.org_id = partners.org_id AND om.role = 'admin'
        )
    )
    WITH CHECK (
        org_id IS NULL OR EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.user_id = auth.uid() AND om.org_id = partners.org_id AND om.role = 'admin'
        )
    );

CREATE POLICY "Partners are deletable by org admins"
    ON partners FOR DELETE
    TO authenticated
    USING (
        org_id IS NULL OR EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.user_id = auth.uid() AND om.org_id = partners.org_id AND om.role = 'admin'
        )
    ); 