-- Check the actual structure of the messages table
-- Run this to see what columns actually exist in your messages table

-- 1. Check if the messages table exists
SELECT 
  'Messages Table Existence' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status;

-- 2. Show the actual table structure
SELECT 
  'Messages Table Structure' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 3. Check if there are any user-related columns
SELECT 
  'User Columns' as check_type,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'messages'
AND (column_name LIKE '%user%' OR column_name LIKE '%sender%' OR column_name LIKE '%recipient%')
ORDER BY column_name;

-- 4. Check if there are any thread-related columns
SELECT 
  'Thread Columns' as check_type,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'messages'
AND (column_name LIKE '%thread%' OR column_name LIKE '%conversation%')
ORDER BY column_name;

-- 5. Show sample data if table exists
SELECT 
  'Sample Data' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM messages LIMIT 1) 
    THEN '✅ HAS DATA' 
    ELSE '❌ NO DATA' 
  END as status;

-- 6. If table has data, show first few rows
SELECT 
  'First 3 Rows' as check_type,
  *
FROM messages 
LIMIT 3;
