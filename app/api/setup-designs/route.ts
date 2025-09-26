import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Add design_id column to call_logs table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_logs' AND column_name = 'design_id') THEN
                ALTER TABLE call_logs ADD COLUMN design_id TEXT;
                CREATE INDEX IF NOT EXISTS idx_call_logs_design_id ON call_logs(design_id);
            END IF;
        END $$;
      `
    });

    if (error) {
      console.error('Error setting up designs:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Design setup completed successfully'
    });

  } catch (error) {
    console.error('Error in setup-designs API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 