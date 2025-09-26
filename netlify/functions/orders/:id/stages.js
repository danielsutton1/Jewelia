
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
import { OrderStageUpdate } from '@/lib/types/order.types';

// Zod schemas for validation
const UpdateStageSchema = z.object({
  current_stage: z.string(),
  next_stage: z.string(),
  updated_by: z.string().uuid(),
  notes: z.string().optional(),
  estimated_completion: z.string().datetime().optional(),
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

    // Fetch production timeline
    const { data: timeline, error } = await supabase
      .from('production_tasks')
      .select(`
        id,
        stage,
        status,
        estimated_start,
        estimated_completion,
        completed_at,
        assigned_to,
        employee:employees(
          id,
          full_name,
          specialization
        ),
        notes
      `)
      .eq('order_id', params.id)
      .eq('tenant_id', tenant_id)
      .order('estimated_start', { ascending: true });

    if (error) throw error;

    // Get current stage
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('production_status')
      .eq('id', params.id)
      .eq('tenant_id', tenant_id)
      .single();

    if (orderError) throw orderError;

    return NextResponse.json({
      data: {
        current_stage: order.production_status,
        timeline,
      },
    });
  } catch (error: any) {
    console.error('Error fetching production timeline:', error);
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
    const validatedData = UpdateStageSchema.parse(body);

    // Initialize service
    const orderService = new OrderService(supabase, tenant_id);

    // Update production stage
    const result = await orderService.updateOrderStage({
      order_id: params.id,
      ...validatedData,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error: any) {
    console.error('Error updating production stage:', error);
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
