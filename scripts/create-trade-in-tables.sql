-- Simplified Trade-In Tables Creation
-- This script creates the essential tables for testing the Trade-In system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: trade_ins (core table)
CREATE TABLE IF NOT EXISTS trade_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  item_type VARCHAR(100) NOT NULL,
  description TEXT,
  photos TEXT[], -- Array of photo URLs
  estimated_value DECIMAL(10,2),
  appraised_value DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'credited')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  credited_order_id UUID REFERENCES orders(id),
  notes TEXT,
  condition VARCHAR(50) CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  appraiser_id UUID REFERENCES customers(id), -- Staff member who appraised
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  credited_at TIMESTAMP
);

-- Table 2: trade_in_status_history
CREATE TABLE IF NOT EXISTS trade_in_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_in_id UUID REFERENCES trade_ins(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES customers(id),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  previous_status VARCHAR(50)
);

-- Table 3: trade_in_valuations
CREATE TABLE IF NOT EXISTS trade_in_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_in_id UUID REFERENCES trade_ins(id) ON DELETE CASCADE,
  appraiser_id UUID REFERENCES customers(id),
  valuation_amount DECIMAL(10,2) NOT NULL,
  valuation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valuation_notes TEXT,
  valuation_method VARCHAR(100), -- e.g., 'market_comparison', 'expert_assessment', 'certified_appraisal'
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 10)
);

-- Table 4: trade_in_credits
CREATE TABLE IF NOT EXISTS trade_in_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_in_id UUID REFERENCES trade_ins(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  credit_amount DECIMAL(10,2) NOT NULL,
  applied_amount DECIMAL(10,2) DEFAULT 0,
  remaining_amount DECIMAL(10,2) GENERATED ALWAYS AS (credit_amount - applied_amount) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
  notes TEXT
);

-- Basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_trade_ins_customer_id ON trade_ins(customer_id);
CREATE INDEX IF NOT EXISTS idx_trade_ins_status ON trade_ins(status);
CREATE INDEX IF NOT EXISTS idx_trade_ins_created_at ON trade_ins(created_at);

-- Basic RLS policies
ALTER TABLE trade_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_credits ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON trade_ins TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON trade_in_status_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON trade_in_valuations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON trade_in_credits TO authenticated;

-- Insert sample data for testing
INSERT INTO trade_ins (
    customer_id, 
    item_type, 
    description, 
    estimated_value, 
    status, 
    condition,
    notes
) VALUES 
(
    '307e97f7-c483-4f4c-9d71-2cecca61eead',
    'Diamond Ring',
    '14k white gold diamond ring, 1.5 carat center stone',
    2500.00,
    'pending',
    'excellent',
    'Customer wants to upgrade to larger diamond'
),
(
    '6122b891-baab-4361-9c56-ee544c25ca09',
    'Gold Necklace',
    '18k yellow gold chain, 24 inches',
    800.00,
    'approved',
    'good',
    'Appraised by certified gemologist'
),
(
    'bf66b1dd-ba96-44fa-aa9c-b52e132cb1fc',
    'Sapphire Earrings',
    'Blue sapphire studs with white gold settings',
    1200.00,
    'under_review',
    'fair',
    'Needs professional cleaning'
)
ON CONFLICT DO NOTHING; 