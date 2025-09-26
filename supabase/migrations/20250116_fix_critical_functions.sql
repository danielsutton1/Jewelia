-- Critical Database Fixes - January 16, 2025
-- Fix missing update_customer_company function and communications table issues

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
  
  -- Log the update for audit purposes
  INSERT INTO audit_logs (
    table_name, 
    record_id, 
    event_type, 
    metadata
  ) VALUES (
    'customers',
    customer_id,
    'update_company',
    jsonb_build_object('company', company_name)
  );
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

-- 3. Fix communications table structure
-- First, check if communications table exists and has proper structure
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

-- 4. Create proper foreign key relationships for communications
-- Note: We'll use auth.users for user references since that's what Supabase uses
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

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_communications_sender_id ON communications(sender_id);
CREATE INDEX IF NOT EXISTS idx_communications_recipient_id ON communications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);

-- 6. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_communications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_communications_updated_at_trigger ON communications;
CREATE TRIGGER update_communications_updated_at_trigger
  BEFORE UPDATE ON communications
  FOR EACH ROW
  EXECUTE FUNCTION update_communications_updated_at();

-- 7. Add RLS policies for communications table
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- Policy for users to see communications they sent or received
CREATE POLICY "Users can view their own communications" ON communications
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Policy for users to create communications
CREATE POLICY "Users can create communications" ON communications
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

-- Policy for users to update communications they sent
CREATE POLICY "Users can update their own communications" ON communications
  FOR UPDATE USING (
    auth.uid() = sender_id OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Policy for users to delete communications they sent
CREATE POLICY "Users can delete their own communications" ON communications
  FOR DELETE USING (
    auth.uid() = sender_id OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- 8. Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Add indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 10. Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy for audit logs (admin only)
CREATE POLICY "Only admins can view audit logs" ON audit_logs
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  ); 