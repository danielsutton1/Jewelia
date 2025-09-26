-- Safe fix for partner_relationships table
-- This script only adds missing columns without dropping existing tables

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

-- Create indexes for new columns (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_partner_relationships_partner_id ON partner_relationships(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_relationships_type ON partner_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_partner_relationships_strength ON partner_relationships(strength);

-- Enable RLS if not already enabled
ALTER TABLE partner_relationships ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'partner_relationships' 
        AND policyname = 'Enable read access for authenticated users'
    ) THEN
        CREATE POLICY "Enable read access for authenticated users" ON partner_relationships
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'partner_relationships' 
        AND policyname = 'Enable insert for authenticated users'
    ) THEN
        CREATE POLICY "Enable insert for authenticated users" ON partner_relationships
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'partner_relationships' 
        AND policyname = 'Enable update for authenticated users'
    ) THEN
        CREATE POLICY "Enable update for authenticated users" ON partner_relationships
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'partner_relationships' 
        AND policyname = 'Enable delete for authenticated users'
    ) THEN
        CREATE POLICY "Enable delete for authenticated users" ON partner_relationships
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Verify the fix
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'partner_relationships' 
AND column_name IN ('partner_id', 'relationship_type', 'strength', 'notes', 'metadata')
ORDER BY column_name;

-- Show success message
SELECT 'Partner relationships table fixed successfully!' as status; 