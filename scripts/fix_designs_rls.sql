-- Fix RLS policies for designs table
-- This script makes the policies more permissive for development

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read designs" ON designs;
DROP POLICY IF EXISTS "Allow authenticated users to insert designs" ON designs;
DROP POLICY IF EXISTS "Allow authenticated users to update designs" ON designs;

-- Create more permissive policies for development
CREATE POLICY "Allow all operations on designs" ON designs
    FOR ALL USING (true) WITH CHECK (true);

-- Alternative: If you want to keep some security, use these instead:
-- CREATE POLICY "Allow read designs" ON designs FOR SELECT USING (true);
-- CREATE POLICY "Allow insert designs" ON designs FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow update designs" ON designs FOR UPDATE USING (true) WITH CHECK (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'designs'; 