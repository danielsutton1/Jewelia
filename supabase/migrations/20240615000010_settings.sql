-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    org_id UUID REFERENCES organizations(id),
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_user_id ON settings(user_id);
CREATE INDEX idx_settings_org_id ON settings(org_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies: allow authenticated users to view, insert, and update their own, org, or global settings
CREATE POLICY "Settings are viewable by authenticated users"
    ON settings FOR SELECT
    TO authenticated
    USING (
        user_id IS NULL OR auth.uid() = user_id OR (
            org_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM organization_members om
                WHERE om.user_id = auth.uid() AND om.org_id = settings.org_id
            )
        )
    );

CREATE POLICY "Settings are insertable by authenticated users"
    ON settings FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id IS NULL OR auth.uid() = user_id OR (
            org_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM organization_members om
                WHERE om.user_id = auth.uid() AND om.org_id = settings.org_id AND om.role = 'admin'
            )
        )
    );

CREATE POLICY "Settings are updatable by authenticated users"
    ON settings FOR UPDATE
    TO authenticated
    USING (
        user_id IS NULL OR auth.uid() = user_id OR (
            org_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM organization_members om
                WHERE om.user_id = auth.uid() AND om.org_id = settings.org_id AND om.role = 'admin'
            )
        )
    )
    WITH CHECK (
        user_id IS NULL OR auth.uid() = user_id OR (
            org_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM organization_members om
                WHERE om.user_id = auth.uid() AND om.org_id = settings.org_id AND om.role = 'admin'
            )
        )
    ); 