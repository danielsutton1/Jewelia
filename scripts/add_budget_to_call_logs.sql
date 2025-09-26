-- Add budget column to call_logs table
ALTER TABLE call_logs 
ADD COLUMN IF NOT EXISTS budget DECIMAL(10,2);

-- Add comment to describe the budget column
COMMENT ON COLUMN call_logs.budget IS 'Customer budget for the project discussed in the call';

-- Create index for better performance on budget queries
CREATE INDEX IF NOT EXISTS idx_call_logs_budget ON call_logs(budget); 