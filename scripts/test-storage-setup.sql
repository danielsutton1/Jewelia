-- Test script to verify message-attachments storage setup
-- Run this in Supabase SQL Editor to check the current state

-- 1. Check if the storage bucket exists
SELECT 
  'Storage Bucket Status' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'message-attachments') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'message-attachments';

-- 2. Check storage policies
SELECT 
  'Storage Policies Status' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ POLICIES EXIST' 
    ELSE '❌ NO POLICIES' 
  END as status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%message attachments%';

-- 3. Show all storage policies for message-attachments
SELECT 
  'Storage Policy Details' as check_type,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%message attachments%'
ORDER BY policyname;

-- 4. Check if message_attachments table exists and has RLS enabled
SELECT 
  'Table Status' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS ENABLED' 
    ELSE '❌ RLS DISABLED' 
  END as rls_status
FROM pg_tables 
WHERE tablename = 'message_attachments';

-- 5. Check RLS policies on message_attachments table
SELECT 
  'Table RLS Policies' as check_type,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'message_attachments'
ORDER BY policyname;
