-- Check the actual structure of the message_attachments table
-- Run this first to see what columns actually exist

-- 1. Check if the table exists
SELECT 
  'Table Existence' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_attachments') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status;

-- 2. Show the actual table structure
SELECT 
  'Table Structure' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'message_attachments'
ORDER BY ordinal_position;

-- 3. Check if there are any storage-related columns
SELECT 
  'Storage Columns' as check_type,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'message_attachments'
AND column_name LIKE '%storage%' OR column_name LIKE '%path%' OR column_name LIKE '%file%'
ORDER BY column_name;

-- 4. Show sample data if table exists
SELECT 
  'Sample Data' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM message_attachments LIMIT 1) 
    THEN '✅ HAS DATA' 
    ELSE '❌ NO DATA' 
  END as status;

-- 5. If table has data, show first few rows
SELECT 
  'First 3 Rows' as check_type,
  *
FROM message_attachments 
LIMIT 3;
