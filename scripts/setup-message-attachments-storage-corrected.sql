-- Corrected storage bucket and policies for message attachments
-- This script uses the actual column names from your message_attachments table
-- Based on the table structure check: file_name, file_path, file_size, file_type

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

-- 3. Create storage policies that work with your actual table structure

-- Policy: Allow authenticated users to upload message attachments
CREATE POLICY "Users can upload message attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated'
  );

-- Policy: Allow users to view message attachments for messages they can access
-- This uses the correct column name: file_path (not storage_path)
CREATE POLICY "Users can view message attachments they have access to"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM message_attachments ma
      JOIN messages m ON ma.message_id = m.id
      WHERE ma.file_path = storage.objects.name  -- Using file_path (your actual column)
      AND (
        m.sender_id = auth.uid() OR 
        m.recipient_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM message_threads mt
          WHERE mt.id = m.thread_id
          AND auth.uid() = ANY(mt.participants)
        )
      )
    )
  );

-- Policy: Allow users to update their own message attachments
CREATE POLICY "Users can update their own message attachments"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM message_attachments ma
      JOIN messages m ON ma.message_id = m.id
      WHERE ma.file_path = storage.objects.name  -- Using file_path (your actual column)
      AND m.sender_id = auth.uid()
    )
  );

-- Policy: Allow users to delete their own message attachments
CREATE POLICY "Users can delete their own message attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM message_attachments ma
      JOIN messages m ON ma.message_id = m.id
      WHERE ma.file_path = storage.objects.name  -- Using file_path (your actual column)
      AND m.sender_id = auth.uid()
    )
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
  'Storage policies created with correct column references' as note,
  'Using file_path column (your actual schema)' as schema_note;
