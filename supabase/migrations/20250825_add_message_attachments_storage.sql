-- Migration: Add Message Attachments Storage
-- Date: 2025-08-25
-- Description: Create storage bucket and policies for message attachments

-- Create message-attachments storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES
  ('message-attachments', 'Message Attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for message attachments
CREATE POLICY "Message attachments are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'message-attachments');

CREATE POLICY "Authenticated users can upload message attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own message attachments"
  ON storage.objects FOR UPDATE
  WITH CHECK (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own message attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated'
  );

-- Create or update message_attachments table if it doesn't exist
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_file_path ON message_attachments(file_path);

-- Enable RLS
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_attachments
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

-- Grant permissions
GRANT ALL ON message_attachments TO authenticated;
