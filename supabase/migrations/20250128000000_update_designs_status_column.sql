-- Update designs table to rename quote_status to design_status and update constraints
-- This migration changes the column from quote-related statuses to design-related statuses

-- First, drop the existing constraint
ALTER TABLE designs DROP CONSTRAINT IF EXISTS designs_quote_status_check;

-- Rename the column from quote_status to design_status
ALTER TABLE designs RENAME COLUMN quote_status TO design_status;

-- Add new constraint for design status values
ALTER TABLE designs ADD CONSTRAINT designs_design_status_check 
  CHECK (design_status IN ('not-started', 'in-progress', 'completed'));

-- Update the default value
ALTER TABLE designs ALTER COLUMN design_status SET DEFAULT 'not-started';

-- Update existing data to map old values to new values
UPDATE designs SET design_status = 'completed' WHERE design_status IN ('sent', 'accepted');
UPDATE designs SET design_status = 'in-progress' WHERE design_status = 'in-progress';
UPDATE designs SET design_status = 'not-started' WHERE design_status IN ('not-started', 'rejected');

-- Update the index name if it exists
DROP INDEX IF EXISTS idx_designs_quote_status;
CREATE INDEX IF NOT EXISTS idx_designs_design_status ON designs(design_status);

-- Add comment to document the change
COMMENT ON COLUMN designs.design_status IS 'Design status: not-started, in-progress, completed'; 