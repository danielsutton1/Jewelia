
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
    import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"

// Validation schemas
const billingRateSchema = z.object({
  resource_type_id: z.number(),
  rate_type: z.enum(["hourly", "daily", "fixed"]),
  amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  effective_from: z.string().datetime().optional(),
  effective_to: z.string().datetime().optional(),
})

const invoiceItemSchema = z.object({
  work_order_id: z.string().uuid(),
  resource_id: z.string().uuid(),
  description: z.string(),
  quantity: z.number().positive(),
  unit_price: z.number().positive(),
  amount: z.number().positive(),
})

const invoiceSchema = z.object({
  customer_id: z.string().uuid(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).default("draft"),
  subtotal: z.number().positive(),
  tax_rate: z.number().min(0).max(100).default(0),
  tax_amount: z.number().min(0).default(0),
  total_amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  due_date: z.string().datetime(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema),
})

const paymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_method: z.string(),
  reference_number: z.string().optional(),
  status: z.enum(["pending", "completed", "failed", "refunded"]).default("pending"),
  notes: z.string().optional(),
})

// GET /api/billing/rates
async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const resourceTypeId = searchParams.get("resource_type_id")

  let query = supabase.from("billing_rates").select("*")
  if (resourceTypeId) {
    query = query.eq("resource_type_id", resourceTypeId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

// POST /api/billing/rates
async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const validatedData = billingRateSchema.parse(body)

    const { data, error } = await supabase
      .from("billing_rates")
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/billing/rates
async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = billingRateSchema.parse(body)

    const { data, error } = await supabase
      .from("billing_rates")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/billing/rates
async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }

  const { error } = await supabase.from("billing_rates").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
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
