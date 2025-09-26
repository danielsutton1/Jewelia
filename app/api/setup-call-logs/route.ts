import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up call_logs table...');
    
    // Create the call_logs table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS call_logs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          customer_name VARCHAR(255),
          customer_id UUID REFERENCES customers(id),
          staff_name VARCHAR(255),
          staff_id UUID REFERENCES users(id),
          call_type VARCHAR(50),
          duration VARCHAR(100),
          outcome VARCHAR(100),
          notes TEXT,
          summary TEXT,
          follow_up_date TIMESTAMP WITH TIME ZONE,
          status VARCHAR(50) DEFAULT 'completed',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (createTableError) {
      console.error('Error creating table:', createTableError);
      return NextResponse.json({ success: false, error: createTableError.message }, { status: 500 });
    }

    // Create the trigger for updating timestamps
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_call_logs_updated_at') THEN
            CREATE TRIGGER update_call_logs_updated_at
              BEFORE UPDATE ON call_logs
              FOR EACH ROW
              EXECUTE FUNCTION update_updated_at_column();
          END IF;
        END $$;
      `
    });

    if (triggerError) {
      console.error('Error creating trigger:', triggerError);
      // Don't fail if trigger creation fails, table is more important
    }

    console.log('call_logs table setup completed successfully!');
    return NextResponse.json({ success: true, message: 'call_logs table created successfully' });
  } catch (error) {
    console.error('Error in setup:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 