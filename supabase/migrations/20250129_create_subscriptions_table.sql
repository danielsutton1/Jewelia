-- Create subscriptions table for Stripe integration
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY, -- Stripe subscription ID
    tenant_id UUID NOT NULL,
    customer_id TEXT NOT NULL, -- Stripe customer ID
    status TEXT NOT NULL DEFAULT 'incomplete',
    plan_id TEXT NOT NULL, -- Stripe price ID
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    metric TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add stripe_customer_id to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE public.users ADD COLUMN stripe_customer_id TEXT;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view subscriptions in their tenant" ON public.subscriptions
    FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "Users can insert subscriptions in their tenant" ON public.subscriptions
    FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "Users can update subscriptions in their tenant" ON public.subscriptions
    FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "Users can delete subscriptions in their tenant" ON public.subscriptions
    FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Create RLS policies for usage tracking
CREATE POLICY "Users can view usage in their tenant" ON public.usage_tracking
    FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "Users can insert usage in their tenant" ON public.usage_tracking
    FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON public.subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON public.subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_tenant_id ON public.usage_tracking(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_metric ON public.usage_tracking(metric);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_recorded_at ON public.usage_tracking(recorded_at);

-- Create updated_at trigger for subscriptions
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- Create trigger for automatic tenant_id assignment on subscriptions
CREATE OR REPLACE FUNCTION set_subscription_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_subscription_tenant_id
  BEFORE INSERT ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION set_subscription_tenant_id();

-- Create trigger for automatic tenant_id assignment on usage_tracking
CREATE TRIGGER set_usage_tracking_tenant_id
  BEFORE INSERT ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION set_subscription_tenant_id();

-- Grant permissions
GRANT ALL ON public.subscriptions TO authenticated;
GRANT ALL ON public.usage_tracking TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 SUBSCRIPTIONS TABLE MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '✅ Created subscriptions table with Stripe integration';
    RAISE NOTICE '✅ Created usage_tracking table';
    RAISE NOTICE '✅ Added stripe_customer_id to users table';
    RAISE NOTICE '✅ Enabled Row Level Security';
    RAISE NOTICE '✅ Created tenant isolation policies';
    RAISE NOTICE '✅ Added performance indexes';
    RAISE NOTICE '✅ Created automatic triggers';
    RAISE NOTICE '✅ System is ready for Stripe subscriptions!';
END $$;
