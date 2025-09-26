-- Add Foreign Key Constraints for Internal Messages
-- This will fix the "Could not find a relationship" error

-- Add foreign key constraint for sender_id
ALTER TABLE internal_messages
ADD CONSTRAINT internal_messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES users(id)
ON DELETE CASCADE;

-- Add foreign key constraint for recipient_id
ALTER TABLE internal_messages
ADD CONSTRAINT internal_messages_recipient_id_fkey
FOREIGN KEY (recipient_id) REFERENCES users(id)
ON DELETE CASCADE;

-- Add foreign key constraint for business_id (if businesses table exists)
DO $$ BEGIN
    ALTER TABLE internal_messages
    ADD CONSTRAINT internal_messages_business_id_fkey
    FOREIGN KEY (business_id) REFERENCES businesses(id)
    ON DELETE SET NULL;
EXCEPTION
    WHEN undefined_table THEN null;
END $$;

-- Add foreign key constraint for company_id (if companies table exists)
DO $$ BEGIN
    ALTER TABLE internal_messages
    ADD CONSTRAINT internal_messages_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE SET NULL;
EXCEPTION
    WHEN undefined_table THEN null;
END $$;

-- Add foreign key constraint for order_id (if orders table exists)
DO $$ BEGIN
    ALTER TABLE internal_messages
    ADD CONSTRAINT internal_messages_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE SET NULL;
EXCEPTION
    WHEN undefined_table THEN null;
END $$;

-- Add foreign key constraint for parent_message_id (self-referencing)
ALTER TABLE internal_messages
ADD CONSTRAINT internal_messages_parent_message_id_fkey
FOREIGN KEY (parent_message_id) REFERENCES internal_messages(id)
ON DELETE CASCADE;

-- Add foreign key constraint for thread_id (self-referencing)
ALTER TABLE internal_messages
ADD CONSTRAINT internal_messages_thread_id_fkey
FOREIGN KEY (thread_id) REFERENCES internal_messages(id)
ON DELETE SET NULL;

-- Verify the constraints were added
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'internal_messages';

