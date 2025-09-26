-- Debug script to find where messages are actually stored
-- Run this to see what tables exist and where your messages are going

-- 1. Check what tables exist that might contain messages
SELECT 
  'Message-related tables' as check_type,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name LIKE '%message%' 
   OR table_name LIKE '%chat%'
   OR table_name LIKE '%conversation%'
   OR table_name LIKE '%communication%'
ORDER BY table_name;

-- 2. Check if there's a messages table and what's in it
SELECT 
  'Messages table check' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status;

-- 3. If messages table exists, show its structure
SELECT 
  'Messages table structure' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 4. Check if there are any rows in the messages table
SELECT 
  'Messages table data' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM messages LIMIT 1) 
    THEN '✅ HAS DATA' 
    ELSE '❌ NO DATA' 
  END as status,
  COUNT(*) as row_count
FROM messages;

-- 5. Look for the specific message ID that was created
SELECT 
  'Looking for specific message' as check_type,
  'dfe253d7-20a2-4d31-9db1-c5e374f88d60' as message_id,
  CASE 
    WHEN EXISTS (SELECT 1 FROM messages WHERE id = 'dfe253d7-20a2-4d31-9db1-c5e374f88d60') 
    THEN '✅ FOUND IN messages table' 
    ELSE '❌ NOT FOUND IN messages table' 
  END as status;

-- 6. Check other potential tables for this message ID
SELECT 
  'Checking other tables' as check_type,
  'Looking for message ID in other tables' as note;
