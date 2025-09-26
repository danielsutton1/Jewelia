
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
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OrderService from '@/lib/services/OrderService';
import { OrderCancellation } from '@/lib/types/order.types';

// Zod schemas for validation
const UpdateOrderSchema = z.object({
  special_instructions: z.string().optional(),
  expected_delivery: z.string().datetime().optional(),
  rush_order: z.boolean().optional(),
});

const CancelOrderSchema = z.object({
  reason: z.string().min(1),
  cancelled_by: z.string().uuid(),
  refund_required: z.boolean(),
  refund_amount: z.number().positive().optional(),
});

async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get tenant_id from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenant_id = session.user.user_metadata.tenant_id;

    // Initialize service
    const orderService = new OrderService(supabase, tenant_id);

    // Fetch order with all related data
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(
          id,
          full_name,
          email,
          phone,
          spending_tier,
          payment_terms
        ),
        items:order_items(
          id,
          inventory_id,
          sku,
          quantity,
          unit_price,
          customization,
          serial_number,
          inventory:inventory(
            id,
            name,
            category,
            price
          )
        ),
        production_tasks(
          id,
          stage,
          status,
          assigned_to,
          estimated_start,
          estimated_completion,
          completed_at,
          employee:employees(
            id,
            full_name,
            specialization
          )
        ),
        accounts_receivable(
          id,
          amount,
          due_date,
          status
        )
      `)
      .eq('id', params.id)
      .eq('tenant_id', tenant_id)
      .single();

    if (error) throw error;
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ data: order });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get tenant_id from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenant_id = session.user.user_metadata.tenant_id;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = UpdateOrderSchema.parse(body);

    // Initialize service
    const orderService = new OrderService(supabase, tenant_id);

    // Update order
    const { data: order, error } = await supabase
      .from('orders')
      .update(validatedData)
      .eq('id', params.id)
      .eq('tenant_id', tenant_id)
      .select()
      .single();

    if (error) throw error;
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ data: order });
  } catch (error: any) {
    console.error('Error updating order:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get tenant_id from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenant_id = session.user.user_metadata.tenant_id;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CancelOrderSchema.parse(body);

    // Initialize service
    const orderService = new OrderService(supabase, tenant_id);

    // Cancel order
    const result = await orderService.handleOrderCancellation({
      order_id: params.id,
      ...validatedData,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
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
