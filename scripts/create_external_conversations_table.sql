-- Create external_conversations table for enhanced external messaging
-- Run this in your Supabase SQL Editor

-- Create the external_conversations table
CREATE TABLE IF NOT EXISTS external_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT,
  category TEXT DEFAULT 'general',
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  initiator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  participants JSONB DEFAULT '[]'::jsonb,
  business_type TEXT DEFAULT 'general' CHECK (business_type IN ('inquiry', 'quote', 'order', 'support', 'general')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'resolved', 'closed', 'archived')),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_external_conversations_partner_id ON external_conversations(partner_id);
CREATE INDEX IF NOT EXISTS idx_external_conversations_initiator_id ON external_conversations(initiator_id);
CREATE INDEX IF NOT EXISTS idx_external_conversations_status ON external_conversations(status);
CREATE INDEX IF NOT EXISTS idx_external_conversations_priority ON external_conversations(priority);
CREATE INDEX IF NOT EXISTS idx_external_conversations_category ON external_conversations(category);
CREATE INDEX IF NOT EXISTS idx_external_conversations_last_message_at ON external_conversations(last_message_at);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_external_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_external_conversations_updated_at
  BEFORE UPDATE ON external_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_external_conversations_updated_at();

-- Insert some sample data for testing
INSERT INTO external_conversations (
  title, 
  subject, 
  category, 
  partner_id, 
  initiator_id, 
  business_type, 
  priority, 
  status, 
  tags
) VALUES 
(
  'Gold Collection Inquiry',
  '2kg 18k Gold Collection Inquiry',
  'inquiry',
  (SELECT id FROM partners LIMIT 1),
  '6d1a08f1-134c-46dd-aa1e-21f95b80bed4',
  'inquiry',
  'high',
  'active',
  ARRAY['gold', 'collection', 'urgent']
),
(
  'Luxury Watch Partnership',
  'Luxury Watch Partnership Discussion',
  'partnership',
  (SELECT id FROM partners LIMIT 1 OFFSET 1),
  '6d1a08f1-134c-46dd-aa1e-21f95b80bed4',
  'support',
  'normal',
  'active',
  ARRAY['watches', 'luxury', 'partnership']
)
ON CONFLICT DO NOTHING;

-- Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'external_conversations'
ORDER BY ordinal_position;
