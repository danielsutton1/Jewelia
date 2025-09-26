
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
  const { inventory_item_id, location_id, quantity, user_id } = await req.json()
  if (!inventory_item_id || !location_id || typeof quantity !== 'number' || !user_id) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }
  // Fetch the user's Shopify integration
  const { data: integration, error: integrationError } = await supabaseAdmin
    .from('ecommerce_integrations')
    .select('*')
    .eq('user_id', user_id)
    .eq('platform', 'shopify')
    .maybeSingle()
  if (integrationError || !integration) {
    return NextResponse.json({ success: false, error: 'Shopify integration not found' }, { status: 404 })
  }
  const { api_key, store_url, id: integration_id } = integration
  let status = 'success'
  let details: any = {}
  let shopifyResponse = null
  try {
    const endpoint = `https://${store_url}/admin/api/2023-04/inventory_levels/set.json`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': api_key,
      },
      body: JSON.stringify({
        location_id,
        inventory_item_id,
        available: quantity,
      }),
    })
    const data = await response.json()
    if (!response.ok) {
      status = 'error'
      details = { error: data, inventory_item_id, location_id, quantity }
      throw new Error(data.errors ? JSON.stringify(data.errors) : 'Shopify API error')
    }
    shopifyResponse = data
    details = { inventory_item_id, location_id, quantity, shopifyResponse: data }
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
    return NextResponse.json({ success: false, error: details.error || 'Shopify inventory sync failed' }, { status: 500 })
  }
  return NextResponse.json({ success: true, shopifyResponse })
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
