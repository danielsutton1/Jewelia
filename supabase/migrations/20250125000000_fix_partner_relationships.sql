-- Fix partner_relationships table schema
-- Add missing columns that PartnerService expects

-- Add partner_id column to partner_relationships (for backward compatibility)
ALTER TABLE partner_relationships 
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id);

-- Add relationship_type column
ALTER TABLE partner_relationships 
ADD COLUMN IF NOT EXISTS relationship_type VARCHAR(100) DEFAULT 'connection';

-- Add strength column
ALTER TABLE partner_relationships 
ADD COLUMN IF NOT EXISTS strength VARCHAR(50) DEFAULT 'moderate';

-- Add notes column
ALTER TABLE partner_relationships 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add metadata column
ALTER TABLE partner_relationships 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update existing records to set partner_id to partner_a for backward compatibility
UPDATE partner_relationships 
SET partner_id = partner_a 
WHERE partner_id IS NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_partner_relationships_partner_id ON partner_relationships(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_relationships_type ON partner_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_partner_relationships_strength ON partner_relationships(strength);

-- Add RLS policies for partner_relationships
ALTER TABLE partner_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view relationships they are part of"
    ON partner_relationships FOR SELECT
    TO authenticated
    USING (
        partner_a IN (
            SELECT id FROM partners WHERE org_id IN (
                SELECT org_id FROM organization_members WHERE user_id = auth.uid()
            )
        ) OR
        partner_b IN (
            SELECT id FROM partners WHERE org_id IN (
                SELECT org_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create relationships for their organization"
    ON partner_relationships FOR INSERT
    TO authenticated
    WITH CHECK (
        partner_a IN (
            SELECT id FROM partners WHERE org_id IN (
                SELECT org_id FROM organization_members WHERE user_id = auth.uid()
            )
        ) OR
        partner_b IN (
            SELECT id FROM partners WHERE org_id IN (
                SELECT org_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
    );

-- Add RLS policies for partner_requests
ALTER TABLE partner_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view requests they sent or received"
    ON partner_requests FOR SELECT
    TO authenticated
    USING (
        from_partner IN (
            SELECT id FROM partners WHERE org_id IN (
                SELECT org_id FROM organization_members WHERE user_id = auth.uid()
            )
        ) OR
        to_partner IN (
            SELECT id FROM partners WHERE org_id IN (
                SELECT org_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create requests for their organization"
    ON partner_requests FOR INSERT
    TO authenticated
    WITH CHECK (
        from_partner IN (
            SELECT id FROM partners WHERE org_id IN (
                SELECT org_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update requests they sent or received"
    ON partner_requests FOR UPDATE
    TO authenticated
    USING (
        from_partner IN (
            SELECT id FROM partners WHERE org_id IN (
                SELECT org_id FROM organization_members WHERE user_id = auth.uid()
            )
        ) OR
        to_partner IN (
            SELECT id FROM partners WHERE org_id IN (
                SELECT org_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
    ); 