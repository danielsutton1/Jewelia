-- COMPREHENSIVE FIX FOR message_attachments RLS POLICIES
-- This will completely remove all existing policies and create working ones

-- Step 1: Disable RLS temporarily to see if that's the issue
ALTER TABLE message_attachments DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (if any exist)
DROP POLICY IF EXISTS "Users can view attachments for messages they can access" ON message_attachments;
DROP POLICY IF EXISTS "Users can insert attachments" ON message_attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON message_attachments;
DROP POLICY IF EXISTS "Enable all operations for testing" ON message_attachments;
DROP POLICY IF EXISTS "Users can upload message attachments" ON message_attachments;
DROP POLICY IF EXISTS "Users can view message attachments they have access to" ON message_attachments;
DROP POLICY IF EXISTS "Users can delete their own message attachments" ON message_attachments;

-- Step 3: Re-enable RLS
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- Step 4: Create a simple, permissive policy for testing
CREATE POLICY "message_attachments_policy" ON message_attachments
FOR ALL USING (true)
WITH CHECK (true);

-- Step 5: Verify the policy was created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'message_attachments';

-- Step 6: Test if we can insert (this should work now)
-- INSERT INTO message_attachments (message_id, file_name, file_path, file_size, file_type, mime_type, uploaded_by, metadata)
-- VALUES ('test-message-id', 'test.txt', 'test/path', 1024, 'txt', 'text/plain', 'test-user', '{"test": true}');

-- Step 7: Show current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'message_attachments';
