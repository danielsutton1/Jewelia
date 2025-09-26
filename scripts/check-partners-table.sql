-- =====================================================
-- CHECK PARTNERS TABLE STRUCTURE
-- =====================================================

-- Check what columns exist in the partners table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'partners' 
ORDER BY ordinal_position;

-- Check if the table exists at all
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'partners'
) as table_exists;
