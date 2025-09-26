import { NextRequest, NextResponse } from 'next/server'
import { subscriptionService } from '@/lib/services/SubscriptionService'
import { getUserContextFromRequest } from '@/lib/services/UserContextService'
import { z } from 'zod'

const UpdateSubscriptionSchema = z.object({
  priceId: z.string().optional(),
  quantity: z.number().optional(),
  prorationBehavior: z.enum(['create_prorations', 'none', 'always_invoice']).optional(),
})

const CancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userContext = await getUserContextFromRequest()
    if (!userContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get subscription
    const subscription = await subscriptionService.getSubscription(id, userContext.tenantId)

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: subscription,
    })
  } catch (error: any) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userContext = await getUserContextFromRequest()
    if (!userContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = UpdateSubscriptionSchema.parse(body)

    // Update subscription
    const subscription = await subscriptionService.updateSubscription(
      {
        subscriptionId: id,
        ...validatedData,
      },
      userContext.tenantId
    )

    return NextResponse.json({
      success: true,
      data: subscription,
    })
  } catch (error: any) {
    console.error('Error updating subscription:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userContext = await getUserContextFromRequest()
    if (!userContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = CancelSubscriptionSchema.parse(body)

    // Cancel subscription
    const subscription = await subscriptionService.cancelSubscription(
      {
        subscriptionId: id,
        ...validatedData,
      },
      userContext.tenantId
    )

    return NextResponse.json({
      success: true,
      data: subscription,
      message: validatedData.cancelAtPeriodEnd 
        ? 'Subscription will be cancelled at the end of the current period'
        : 'Subscription cancelled immediately',
    })
  } catch (error: any) {
    console.error('Error cancelling subscription:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
