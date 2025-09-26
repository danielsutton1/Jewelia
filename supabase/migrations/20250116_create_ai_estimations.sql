-- Create AI estimations table
CREATE TABLE IF NOT EXISTS ai_estimations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type VARCHAR(100) NOT NULL,
    materials JSONB NOT NULL,
    complexity VARCHAR(50) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    labor_cost DECIMAL(10,2) NOT NULL,
    material_cost DECIMAL(10,2) NOT NULL,
    customization_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    rush_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    estimated_time VARCHAR(50) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    breakdown JSONB NOT NULL,
    market_factors JSONB NOT NULL,
    recommendations TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_estimations_item_type ON ai_estimations(item_type);
CREATE INDEX IF NOT EXISTS idx_ai_estimations_complexity ON ai_estimations(complexity);
CREATE INDEX IF NOT EXISTS idx_ai_estimations_created_at ON ai_estimations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_estimations_total_price ON ai_estimations(total_price);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_ai_estimations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_estimations_updated_at
    BEFORE UPDATE ON ai_estimations
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_estimations_updated_at();

-- Enable RLS
ALTER TABLE ai_estimations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own estimations" ON ai_estimations
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create estimations" ON ai_estimations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own estimations" ON ai_estimations
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own estimations" ON ai_estimations
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Add comments
COMMENT ON TABLE ai_estimations IS 'Stores AI-generated estimations for jewelry items';
COMMENT ON COLUMN ai_estimations.item_type IS 'Type of jewelry item (ring, necklace, etc.)';
COMMENT ON COLUMN ai_estimations.materials IS 'JSON array of materials used in the item';
COMMENT ON COLUMN ai_estimations.complexity IS 'Complexity level of the work required';
COMMENT ON COLUMN ai_estimations.base_price IS 'Base price before customizations and rush fees';
COMMENT ON COLUMN ai_estimations.labor_cost IS 'Cost of labor for the item';
COMMENT ON COLUMN ai_estimations.material_cost IS 'Cost of materials for the item';
COMMENT ON COLUMN ai_estimations.customization_cost IS 'Additional cost for customizations';
COMMENT ON COLUMN ai_estimations.rush_fee IS 'Additional fee for rush orders';
COMMENT ON COLUMN ai_estimations.total_price IS 'Total estimated price';
COMMENT ON COLUMN ai_estimations.estimated_time IS 'Estimated time to complete the work';
COMMENT ON COLUMN ai_estimations.confidence IS 'Confidence score for the estimation (0-1)';
COMMENT ON COLUMN ai_estimations.breakdown IS 'Detailed breakdown of costs';
COMMENT ON COLUMN ai_estimations.market_factors IS 'Current market factors affecting pricing';
COMMENT ON COLUMN ai_estimations.recommendations IS 'AI-generated recommendations'; 