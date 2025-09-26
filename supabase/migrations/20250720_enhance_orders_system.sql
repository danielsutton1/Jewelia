-- Enhance existing orders table
ALTER TABLE "public"."orders" 
ADD COLUMN IF NOT EXISTS "payment_method" "text",
ADD COLUMN IF NOT EXISTS "expected_delivery_date" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "actual_delivery_date" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "subtotal" numeric(10,2) DEFAULT 0;

-- Update existing orders to calculate subtotal
UPDATE "public"."orders" 
SET subtotal = total_amount - COALESCE(tax_amount, 0) - COALESCE(shipping_amount, 0) + COALESCE(discount_amount, 0)
WHERE subtotal = 0;

-- Create order_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "inventory_id" "uuid",
    "sku" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "quantity" integer NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "total_price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

-- Create order_status_history table for audit trail
CREATE TABLE IF NOT EXISTS "public"."order_status_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "notes" "text",
    "changed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

-- Add primary keys
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."order_status_history" ADD CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id");

-- Add foreign key constraints
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE SET NULL;
ALTER TABLE "public"."order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "public"."order_items" ("order_id");
CREATE INDEX IF NOT EXISTS "order_items_product_id_idx" ON "public"."order_items" ("product_id");
CREATE INDEX IF NOT EXISTS "order_status_history_order_id_idx" ON "public"."order_status_history" ("order_id");

-- Enable Row Level Security
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_status_history" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON "public"."order_items" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON "public"."order_items" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON "public"."order_items" FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete access for authenticated users" ON "public"."order_items" FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON "public"."order_status_history" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON "public"."order_status_history" FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
    order_num text;
    counter integer := 1;
BEGIN
    LOOP
        order_num := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(counter::text, 4, '0');
        
        -- Check if order number already exists
        IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = order_num) THEN
            RETURN order_num;
        END IF;
        
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to update order totals
CREATE OR REPLACE FUNCTION update_order_totals()
RETURNS trigger AS $$
BEGIN
    -- Update order totals when order items change
    UPDATE orders 
    SET 
        subtotal = COALESCE((
            SELECT SUM(total_price) 
            FROM order_items 
            WHERE order_id = NEW.order_id
        ), 0),
        total_amount = COALESCE((
            SELECT SUM(total_price) 
            FROM order_items 
            WHERE order_id = NEW.order_id
        ), 0) + COALESCE(tax_amount, 0) + COALESCE(shipping_amount, 0) - COALESCE(discount_amount, 0),
        updated_at = now()
    WHERE id = NEW.order_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update order totals
DROP TRIGGER IF EXISTS update_order_totals_trigger ON order_items;
CREATE TRIGGER update_order_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_totals();

-- Create function to log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS trigger AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (order_id, status, notes, changed_by)
        VALUES (NEW.id, NEW.status, 'Status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || NEW.status, auth.uid());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to log status changes
DROP TRIGGER IF EXISTS log_order_status_change_trigger ON orders;
CREATE TRIGGER log_order_status_change_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change(); 