
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Parse the request body
  const body = event.body ? JSON.parse(event.body) : {};
  
  // Convert Next.js API route to Netlify function
  try {
    // Extract the handler from the route file
    import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const PAGE_SIZE_DEFAULT = 10;
const SORTABLE_FIELDS = ['orderDate', 'status', 'totalAmount'];

async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const searchParams = request.nextUrl.searchParams;

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const minTotal = parseFloat(searchParams.get('minTotal') || '');
  const maxTotal = parseFloat(searchParams.get('maxTotal') || '');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || String(PAGE_SIZE_DEFAULT), 10);
  const sortKey = SORTABLE_FIELDS.includes(searchParams.get('sortKey') || '') ? searchParams.get('sortKey')! : 'orderDate';
  const sortOrder = (searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';

  let query = supabase.from('dropship_orders').select('*', { count: 'exact' });

  // Filtering
  if (search) {
    query = query.or(`id.ilike.%${search}%,customerName.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (!isNaN(minTotal)) {
    query = query.gte('totalAmount', minTotal);
  }
  if (!isNaN(maxTotal)) {
    query = query.lte('totalAmount', maxTotal);
  }

  // Sorting
  query = query.order(sortKey, { ascending: sortOrder === 'asc' });

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: orders, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  return NextResponse.json({ orders, totalPages });
} 

    // Handle the request based on the HTTP method
    const method = event.httpMethod;
    let response;
    
    switch (method) {
      case 'GET':
        response = await GET({ req: event, supabase });
        break;
      case 'POST':
        response = await POST({ req: event, supabase });
        break;
      case 'PUT':
        response = await PUT({ req: event, supabase });
        break;
      case 'DELETE':
        response = await DELETE({ req: event, supabase });
        break;
      case 'PATCH':
        response = await PATCH({ req: event, supabase });
        break;
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
