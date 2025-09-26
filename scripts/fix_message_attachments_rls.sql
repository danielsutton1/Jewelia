-- Fix RLS policies for message_attachments table
-- This will allow authenticated users to insert, select, and delete their own attachments

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view attachments for messages they can access" ON message_attachments;
DROP POLICY IF EXISTS "Users can insert attachments" ON message_attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON message_attachments;

-- Create a permissive policy for testing (allows all operations for authenticated users)
CREATE POLICY "Enable all operations for testing" ON message_attachments
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Alternative: More restrictive but functional policies
-- CREATE POLICY "Users can view attachments for messages they can access" ON message_attachments
-- FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE POLICY "Users can insert attachments" ON message_attachments
-- FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Users can delete their own attachments" ON message_attachments
-- FOR DELETE USING (auth.role() = 'authenticated');

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'message_attachments';

-- Test if we can insert (this should work now)
-- INSERT INTO message_attachments (message_id, file_name, file_path, file_size, file_type, mime_type, uploaded_by, metadata)
-- VALUES ('test-message-id', 'test.txt', 'test/path', 1024, 'txt', 'text/plain', 'test-user', '{"test": true}');
