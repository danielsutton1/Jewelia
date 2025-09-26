import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Test basic connection
    const { data, error } = await supabase
      .from('customers')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection working',
      data 
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
} 