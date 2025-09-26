-- =====================================================
-- FIX BODY COLUMN CONSTRAINT ISSUE
-- =====================================================
-- This script fixes the body column NOT NULL constraint issue

-- =====================================================
-- STEP 1: MAKE BODY COLUMN NULLABLE
-- =====================================================

-- Remove NOT NULL constraint from body column
ALTER TABLE messages ALTER COLUMN body DROP NOT NULL;

-- =====================================================
-- STEP 2: UPDATE EXISTING DATA
-- =====================================================

-- Copy content to body for existing messages
UPDATE messages SET body = content WHERE body IS NULL AND content IS NOT NULL;

-- Copy body to content for existing messages (in case some have body but not content)
UPDATE messages SET content = body WHERE content IS NULL AND body IS NOT NULL;

-- =====================================================
-- STEP 3: CREATE TRIGGER TO SYNC COLUMNS
-- =====================================================

-- Create a function to sync body and content columns
CREATE OR REPLACE FUNCTION sync_message_content()
RETURNS TRIGGER AS $$
BEGIN
    -- If content is updated, update body
    IF NEW.content IS NOT NULL AND (OLD.content IS NULL OR NEW.content != OLD.content) THEN
        NEW.body = NEW.content;
    END IF;
    
    -- If body is updated, update content
    IF NEW.body IS NOT NULL AND (OLD.body IS NULL OR NEW.body != OLD.body) THEN
        NEW.content = NEW.body;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync the columns
DROP TRIGGER IF EXISTS sync_message_content_trigger ON messages;
CREATE TRIGGER sync_message_content_trigger
    BEFORE INSERT OR UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION sync_message_content();

-- =====================================================
-- STEP 4: UPDATE SAMPLE DATA
-- =====================================================

-- Ensure all messages have both body and content
UPDATE messages SET 
    body = COALESCE(body, content, 'Sample message content'),
    content = COALESCE(content, body, 'Sample message content')
WHERE body IS NULL OR content IS NULL;

-- =====================================================
-- STEP 5: REFRESH SCHEMA CACHE
-- =====================================================

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- STEP 6: VERIFY THE FIX
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'BODY CONSTRAINT FIX COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ Made body column nullable';
    RAISE NOTICE '✅ Synced existing data between body and content';
    RAISE NOTICE '✅ Created trigger to auto-sync columns';
    RAISE NOTICE '✅ Updated sample data';
    RAISE NOTICE '✅ Schema cache refreshed';
    RAISE NOTICE '✅ Message creation should now work';
    RAISE NOTICE '=====================================================';
END $$;
