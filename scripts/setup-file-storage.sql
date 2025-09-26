-- Setup file storage for call log attachments
-- This script should be run in the Supabase SQL Editor

-- Create storage bucket for call log files
-- Note: This needs to be done in the Supabase Dashboard under Storage

-- Instructions for manual setup:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Storage
-- 3. Click "Create a new bucket"
-- 4. Bucket name: call-log-files
-- 5. Make it public (so files can be accessed via URLs)
-- 6. Set up RLS policies

-- RLS Policies for the call-log-files bucket:
-- These policies should be added in the Supabase Dashboard under Storage > Policies

-- Policy 1: Allow authenticated users to upload files
-- Name: "Allow authenticated uploads"
-- Operation: INSERT
-- Policy: (auth.role() = 'authenticated')

-- Policy 2: Allow public access to view files
-- Name: "Allow public access"
-- Operation: SELECT
-- Policy: (true)

-- Policy 3: Allow authenticated users to update their own files
-- Name: "Allow authenticated updates"
-- Operation: UPDATE
-- Policy: (auth.role() = 'authenticated')

-- Policy 4: Allow authenticated users to delete their own files
-- Name: "Allow authenticated deletes"
-- Operation: DELETE
-- Policy: (auth.role() = 'authenticated')

-- Verify the bucket exists (this will show an error if it doesn't exist)
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'call-log-files'; 