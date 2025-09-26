-- Update call_logs table to support "in-progress" status
-- Add a check constraint to ensure valid status values

ALTER TABLE call_logs 
DROP CONSTRAINT IF EXISTS call_logs_status_check;

ALTER TABLE call_logs 
ADD CONSTRAINT call_logs_status_check 
CHECK (status IN ('completed', 'missed', 'followup', 'in-progress', 'design_created'));

-- Update any existing records that might have invalid status values
UPDATE call_logs 
SET status = 'completed' 
WHERE status NOT IN ('completed', 'missed', 'followup', 'in-progress', 'design_created');

-- Add comment to document the status values
COMMENT ON COLUMN call_logs.status IS 'Status values: completed, missed, followup, in-progress, design_created'; 