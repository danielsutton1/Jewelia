-- Create designs table
CREATE TABLE IF NOT EXISTS designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  design_id TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_id TEXT,
  designer TEXT NOT NULL,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'revision-requested')),
  quote_status TEXT DEFAULT 'not-started' CHECK (quote_status IN ('not-started', 'in-progress', 'sent', 'accepted', 'rejected')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_value DECIMAL(10,2) DEFAULT 0,
  materials TEXT[] DEFAULT '{}',
  complexity TEXT DEFAULT 'moderate' CHECK (complexity IN ('simple', 'moderate', 'complex', 'expert')),
  client_feedback TEXT,
  revision_notes TEXT,
  next_action TEXT DEFAULT 'Design review',
  assigned_to TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  files TEXT[] DEFAULT '{}',
  notes TEXT,
  call_log_id TEXT,
  source_call_log JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_designs_design_id ON designs(design_id);
CREATE INDEX IF NOT EXISTS idx_designs_client_name ON designs(client_name);
CREATE INDEX IF NOT EXISTS idx_designs_designer ON designs(designer);
CREATE INDEX IF NOT EXISTS idx_designs_approval_status ON designs(approval_status);
CREATE INDEX IF NOT EXISTS idx_designs_priority ON designs(priority);
CREATE INDEX IF NOT EXISTS idx_designs_created_date ON designs(created_date);
CREATE INDEX IF NOT EXISTS idx_designs_call_log_id ON designs(call_log_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_designs_updated_at BEFORE UPDATE ON designs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all designs
CREATE POLICY "Allow authenticated users to read designs" ON designs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert designs
CREATE POLICY "Allow authenticated users to insert designs" ON designs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update designs
CREATE POLICY "Allow authenticated users to update designs" ON designs
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Add design_id column to call_logs table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_logs' AND column_name = 'design_id') THEN
        ALTER TABLE call_logs ADD COLUMN design_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_call_logs_design_id ON call_logs(design_id);
    END IF;
END $$; 