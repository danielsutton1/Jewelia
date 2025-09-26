
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
import { z } from 'zod';
import { InventoryWithStock } from '@/lib/types/service.types';

const InventoryAlertSchema = z.object({
  tenant_id: z.string().uuid(),
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sku: z.string(),
      name: z.string(),
      quantity_available: z.number(),
      reorder_level: z.number(),
    })
  ),
});

async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant_id, items } = InventoryAlertSchema.parse(body);

    // Trigger low stock notifications (mocked)
    // TODO: Integrate with RealtimeService or notification system
    // TODO: Integrate with external suppliers (mocked)
    const triggered = items.filter(item => item.quantity_available <= item.reorder_level);

    // Simulate external supplier integration
    const supplierResponses = triggered.map(item => ({
      sku: item.sku,
      reorder_triggered: true,
      supplier_order_id: `SUP-${item.sku}-${Date.now()}`,
    }));

    return NextResponse.json({
      message: 'Low stock notifications and reorder triggers processed.',
      triggered,
      supplierResponses,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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
