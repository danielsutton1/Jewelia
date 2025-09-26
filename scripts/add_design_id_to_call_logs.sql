-- Add design_id column to call_logs table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_logs' AND column_name = 'design_id') THEN
        ALTER TABLE call_logs ADD COLUMN design_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_call_logs_design_id ON call_logs(design_id);
    END IF;
END $$; 