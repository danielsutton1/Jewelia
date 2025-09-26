-- Rename estimated_value column to budget in designs table
ALTER TABLE designs RENAME COLUMN estimated_value TO budget;

-- Update the comment to reflect the new column name
COMMENT ON COLUMN designs.budget IS 'Customer budget for the design project';

-- Create index for better performance on budget queries
CREATE INDEX IF NOT EXISTS idx_designs_budget ON designs(budget); 