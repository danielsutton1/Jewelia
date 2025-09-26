-- Add files column to call_logs table for storing file attachments
-- This will store file metadata and Supabase storage URLs

ALTER TABLE call_logs
ADD COLUMN files JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the field
COMMENT ON COLUMN call_logs.files IS 'Array of file attachments with metadata and storage URLs';

-- Add index on files field for better query performance
CREATE INDEX idx_call_logs_files ON call_logs USING GIN (files);

-- Verify the changes
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'call_logs'
AND column_name = 'files';

-- Show sample of existing data
SELECT 
    id,
    customer_name,
    created_at,
    files
FROM call_logs
LIMIT 5; 