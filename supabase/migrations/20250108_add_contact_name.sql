-- Add contact_name column to partners table for B2B partner display
ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);

-- Add index for contact_name for better search performance
CREATE INDEX IF NOT EXISTS idx_partners_contact_name ON partners(contact_name);
