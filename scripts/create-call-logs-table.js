const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCallLogsTable() {
  try {
    console.log('Creating call_logs table...');
    
    const { error } = await supabase.rpc('exec_sql', {
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

    if (error) {
      console.error('Error creating table:', error);
      return;
    }

    console.log('call_logs table created successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

createCallLogsTable(); 