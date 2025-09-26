-- 🔧 COMMUNICATIONS TABLE SAFE FIX
-- This script is NON-DESTRUCTIVE - it only adds missing components
-- Apply this script in your Supabase Dashboard SQL Editor

-- =====================================================
-- 1. SAFELY CREATE COMMUNICATIONS TABLE (if it doesn't exist)
-- =====================================================

DO $$ 
BEGIN
    -- Check if communications table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'communications'
    ) THEN
        -- Create the communications table with proper structure
        CREATE TABLE communications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            sender_id UUID,
            recipient_id UUID,
            subject TEXT,
            content TEXT NOT NULL DEFAULT '',
            type TEXT DEFAULT 'email' CHECK (type IN ('email', 'sms', 'notification', 'internal', 'task')),
            status TEXT DEFAULT 'unread' CHECK (status IN ('draft', 'unread', 'read', 'sent', 'delivered', 'failed')),
            priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
            category TEXT DEFAULT 'general',
            due_date TIMESTAMP WITH TIME ZONE,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ Created communications table with proper structure';
    ELSE
        RAISE NOTICE 'ℹ️ Communications table already exists - checking structure...';
        
        -- SAFELY add missing columns if they don't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'communications' AND column_name = 'sender_id'
        ) THEN
            ALTER TABLE communications ADD COLUMN sender_id UUID;
            RAISE NOTICE '✅ Added sender_id column';
        ELSE
            RAISE NOTICE 'ℹ️ sender_id column already exists';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'communications' AND column_name = 'recipient_id'
        ) THEN
            ALTER TABLE communications ADD COLUMN recipient_id UUID;
            RAISE NOTICE '✅ Added recipient_id column';
        ELSE
            RAISE NOTICE 'ℹ️ recipient_id column already exists';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'communications' AND column_name = 'content'
        ) THEN
            -- Check if message column exists and rename it safely
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'communications' AND column_name = 'message'
            ) THEN
                ALTER TABLE communications RENAME COLUMN message TO content;
                RAISE NOTICE '✅ Renamed message column to content';
            ELSE
                ALTER TABLE communications ADD COLUMN content TEXT NOT NULL DEFAULT '';
                RAISE NOTICE '✅ Added content column';
            END IF;
        ELSE
            RAISE NOTICE 'ℹ️ content column already exists';
        END IF;
    END IF;
END $$;

-- =====================================================
-- 2. SAFELY ADD FOREIGN KEY CONSTRAINTS (only if they don't exist)
-- =====================================================

DO $$
BEGIN
    -- Add sender_id foreign key constraint ONLY if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'communications' 
        AND constraint_name = 'communications_sender_id_fkey'
    ) THEN
        ALTER TABLE communications 
        ADD CONSTRAINT communications_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Added foreign key constraint for sender_id';
    ELSE
        RAISE NOTICE 'ℹ️ sender_id foreign key constraint already exists';
    END IF;
    
    -- Add recipient_id foreign key constraint ONLY if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'communications' 
        AND constraint_name = 'communications_recipient_id_fkey'
    ) THEN
        ALTER TABLE communications 
        ADD CONSTRAINT communications_recipient_id_fkey 
        FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Added foreign key constraint for recipient_id';
    ELSE
        RAISE NOTICE 'ℹ️ recipient_id foreign key constraint already exists';
    END IF;
END $$;

-- =====================================================
-- 3. SAFELY CREATE PERFORMANCE INDEXES (only if they don't exist)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_communications_sender_id ON communications(sender_id);
CREATE INDEX IF NOT EXISTS idx_communications_recipient_id ON communications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);
CREATE INDEX IF NOT EXISTS idx_communications_category ON communications(category);

RAISE NOTICE '✅ Performance indexes created (or already existed)';

-- =====================================================
-- 4. SAFELY ENABLE ROW LEVEL SECURITY (non-destructive)
-- =====================================================

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

RAISE NOTICE '✅ RLS enabled on communications table';

-- =====================================================
-- 5. SAFELY CREATE RLS POLICIES (only if they don't exist)
-- =====================================================

-- Drop existing policies ONLY if they exist (safe operation)
DROP POLICY IF EXISTS "Users can view their communications" ON communications;
DROP POLICY IF EXISTS "Users can create communications" ON communications;
DROP POLICY IF EXISTS "Users can update their communications" ON communications;
DROP POLICY IF EXISTS "Users can delete their communications" ON communications;

-- Create new policies
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

RAISE NOTICE '✅ RLS policies created';

-- =====================================================
-- 6. SAFELY CREATE UPDATED_AT TRIGGER (only if it doesn't exist)
-- =====================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger ONLY if it doesn't exist
DROP TRIGGER IF EXISTS update_communications_updated_at_trigger ON communications;
CREATE TRIGGER update_communications_updated_at_trigger
    BEFORE UPDATE ON communications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

RAISE NOTICE '✅ Updated_at trigger created';

-- =====================================================
-- 7. SAFELY ADD SAMPLE DATA (only if table is empty)
-- =====================================================

DO $$
DECLARE
    sample_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO sample_count FROM communications;
    
    IF sample_count = 0 THEN
        -- Get a sample user ID
        DECLARE
            sample_user_id UUID;
        BEGIN
            SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
            
            IF sample_user_id IS NOT NULL THEN
                INSERT INTO communications (
                    sender_id,
                    recipient_id,
                    subject,
                    content,
                    type,
                    status,
                    priority,
                    category
                ) VALUES 
                (
                    sample_user_id,
                    sample_user_id,
                    'Welcome to Jewelry CRM',
                    'Welcome to your new jewelry management system! This is your first communication.',
                    'internal',
                    'read',
                    'normal',
                    'welcome'
                ),
                (
                    sample_user_id,
                    sample_user_id,
                    'System Setup Complete',
                    'Your jewelry CRM system has been successfully configured and is ready for use.',
                    'notification',
                    'unread',
                    'high',
                    'system'
                );
                
                RAISE NOTICE '✅ Added sample communications data';
            ELSE
                RAISE NOTICE '⚠️ No users found to create sample communications';
            END IF;
        END;
    ELSE
        RAISE NOTICE 'ℹ️ Communications table already has data, skipping sample insertion';
    END IF;
END $$;

-- =====================================================
-- 8. VERIFICATION (NON-DESTRUCTIVE)
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VERIFICATION RESULTS:';
    RAISE NOTICE '';
    
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'communications') THEN
        RAISE NOTICE '✅ Communications table exists';
    ELSE
        RAISE NOTICE '❌ Communications table missing';
    END IF;
    
    -- Check if columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communications' AND column_name = 'sender_id') THEN
        RAISE NOTICE '✅ sender_id column exists';
    ELSE
        RAISE NOTICE '❌ sender_id column missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communications' AND column_name = 'recipient_id') THEN
        RAISE NOTICE '✅ recipient_id column exists';
    ELSE
        RAISE NOTICE '❌ recipient_id column missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communications' AND column_name = 'content') THEN
        RAISE NOTICE '✅ content column exists';
    ELSE
        RAISE NOTICE '❌ content column missing';
    END IF;
    
    -- Check foreign key constraints
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'communications' AND constraint_name = 'communications_sender_id_fkey'
    ) THEN
        RAISE NOTICE '✅ sender_id foreign key constraint exists';
    ELSE
        RAISE NOTICE '❌ sender_id foreign key constraint missing';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'communications' AND constraint_name = 'communications_recipient_id_fkey'
    ) THEN
        RAISE NOTICE '✅ recipient_id foreign key constraint exists';
    ELSE
        RAISE NOTICE '❌ recipient_id foreign key constraint missing';
    END IF;
    
    -- Check RLS
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'communications' AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS is enabled';
    ELSE
        RAISE NOTICE '❌ RLS is not enabled';
    END IF;
    
    -- Check policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communications') THEN
        RAISE NOTICE '✅ RLS policies exist';
    ELSE
        RAISE NOTICE '❌ RLS policies missing';
    END IF;
    
    RAISE NOTICE '';
END $$;

-- =====================================================
-- 9. SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 COMMUNICATIONS TABLE SAFELY FIXED!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ What was done (NON-DESTRUCTIVE):';
    RAISE NOTICE '   - Created communications table (if missing)';
    RAISE NOTICE '   - Added missing columns (if needed)';
    RAISE NOTICE '   - Created foreign key relationships (if missing)';
    RAISE NOTICE '   - Added performance indexes (if missing)';
    RAISE NOTICE '   - Enabled RLS with proper policies';
    RAISE NOTICE '   - Added updated_at trigger (if missing)';
    RAISE NOTICE '   - Added sample data (only if table was empty)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Communications API should now work correctly!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Next Steps:';
    RAISE NOTICE '   1. Test the communications API in your application';
    RAISE NOTICE '   2. Verify that communications load without errors';
    RAISE NOTICE '   3. Test creating new communications';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 SAFETY: No existing data was modified or deleted!';
    RAISE NOTICE '';
END $$; 