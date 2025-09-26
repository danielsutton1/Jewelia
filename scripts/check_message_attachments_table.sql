-- Check if message_attachments table exists
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'message_attachments'
ORDER BY ordinal_position;

-- Check table existence
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'message_attachments'
) as table_exists;

-- Check if table has any data
SELECT COUNT(*) as row_count FROM message_attachments;

-- Show table structure
\d message_attachments;
