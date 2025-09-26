
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

async function POST(req: NextRequest) {
  const { woocommerceProductId, quantity, user_id } = await req.json()
  if (!woocommerceProductId || typeof quantity !== 'number' || !user_id) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }
  // Fetch the user's WooCommerce integration
  const { data: integration, error: integrationError } = await supabaseAdmin
    .from('ecommerce_integrations')
    .select('*')
    .eq('user_id', user_id)
    .eq('platform', 'woocommerce')
    .maybeSingle()
  if (integrationError || !integration) {
    return NextResponse.json({ success: false, error: 'WooCommerce integration not found' }, { status: 404 })
  }
  const { consumer_key, consumer_secret, store_url, id: integration_id } = integration
  let status = 'success'
  let details: any = {}
  let woocommerceResponse = null
  try {
    const endpoint = `https://${store_url}/wp-json/wc/v3/products/${woocommerceProductId}?consumer_key=${encodeURIComponent(consumer_key)}&consumer_secret=${encodeURIComponent(consumer_secret)}`
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stock_quantity: quantity }),
    })
    const data = await response.json()
    if (!response.ok) {
      status = 'error'
      details = { error: data, woocommerceProductId, quantity }
      throw new Error(data.message ? data.message : 'WooCommerce API error')
    }
    woocommerceResponse = data
    details = { woocommerceProductId, quantity, woocommerceResponse: data }
  } catch (err: any) {
    status = 'error'
    details = { ...details, error: err.message || 'Unknown error' }
  }
  // Log the sync action
  await supabaseAdmin.from('ecommerce_sync_logs').insert([
    {
      integration_id,
      action: 'sync-inventory',
      status,
      details,
    },
  ])
  if (status === 'error') {
    return NextResponse.json({ success: false, error: details.error || 'WooCommerce inventory sync failed' }, { status: 500 })
  }
  return NextResponse.json({ success: true, woocommerceResponse })
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
