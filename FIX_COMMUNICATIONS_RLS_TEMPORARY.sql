-- 🔧 TEMPORARY FIX: Communications RLS Policies
-- This will allow access to communications table for testing

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view their communications" ON communications;
DROP POLICY IF EXISTS "Users can create communications" ON communications;
DROP POLICY IF EXISTS "Users can update their communications" ON communications;
DROP POLICY IF EXISTS "Users can delete their communications" ON communications;

-- Create simple, permissive policies for testing
CREATE POLICY "Allow all authenticated users to view communications" ON communications
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow all authenticated users to create communications" ON communications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow all authenticated users to update communications" ON communications
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow all authenticated users to delete communications" ON communications
    FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Verify the policies were created
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'communications'
ORDER BY policyname; 