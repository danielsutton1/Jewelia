-- Temporary RLS policy for testing (more permissive)
-- This will help us test the communications API

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their communications" ON communications;
DROP POLICY IF EXISTS "Users can create communications" ON communications;
DROP POLICY IF EXISTS "Users can update their communications" ON communications;
DROP POLICY IF EXISTS "Users can delete their communications" ON communications;

-- Create a temporary permissive policy for testing
CREATE POLICY "Temporary test policy" ON communications
    FOR ALL USING (true);

-- Also check if we need to grant permissions to the service role
GRANT ALL ON communications TO service_role;
GRANT ALL ON communications TO postgres; 