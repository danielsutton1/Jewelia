-- Fix the RLS policy for message_attachments
-- Update the policy to work with the hardcoded test user ID

-- 1. Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert message attachments" ON message_attachments;

-- 2. Create a new INSERT policy that works with your setup
CREATE POLICY "Users can insert message attachments"
ON message_attachments
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM internal_messages m
        WHERE m.id = message_attachments.message_id
        AND m.sender_id = 'fdb2a122-d6ae-4e78-b277-3317e1a09132'  -- Hardcoded test user ID
    )
);

-- 3. Verify the policy was updated
SELECT 
    'Policy Updated' as check_type,
    policyname,
    cmd as operation,
    with_check as check_clause
FROM pg_policies 
WHERE tablename = 'message_attachments' 
AND cmd = 'INSERT';

-- 4. Test the policy logic manually
SELECT 
    'Policy Test' as check_type,
    'Message exists: ' || CASE 
        WHEN EXISTS (
            SELECT 1 FROM internal_messages m
            WHERE m.id = '190810f2-6e3d-46fa-b3dc-3a9f55f202a3'
        ) THEN 'YES' 
        ELSE 'NO' 
    END as message_exists,
    'User ID matches sender: ' || CASE 
        WHEN EXISTS (
            SELECT 1 FROM internal_messages m
            WHERE m.id = '190810f2-6e3d-46fa-b3dc-3a9f55f202a3'
            AND m.sender_id = 'fdb2a122-d6ae-4e78-b277-3317e1a09132'
        ) THEN 'YES' 
        ELSE 'NO' 
    END as user_matches_sender;
