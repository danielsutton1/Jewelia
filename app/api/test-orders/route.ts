import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('Testing orders table...');
    
    // Try to select from orders table
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Orders table error:', error);
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 });
    }
    
    // Get column names from the first row
    const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
    
    return NextResponse.json({ 
      success: true,
      message: 'Orders table exists',
      columns,
      sampleData: data[0],
      totalRows: data?.length || 0
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
} 