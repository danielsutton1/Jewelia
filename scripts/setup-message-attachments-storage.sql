-- Setup Message Attachments Storage System
-- Run this in your Supabase SQL Editor

-- 1. First, let's check if we have the right permissions to create storage buckets
-- You may need to run this as a superuser or with elevated privileges

-- 2. Create message-attachments storage bucket (if it doesn't exist)
-- Note: This might need to be done manually in the Supabase dashboard under Storage
-- If the bucket already exists, this will do nothing
INSERT INTO storage.buckets (id, name, public) VALUES
  ('message-attachments', 'Message Attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 3. If the bucket creation fails due to RLS, you can create it manually in the Supabase dashboard:
-- Go to Storage > Create a new bucket
-- Bucket ID: message-attachments
-- Name: Message Attachments
-- Public bucket: Yes
-- File size limit: 50MB
-- Allowed MIME types: image/*, application/pdf, text/*, application/zip

-- 4. Set up storage policies for message attachments (only if bucket exists)
-- First, let's check if the bucket exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'message-attachments') THEN
    -- Create storage policies
    DROP POLICY IF EXISTS "Message attachments are publicly accessible" ON storage.objects;
    CREATE POLICY "Message attachments are publicly accessible"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'message-attachments');

    DROP POLICY IF EXISTS "Authenticated users can upload message attachments" ON storage.objects;
    CREATE POLICY "Authenticated users can upload message attachments"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'message-attachments' AND
        auth.role() = 'authenticated'
      );

    DROP POLICY IF EXISTS "Users can update their own message attachments" ON storage.objects;
    CREATE POLICY "Users can update their own message attachments"
      ON storage.objects FOR UPDATE
      WITH CHECK (
        bucket_id = 'message-attachments' AND
        auth.role() = 'authenticated'
      );

    DROP POLICY IF EXISTS "Users can delete their own message attachments" ON storage.objects;
    CREATE POLICY "Users can delete their own message attachments"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'message-attachments' AND
        auth.role() = 'authenticated'
      );
    
    RAISE NOTICE 'Storage policies created successfully for message-attachments bucket';
  ELSE
    RAISE NOTICE 'message-attachments bucket does not exist. Please create it manually in the Supabase dashboard first.';
  END IF;
END $$;

-- 5. Create or update message_attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL, -- This will store the path in the storage bucket
  mime_type TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_file_path ON message_attachments(file_path);

-- 7. Enable RLS
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- 8. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view attachments for messages they can access" ON message_attachments;
DROP POLICY IF EXISTS "Users can insert attachments" ON message_attachments;

-- 9. RLS policies for message_attachments
CREATE POLICY "Users can view attachments for messages they can access" ON message_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM internal_messages im 
      WHERE im.id = message_attachments.message_id
      AND (im.sender_id = auth.uid() OR im.recipient_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert attachments" ON message_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM internal_messages im 
      WHERE im.id = message_attachments.message_id
      AND im.sender_id = auth.uid()
    )
  );

-- 10. Grant permissions
GRANT ALL ON message_attachments TO authenticated;

-- 11. Verify the setup
SELECT 'Storage bucket status:' as info;
SELECT 
  id, 
  name, 
  public,
  CASE 
    WHEN id = 'message-attachments' THEN '✅ Bucket exists'
    ELSE '❌ Bucket missing'
  END as status
FROM storage.buckets 
WHERE id = 'message-attachments';

SELECT 'Message attachments table status:' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_attachments') 
    THEN '✅ Table exists'
    ELSE '❌ Table missing'
  END as status;

SELECT 'Storage policies status:' as info;
SELECT 
  policyname,
  CASE 
    WHEN policyname LIKE '%message attachments%' THEN '✅ Policy exists'
    ELSE '❌ Policy missing'
  END as status
FROM pg_policies 
WHERE tablename = 'objects' 
AND bucket_id = 'message-attachments';
