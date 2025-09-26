-- Apply Critical Database Fixes Directly
-- This script fixes the critical issues identified in the audit

-- 1. Create the missing update_customer_company function
CREATE OR REPLACE FUNCTION update_customer_company(
  customer_id UUID,
  company_name VARCHAR(255)
) RETURNS VOID AS $$
BEGIN
  UPDATE customers 
  SET company = company_name, 
      updated_at = CURRENT_TIMESTAMP 
  WHERE id = customer_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Ensure company column exists in customers table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' 
    AND column_name = 'company'
  ) THEN
    ALTER TABLE customers ADD COLUMN company VARCHAR(255);
  END IF;
END $$;

-- 3. Fix communications table structure (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('internal', 'external', 'notification', 'task')),
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  sender_id UUID,
  recipient_id UUID,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  due_date TIMESTAMP WITH TIME ZONE,
  category VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add foreign key relationships only if they don't exist
DO $$ 
BEGIN
  -- Add sender_id foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'communications_sender_id_fkey'
  ) THEN
    ALTER TABLE communications 
    ADD CONSTRAINT communications_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  
  -- Add recipient_id foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'communications_recipient_id_fkey'
  ) THEN
    ALTER TABLE communications 
    ADD CONSTRAINT communications_recipient_id_fkey 
    FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_communications_sender_id ON communications(sender_id);
CREATE INDEX IF NOT EXISTS idx_communications_recipient_id ON communications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);

-- 6. Enable RLS on communications table (if not already enabled)
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies only if they don't exist
DO $$
BEGIN
  -- Policy for users to see communications they sent or received
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'communications' 
    AND policyname = 'Users can view their own communications'
  ) THEN
    CREATE POLICY "Users can view their own communications" ON communications
      FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id OR
        auth.jwt() ->> 'role' = 'admin'
      );
  END IF;

  -- Policy for users to create communications
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'communications' 
    AND policyname = 'Users can create communications'
  ) THEN
    CREATE POLICY "Users can create communications" ON communications
      FOR INSERT WITH CHECK (
        auth.uid() = sender_id
      );
  END IF;

  -- Policy for users to update communications they sent
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'communications' 
    AND policyname = 'Users can update their own communications'
  ) THEN
    CREATE POLICY "Users can update their own communications" ON communications
      FOR UPDATE USING (
        auth.uid() = sender_id OR
        auth.jwt() ->> 'role' = 'admin'
      );
  END IF;

  -- Policy for users to delete communications they sent
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'communications' 
    AND policyname = 'Users can delete their own communications'
  ) THEN
    CREATE POLICY "Users can delete their own communications" ON communications
      FOR DELETE USING (
        auth.uid() = sender_id OR
        auth.jwt() ->> 'role' = 'admin'
      );
  END IF;
END $$;

-- 8. Test the function
SELECT 'Critical fixes applied successfully!' as status; 