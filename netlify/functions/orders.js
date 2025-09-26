
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
import { CompleteOrderRequest } from '@/lib/types/order.types';

// Zod schemas for validation
const OrderListQuerySchema = z.object({
  status: z.enum(['pending', 'in_production', 'completed', 'cancelled']).optional(),
  customer_id: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort_by: z.enum(['created_at', 'total_amount', 'expected_delivery']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

const CreateOrderSchema = z.object({
  customer_id: z.string().uuid(),
  items: z.array(z.object({
    inventory_id: z.string().uuid(),
    sku: z.string(),
    quantity: z.number().positive(),
    unit_price: z.number().positive(),
    customization: z.string().optional(),
    serial_number: z.string().optional(),
  })),
  payment_method: z.enum(['CASH', 'CREDIT_CARD', 'CHECK', 'ACCOUNT']),
  special_instructions: z.string().optional(),
  rush_order: z.boolean().optional(),
  expected_delivery: z.string().datetime().optional(),
});

async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get tenant_id from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenant_id = session.user.user_metadata.tenant_id;

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedParams = OrderListQuerySchema.parse(queryParams);

    // Initialize service
    const orderService = new OrderService(supabase, tenant_id);

    // Build filter conditions
    const filters: any = { tenant_id };
    if (validatedParams.status) filters.status = validatedParams.status;
    if (validatedParams.customer_id) filters.customer_id = validatedParams.customer_id;

    // Calculate pagination
    const offset = (validatedParams.page - 1) * validatedParams.limit;

    // Fetch orders with pagination and filters
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(id, full_name, email),
        items:order_items(
          id,
          inventory_id,
          quantity,
          unit_price,
          customization,
          serial_number
        ),
        production_tasks(
          id,
          stage,
          status,
          assigned_to,
          estimated_completion
        )
      `)
      .match(filters)
      .order(validatedParams.sort_by, { ascending: validatedParams.sort_order === 'asc' })
      .range(offset, offset + validatedParams.limit - 1);

    if (error) throw error;

    // Get total count for pagination
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .match(filters);

    return NextResponse.json({
      data: orders,
      meta: {
        total: count,
        page: validatedParams.page,
        limit: validatedParams.limit,
        total_pages: Math.ceil((count || 0) / validatedParams.limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function POST(request: NextRequest) {
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
    const validatedData = CreateOrderSchema.parse(body);

    // Initialize service
    const orderService = new OrderService(supabase, tenant_id);

    // Process the order
    const result = await orderService.processCompleteOrder(validatedData as CompleteOrderRequest);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/orders/[id]
async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const body = await request.json();
    const validated = orderSchema.parse(body);
    const { data, error } = await supabase
      .from("orders")
      .update({ ...validated })
      .eq("id", params.id)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/orders/[id]
async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
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
