-- Onboarding wizard progress table
CREATE TABLE IF NOT EXISTS onboarding_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    org_id UUID REFERENCES organizations(id),
    step VARCHAR(100) NOT NULL DEFAULT 'start',
    completed BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_onboarding_user_id ON onboarding_progress(user_id);
CREATE INDEX idx_onboarding_org_id ON onboarding_progress(org_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_onboarding_updated_at
    BEFORE UPDATE ON onboarding_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_updated_at();

-- Enable RLS
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Policies: allow user or org admin to view/modify their onboarding
CREATE POLICY "Onboarding is viewable by user or org admin"
    ON onboarding_progress FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR (
            org_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM organization_members om
                WHERE om.user_id = auth.uid() AND om.org_id = onboarding_progress.org_id AND om.role = 'admin'
            )
        )
    );

CREATE POLICY "Onboarding is insertable by user or org admin"
    ON onboarding_progress FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid() OR (
            org_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM organization_members om
                WHERE om.user_id = auth.uid() AND om.org_id = onboarding_progress.org_id AND om.role = 'admin'
            )
        )
    );

CREATE POLICY "Onboarding is updatable by user or org admin"
    ON onboarding_progress FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid() OR (
            org_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM organization_members om
                WHERE om.user_id = auth.uid() AND om.org_id = onboarding_progress.org_id AND om.role = 'admin'
            )
        )
    )
    WITH CHECK (
        user_id = auth.uid() OR (
            org_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM organization_members om
                WHERE om.user_id = auth.uid() AND om.org_id = onboarding_progress.org_id AND om.role = 'admin'
            )
        )
    ); 