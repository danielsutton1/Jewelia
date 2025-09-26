import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, supabase)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, supabase)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, supabase)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabase)
        break

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer, supabase)
        break

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer, supabase)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Payment Intent Handlers
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  try {
    const { user_id, tenant_id, order_id } = paymentIntent.metadata

    // Update payment record
    await supabase
      .from('billing_payments')
      .update({
        status: 'completed',
        payment_date: new Date().toISOString(),
        reference_number: paymentIntent.id,
      })
      .eq('reference_number', paymentIntent.id)

    // Update order status if order_id exists
    if (order_id) {
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order_id)
        .eq('tenant_id', tenant_id)
    }

    // Create invoice if it doesn't exist
    if ((paymentIntent as any).invoice) {
      const invoice = await getStripe().invoices.retrieve((paymentIntent as any).invoice)
      await createInvoiceRecord(invoice, supabase, tenant_id)
    }

    console.log(`Payment succeeded: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  try {
    const { user_id, tenant_id, order_id } = paymentIntent.metadata

    // Update payment record
    await supabase
      .from('billing_payments')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('reference_number', paymentIntent.id)

    // Update order status if order_id exists
    if (order_id) {
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order_id)
        .eq('tenant_id', tenant_id)
    }

    console.log(`Payment failed: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

// Subscription Handlers
async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  try {
    const customer = await getStripe().customers.retrieve(subscription.customer as string)
    const { tenant_id } = (customer as any).metadata

          // Create subscription record
      await supabase
        .from('subscriptions')
        .insert({
          id: subscription.id,
          tenant_id: tenant_id,
          customer_id: subscription.customer as string,
          status: subscription.status,
          plan_id: subscription.items.data[0]?.price.id,
          current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          created_at: new Date(subscription.created * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })

    console.log(`Subscription created: ${subscription.id}`)
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  try {
    // Update subscription record
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)

    console.log(`Subscription updated: ${subscription.id}`)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  try {
    // Update subscription status to cancelled
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)

    console.log(`Subscription deleted: ${subscription.id}`)
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

// Invoice Handlers
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  try {
    const customer = await getStripe().customers.retrieve(invoice.customer as string)
    const { tenant_id } = (customer as any).metadata

    // Create or update invoice record
    await createInvoiceRecord(invoice, supabase, tenant_id)

    console.log(`Invoice payment succeeded: ${invoice.id}`)
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  try {
    const customer = await getStripe().customers.retrieve(invoice.customer as string)
    const { tenant_id } = (customer as any).metadata

    // Update invoice status
    await supabase
      .from('billing_invoices')
      .update({
        status: 'overdue',
        updated_at: new Date().toISOString(),
      })
      .eq('invoice_number', invoice.number)
      .eq('tenant_id', tenant_id)

    console.log(`Invoice payment failed: ${invoice.id}`)
  } catch (error) {
    console.error('Error handling invoice payment failed:', error)
  }
}

// Customer Handlers
async function handleCustomerCreated(customer: Stripe.Customer, supabase: any) {
  try {
    const { tenant_id, user_id } = customer.metadata

    if (tenant_id && user_id) {
      // Update user record with Stripe customer ID
      await supabase
        .from('users')
        .update({
          stripe_customer_id: customer.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user_id)
        .eq('tenant_id', tenant_id)
    }

    console.log(`Customer created: ${customer.id}`)
  } catch (error) {
    console.error('Error handling customer created:', error)
  }
}

async function handleCustomerUpdated(customer: Stripe.Customer, supabase: any) {
  try {
    const { tenant_id, user_id } = customer.metadata

    if (tenant_id && user_id) {
      // Update user record with latest customer data
      await supabase
        .from('users')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customer.id)
        .eq('tenant_id', tenant_id)
    }

    console.log(`Customer updated: ${customer.id}`)
  } catch (error) {
    console.error('Error handling customer updated:', error)
  }
}

// Helper function to create invoice record
async function createInvoiceRecord(invoice: Stripe.Invoice, supabase: any, tenant_id: string) {
  try {
    const { data: existingInvoice } = await supabase
      .from('billing_invoices')
      .select('id')
      .eq('invoice_number', invoice.number)
      .eq('tenant_id', tenant_id)
      .single()

    if (existingInvoice) {
      // Update existing invoice
      await supabase
        .from('billing_invoices')
        .update({
          status: (invoice as any).paid ? 'paid' : 'sent',
          paid_at: (invoice as any).paid ? new Date((invoice as any).status_transitions.paid_at! * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingInvoice.id)
    } else {
      // Create new invoice
      await supabase
        .from('billing_invoices')
        .insert({
          invoice_number: invoice.number || invoice.id,
          customer_id: invoice.customer as string,
          status: (invoice as any).paid ? 'paid' : 'sent',
          subtotal: (invoice as any).subtotal / 100,
          tax_amount: (invoice as any).tax / 100,
          total_amount: (invoice as any).total / 100,
          currency: invoice.currency,
          due_date: new Date((invoice as any).due_date! * 1000).toISOString(),
          paid_at: (invoice as any).paid ? new Date((invoice as any).status_transitions.paid_at! * 1000).toISOString() : null,
          tenant_id: tenant_id,
          created_at: new Date(invoice.created * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
    }
  } catch (error) {
    console.error('Error creating invoice record:', error)
  }
}
