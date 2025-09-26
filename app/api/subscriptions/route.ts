import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { subscriptionService } from '@/lib/services/SubscriptionService'
import { getUserContextFromRequest } from '@/lib/services/UserContextService'
import { z } from 'zod'

const CreateSubscriptionSchema = z.object({
  priceId: z.string(),
  paymentMethodId: z.string().optional(),
  trialPeriodDays: z.number().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const userContext = await getUserContextFromRequest()
    if (!userContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current subscription
    const subscription = await subscriptionService.getUserSubscription(
      userContext.user.id,
      userContext.tenantId
    )

    // Get available plans
    const plans = await subscriptionService.getAvailablePlans()

    return NextResponse.json({
      success: true,
      data: {
        currentSubscription: subscription,
        availablePlans: plans,
      },
    })
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userContext = await getUserContextFromRequest()
    if (!userContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = CreateSubscriptionSchema.parse(body)

    // Create subscription
    const result = await subscriptionService.createSubscription(
      userContext.user.id,
      userContext.tenantId,
      validatedData
    )

    return NextResponse.json({
      success: true,
      data: {
        subscription: result.subscription,
        clientSecret: result.clientSecret,
      },
    })
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
