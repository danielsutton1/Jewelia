-- Enable RLS on communications table
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for communications table
CREATE POLICY "Users can view their communications" ON communications
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            sender_id = auth.uid() OR 
            recipient_id = auth.uid() OR 
            auth.uid() IN (
                SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
            )
        )
    );

CREATE POLICY "Users can create communications" ON communications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their communications" ON communications
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            sender_id = auth.uid() OR 
            auth.uid() IN (
                SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
            )
        )
    );

CREATE POLICY "Users can delete their communications" ON communications
    FOR DELETE USING (
        auth.role() = 'authenticated' AND (
            sender_id = auth.uid() OR 
            auth.uid() IN (
                SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
            )
        )
    );

-- Verify RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'communications';

-- Verify policies were created
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'communications'; 