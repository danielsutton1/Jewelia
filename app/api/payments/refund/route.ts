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

const RefundPaymentSchema = z.object({
  payment_intent_id: z.string(),
  amount: z.number().positive().optional(), // If not provided, refunds full amount
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
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
    const validatedData = RefundPaymentSchema.parse(body)
    
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

      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: validatedData.payment_intent_id,
        amount: validatedData.amount ? Math.round(validatedData.amount * 100) : undefined,
        reason: validatedData.reason,
        metadata: {
          user_id: user.id,
          tenant_id: tenant_id || '',
          ...validatedData.metadata
        },
      })

      // Update payment record in database
      const { data: paymentRecord, error: dbError } = await supabase
        .from('billing_payments')
        .update({
          refund_id: refund.id,
          refund_amount: validatedData.amount || undefined,
          refund_reason: validatedData.reason,
          refund_status: refund.status,
          updated_at: new Date().toISOString(),
        })
        .eq('payment_intent_id', validatedData.payment_intent_id)
        .select()
        .single()

      if (dbError) {
        console.error('Payment record update error:', dbError)
        // Refund was processed but record update failed - this is a partial success
        return NextResponse.json({
          success: true,
          data: {
            refund: refund,
            message: 'Refund processed but record update failed'
          }
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          refund: refund,
          payment_record: paymentRecord,
          message: 'Refund processed successfully'
        }
      })

    } catch (stripeError: any) {
      console.error('Stripe refund error:', stripeError)
      return NextResponse.json(
        { 
          error: 'Refund processing failed',
          details: stripeError.message 
        },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Process refund error:', error)
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