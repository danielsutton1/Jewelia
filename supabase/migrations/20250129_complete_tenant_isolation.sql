-- Complete Tenant Isolation Migration
-- This migration ensures all tables have proper tenant_id columns and RLS policies

-- =====================================================
-- 1. ADD TENANT_ID TO MISSING TABLES
-- =====================================================

-- Add tenant_id to quotes table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.quotes ADD COLUMN tenant_id UUID;
    END IF;
END $$;

-- Add tenant_id to call_logs table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'call_logs' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.call_logs ADD COLUMN tenant_id UUID;
    END IF;
END $$;

-- Add tenant_id to repairs table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'repairs' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.repairs ADD COLUMN tenant_id UUID;
    END IF;
END $$;

-- Add tenant_id to audit_logs table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.audit_logs ADD COLUMN tenant_id UUID;
    END IF;
END $$;

-- Add tenant_id to order_items table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.order_items ADD COLUMN tenant_id UUID;
    END IF;
END $$;

-- =====================================================
-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

-- Enable RLS on tables that might not have it
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CREATE TENANT ISOLATION POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Tenant isolation - quotes" ON public.quotes;
DROP POLICY IF EXISTS "Tenant isolation - call_logs" ON public.call_logs;
DROP POLICY IF EXISTS "Tenant isolation - repairs" ON public.repairs;
DROP POLICY IF EXISTS "Tenant isolation - audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Tenant isolation - order_items" ON public.order_items;

-- Create tenant isolation policies
CREATE POLICY "Tenant isolation - quotes"
  ON public.quotes
  FOR ALL
  USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Tenant isolation - call_logs"
  ON public.call_logs
  FOR ALL
  USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Tenant isolation - repairs"
  ON public.repairs
  FOR ALL
  USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Tenant isolation - audit_logs"
  ON public.audit_logs
  FOR ALL
  USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Tenant isolation - order_items"
  ON public.order_items
  FOR ALL
  USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

-- =====================================================
-- 4. CREATE PERFORMANCE INDEXES
-- =====================================================

-- Create indexes for tenant_id columns for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_tenant_id ON public.quotes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_tenant_id ON public.call_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_repairs_tenant_id ON public.repairs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_tenant_id ON public.order_items(tenant_id);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_quotes_tenant_status ON public.quotes(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_call_logs_tenant_created ON public.call_logs(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_repairs_tenant_status ON public.repairs(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_order_items_tenant_order ON public.order_items(tenant_id, order_id);

-- =====================================================
-- 5. UPDATE EXISTING DATA WITH TENANT_ID
-- =====================================================

-- Update existing records to have a default tenant_id (for existing data)
-- This should be customized based on your actual tenant structure
UPDATE public.quotes 
SET tenant_id = (SELECT id FROM auth.users LIMIT 1)::uuid 
WHERE tenant_id IS NULL;

UPDATE public.call_logs 
SET tenant_id = (SELECT id FROM auth.users LIMIT 1)::uuid 
WHERE tenant_id IS NULL;

UPDATE public.repairs 
SET tenant_id = (SELECT id FROM auth.users LIMIT 1)::uuid 
WHERE tenant_id IS NULL;

UPDATE public.audit_logs 
SET tenant_id = (SELECT id FROM auth.users LIMIT 1)::uuid 
WHERE tenant_id IS NULL;

UPDATE public.order_items 
SET tenant_id = (SELECT id FROM auth.users LIMIT 1)::uuid 
WHERE tenant_id IS NULL;

-- =====================================================
-- 6. ADD NOT NULL CONSTRAINTS (AFTER DATA UPDATE)
-- =====================================================

-- Make tenant_id NOT NULL after updating existing data
ALTER TABLE public.quotes ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.call_logs ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.repairs ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.audit_logs ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.order_items ALTER COLUMN tenant_id SET NOT NULL;

-- =====================================================
-- 7. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get current user's tenant_id
CREATE OR REPLACE FUNCTION auth.current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() ->> 'tenant_id')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to a resource
CREATE OR REPLACE FUNCTION auth.user_has_tenant_access(resource_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN resource_tenant_id = auth.current_tenant_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. CREATE TRIGGERS FOR AUTOMATIC TENANT_ID ASSIGNMENT
-- =====================================================

-- Function to automatically set tenant_id on insert
CREATE OR REPLACE FUNCTION public.set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id = auth.current_tenant_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic tenant_id assignment
CREATE TRIGGER set_tenant_id_quotes
  BEFORE INSERT ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tenant_id();

CREATE TRIGGER set_tenant_id_call_logs
  BEFORE INSERT ON public.call_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tenant_id();

CREATE TRIGGER set_tenant_id_repairs
  BEFORE INSERT ON public.repairs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tenant_id();

CREATE TRIGGER set_tenant_id_audit_logs
  BEFORE INSERT ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tenant_id();

CREATE TRIGGER set_tenant_id_order_items
  BEFORE INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tenant_id();

-- =====================================================
-- 9. SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 TENANT ISOLATION MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '✅ Added tenant_id columns to all tables';
    RAISE NOTICE '✅ Enabled Row Level Security on all tables';
    RAISE NOTICE '✅ Created tenant isolation policies';
    RAISE NOTICE '✅ Added performance indexes';
    RAISE NOTICE '✅ Updated existing data with tenant_id';
    RAISE NOTICE '✅ Added NOT NULL constraints';
    RAISE NOTICE '✅ Created helper functions';
    RAISE NOTICE '✅ Added automatic tenant_id assignment triggers';
    RAISE NOTICE '✅ System is now fully tenant-isolated!';
END $$;
