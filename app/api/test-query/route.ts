import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchParam = searchParams.get('search');
    const search = Array.isArray(searchParam) ? searchParam[0] : searchParam || 'Sophia Chen';
    
    console.log('Testing query with search:', search);
    
    // Test the exact query from customers API
    let query = supabase.from('customers').select('*');
    if (search) {
      query = query.or(`"Full Name".ilike.%${search}%,"Email Address".ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data, count: data?.length });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 