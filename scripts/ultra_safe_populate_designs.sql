-- Ultra Safe, Non-Destructive script to populate designs table
-- This script contains ZERO destructive operations

-- 1. Create the designs table if it doesn't exist (safe)
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

-- 2. Create indexes if they don't exist (safe)
CREATE INDEX IF NOT EXISTS idx_designs_design_id ON designs(design_id);
CREATE INDEX IF NOT EXISTS idx_designs_client_name ON designs(client_name);
CREATE INDEX IF NOT EXISTS idx_designs_designer ON designs(designer);
CREATE INDEX IF NOT EXISTS idx_designs_approval_status ON designs(approval_status);
CREATE INDEX IF NOT EXISTS idx_designs_priority ON designs(priority);
CREATE INDEX IF NOT EXISTS idx_designs_created_date ON designs(created_date);
CREATE INDEX IF NOT EXISTS idx_designs_call_log_id ON designs(call_log_id);

-- 3. Temporarily disable RLS to allow data insertion (safe)
ALTER TABLE designs DISABLE ROW LEVEL SECURITY;

-- 4. Check if table is empty and only insert if it is (safe)
DO $$
DECLARE
    record_count INTEGER;
BEGIN
    -- Count existing records
    SELECT COUNT(*) INTO record_count FROM designs;
    
    -- Only insert if table is empty
    IF record_count = 0 THEN
        INSERT INTO designs (design_id, client_name, designer, quote_status, priority, estimated_value) VALUES
        ('DS-2025-test1', 'Test Client 1', 'Test Designer', 'not-started', 'medium', 1000.00),
        ('DS-2025-test2', 'Test Client 2', 'Test Designer', 'in-progress', 'high', 2500.00),
        ('DS-2025-test3', 'Test Client 3', 'Test Designer', 'completed', 'low', 500.00);
        
        RAISE NOTICE 'Inserted 3 test designs into empty table';
    ELSE
        RAISE NOTICE 'Table already has % records, skipping insertion', record_count;
    END IF;
END $$;

-- 5. Re-enable RLS
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

-- 6. Create permissive policies only if they don't exist (safe)
DO $$
BEGIN
    -- Check if the policy exists before creating it
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'designs' 
        AND policyname = 'Allow all operations on designs'
    ) THEN
        CREATE POLICY "Allow all operations on designs" ON designs
            FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'Created permissive policy for designs table';
    ELSE
        RAISE NOTICE 'Permissive policy already exists, skipping creation';
    END IF;
END $$;

-- 7. Verify the data (read-only operation)
SELECT design_id, client_name, designer, quote_status FROM designs ORDER BY created_at DESC; 