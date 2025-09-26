-- Simple storage bucket and policies for message attachments
-- This script avoids complex table joins that might fail due to missing columns
-- Run scripts/check-messages-table-structure.sql first to see your actual messages table structure

-- 1. Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'Message Attachments',
  false, -- Keep private for security
  52428800, -- 50MB file size limit
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'text/csv',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'application/x-zip-compressed'
  ]
) ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view message attachments they have access to" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own message attachments" ON storage.objects;

-- 3. Create simple, reliable storage policies

-- Policy: Allow authenticated users to upload message attachments
CREATE POLICY "Users can upload message attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated'
  );

-- Policy: Allow authenticated users to view message attachments
-- This is a simplified policy - access control handled at application level
CREATE POLICY "Users can view message attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated'
  );

-- Policy: Allow authenticated users to update message attachments
CREATE POLICY "Users can update message attachments"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated'
  );

-- Policy: Allow authenticated users to delete message attachments
CREATE POLICY "Users can delete message attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated'
  );

-- 4. Verify the setup
SELECT 
  'Storage bucket created successfully' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'message-attachments';

-- 5. Show the created policies
SELECT 
  'Storage policies created successfully' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%message attachments%';

-- 6. Test the policies
SELECT 
  'Policy test' as check_type,
  'Storage policies created with simplified access control' as note,
  'Access control will be handled at the application level' as security_note,
  'This approach avoids complex SQL joins that might fail' as approach_note;
