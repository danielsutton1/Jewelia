
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

async function POST(req: NextRequest) {
  const event = await req.json()
  // Shopify sends a topic header for the event type
  const topic = req.headers.get('x-shopify-topic') || event.topic || ''
  console.log('Shopify Webhook Event:', topic, event)

  if (topic === 'inventory_levels/update' || topic === 'inventory_levels/adjust') {
    // Example: update local inventory for the given item/location
    // const { inventory_item_id, available, location_id } = event;
    // TODO: Update your local inventory DB here
    console.log('Update local inventory for item:', event.inventory_item_id, 'to', event.available)
  } else if (topic === 'products/update') {
    // Example: update local product info
    // const { id, title, variants } = event;
    // TODO: Update your local product DB here
    console.log('Update local product info for product:', event.id)
  } else {
    // Handle other event types as needed
    console.log('Unhandled Shopify webhook topic:', topic)
  }

  return NextResponse.json({ received: true })
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
