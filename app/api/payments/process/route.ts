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

const ProcessPaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('usd'),
  payment_method_id: z.string().optional(),
  customer_id: z.string().optional(),
  order_id: z.string().uuid().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
})

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
    const validatedData = ProcessPaymentSchema.parse(body)
    
    // Get user profile for tenant_id
    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    const tenant_id = userProfile?.tenant_id

    try {
      // Check if Stripe is configured
      if (!stripe) {
        return NextResponse.json(
          { error: 'Payment service not configured' },
          { status: 503 }
        )
      }

      let paymentIntent: Stripe.PaymentIntent

      if (validatedData.payment_method_id) {
        // Create payment intent with payment method
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(validatedData.amount * 100), // Convert to cents
          currency: validatedData.currency,
          payment_method: validatedData.payment_method_id,
          confirm: true,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/confirm`,
          metadata: {
            user_id: user.id,
            tenant_id: tenant_id || '',
            order_id: validatedData.order_id || '',
            ...validatedData.metadata
          },
          description: validatedData.description,
        })
      } else {
        // Create payment intent without payment method (for later confirmation)
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(validatedData.amount * 100), // Convert to cents
          currency: validatedData.currency,
          customer: validatedData.customer_id,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/confirm`,
          metadata: {
            user_id: user.id,
            tenant_id: tenant_id || '',
            order_id: validatedData.order_id || '',
            ...validatedData.metadata
          },
          description: validatedData.description,
        })
      }

      // Store payment record in database
      const { data: paymentRecord, error: dbError } = await supabase
        .from('billing_payments')
        .insert([{
          payment_intent_id: paymentIntent.id,
          amount: validatedData.amount,
          currency: validatedData.currency,
          status: paymentIntent.status,
          payment_method_id: validatedData.payment_method_id,
          customer_id: validatedData.customer_id,
          order_id: validatedData.order_id,
          user_id: user.id,
          tenant_id: tenant_id,
          metadata: validatedData.metadata,
          description: validatedData.description,
        }])
        .select()
        .single()

      if (dbError) {
        console.error('Payment record creation error:', dbError)
        // Payment was processed but record failed - this is a partial success
        return NextResponse.json({
          success: true,
          data: {
            payment_intent: paymentIntent,
            message: 'Payment processed but record creation failed'
          }
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          payment_intent: paymentIntent,
          payment_record: paymentRecord,
          message: 'Payment processed successfully'
        }
      })

    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError)
      return NextResponse.json(
        { 
          error: 'Payment processing failed',
          details: stripeError.message 
        },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Process payment error:', error)
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