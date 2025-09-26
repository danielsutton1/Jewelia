import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import Stripe from 'stripe'

// Initialize Stripe only if API key is available
let stripe: Stripe | null = null
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil',
  })
}

const AddPaymentMethodSchema = z.object({
  payment_method_id: z.string(),
  customer_id: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const customer_id = searchParams.get('customer_id')

    if (!customer_id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    try {
      // Check if Stripe is configured
      if (!stripe) {
        return NextResponse.json(
          { error: 'Payment service not configured' },
          { status: 503 }
        )
      }

      // Get payment methods from Stripe
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customer_id,
        type: 'card',
      })

      return NextResponse.json({
        success: true,
        data: paymentMethods.data
      })

    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError)
      return NextResponse.json(
        { 
          error: 'Failed to fetch payment methods',
          details: stripeError.message 
        },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Get payment methods error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate input
    const validatedData = AddPaymentMethodSchema.parse(body)
    
    if (!validatedData.customer_id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    try {
      // Check if Stripe is configured
      if (!stripe) {
        return NextResponse.json(
          { error: 'Payment service not configured' },
          { status: 503 }
        )
      }

      // Attach payment method to customer
      const paymentMethod = await stripe.paymentMethods.attach(
        validatedData.payment_method_id,
        {
          customer: validatedData.customer_id,
        }
      )

      return NextResponse.json({
        success: true,
        data: paymentMethod,
        message: 'Payment method added successfully'
      })

    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError)
      return NextResponse.json(
        { 
          error: 'Failed to add payment method',
          details: stripeError.message 
        },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Add payment method error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 