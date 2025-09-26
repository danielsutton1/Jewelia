-- Add completed_date column to designs table
ALTER TABLE designs ADD COLUMN IF NOT EXISTS completed_date TIMESTAMP WITH TIME ZONE;

-- Create index for completed_date
CREATE INDEX IF NOT EXISTS idx_designs_completed_date ON designs(completed_date); 