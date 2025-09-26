#!/usr/bin/env node

/**
 * Stripe Products and Prices Setup Script
 * This script creates the subscription plans in Stripe
 * Run this after setting up your Stripe account
 */

const Stripe = require('stripe');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

// Subscription plans configuration
const plans = [
  {
    name: 'Basic',
    description: 'Essential features for small jewelry businesses',
    price: 2999, // $29.99 in cents
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 1,000 products',
      '2 staff accounts',
      'Basic analytics',
      'Standard support',
      'Mobile app access',
      'Basic inventory management',
      'Customer management',
      'Order tracking'
    ],
    limits: {
      products: 1000,
      users: 2,
      storage: 5, // GB
      apiCalls: 1000
    }
  },
  {
    name: 'Professional',
    description: 'Advanced features for growing jewelry businesses',
    price: 4999, // $49.99 in cents
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 10,000 products',
      '10 staff accounts',
      'Advanced analytics',
      'Priority support',
      'Mobile app access',
      'API access',
      'Custom reporting',
      'Advanced inventory management',
      'Multi-location support',
      'Advanced customer analytics',
      'Automated workflows',
      'Integration capabilities'
    ],
    limits: {
      products: 10000,
      users: 10,
      storage: 25, // GB
      apiCalls: 10000
    }
  },
  {
    name: 'Enterprise',
    description: 'Complete solution for large jewelry businesses',
    price: 9999, // $99.99 in cents
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited products',
      'Unlimited staff accounts',
      'Enterprise analytics',
      '24/7 dedicated support',
      'Mobile app access',
      'Advanced API access',
      'Custom reporting',
      'White-label options',
      'Custom integrations',
      'Advanced security features',
      'Dedicated account manager',
      'Custom training',
      'SLA guarantees',
      'Advanced automation',
      'Multi-currency support'
    ],
    limits: {
      products: -1, // Unlimited
      users: -1, // Unlimited
      storage: 100, // GB
      apiCalls: 100000
    }
  }
];

async function createStripeProducts() {
  console.log('🚀 Setting up Stripe products and prices...\n');

  try {
    for (const plan of plans) {
      console.log(`Creating product: ${plan.name}`);
      
      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          features: JSON.stringify(plan.features),
          products_limit: plan.limits.products.toString(),
          users_limit: plan.limits.users.toString(),
          storage_limit: plan.limits.storage.toString(),
          api_calls_limit: plan.limits.apiCalls.toString(),
        },
      });

      console.log(`✅ Product created: ${product.id}`);

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: plan.currency,
        recurring: {
          interval: plan.interval,
        },
        metadata: {
          plan_name: plan.name,
        },
      });

      console.log(`✅ Price created: ${price.id}`);
      console.log(`   Price: $${(plan.price / 100).toFixed(2)}/${plan.interval}`);
      console.log(`   Features: ${plan.features.length} features`);
      console.log(`   Limits: ${plan.limits.products === -1 ? 'Unlimited' : plan.limits.products} products, ${plan.limits.users === -1 ? 'Unlimited' : plan.limits.users} users\n`);
    }

    console.log('🎉 All Stripe products and prices created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Copy the price IDs from the output above');
    console.log('2. Update your environment variables with STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY');
    console.log('3. Set up webhook endpoints in Stripe dashboard');
    console.log('4. Test the subscription flow in your application');

  } catch (error) {
    console.error('❌ Error creating Stripe products:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY environment variable is required');
    console.log('Please set your Stripe secret key:');
    console.log('export STRIPE_SECRET_KEY=sk_test_...');
    process.exit(1);
  }

  createStripeProducts();
}

module.exports = { createStripeProducts, plans };
