import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Adding budget field to quotes table...');

    // First, let's check if the budget field already exists
    const { data: existingQuotes, error: checkError } = await supabase
      .from('quotes')
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking quotes table:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check quotes table structure'
      }, { status: 500 });
    }

    console.log('✅ Quotes table structure:', Object.keys(existingQuotes[0] || {}));

    // For now, let's update the quotes API to handle the budget field
    // The actual database schema change will need to be done manually in Supabase dashboard
    
    return NextResponse.json({
      success: true,
      message: 'Please add the budget field manually in Supabase dashboard',
      instructions: [
        '1. Go to Supabase Dashboard',
        '2. Navigate to Table Editor',
        '3. Select the "quotes" table',
        '4. Add a new column called "budget" with type DECIMAL(10,2)',
        '5. Set default value to 0.00',
        '6. Make it NOT NULL'
      ],
      currentColumns: Object.keys(existingQuotes[0] || {})
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 