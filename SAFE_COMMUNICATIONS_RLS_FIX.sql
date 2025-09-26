-- 🔒 SAFE COMMUNICATIONS RLS FIX - JEWELIA CRM
-- This script is 100% NON-DESTRUCTIVE - no DROP statements
-- Only creates new policies if they don't exist

-- ========================================
-- STEP 1: Create Safe Communications RLS Policies
-- ========================================

-- Create view policy only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'communications' 
        AND policyname = 'Allow all authenticated users to view communications'
    ) THEN
        CREATE POLICY "Allow all authenticated users to view communications" ON communications
            FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
        RAISE NOTICE '✅ Created communications view policy';
    ELSE
        RAISE NOTICE 'ℹ️ communications view policy already exists';
    END IF;
END $$;

-- Create insert policy only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'communications' 
        AND policyname = 'Allow all authenticated users to create communications'
    ) THEN
        CREATE POLICY "Allow all authenticated users to create communications" ON communications
            FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
        RAISE NOTICE '✅ Created communications insert policy';
    ELSE
        RAISE NOTICE 'ℹ️ communications insert policy already exists';
    END IF;
END $$;

-- Create update policy only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'communications' 
        AND policyname = 'Allow all authenticated users to update communications'
    ) THEN
        CREATE POLICY "Allow all authenticated users to update communications" ON communications
            FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
        RAISE NOTICE '✅ Created communications update policy';
    ELSE
        RAISE NOTICE 'ℹ️ communications update policy already exists';
    END IF;
END $$;

-- Create delete policy only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'communications' 
        AND policyname = 'Allow all authenticated users to delete communications'
    ) THEN
        CREATE POLICY "Allow all authenticated users to delete communications" ON communications
            FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
        RAISE NOTICE '✅ Created communications delete policy';
    ELSE
        RAISE NOTICE 'ℹ️ communications delete policy already exists';
    END IF;
END $$;

-- ========================================
-- STEP 2: Verify RLS is Enabled
-- ========================================

-- Ensure RLS is enabled on communications table
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 3: Verification Query
-- ========================================

-- Show all communications policies
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'communications'
ORDER BY policyname;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SAFE COMMUNICATIONS RLS FIX COMPLETED!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ All communications RLS policies created (if missing)';
    RAISE NOTICE '✅ RLS enabled on communications table';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 No existing policies were dropped';
    RAISE NOTICE '🔒 No existing data was modified';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Test the communications API!';
END $$; 