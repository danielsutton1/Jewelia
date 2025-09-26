
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

// GET /api/billing/invoices
async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get("customer_id")
  const status = searchParams.get("status")

  let query = supabase
    .from("billing_invoices")
    .select(`
      *,
      items:billing_invoice_items(*)
    `)

  if (customerId) {
    query = query.eq("customer_id", customerId)
  }
  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

// POST /api/billing/invoices
async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const validatedData = invoiceSchema.parse(body)

    // Start a transaction
    const { data: invoice, error: invoiceError } = await supabase
      .from("billing_invoices")
      .insert({
        customer_id: validatedData.customer_id,
        status: validatedData.status,
        subtotal: validatedData.subtotal,
        tax_rate: validatedData.tax_rate,
        tax_amount: validatedData.tax_amount,
        total_amount: validatedData.total_amount,
        currency: validatedData.currency,
        due_date: validatedData.due_date,
        notes: validatedData.notes,
      })
      .select()
      .single()

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 500 })
    }

    // Insert invoice items
    const items = validatedData.items.map((item) => ({
      ...item,
      invoice_id: invoice.id,
    }))

    const { error: itemsError } = await supabase
      .from("billing_invoice_items")
      .insert(items)

    if (itemsError) {
      // Rollback invoice creation if items fail
      await supabase.from("billing_invoices").delete().eq("id", invoice.id)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // Fetch the complete invoice with items
    const { data: completeInvoice, error: fetchError } = await supabase
      .from("billing_invoices")
      .select(`
        *,
        items:billing_invoice_items(*)
      `)
      .eq("id", invoice.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: completeInvoice })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/billing/invoices
async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = invoiceSchema.parse(body)

    // Update invoice
    const { error: invoiceError } = await supabase
      .from("billing_invoices")
      .update({
        customer_id: validatedData.customer_id,
        status: validatedData.status,
        subtotal: validatedData.subtotal,
        tax_rate: validatedData.tax_rate,
        tax_amount: validatedData.tax_amount,
        total_amount: validatedData.total_amount,
        currency: validatedData.currency,
        due_date: validatedData.due_date,
        notes: validatedData.notes,
      })
      .eq("id", id)

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 500 })
    }

    // Delete existing items
    const { error: deleteError } = await supabase
      .from("billing_invoice_items")
      .delete()
      .eq("invoice_id", id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Insert new items
    const items = validatedData.items.map((item) => ({
      ...item,
      invoice_id: id,
    }))

    const { error: itemsError } = await supabase
      .from("billing_invoice_items")
      .insert(items)

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // Fetch the complete invoice with items
    const { data: completeInvoice, error: fetchError } = await supabase
      .from("billing_invoices")
      .select(`
        *,
        items:billing_invoice_items(*)
      `)
      .eq("id", id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: completeInvoice })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/billing/invoices
async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }

  // Delete invoice (cascade will handle items)
  const { error } = await supabase.from("billing_invoices").delete().eq("id", id)

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
