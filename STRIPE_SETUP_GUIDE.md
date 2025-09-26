# 🚀 **STRIPE INTEGRATION SETUP GUIDE**
## Complete Stripe Integration for Jewelia CRM

This guide will walk you through setting up the complete Stripe integration for your SaaS application.

---

## 📋 **PREREQUISITES**

- Stripe account (test mode for development)
- Supabase project with database access
- Environment variables configured

---

## 🔧 **STEP 1: STRIPE ACCOUNT SETUP**

### **1.1 Create Stripe Account**
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the account verification process
3. Switch to **Test Mode** for development

### **1.2 Get API Keys**
1. Go to **Developers > API Keys** in your Stripe dashboard
2. Copy your **Publishable Key** (starts with `pk_test_`)
3. Copy your **Secret Key** (starts with `sk_test_`)

### **1.3 Set Environment Variables**
Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## 🗄️ **STEP 2: DATABASE SETUP**

### **2.1 Run the Migration**
Execute this SQL in your Supabase SQL editor:

```sql
-- Run the migration file: supabase/migrations/20250129_create_subscriptions_table.sql
```

**Or run it via command line:**
```bash
supabase db push
```

### **2.2 Verify Tables Created**
Check that these tables exist:
- `subscriptions` - Stores subscription data
- `usage_tracking` - Tracks usage metrics
- `users` - Should have `stripe_customer_id` column

---

## 🛍️ **STEP 3: CREATE STRIPE PRODUCTS**

### **3.1 Run the Setup Script**
```bash
# Install dependencies if needed
npm install stripe

# Set your Stripe secret key
export STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Run the setup script
node scripts/setup-stripe-products.js
```

### **3.2 Expected Output**
```
🚀 Setting up Stripe products and prices...

Creating product: Basic
✅ Product created: prod_xxxxx
✅ Price created: price_xxxxx
   Price: $29.99/month
   Features: 8 features
   Limits: 1000 products, 2 users

Creating product: Professional
✅ Product created: prod_xxxxx
✅ Price created: price_xxxxx
   Price: $49.99/month
   Features: 12 features
   Limits: 10000 products, 10 users

Creating product: Enterprise
✅ Product created: prod_xxxxx
✅ Price created: price_xxxxx
   Price: $99.99/month
   Features: 15 features
   Limits: Unlimited products, Unlimited users

🎉 All Stripe products and prices created successfully!
```

### **3.3 Save Price IDs**
Copy the price IDs from the output - you'll need them for testing.

---

## 🔗 **STEP 4: WEBHOOK SETUP**

### **4.1 Create Webhook Endpoint**
1. Go to **Developers > Webhooks** in Stripe dashboard
2. Click **Add endpoint**
3. Set endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.created`
   - `customer.updated`

### **4.2 Get Webhook Secret**
1. After creating the webhook, click on it
2. Go to **Signing secret**
3. Click **Reveal** and copy the secret
4. Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

---

## 🧪 **STEP 5: TESTING**

### **5.1 Test Cards**
Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### **5.2 Test the Flow**
1. Start your development server: `npm run dev`
2. Go to `/dashboard/billing`
3. Try subscribing to a plan
4. Use test card: `4242 4242 4242 4242`
5. Check Stripe dashboard for the payment

### **5.3 Verify Webhooks**
1. Check your application logs for webhook events
2. Verify data is being stored in the database
3. Test subscription cancellation

---

## 🔒 **STEP 6: SECURITY CONFIGURATION**

### **6.1 Environment Variables**
Ensure these are set in production:
```bash
# Production Stripe Keys
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
```

### **6.2 Webhook Security**
- Always verify webhook signatures
- Use HTTPS endpoints
- Validate webhook payloads

---

## 📊 **STEP 7: MONITORING**

### **7.1 Stripe Dashboard**
Monitor these metrics:
- Payment success rates
- Failed payments
- Subscription churn
- Revenue metrics

### **7.2 Application Logs**
Check for:
- Webhook processing errors
- Payment failures
- Subscription status changes

---

## 🚀 **STEP 8: PRODUCTION DEPLOYMENT**

### **8.1 Switch to Live Mode**
1. Complete Stripe account verification
2. Switch to **Live Mode** in Stripe dashboard
3. Update environment variables with live keys
4. Update webhook endpoints to production URLs

### **8.2 Final Testing**
1. Test with real payment methods (small amounts)
2. Verify webhook processing
3. Test subscription lifecycle
4. Monitor for any issues

---

## 🎯 **FEATURES IMPLEMENTED**

### **✅ Completed Features:**
- Stripe webhook handling
- Subscription creation and management
- Payment method management
- Invoice handling
- Usage tracking
- Tenant isolation
- Real-time subscription updates
- Subscription cancellation
- Payment failure handling

### **🔧 API Endpoints:**
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions` - Get user subscriptions
- `PUT /api/subscriptions/[id]` - Update subscription
- `DELETE /api/subscriptions/[id]` - Cancel subscription
- `POST /api/webhooks/stripe` - Stripe webhooks

### **🎨 UI Components:**
- Subscription plans display
- Payment method management
- Billing history
- Subscription status
- Plan upgrade/downgrade

---

## 🆘 **TROUBLESHOOTING**

### **Common Issues:**

**1. Webhook Not Receiving Events**
- Check webhook URL is correct
- Verify webhook secret
- Check server logs for errors

**2. Payment Fails**
- Verify Stripe keys are correct
- Check card details
- Review error messages in logs

**3. Subscription Not Created**
- Check database connection
- Verify tenant_id is set
- Review webhook processing

**4. TypeScript Errors**
- Run `npm run build` to check for errors
- Fix any type mismatches
- Ensure all imports are correct

---

## 📞 **SUPPORT**

If you encounter issues:
1. Check the Stripe dashboard for payment status
2. Review application logs
3. Verify environment variables
4. Test with Stripe test cards
5. Check webhook delivery in Stripe dashboard

---

## 🎉 **SUCCESS!**

Once completed, your Jewelia CRM will have:
- ✅ Complete Stripe integration
- ✅ Subscription management
- ✅ Payment processing
- ✅ Webhook handling
- ✅ Tenant isolation
- ✅ Usage tracking
- ✅ Production-ready billing system

**Your SaaS is now ready for real customers!** 🚀

---

*Last updated: January 29, 2025*
