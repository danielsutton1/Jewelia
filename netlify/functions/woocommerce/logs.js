
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
    import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const user_id = searchParams.get('user_id')
  const store_url = searchParams.get('store_url')
  if (!user_id) {
    return NextResponse.json({ success: false, error: 'Missing user_id' }, { status: 400 })
  }
  // Fetch the user's WooCommerce integration
  const { data: integration, error: integrationError } = await supabaseAdmin
    .from('ecommerce_integrations')
    .select('id')
    .eq('user_id', user_id)
    .eq('platform', 'woocommerce')
    .maybeSingle()
  if (integrationError || !integration) {
    return NextResponse.json({ success: false, error: 'WooCommerce integration not found' }, { status: 404 })
  }
  // Fetch logs for this integration
  const { data: logs, error: logsError } = await supabaseAdmin
    .from('ecommerce_sync_logs')
    .select('*')
    .eq('integration_id', integration.id)
    .order('created_at', { ascending: false })
    .limit(50)
  if (logsError) {
    return NextResponse.json({ success: false, error: logsError.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, logs })
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
