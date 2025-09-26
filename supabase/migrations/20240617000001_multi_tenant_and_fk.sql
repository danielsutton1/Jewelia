-- Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Add tenant_id columns to existing tables
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.accounts_payable ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.accounts_receivable ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS tenant_id uuid;

-- 2. Add foreign key constraints (only for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_orders_customer') THEN
        ALTER TABLE public.orders
        ADD CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES public.customers(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_inventory_location') THEN
        ALTER TABLE public.inventory
        ADD CONSTRAINT fk_inventory_location
        FOREIGN KEY (location_id) REFERENCES public.locations(id);
    END IF;
END $$;

-- 3. Enable RLS on existing business tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- 4. Add multi-tenant RLS policies for existing tables
CREATE POLICY "Tenant isolation - customers"
  ON public.customers
  FOR ALL
  USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Tenant isolation - orders"
  ON public.orders
  FOR ALL
  USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Tenant isolation - inventory"
  ON public.inventory
  FOR ALL
  USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Tenant isolation - accounts_payable"
  ON public.accounts_payable
  FOR ALL
  USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Tenant isolation - accounts_receivable"
  ON public.accounts_receivable
  FOR ALL
  USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Tenant isolation - vendors"
  ON public.vendors
  FOR ALL
  USING (tenant_id::text = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Tenant isolation - locations"
  ON public.locations
  FOR ALL
  USING (tenant_id::text = auth.jwt() ->> 'tenant_id'); 