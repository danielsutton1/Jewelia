
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
const paymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_method: z.enum(["credit_card", "bank_transfer", "cash", "check", "other"]),
  reference_number: z.string().optional(),
  status: z.enum(["pending", "completed", "failed", "refunded"]).default("pending"),
  notes: z.string().optional(),
})

// GET /api/billing/payments
async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const invoiceId = searchParams.get("invoice_id")
  const status = searchParams.get("status")

  let query = supabase.from("billing_payments").select("*")

  if (invoiceId) {
    query = query.eq("invoice_id", invoiceId)
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

// POST /api/billing/payments
async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const validatedData = paymentSchema.parse(body)

    // Insert payment
    const { data, error } = await supabase
      .from("billing_payments")
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If payment is completed, update invoice status
    if (validatedData.status === "completed") {
      const { error: invoiceError } = await supabase
        .from("billing_invoices")
        .update({ status: "paid" })
        .eq("id", validatedData.invoice_id)

      if (invoiceError) {
        return NextResponse.json({ error: invoiceError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/billing/payments
async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = paymentSchema.parse(body)

    // Get current payment status
    const { data: currentPayment, error: fetchError } = await supabase
      .from("billing_payments")
      .select("status, invoice_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Update payment
    const { data, error } = await supabase
      .from("billing_payments")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Handle status changes
    if (
      currentPayment.status !== "completed" &&
      validatedData.status === "completed"
    ) {
      // Update invoice status to paid
      const { error: invoiceError } = await supabase
        .from("billing_invoices")
        .update({ status: "paid" })
        .eq("id", validatedData.invoice_id)

      if (invoiceError) {
        return NextResponse.json({ error: invoiceError.message }, { status: 500 })
      }
    } else if (
      currentPayment.status === "completed" &&
      validatedData.status !== "completed"
    ) {
      // Update invoice status back to sent
      const { error: invoiceError } = await supabase
        .from("billing_invoices")
        .update({ status: "sent" })
        .eq("id", validatedData.invoice_id)

      if (invoiceError) {
        return NextResponse.json({ error: invoiceError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/billing/payments
async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }

  // Get payment details before deletion
  const { data: payment, error: fetchError } = await supabase
    .from("billing_payments")
    .select("status, invoice_id")
    .eq("id", id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  // Delete payment
  const { error } = await supabase.from("billing_payments").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If payment was completed, update invoice status back to sent
  if (payment.status === "completed") {
    const { error: invoiceError } = await supabase
      .from("billing_invoices")
      .update({ status: "sent" })
      .eq("id", payment.invoice_id)

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 500 })
    }
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
