-- Setup RLS policies for message_attachments table
-- This script addresses the "new row violates row-level security policy" error

-- 1. First, let's check if RLS is enabled on the table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'message_attachments';

-- 2. Enable RLS if it's not already enabled
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- 3. Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert message attachments" ON message_attachments;
DROP POLICY IF EXISTS "Users can view message attachments" ON message_attachments;
DROP POLICY IF EXISTS "Users can update message attachments" ON message_attachments;
DROP POLICY IF EXISTS "Users can delete message attachments" ON message_attachments;

-- 4. Create the INSERT policy (this is what's failing)
-- Users can insert attachments for messages they sent
CREATE POLICY "Users can insert message attachments"
ON message_attachments
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM internal_messages m
        WHERE m.id = message_attachments.message_id
        AND m.sender_id = auth.uid()
    )
);

-- 5. Create the SELECT policy
-- Users can view attachments for messages they can access
CREATE POLICY "Users can view message attachments"
ON message_attachments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM internal_messages m
        WHERE m.id = message_attachments.message_id
        AND (
            m.sender_id = auth.uid() OR 
            m.recipient_id = auth.uid()
        )
    )
);

-- 6. Create the UPDATE policy
-- Users can update attachments for messages they sent
CREATE POLICY "Users can update message attachments"
ON message_attachments
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM internal_messages m
        WHERE m.id = message_attachments.message_id
        AND m.sender_id = auth.uid()
    )
);

-- 7. Create the DELETE policy
-- Users can delete attachments for messages they sent
CREATE POLICY "Users can delete message attachments"
ON message_attachments
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM internal_messages m
        WHERE m.id = message_attachments.message_id
        AND m.sender_id = auth.uid()
    )
);

-- 8. Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'message_attachments'
ORDER BY policyname;

-- 9. Test the policies
SELECT 
    'RLS policies created successfully' as status,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'message_attachments';

-- 10. Show the current RLS status
SELECT 
    'RLS Status' as check_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'message_attachments';
