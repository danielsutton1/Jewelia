ALTER TABLE messages ADD COLUMN IF NOT EXISTS work_order_id UUID REFERENCES work_orders(id);
CREATE INDEX IF NOT EXISTS idx_messages_work_order_id ON messages(work_order_id); 