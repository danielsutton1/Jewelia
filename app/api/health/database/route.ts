import { NextRequest, NextResponse } from 'next/server';
import { checkSupabaseConnection, withRetry } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed - likely using backup with invalid credentials',
        mode: 'backup',
        fallback: 'mock_data',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    // Test with retry mechanism
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await withRetry(async () => {
      const result = await supabase
        .from('customers')
        .select('count')
        .limit(1);
      return result;
    });

    if (error) {
      console.error('Database query failed:', error);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      data: {
        connection: 'healthy',
        query: 'successful'
      }
    });

  } catch (error) {
    console.error('Database health check failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Database health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
