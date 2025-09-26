-- Setup Storage Bucket for Message Attachments
-- Run this in your Supabase SQL Editor

-- Note: Storage buckets are typically created through the Supabase Dashboard
-- Go to Storage > Buckets > Create Bucket
-- Bucket Name: message-attachments
-- Public: true
-- File Size Limit: 50MB
-- Allowed MIME Types: image/*, application/pdf, text/*, application/*

-- Alternative: Use the Storage API to create the bucket
-- The upload API will automatically create the bucket if it doesn't exist

-- Check if bucket exists
SELECT name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE name = 'message-attachments';

-- If no results, the bucket needs to be created through the Dashboard or API
