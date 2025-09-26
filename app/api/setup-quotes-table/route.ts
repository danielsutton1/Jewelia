import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Checking quotes table...');

    // Try to insert a test quote to see if the table exists
    const { data: testData, error: testError } = await supabase
      .from('quotes')
      .select('*')
      .limit(1);

    if (testError && testError.message.includes('relation "public.quotes" does not exist')) {
      console.log('❌ Quotes table does not exist. Please create it manually in your Supabase dashboard.');
      return NextResponse.json({ 
        success: false, 
        error: 'Quotes table does not exist. Please create it manually in your Supabase dashboard.',
        instructions: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to the SQL Editor',
          '3. Run the following SQL:',
          '',
          'CREATE TABLE IF NOT EXISTS quotes (',
          '  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),',
          '  quote_number TEXT UNIQUE NOT NULL,',
          '  customer_name TEXT,',
          '  customer_id UUID,',
          '  total_amount DECIMAL(10,2) NOT NULL,',
          '  status TEXT DEFAULT \'draft\',',
          '  description TEXT,',
          '  valid_until DATE,',
          '  notes TEXT,',
          '  items JSONB DEFAULT \'[]\',',
          '  assignee TEXT,',
          '  sent_at TIMESTAMP WITH TIME ZONE,',
          '  accepted_at TIMESTAMP WITH TIME ZONE,',
          '  declined_at TIMESTAMP WITH TIME ZONE,',
          '  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),',
          '  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
          ');',
          '',
          'ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;',
          '',
          'CREATE POLICY "Users can view quotes" ON quotes FOR SELECT USING (true);',
          'CREATE POLICY "Users can create quotes" ON quotes FOR INSERT WITH CHECK (true);',
          'CREATE POLICY "Users can update quotes" ON quotes FOR UPDATE USING (true);',
          'CREATE POLICY "Users can delete quotes" ON quotes FOR DELETE USING (true);'
        ]
      }, { status: 404 });
    }

    if (testError) {
      console.error('❌ Error testing quotes table:', testError);
      return NextResponse.json({ 
        success: false, 
        error: 'Error testing quotes table',
        details: testError 
      }, { status: 500 });
    }

    console.log('✅ Quotes table exists and is accessible!');
    console.log('📊 Current quotes in table:', testData?.length || 0);

    return NextResponse.json({ 
      success: true, 
      message: 'Quotes table exists and is accessible',
      quoteCount: testData?.length || 0
    });

  } catch (error) {
    console.error('❌ Error in setup quotes table API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 