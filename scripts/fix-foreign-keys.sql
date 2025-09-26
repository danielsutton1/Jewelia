-- Fix Foreign Key Relationships for Orders Table
-- This script drops the duplicate foreign key constraint and leaves only one

-- 1. DROP DUPLICATE FOREIGN KEY CONSTRAINT IF EXISTS
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_orders_customer' 
        AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT fk_orders_customer;
        RAISE NOTICE 'Dropped duplicate foreign key constraint: fk_orders_customer';
    ELSE
        RAISE NOTICE 'No duplicate foreign key constraint fk_orders_customer found';
    END IF;
END $$;

-- 2. (Optional) Verify only one foreign key remains
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'orders'
ORDER BY tc.table_name, kcu.column_name;

SELECT 'Foreign key deduplication completed!' as status; 