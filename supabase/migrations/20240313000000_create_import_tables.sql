-- Create accounts_payable table
CREATE TABLE IF NOT EXISTS public.accounts_payable (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "Bill ID" TEXT NOT NULL,
    "Vendor" TEXT NOT NULL,
    "Date Issued" DATE NOT NULL,
    "Due Date" DATE NOT NULL,
    "Amount" DECIMAL(10,2) NOT NULL,
    "Balance" DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create accounts_receivable table
CREATE TABLE IF NOT EXISTS public.accounts_receivable (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "Invoice ID" TEXT NOT NULL,
    "Customer" TEXT NOT NULL,
    "Date Issued" DATE NOT NULL,
    "Due Date" DATE NOT NULL,
    "Amount" DECIMAL(10,2) NOT NULL,
    "Balance" DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: cad_files table is created in 20250115_create_cad_files_system.sql with comprehensive schema

-- Note: consigned_items table is created in 20240321000000_add_consignment.sql with proper schema

-- Note: consignors table is created in 20240321000000_add_consignment.sql with proper schema

-- Note: orders table is created in 20240616_orders.sql with proper schema

-- Create diamonds table
CREATE TABLE IF NOT EXISTS public.diamonds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "ID" TEXT NOT NULL,
    "Shape" TEXT NOT NULL,
    "Carat" DECIMAL(4,2) NOT NULL,
    "Color" TEXT NOT NULL,
    "Quality" TEXT NOT NULL,
    "Cut" TEXT NOT NULL,
    "Certificate" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ecommerce_integration_field_mapping table
CREATE TABLE IF NOT EXISTS public.ecommerce_integration_field_mapping (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "Platform" TEXT NOT NULL,
    "External Field" TEXT NOT NULL,
    "Jewelia Field" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create employee_schedules table
CREATE TABLE IF NOT EXISTS public.employee_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "Employee ID" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Date" DATE NOT NULL,
    "Shift Start" TIME NOT NULL,
    "Shift End" TIME NOT NULL,
    "Role" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create employee_tasks table
CREATE TABLE IF NOT EXISTS public.employee_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "Task ID" TEXT NOT NULL,
    "Employee ID" TEXT NOT NULL,
    "Employee Name" TEXT NOT NULL,
    "Task Description" TEXT NOT NULL,
    "Start Date" DATE NOT NULL,
    "Due Date" DATE NOT NULL,
    "Status" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create equipment_maintenance table
CREATE TABLE IF NOT EXISTS public.equipment_maintenance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "Equipment ID" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Location" TEXT NOT NULL,
    "Last Maintenance" DATE NOT NULL,
    "Next Maintenance" DATE NOT NULL,
    "Status" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create finished_inventory table
CREATE TABLE IF NOT EXISTS public.finished_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "SKU" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Category" TEXT NOT NULL,
    "Metal" TEXT NOT NULL,
    "Weight" DECIMAL(10,2) NOT NULL,
    "Stones" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "Cost" DECIMAL(10,2) NOT NULL,
    "Price" DECIMAL(10,2) NOT NULL,
    "Status" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory_tags_barcodes table
CREATE TABLE IF NOT EXISTS public.inventory_tags_barcodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "SKU" TEXT NOT NULL,
    "Tag ID" TEXT NOT NULL,
    "Barcode" TEXT NOT NULL,
    "Location" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create item_templates table
CREATE TABLE IF NOT EXISTS public.item_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "Code" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Category" TEXT NOT NULL,
    "Materials" TEXT NOT NULL,
    "Labor Codes" TEXT NOT NULL,
    "Total Cost" DECIMAL(10,2) NOT NULL,
    "Base Price" DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create labor_codes table
CREATE TABLE IF NOT EXISTS public.labor_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "Code" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "Time" INTEGER NOT NULL,
    "Estimate" DECIMAL(10,2) NOT NULL,
    "Cost" DECIMAL(10,2) NOT NULL,
    "Price" DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create loose_stones table
CREATE TABLE IF NOT EXISTS public.loose_stones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "SKU" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Shape" TEXT NOT NULL,
    "Carat" DECIMAL(4,2) NOT NULL,
    "Color" TEXT NOT NULL,
    "Clarity" TEXT NOT NULL,
    "Cut" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "Cost" DECIMAL(10,2) NOT NULL,
    "Price" DECIMAL(10,2) NOT NULL,
    "Status" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create past_sales table
CREATE TABLE IF NOT EXISTS public.past_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "Sale ID" TEXT NOT NULL,
    "Date" DATE NOT NULL,
    "Customer" TEXT NOT NULL,
    "Product/SKU" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "Price" DECIMAL(10,2) NOT NULL,
    "Total" DECIMAL(10,2) NOT NULL,
    "Salesperson" TEXT NOT NULL,
    "Payment Method" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create production_status table
CREATE TABLE IF NOT EXISTS public.production_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "Product ID" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Current Stage" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "Last Updated" TIMESTAMP NOT NULL,
    "Responsible Employee" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products_in_production_pipeline table
CREATE TABLE IF NOT EXISTS public.products_in_production_pipeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "Product ID" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "Category" TEXT NOT NULL,
    "Stage" TEXT NOT NULL,
    "Assigned Employee" TEXT NOT NULL,
    "Start Date" DATE NOT NULL,
    "Estimated Completion" DATE NOT NULL,
    "Status" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quality_control table
CREATE TABLE IF NOT EXISTS public.quality_control (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "QC ID" TEXT NOT NULL,
    "Product/SKU" TEXT NOT NULL,
    "Date" DATE NOT NULL,
    "Inspector" TEXT NOT NULL,
    "Result" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create raw_materials table
CREATE TABLE IF NOT EXISTS public.raw_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "SKU" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Alloy" TEXT NOT NULL,
    "Weight" DECIMAL(10,2) NOT NULL,
    "Thickness" DECIMAL(10,2) NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "Cost" DECIMAL(10,2) NOT NULL,
    "Price" DECIMAL(10,2) NOT NULL,
    "Status" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for import tables only
-- Note: cad_files, consigned_items, consignor_management, and current_orders are created in later migrations
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diamonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecommerce_integration_field_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finished_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_tags_barcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labor_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loose_stones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_in_production_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON public.accounts_payable FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON public.accounts_payable FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON public.accounts_payable FOR UPDATE TO authenticated USING (true);

-- Repeat for other tables...
-- Note: You may want to customize these policies based on your specific requirements 