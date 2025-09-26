-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE trade_in_status AS ENUM ('pending', 'approved', 'completed', 'cancelled');
CREATE TYPE metal_type AS ENUM ('gold', 'silver', 'platinum', 'palladium');
CREATE TYPE metal_purity AS ENUM ('24k', '22k', '18k', '14k', '10k', '925', '999', '950', '900');
CREATE TYPE weight_unit AS ENUM ('grams', 'troy-oz', 'oz');
CREATE TYPE item_condition AS ENUM ('excellent', 'good', 'fair', 'poor');
CREATE TYPE gemstone_quality AS ENUM ('excellent', 'very_good', 'good', 'fair');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE notification_status AS ENUM ('unread', 'read', 'archived');
CREATE TYPE log_level AS ENUM ('info', 'warn', 'error', 'debug');

-- Create trade-ins table
CREATE TABLE trade_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  staff_id UUID NOT NULL REFERENCES auth.users(id),
  date DATE NOT NULL,
  status trade_in_status NOT NULL DEFAULT 'pending',
  status_history JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  financial JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_financial CHECK (
    financial ? 'tradeInCredit' AND
    financial ? 'newItemsCost' AND
    financial ? 'tax' AND
    financial ? 'netDifference'
  )
);

-- Create trade-in items table
CREATE TABLE trade_in_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_in_id UUID NOT NULL REFERENCES trade_ins(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  metal_type metal_type NOT NULL,
  metal_purity metal_purity NOT NULL,
  weight DECIMAL(10,3) NOT NULL,
  weight_unit weight_unit NOT NULL,
  condition item_condition NOT NULL,
  accepted_value DECIMAL(10,2) NOT NULL,
  appraisal_value DECIMAL(10,2) NOT NULL,
  description TEXT,
  photos TEXT[] DEFAULT '{}',
  gemstone_type TEXT,
  gemstone_carat DECIMAL(5,2),
  gemstone_quality gemstone_quality,
  gemstone_cert TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trade-in new items table
CREATE TABLE trade_in_new_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_in_id UUID NOT NULL REFERENCES trade_ins(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT false,
  specs TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trade-in documents table
CREATE TABLE trade_in_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_in_id UUID NOT NULL REFERENCES trade_ins(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trade-in communications table
CREATE TABLE trade_in_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_in_id UUID NOT NULL REFERENCES trade_ins(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trade-in audit log table
CREATE TABLE trade_in_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_in_id UUID NOT NULL REFERENCES trade_ins(id) ON DELETE CASCADE,
  changes JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



-- Create logs table
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level log_level NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create emails table
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "to" TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT NOT NULL,
  data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE trade_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_new_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_audit_log ENABLE ROW LEVEL SECURITY;

ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Staff can view all trade-ins
CREATE POLICY "Staff can view trade-ins"
  ON trade_ins FOR SELECT
  TO authenticated
  USING (true);

-- Staff can create trade-ins
CREATE POLICY "Staff can create trade-ins"
  ON trade_ins FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Staff can update trade-ins
CREATE POLICY "Staff can update trade-ins"
  ON trade_ins FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Staff can view trade-in items
CREATE POLICY "Staff can view trade-in items"
  ON trade_in_items FOR SELECT
  TO authenticated
  USING (true);

-- Staff can manage trade-in items
CREATE POLICY "Staff can manage trade-in items"
  ON trade_in_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Staff can view new items
CREATE POLICY "Staff can view new items"
  ON trade_in_new_items FOR SELECT
  TO authenticated
  USING (true);

-- Staff can manage new items
CREATE POLICY "Staff can manage new items"
  ON trade_in_new_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Staff can view documents
CREATE POLICY "Staff can view documents"
  ON trade_in_documents FOR SELECT
  TO authenticated
  USING (true);

-- Staff can manage documents
CREATE POLICY "Staff can manage documents"
  ON trade_in_documents FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Staff can view communications
CREATE POLICY "Staff can view communications"
  ON trade_in_communications FOR SELECT
  TO authenticated
  USING (true);

-- Staff can manage communications
CREATE POLICY "Staff can manage communications"
  ON trade_in_communications FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Staff can view audit log
CREATE POLICY "Staff can view audit log"
  ON trade_in_audit_log FOR SELECT
  TO authenticated
  USING (true);



-- Staff can view logs
CREATE POLICY "Staff can view logs"
  ON logs FOR SELECT
  TO authenticated
  USING (true);

-- Staff can view emails
CREATE POLICY "Staff can view emails"
  ON emails FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX idx_trade_ins_customer ON trade_ins(customer_id);
CREATE INDEX idx_trade_ins_staff ON trade_ins(staff_id);
CREATE INDEX idx_trade_ins_status ON trade_ins(status);
CREATE INDEX idx_trade_ins_date ON trade_ins(date);
CREATE INDEX idx_trade_in_items_trade_in ON trade_in_items(trade_in_id);
CREATE INDEX idx_trade_in_new_items_trade_in ON trade_in_new_items(trade_in_id);
CREATE INDEX idx_trade_in_documents_trade_in ON trade_in_documents(trade_in_id);
CREATE INDEX idx_trade_in_communications_trade_in ON trade_in_communications(trade_in_id);
CREATE INDEX idx_trade_in_audit_log_trade_in ON trade_in_audit_log(trade_in_id);

CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_emails_status ON emails(status);

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_trade_ins_updated_at
  BEFORE UPDATE ON trade_ins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trade_in_items_updated_at
  BEFORE UPDATE ON trade_in_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trade_in_new_items_updated_at
  BEFORE UPDATE ON trade_in_new_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at(); 