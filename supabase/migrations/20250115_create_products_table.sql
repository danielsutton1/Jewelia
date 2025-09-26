-- Create products table for jewelry CRM
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    price DECIMAL(10,2) DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    material VARCHAR(100),
    gemstone VARCHAR(100),
    weight DECIMAL(8,3),
    dimensions VARCHAR(100),
    images TEXT[], -- Array of image URLs
    tags TEXT[], -- Array of tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample products for jewelry
INSERT INTO products (sku, name, description, category, price, cost, stock_quantity, material, gemstone, weight, dimensions, tags) VALUES
('RING-001', 'Diamond Engagement Ring', 'Beautiful 1 carat diamond engagement ring in white gold', 'rings', 2500.00, 1500.00, 5, 'White Gold', 'Diamond', 3.5, '6.5mm x 6.5mm', ARRAY['engagement', 'diamond', 'white-gold']),
('NECK-001', 'Pearl Necklace', 'Elegant freshwater pearl necklace with 18k gold clasp', 'necklaces', 450.00, 250.00, 12, '18k Gold', 'Pearl', 8.2, '18 inches', ARRAY['pearl', 'necklace', 'elegant']),
('EARR-001', 'Sapphire Stud Earrings', 'Classic sapphire stud earrings in yellow gold', 'earrings', 350.00, 200.00, 8, 'Yellow Gold', 'Sapphire', 2.1, '4mm', ARRAY['sapphire', 'studs', 'classic']),
('BRAC-001', 'Tennis Bracelet', 'Diamond tennis bracelet with 3 carats total weight', 'bracelets', 1800.00, 1200.00, 3, 'White Gold', 'Diamond', 12.5, '7 inches', ARRAY['tennis', 'diamond', 'luxury']),
('WATCH-001', 'Luxury Watch', 'Premium automatic watch with leather strap', 'watches', 1200.00, 800.00, 4, 'Stainless Steel', NULL, 85.0, '42mm', ARRAY['watch', 'automatic', 'luxury']);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON products
    FOR DELETE USING (auth.role() = 'authenticated'); 