import { createSupabaseServerClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { z } from 'zod'

// Lazy initialize Stripe to avoid build-time errors
let stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
  }
  return stripe
}

// Validation schemas
const CreateSubscriptionSchema = z.object({
  priceId: z.string(),
  customerId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  trialPeriodDays: z.number().optional(),
})

const UpdateSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  priceId: z.string().optional(),
  quantity: z.number().optional(),
  prorationBehavior: z.enum(['create_prorations', 'none', 'always_invoice']).optional(),
})

const CancelSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  cancelAtPeriodEnd: z.boolean().default(true),
})

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  limits: {
    products: number
    users: number
    storage: number
    apiCalls: number
  }
  stripePriceId: string
}

export interface Subscription {
  id: string
  tenant_id: string
  customer_id: string
  status: string
  plan_id: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export class SubscriptionService {
  private supabase: any

  constructor() {
    this.supabase = createSupabaseServerClient()
  }

  // =====================================================
  // SUBSCRIPTION PLANS
  // =====================================================

  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    try {
      // Get prices from Stripe
      const prices = await getStripe().prices.list({
        active: true,
        expand: ['data.product'],
      })

      const plans: SubscriptionPlan[] = prices.data.map((price) => {
        const product = price.product as Stripe.Product
        const metadata = product.metadata

        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: price.unit_amount! / 100,
          currency: price.currency,
          interval: price.recurring?.interval as 'month' | 'year',
          features: metadata.features ? JSON.parse(metadata.features) : [],
          limits: {
            products: parseInt(metadata.products_limit || '0'),
            users: parseInt(metadata.users_limit || '0'),
            storage: parseInt(metadata.storage_limit || '0'),
            apiCalls: parseInt(metadata.api_calls_limit || '0'),
          },
          stripePriceId: price.id,
        }
      })

      return plans
    } catch (error) {
      console.error('Error fetching subscription plans:', error)
      throw new Error('Failed to fetch subscription plans')
    }
  }

  // =====================================================
  // CUSTOMER MANAGEMENT
  // =====================================================

  async createOrGetCustomer(userId: string, tenantId: string, email: string): Promise<string> {
    try {
      // Check if customer already exists
      const { data: user } = await this.supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', userId)
        .eq('tenant_id', tenantId)
        .single()

      if (user?.stripe_customer_id) {
        return user.stripe_customer_id
      }

      // Create new Stripe customer
      const customer = await getStripe().customers.create({
        email,
        metadata: {
          user_id: userId,
          tenant_id: tenantId,
        },
      })

      // Update user record with customer ID
      await this.supabase
        .from('users')
        .update({
          stripe_customer_id: customer.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .eq('tenant_id', tenantId)

      return customer.id
    } catch (error) {
      console.error('Error creating/getting customer:', error)
      throw new Error('Failed to create customer')
    }
  }

  // =====================================================
  // SUBSCRIPTION MANAGEMENT
  // =====================================================

  async createSubscription(
    userId: string,
    tenantId: string,
    subscriptionData: z.infer<typeof CreateSubscriptionSchema>
  ): Promise<{ subscription: Stripe.Subscription; clientSecret?: string }> {
    try {
      const validatedData = CreateSubscriptionSchema.parse(subscriptionData)

      // Get user email for customer creation
      const { data: user } = await this.supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .eq('tenant_id', tenantId)
        .single()

      if (!user) {
        throw new Error('User not found')
      }

      // Create or get customer
      const customerId = await this.createOrGetCustomer(userId, tenantId, user.email)

      // Create subscription
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: validatedData.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          user_id: userId,
          tenant_id: tenantId,
        },
      }

      if (validatedData.trialPeriodDays) {
        subscriptionParams.trial_period_days = validatedData.trialPeriodDays
      }

      const subscription = await getStripe().subscriptions.create(subscriptionParams)

      // Store subscription in database
      await this.supabase
        .from('subscriptions')
        .insert({
          id: subscription.id,
          tenant_id: tenantId,
          customer_id: customerId,
          status: subscription.status,
          plan_id: validatedData.priceId,
          current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      const clientSecret = (subscription.latest_invoice as any)?.payment_intent
        ? ((subscription.latest_invoice as any).payment_intent as Stripe.PaymentIntent).client_secret || undefined
        : undefined

      return { subscription, clientSecret }
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw new Error('Failed to create subscription')
    }
  }

  async getSubscription(subscriptionId: string, tenantId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .eq('tenant_id', tenantId)
        .single()

      if (error || !data) {
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching subscription:', error)
      return null
    }
  }

  async getUserSubscription(userId: string, tenantId: string): Promise<Subscription | null> {
    try {
      // Get user's customer ID
      const { data: user } = await this.supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', userId)
        .eq('tenant_id', tenantId)
        .single()

      if (!user?.stripe_customer_id) {
        return null
      }

      // Get active subscription
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('customer_id', user.stripe_customer_id)
        .eq('tenant_id', tenantId)
        .in('status', ['active', 'trialing', 'past_due'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }
  }

  async updateSubscription(
    subscriptionData: z.infer<typeof UpdateSubscriptionSchema>,
    tenantId: string
  ): Promise<Stripe.Subscription> {
    try {
      const validatedData = UpdateSubscriptionSchema.parse(subscriptionData)

      // Update subscription in Stripe
      const subscription = await getStripe().subscriptions.update(validatedData.subscriptionId, {
        items: validatedData.priceId ? [{ price: validatedData.priceId, quantity: validatedData.quantity }] : undefined,
        proration_behavior: validatedData.prorationBehavior,
      })

      // Update subscription in database
      await this.supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          plan_id: validatedData.priceId || undefined,
          current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', validatedData.subscriptionId)
        .eq('tenant_id', tenantId)

      return subscription
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw new Error('Failed to update subscription')
    }
  }

  async cancelSubscription(
    subscriptionData: z.infer<typeof CancelSubscriptionSchema>,
    tenantId: string
  ): Promise<Stripe.Subscription> {
    try {
      const validatedData = CancelSubscriptionSchema.parse(subscriptionData)

      // Cancel subscription in Stripe
      const subscription = await getStripe().subscriptions.update(validatedData.subscriptionId, {
        cancel_at_period_end: validatedData.cancelAtPeriodEnd,
      })

      // Update subscription in database
      await this.supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          cancel_at_period_end: validatedData.cancelAtPeriodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validatedData.subscriptionId)
        .eq('tenant_id', tenantId)

      return subscription
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      throw new Error('Failed to cancel subscription')
    }
  }

  // =====================================================
  // PAYMENT METHODS
  // =====================================================

  async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await getStripe().paymentMethods.list({
        customer: customerId,
        type: 'card',
      })

      return paymentMethods.data
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      throw new Error('Failed to fetch payment methods')
    }
  }

  async addPaymentMethod(customerId: string, paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await getStripe().paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      })

      return paymentMethod
    } catch (error) {
      console.error('Error adding payment method:', error)
      throw new Error('Failed to add payment method')
    }
  }

  async removePaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await getStripe().paymentMethods.detach(paymentMethodId)
      return paymentMethod
    } catch (error) {
      console.error('Error removing payment method:', error)
      throw new Error('Failed to remove payment method')
    }
  }

  // =====================================================
  // INVOICES
  // =====================================================

  async getInvoices(customerId: string, limit: number = 10): Promise<Stripe.Invoice[]> {
    try {
      const invoices = await getStripe().invoices.list({
        customer: customerId,
        limit,
      })

      return invoices.data
    } catch (error) {
      console.error('Error fetching invoices:', error)
      throw new Error('Failed to fetch invoices')
    }
  }

  async getUpcomingInvoice(customerId: string): Promise<Stripe.Invoice | null> {
    try {
      const invoice = await (getStripe().invoices as any).retrieveUpcoming({
        customer: customerId,
      })

      return invoice
    } catch (error) {
      console.error('Error fetching upcoming invoice:', error)
      return null
    }
  }

  // =====================================================
  // USAGE TRACKING
  // =====================================================

  async trackUsage(tenantId: string, metric: string, value: number): Promise<void> {
    try {
      await this.supabase
        .from('usage_tracking')
        .insert({
          tenant_id: tenantId,
          metric,
          value,
          recorded_at: new Date().toISOString(),
        })
    } catch (error) {
      console.error('Error tracking usage:', error)
    }
  }

  async getUsage(tenantId: string, metric: string, period: 'day' | 'month' | 'year'): Promise<number> {
    try {
      const startDate = new Date()
      switch (period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1)
          break
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1)
          break
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
      }

      const { data, error } = await this.supabase
        .from('usage_tracking')
        .select('value')
        .eq('tenant_id', tenantId)
        .eq('metric', metric)
        .gte('recorded_at', startDate.toISOString())

      if (error || !data) {
        return 0
      }

      return data.reduce((sum: number, record: any) => sum + record.value, 0)
    } catch (error) {
      console.error('Error fetching usage:', error)
      return 0
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService()
