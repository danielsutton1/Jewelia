
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
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CustomerSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-demo-auth-token')?.value;
    const { data: { user } } = await supabase.auth.getUser(token);
    const tenant_id = user?.user_metadata?.tenant_id;
    if (!tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const customerId = params.id;
    // Fetch customer info
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('tenant_id', tenant_id)
      .single();
    if (customerError || !customer) throw customerError || new Error('Customer not found');
    // Fetch orders summary
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, created_at')
      .eq('customer_id', customerId)
      .eq('tenant_id', tenant_id);
    if (ordersError) throw ordersError;
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const lastOrderDate = orders.length > 0 ? orders.reduce((latest, o) => o.created_at > latest ? o.created_at : latest, orders[0].created_at) : null;
    // Fetch current account balance from accounts_receivable
    const { data: ar, error: arError } = await supabase
      .from('accounts_receivable')
      .select('Balance')
      .eq('customer_id', customerId)
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false })
      .limit(1);
    if (arError) throw arError;
    const currentBalance = ar && ar.length > 0 ? ar[0].Balance : 0;
    return NextResponse.json({
      customer,
      summary: {
        totalOrders,
        totalSpent,
        lastOrderDate,
        currentBalance,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-demo-auth-token')?.value;
    const { data: { user } } = await supabase.auth.getUser(token);
    const tenant_id = user?.user_metadata?.tenant_id;
    if (!tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const parse = CustomerSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('customers')
      .update({ ...parse.data })
      .eq('id', params.id)
      .eq('tenant_id', tenant_id)
      .select();
    if (error) throw error;
    return NextResponse.json(data[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-demo-auth-token')?.value;
    const { data: { user } } = await supabase.auth.getUser(token);
    const tenant_id = user?.user_metadata?.tenant_id;
    if (!tenant_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // Soft delete: set status to 'inactive'
    const { data, error } = await supabase
      .from('customers')
      .update({ status: 'inactive' })
      .eq('id', params.id)
      .eq('tenant_id', tenant_id)
      .select();
    if (error) throw error;
    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
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
