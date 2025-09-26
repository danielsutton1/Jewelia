import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Initialize Stripe only if API key is available
let stripe: Stripe | null = null
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil',
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id } = await params;
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

      // Detach payment method from customer
      const paymentMethod = await stripe.paymentMethods.detach(id)

      return NextResponse.json({
        success: true,
        data: paymentMethod,
        message: 'Payment method removed successfully'
      })

    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError)
      return NextResponse.json(
        { 
          error: 'Failed to remove payment method',
          details: stripeError.message 
        },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Remove payment method error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 