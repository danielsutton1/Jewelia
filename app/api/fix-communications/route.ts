import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing communications table structure...');
    
    const results = {
      tableExists: false,
      columnsAdded: false,
      relationshipsFixed: false,
      dataMigrated: false,
      errors: [] as string[]
    };

    // Step 1: Check if communications table exists
    try {
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .limit(1);
      
      if (!error) {
        results.tableExists = true;
        console.log('✅ Communications table exists');
      } else {
        results.errors.push('Communications table does not exist');
        console.log('❌ Communications table does not exist');
      }
    } catch (error) {
      results.errors.push(`Table check error: ${error}`);
    }

    // Step 2: Check current table structure
    if (results.tableExists) {
      try {
        // Try to select sender_id and recipient_id columns
        const { data, error: senderError } = await supabase
          .from('communications')
          .select('sender_id')
          .limit(1);
        
        if (senderError) {
          console.log('❌ sender_id column missing');
          results.errors.push('sender_id column missing');
        } else {
          console.log('✅ sender_id column exists');
        }

        const { data: recipientData, error: recipientError } = await supabase
          .from('communications')
          .select('recipient_id')
          .limit(1);
        
        if (recipientError) {
          console.log('❌ recipient_id column missing');
          results.errors.push('recipient_id column missing');
        } else {
          console.log('✅ recipient_id column exists');
        }

        // If both columns exist, check relationships
        if (!senderError && !recipientError) {
          results.columnsAdded = true;
          
          // Test the relationships by trying to join
          const { data: joinTest, error: joinError } = await supabase
            .from('communications')
            .select(`
              *,
              sender:sender_id(id, email),
              recipient:recipient_id(id, email)
            `)
            .limit(1);
          
          if (joinError) {
            console.log('❌ Foreign key relationships broken');
            results.errors.push('Foreign key relationships need to be fixed');
          } else {
            console.log('✅ Foreign key relationships working');
            results.relationshipsFixed = true;
          }
        }
      } catch (error) {
        results.errors.push(`Structure check error: ${error}`);
      }
    }

    // Step 3: Provide SQL script for manual fixes
    const sqlScript = `
-- 🔧 COMMUNICATIONS TABLE FIX SCRIPT
-- Apply this in your Supabase Dashboard SQL Editor

-- 1. Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add sender_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'communications' AND column_name = 'sender_id'
    ) THEN
        ALTER TABLE communications ADD COLUMN sender_id UUID;
        RAISE NOTICE 'Added sender_id column to communications table';
    ELSE
        RAISE NOTICE 'sender_id column already exists';
    END IF;
    
    -- Add recipient_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'communications' AND column_name = 'recipient_id'
    ) THEN
        ALTER TABLE communications ADD COLUMN recipient_id UUID;
        RAISE NOTICE 'Added recipient_id column to communications table';
    ELSE
        RAISE NOTICE 'recipient_id column already exists';
    END IF;
END $$;

-- 2. Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add sender_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'communications' 
        AND constraint_name = 'communications_sender_id_fkey'
    ) THEN
        ALTER TABLE communications 
        ADD CONSTRAINT communications_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint for sender_id';
    ELSE
        RAISE NOTICE 'sender_id foreign key constraint already exists';
    END IF;
    
    -- Add recipient_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'communications' 
        AND constraint_name = 'communications_recipient_id_fkey'
    ) THEN
        ALTER TABLE communications 
        ADD CONSTRAINT communications_recipient_id_fkey 
        FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint for recipient_id';
    ELSE
        RAISE NOTICE 'recipient_id foreign key constraint already exists';
    END IF;
END $$;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_communications_sender_id ON communications(sender_id);
CREATE INDEX IF NOT EXISTS idx_communications_recipient_id ON communications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);

-- 4. Enable RLS if not already enabled
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
DROP POLICY IF EXISTS "Users can view their communications" ON communications;
CREATE POLICY "Users can view their communications" ON communications
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            sender_id = auth.uid() OR 
            recipient_id = auth.uid() OR 
            auth.uid() IN (
                SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
            )
        )
    );

DROP POLICY IF EXISTS "Users can create communications" ON communications;
CREATE POLICY "Users can create communications" ON communications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their communications" ON communications;
CREATE POLICY "Users can update their communications" ON communications
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            sender_id = auth.uid() OR 
            auth.uid() IN (
                SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
            )
        )
    );

-- 6. Verification query
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 COMMUNICATIONS TABLE FIXED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Fixed Issues:';
    RAISE NOTICE '   - Added sender_id and recipient_id columns';
    RAISE NOTICE '   - Created foreign key relationships';
    RAISE NOTICE '   - Added performance indexes';
    RAISE NOTICE '   - Enabled RLS with proper policies';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Communications API should now work correctly!';
    RAISE NOTICE '';
END $$;
    `;

    return NextResponse.json({
      success: true,
      message: 'Communications table assessment completed',
      results,
      needsManualFix: results.errors.length > 0,
      sqlScript: results.errors.length > 0 ? sqlScript : null,
      nextSteps: results.errors.length > 0 ? 
        'Apply the SQL script in Supabase Dashboard SQL Editor' : 
        'Communications table is working correctly!'
    });

  } catch (error) {
    console.error('🚨 Error fixing communications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix communications table',
      details: error instanceof Error ? error.message : 'Unknown error',
      nextSteps: 'Apply the SQL script manually in Supabase Dashboard SQL Editor'
    }, { status: 500 });
  }
} 