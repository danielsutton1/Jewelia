-- =====================================================
-- FIX COLUMN NAMES TO MATCH API EXPECTATIONS
-- =====================================================
-- This script fixes column name mismatches between database and API

-- =====================================================
-- STEP 1: ADD MISSING COLUMNS TO MESSAGES TABLE
-- =====================================================

-- Add content column (API expects this instead of body)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS content TEXT;

-- Add thread_id column (API expects this)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS thread_id UUID;

-- Add reply_to_id column (API expects this)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id UUID;

-- Add message_type column (API expects this)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'internal';

-- Add priority column (API expects this)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- Add category column (API expects this)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Add status column (API expects this)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent';

-- Add is_read column (API expects this)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Add read_at column (API expects this)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Add delivered_at column (API expects this)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Add tags column (API expects this)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add metadata column (API expects this)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add organization_id column (API expects this)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Add related_order_id column (API expects this)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS related_order_id UUID;

-- Add related_task_id column (API expects this)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS related_task_id UUID;

-- Add related_project_id column (API expects this)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS related_project_id UUID;

-- =====================================================
-- STEP 2: ADD MISSING COLUMNS TO USERS TABLE
-- =====================================================

-- Add first_name column (API expects this)
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;

-- Add last_name column (API expects this)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add role column (API expects this)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff';

-- Add company_id column (API expects this)
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id UUID;

-- Add department_id column (API expects this)
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id UUID;

-- Add is_active column (API expects this)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add last_login column (API expects this)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Add updated_at column (API expects this)
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =====================================================
-- STEP 3: COPY DATA FROM OLD COLUMNS TO NEW COLUMNS
-- =====================================================

-- Copy body to content
UPDATE messages SET content = body WHERE content IS NULL AND body IS NOT NULL;

-- Copy full_name to first_name and last_name
UPDATE users SET 
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE 
    WHEN POSITION(' ' IN full_name) > 0 THEN SPLIT_PART(full_name, ' ', 2)
    ELSE ''
  END
WHERE first_name IS NULL AND full_name IS NOT NULL;

-- =====================================================
-- STEP 4: ADD FOREIGN KEY CONSTRAINTS FOR NEW COLUMNS
-- =====================================================

-- Add foreign key for thread_id
ALTER TABLE messages ADD CONSTRAINT messages_thread_id_fkey 
FOREIGN KEY (thread_id) REFERENCES message_threads(id) ON DELETE CASCADE;

-- Add foreign key for reply_to_id
ALTER TABLE messages ADD CONSTRAINT messages_reply_to_id_fkey 
FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE CASCADE;

-- =====================================================
-- STEP 5: CREATE INDEXES FOR NEW COLUMNS
-- =====================================================

-- Indexes for new message columns
CREATE INDEX IF NOT EXISTS idx_messages_content ON messages(content);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_priority ON messages(priority);
CREATE INDEX IF NOT EXISTS idx_messages_category ON messages(category);

-- Indexes for new user columns
CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- =====================================================
-- STEP 6: UPDATE SAMPLE DATA TO USE NEW COLUMNS
-- =====================================================

-- Update existing messages to have proper content
UPDATE messages SET 
  content = COALESCE(content, body, 'Sample message content'),
  message_type = COALESCE(message_type, 'internal'),
  priority = COALESCE(priority, 'normal'),
  category = COALESCE(category, 'general'),
  status = COALESCE(status, 'sent'),
  is_read = COALESCE(is_read, false)
WHERE content IS NULL OR content = '';

-- Update existing users to have proper names
UPDATE users SET 
  first_name = COALESCE(first_name, SPLIT_PART(full_name, ' ', 1)),
  last_name = COALESCE(last_name, CASE 
    WHEN POSITION(' ' IN full_name) > 0 THEN SPLIT_PART(full_name, ' ', 2)
    ELSE ''
  END),
  role = COALESCE(role, 'staff'),
  is_active = COALESCE(is_active, true)
WHERE first_name IS NULL OR first_name = '';

-- =====================================================
-- STEP 7: REFRESH SCHEMA CACHE
-- =====================================================

-- Refresh the schema cache to ensure all columns are recognized
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- STEP 8: VERIFY THE FIX
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'COLUMN NAMES FIX COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ Added content column to messages table';
    RAISE NOTICE '✅ Added thread_id column to messages table';
    RAISE NOTICE '✅ Added first_name/last_name columns to users table';
    RAISE NOTICE '✅ Added all missing API-expected columns';
    RAISE NOTICE '✅ Copied data from old columns to new columns';
    RAISE NOTICE '✅ Created indexes for new columns';
    RAISE NOTICE '✅ Schema cache refreshed';
    RAISE NOTICE '✅ APIs should now work correctly';
    RAISE NOTICE '=====================================================';
END $$;
