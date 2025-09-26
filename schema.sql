

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."inventory_status" AS ENUM (
    'in_stock',
    'low_stock',
    'out_of_stock',
    'on_order'
);


ALTER TYPE "public"."inventory_status" OWNER TO "postgres";


CREATE TYPE "public"."order_status" AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."order_status" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'pending',
    'paid',
    'partial',
    'overdue'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."repair_status" AS ENUM (
    'received',
    'in_progress',
    'completed',
    'delivered'
);


ALTER TYPE "public"."repair_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'manager',
    'staff',
    'viewer'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."accounts_payable" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Bill ID" "text" NOT NULL,
    "Vendor" "text",
    "Date Issued" "date",
    "Due Date" "date",
    "Amount" numeric,
    "Balance" numeric,
    "Status" "text",
    "Related Purchase" "text",
    "Notes" "text",
    "vendor_id" "uuid"
);


ALTER TABLE "public"."accounts_payable" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."accounts_receivable" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Invoice ID" "text" NOT NULL,
    "Customer" "text",
    "Date Issued" "date",
    "Due Date" "date",
    "Amount" numeric,
    "Balance" numeric,
    "Status" "text",
    "Related Order" "text",
    "Notes" "text",
    "customer_id" "uuid",
    "order_id" "uuid"
);


ALTER TABLE "public"."accounts_receivable" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "action" character varying(100) NOT NULL,
    "table_name" character varying(100) NOT NULL,
    "record_id" "uuid" NOT NULL,
    "changes" "jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cad_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Project ID" "text",
    "Product Name" "text",
    "CAD File Name" "text",
    "File Link/Path" "text",
    "Designer" "text",
    "Date Uploaded" "date",
    "Status" "text",
    "Notes" "text"
);


ALTER TABLE "public"."cad_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."consigned_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Item ID" "text",
    "Consignor ID" "text",
    "SKU" "text",
    "Name" "text",
    "Category" "text",
    "Value" numeric,
    "Status" "text",
    "Date Consigned" "date",
    "Notes" "text"
);


ALTER TABLE "public"."consigned_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."consignor_management" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Consignor ID" "text",
    "Name" "text",
    "Contact" "text",
    "Agreement Date" "date",
    "Terms" "text",
    "Status" "text",
    "Notes" "text"
);


ALTER TABLE "public"."consignor_management" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crm_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Full Name" "text",
    "Email Address" "text",
    "Phone Number" "text",
    "Address" "text",
    "Company" "text",
    "Notes" "text"
);


ALTER TABLE "public"."crm_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."current_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Order ID" "text",
    "Customer" "text",
    "Date" "date",
    "Items" "text",
    "Status" "text",
    "Expected Delivery" "date",
    "Salesperson" "text",
    "Notes" "text",
    "customer_id" "uuid"
);


ALTER TABLE "public"."current_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" character varying(255),
    "phone" character varying(50),
    "full_name" character varying(255) NOT NULL,
    "address" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."diamonds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ID" "text",
    "Shape" "text",
    "Carat" numeric,
    "Color" "text",
    "Quality" "text",
    "Cut" "text",
    "Certificate" "text",
    "Status" "text",
    "Vendor" "text",
    "Location" "text",
    "Price" numeric,
    "inventory_id" "uuid"
);


ALTER TABLE "public"."diamonds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dropship_orders" (
    "id" "text" NOT NULL,
    "customername" "text" NOT NULL,
    "itemscount" integer NOT NULL,
    "status" "text" NOT NULL,
    "orderdate" timestamp with time zone NOT NULL,
    "totalamount" numeric NOT NULL,
    CONSTRAINT "dropship_orders_status_check" CHECK (("status" = ANY (ARRAY['Pending'::"text", 'Processing'::"text", 'Shipped'::"text", 'Delivered'::"text"])))
);


ALTER TABLE "public"."dropship_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ecommerce_integration_field_mapping" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Platform" "text",
    "External Field" "text",
    "Jewelia Field" "text",
    "Data Type" "text",
    "Example Value" "text",
    "Notes" "text"
);


ALTER TABLE "public"."ecommerce_integration_field_mapping" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employee_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Employee ID" "text",
    "Name" "text",
    "Date" "date",
    "Shift Start" time without time zone,
    "Shift End" time without time zone,
    "Role" "text",
    "Notes" "text",
    "employee_uuid" "uuid"
);


ALTER TABLE "public"."employee_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employee_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Task ID" "text",
    "Employee ID" "text",
    "Employee Name" "text",
    "Task Description" "text",
    "Related Product/Order" "text",
    "Start Date" "date",
    "Due Date" "date",
    "Status" "text",
    "Notes" "text",
    "employee_uuid" "uuid"
);


ALTER TABLE "public"."employee_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Employee ID" "text",
    "Name" "text",
    "Role" "text",
    "Department" "text",
    "Email" "text",
    "Phone" "text",
    "Production Stage" "text",
    "Tip Limit" numeric,
    "Schedule" "text",
    "Status" "text"
);


ALTER TABLE "public"."employees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."equipment_maintenance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Equipment ID" "text",
    "Name" "text",
    "Type" "text",
    "Location" "text",
    "Last Maintenance" "date",
    "Next Maintenance" "date",
    "Status" "text",
    "Notes" "text"
);


ALTER TABLE "public"."equipment_maintenance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."finished_inventory" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "SKU" "text",
    "Name" "text",
    "Category" "text",
    "Metal" "text",
    "Weight" numeric,
    "Stones" "text",
    "Quantity" numeric,
    "Cost" numeric,
    "Price" numeric,
    "Status" "text",
    "inventory_id" "uuid"
);


ALTER TABLE "public"."finished_inventory" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."finished_inventory_template" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "SKU" "text",
    "Name" "text",
    "Category" "text",
    "Metal" "text",
    "Weight" numeric,
    "Stones" "text",
    "Quantity" numeric,
    "Cost" numeric,
    "Price" numeric,
    "Status" "text"
);


ALTER TABLE "public"."finished_inventory_template" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "sku" character varying(50) NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "category" character varying(100),
    "price" numeric(10,2) NOT NULL,
    "cost" numeric(10,2),
    "quantity" integer DEFAULT 0,
    "status" "public"."inventory_status" DEFAULT 'in_stock'::"public"."inventory_status",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."inventory" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "SKU" "text",
    "Description" "text",
    "Category" "text",
    "Price" numeric,
    "Stock" numeric,
    "Location" "text",
    "Image" "text",
    "Supplier" "text",
    "GIA Number" "text",
    "Carat" numeric,
    "Color" "text",
    "Clarity" "text",
    "Cut" "text",
    "inventory_id" "uuid"
);


ALTER TABLE "public"."inventory_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_tags_barcodes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "SKU" "text",
    "Tag ID" "text",
    "Barcode" "text",
    "Location" "text",
    "Status" "text",
    "Notes" "text",
    "inventory_id" "uuid"
);


ALTER TABLE "public"."inventory_tags_barcodes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."item_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Code" "text",
    "Name" "text",
    "Category" "text",
    "Materials" "text",
    "Labor Codes" "text",
    "Total Cost" numeric,
    "Base Price" numeric
);


ALTER TABLE "public"."item_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."labor_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Code" "text",
    "Name" "text",
    "Description" "text",
    "Time" numeric,
    "Estimate" numeric,
    "Cost" numeric,
    "Price" numeric
);


ALTER TABLE "public"."labor_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."loose_stones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "SKU" "text",
    "Name" "text",
    "Type" "text",
    "Shape" "text",
    "Carat" numeric,
    "Color" "text",
    "Clarity" "text",
    "Cut" "text",
    "Quantity" numeric,
    "Cost" numeric,
    "Price" numeric,
    "Status" "text",
    "inventory_id" "uuid"
);


ALTER TABLE "public"."loose_stones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid",
    "inventory_id" "uuid",
    "quantity" integer NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid",
    "status" "public"."order_status" DEFAULT 'pending'::"public"."order_status",
    "total_amount" numeric(10,2) NOT NULL,
    "payment_status" "public"."payment_status" DEFAULT 'pending'::"public"."payment_status",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."past_sales" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Sale ID" "text",
    "Date" "date",
    "Customer" "text",
    "Product/SKU" "text",
    "Quantity" numeric,
    "Price" numeric,
    "Total" numeric,
    "Salesperson" "text",
    "Payment Method" "text",
    "Status" "text",
    "customer_id" "uuid",
    "product_inventory_id" "uuid",
    "salesperson_id" "uuid"
);


ALTER TABLE "public"."past_sales" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."production_status" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Product ID" "text",
    "Name" "text",
    "Current Stage" "text",
    "Status" "text",
    "Last Updated" "date",
    "Responsible Employee" "text",
    "Notes" "text",
    "product_inventory_id" "uuid"
);


ALTER TABLE "public"."production_status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Image" "text",
    "Product" "text",
    "Category" "text",
    "Price" numeric,
    "Stock" numeric,
    "Status" "text",
    "SKU" "text"
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products_in_production_pipeline" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Product ID" "text",
    "Name" "text",
    "Description" "text",
    "Category" "text",
    "Stage" "text",
    "Assigned Employee" "text",
    "Start Date" "date",
    "Estimated Completion" "date",
    "Status" "text",
    "Notes" "text",
    "product_inventory_id" "uuid",
    "assigned_employee_id" "uuid"
);


ALTER TABLE "public"."products_in_production_pipeline" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quality_control" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "QC ID" "text",
    "Product/SKU" "text",
    "Date" "date",
    "Inspector" "text",
    "Result" "text",
    "Issues Found" "text",
    "Actions Taken" "text",
    "Status" "text",
    "Notes" "text",
    "product_inventory_id" "uuid",
    "inspector_id" "uuid"
);


ALTER TABLE "public"."quality_control" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."raw_materials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "SKU" "text",
    "Name" "text",
    "Type" "text",
    "Alloy" "text",
    "Weight" numeric,
    "Thickness" numeric,
    "Quantity" numeric,
    "Cost" numeric,
    "Price" numeric,
    "Status" "text",
    "inventory_id" "uuid"
);


ALTER TABLE "public"."raw_materials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."repairs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Repair ID" "text",
    "Customer" "text",
    "Item" "text",
    "Issue" "text",
    "Status" "text",
    "Technician" "text",
    "Received" "date",
    "Due" "date",
    "Cost" numeric,
    "Notes" "text"
);


ALTER TABLE "public"."repairs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" character varying(255) NOT NULL,
    "full_name" character varying(255) NOT NULL,
    "role" "public"."user_role" DEFAULT 'staff'::"public"."user_role",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "contact_email" "text",
    "contact_phone" "text",
    "address" "text",
    "payment_terms" "text",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."vendors" OWNER TO "postgres";


ALTER TABLE ONLY "public"."accounts_payable"
    ADD CONSTRAINT "accounts_payable_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."accounts_receivable"
    ADD CONSTRAINT "accounts_receivable_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cad_files"
    ADD CONSTRAINT "cad_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."consigned_items"
    ADD CONSTRAINT "consigned_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."consignor_management"
    ADD CONSTRAINT "consignor_management_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crm_data"
    ADD CONSTRAINT "crm_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."current_orders"
    ADD CONSTRAINT "current_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."diamonds"
    ADD CONSTRAINT "diamonds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dropship_orders"
    ADD CONSTRAINT "dropship_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ecommerce_integration_field_mapping"
    ADD CONSTRAINT "ecommerce_integration_field_mapping_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_schedules"
    ADD CONSTRAINT "employee_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_tasks"
    ADD CONSTRAINT "employee_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."equipment_maintenance"
    ADD CONSTRAINT "equipment_maintenance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."finished_inventory"
    ADD CONSTRAINT "finished_inventory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."finished_inventory_template"
    ADD CONSTRAINT "finished_inventory_template_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_data"
    ADD CONSTRAINT "inventory_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."inventory_tags_barcodes"
    ADD CONSTRAINT "inventory_tags_barcodes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."item_templates"
    ADD CONSTRAINT "item_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."labor_codes"
    ADD CONSTRAINT "labor_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loose_stones"
    ADD CONSTRAINT "loose_stones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."past_sales"
    ADD CONSTRAINT "past_sales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."production_status"
    ADD CONSTRAINT "production_status_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products_in_production_pipeline"
    ADD CONSTRAINT "products_in_production_pipeline_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quality_control"
    ADD CONSTRAINT "quality_control_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."raw_materials"
    ADD CONSTRAINT "raw_materials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."repairs"
    ADD CONSTRAINT "repairs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_accounts_payable_vendor_id" ON "public"."accounts_payable" USING "btree" ("vendor_id");



CREATE INDEX "idx_accounts_receivable_customer_id" ON "public"."accounts_receivable" USING "btree" ("customer_id");



CREATE INDEX "idx_accounts_receivable_order_id" ON "public"."accounts_receivable" USING "btree" ("order_id");



CREATE INDEX "idx_current_orders_customer_id" ON "public"."current_orders" USING "btree" ("customer_id");



CREATE INDEX "idx_diamonds_inventory_id" ON "public"."diamonds" USING "btree" ("inventory_id");



CREATE INDEX "idx_employee_schedules_employee_uuid" ON "public"."employee_schedules" USING "btree" ("employee_uuid");



CREATE INDEX "idx_employee_tasks_employee_uuid" ON "public"."employee_tasks" USING "btree" ("employee_uuid");



CREATE INDEX "idx_inventory_data_inventory_id" ON "public"."inventory_data" USING "btree" ("inventory_id");



CREATE INDEX "idx_loose_stones_inventory_id" ON "public"."loose_stones" USING "btree" ("inventory_id");



CREATE INDEX "idx_past_sales_customer_id" ON "public"."past_sales" USING "btree" ("customer_id");



CREATE INDEX "idx_past_sales_salesperson_id" ON "public"."past_sales" USING "btree" ("salesperson_id");



CREATE OR REPLACE TRIGGER "update_customers_updated_at" BEFORE UPDATE ON "public"."customers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_inventory_updated_at" BEFORE UPDATE ON "public"."inventory" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."accounts_payable"
    ADD CONSTRAINT "accounts_payable_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id");



ALTER TABLE ONLY "public"."accounts_receivable"
    ADD CONSTRAINT "accounts_receivable_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."accounts_receivable"
    ADD CONSTRAINT "accounts_receivable_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."current_orders"
    ADD CONSTRAINT "current_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."diamonds"
    ADD CONSTRAINT "diamonds_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id");



ALTER TABLE ONLY "public"."employee_schedules"
    ADD CONSTRAINT "employee_schedules_employee_uuid_fkey" FOREIGN KEY ("employee_uuid") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."employee_tasks"
    ADD CONSTRAINT "employee_tasks_employee_uuid_fkey" FOREIGN KEY ("employee_uuid") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."finished_inventory"
    ADD CONSTRAINT "finished_inventory_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id");



ALTER TABLE ONLY "public"."inventory_data"
    ADD CONSTRAINT "inventory_data_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id");



ALTER TABLE ONLY "public"."inventory_tags_barcodes"
    ADD CONSTRAINT "inventory_tags_barcodes_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id");



ALTER TABLE ONLY "public"."loose_stones"
    ADD CONSTRAINT "loose_stones_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."past_sales"
    ADD CONSTRAINT "past_sales_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."past_sales"
    ADD CONSTRAINT "past_sales_product_inventory_id_fkey" FOREIGN KEY ("product_inventory_id") REFERENCES "public"."inventory"("id");



ALTER TABLE ONLY "public"."past_sales"
    ADD CONSTRAINT "past_sales_salesperson_id_fkey" FOREIGN KEY ("salesperson_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."production_status"
    ADD CONSTRAINT "production_status_product_inventory_id_fkey" FOREIGN KEY ("product_inventory_id") REFERENCES "public"."inventory"("id");



ALTER TABLE ONLY "public"."products_in_production_pipeline"
    ADD CONSTRAINT "products_in_production_pipeline_assigned_employee_id_fkey" FOREIGN KEY ("assigned_employee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."products_in_production_pipeline"
    ADD CONSTRAINT "products_in_production_pipeline_product_inventory_id_fkey" FOREIGN KEY ("product_inventory_id") REFERENCES "public"."inventory"("id");



ALTER TABLE ONLY "public"."quality_control"
    ADD CONSTRAINT "quality_control_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."quality_control"
    ADD CONSTRAINT "quality_control_product_inventory_id_fkey" FOREIGN KEY ("product_inventory_id") REFERENCES "public"."inventory"("id");



ALTER TABLE ONLY "public"."raw_materials"
    ADD CONSTRAINT "raw_materials_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id");



CREATE POLICY "Authenticated can insert audit logs" ON "public"."audit_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated can view audit logs" ON "public"."audit_logs" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."accounts_payable" TO "anon";
GRANT ALL ON TABLE "public"."accounts_payable" TO "authenticated";
GRANT ALL ON TABLE "public"."accounts_payable" TO "service_role";



GRANT ALL ON TABLE "public"."accounts_receivable" TO "anon";
GRANT ALL ON TABLE "public"."accounts_receivable" TO "authenticated";
GRANT ALL ON TABLE "public"."accounts_receivable" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."cad_files" TO "anon";
GRANT ALL ON TABLE "public"."cad_files" TO "authenticated";
GRANT ALL ON TABLE "public"."cad_files" TO "service_role";



GRANT ALL ON TABLE "public"."consigned_items" TO "anon";
GRANT ALL ON TABLE "public"."consigned_items" TO "authenticated";
GRANT ALL ON TABLE "public"."consigned_items" TO "service_role";



GRANT ALL ON TABLE "public"."consignor_management" TO "anon";
GRANT ALL ON TABLE "public"."consignor_management" TO "authenticated";
GRANT ALL ON TABLE "public"."consignor_management" TO "service_role";



GRANT ALL ON TABLE "public"."crm_data" TO "anon";
GRANT ALL ON TABLE "public"."crm_data" TO "authenticated";
GRANT ALL ON TABLE "public"."crm_data" TO "service_role";



GRANT ALL ON TABLE "public"."current_orders" TO "anon";
GRANT ALL ON TABLE "public"."current_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."current_orders" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."diamonds" TO "anon";
GRANT ALL ON TABLE "public"."diamonds" TO "authenticated";
GRANT ALL ON TABLE "public"."diamonds" TO "service_role";



GRANT ALL ON TABLE "public"."dropship_orders" TO "anon";
GRANT ALL ON TABLE "public"."dropship_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."dropship_orders" TO "service_role";



GRANT ALL ON TABLE "public"."ecommerce_integration_field_mapping" TO "anon";
GRANT ALL ON TABLE "public"."ecommerce_integration_field_mapping" TO "authenticated";
GRANT ALL ON TABLE "public"."ecommerce_integration_field_mapping" TO "service_role";



GRANT ALL ON TABLE "public"."employee_schedules" TO "anon";
GRANT ALL ON TABLE "public"."employee_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."employee_tasks" TO "anon";
GRANT ALL ON TABLE "public"."employee_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."employees" TO "anon";
GRANT ALL ON TABLE "public"."employees" TO "authenticated";
GRANT ALL ON TABLE "public"."employees" TO "service_role";



GRANT ALL ON TABLE "public"."equipment_maintenance" TO "anon";
GRANT ALL ON TABLE "public"."equipment_maintenance" TO "authenticated";
GRANT ALL ON TABLE "public"."equipment_maintenance" TO "service_role";



GRANT ALL ON TABLE "public"."finished_inventory" TO "anon";
GRANT ALL ON TABLE "public"."finished_inventory" TO "authenticated";
GRANT ALL ON TABLE "public"."finished_inventory" TO "service_role";



GRANT ALL ON TABLE "public"."finished_inventory_template" TO "anon";
GRANT ALL ON TABLE "public"."finished_inventory_template" TO "authenticated";
GRANT ALL ON TABLE "public"."finished_inventory_template" TO "service_role";



GRANT ALL ON TABLE "public"."inventory" TO "anon";
GRANT ALL ON TABLE "public"."inventory" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_data" TO "anon";
GRANT ALL ON TABLE "public"."inventory_data" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_data" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_tags_barcodes" TO "anon";
GRANT ALL ON TABLE "public"."inventory_tags_barcodes" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_tags_barcodes" TO "service_role";



GRANT ALL ON TABLE "public"."item_templates" TO "anon";
GRANT ALL ON TABLE "public"."item_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."item_templates" TO "service_role";



GRANT ALL ON TABLE "public"."labor_codes" TO "anon";
GRANT ALL ON TABLE "public"."labor_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."labor_codes" TO "service_role";



GRANT ALL ON TABLE "public"."loose_stones" TO "anon";
GRANT ALL ON TABLE "public"."loose_stones" TO "authenticated";
GRANT ALL ON TABLE "public"."loose_stones" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."past_sales" TO "anon";
GRANT ALL ON TABLE "public"."past_sales" TO "authenticated";
GRANT ALL ON TABLE "public"."past_sales" TO "service_role";



GRANT ALL ON TABLE "public"."production_status" TO "anon";
GRANT ALL ON TABLE "public"."production_status" TO "authenticated";
GRANT ALL ON TABLE "public"."production_status" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."products_in_production_pipeline" TO "anon";
GRANT ALL ON TABLE "public"."products_in_production_pipeline" TO "authenticated";
GRANT ALL ON TABLE "public"."products_in_production_pipeline" TO "service_role";



GRANT ALL ON TABLE "public"."quality_control" TO "anon";
GRANT ALL ON TABLE "public"."quality_control" TO "authenticated";
GRANT ALL ON TABLE "public"."quality_control" TO "service_role";



GRANT ALL ON TABLE "public"."raw_materials" TO "anon";
GRANT ALL ON TABLE "public"."raw_materials" TO "authenticated";
GRANT ALL ON TABLE "public"."raw_materials" TO "service_role";



GRANT ALL ON TABLE "public"."repairs" TO "anon";
GRANT ALL ON TABLE "public"."repairs" TO "authenticated";
GRANT ALL ON TABLE "public"."repairs" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."vendors" TO "anon";
GRANT ALL ON TABLE "public"."vendors" TO "authenticated";
GRANT ALL ON TABLE "public"."vendors" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
