-- Add diamond-specific fields to products table
-- This migration adds comprehensive diamond grading and specification fields

-- Add diamond-specific columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS carat_weight DECIMAL(6,3),
ADD COLUMN IF NOT EXISTS clarity VARCHAR(10),
ADD COLUMN IF NOT EXISTS color VARCHAR(5),
ADD COLUMN IF NOT EXISTS cut VARCHAR(20),
ADD COLUMN IF NOT EXISTS shape VARCHAR(20),
ADD COLUMN IF NOT EXISTS certification VARCHAR(10),
ADD COLUMN IF NOT EXISTS fluorescence VARCHAR(20),
ADD COLUMN IF NOT EXISTS polish VARCHAR(20),
ADD COLUMN IF NOT EXISTS symmetry VARCHAR(20),
ADD COLUMN IF NOT EXISTS depth_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS table_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS measurements VARCHAR(50),
ADD COLUMN IF NOT EXISTS origin VARCHAR(50),
ADD COLUMN IF NOT EXISTS treatment VARCHAR(50);

-- Create indexes for diamond-specific fields for better query performance
CREATE INDEX IF NOT EXISTS idx_products_carat_weight ON products(carat_weight);
CREATE INDEX IF NOT EXISTS idx_products_clarity ON products(clarity);
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
CREATE INDEX IF NOT EXISTS idx_products_cut ON products(cut);
CREATE INDEX IF NOT EXISTS idx_products_shape ON products(shape);
CREATE INDEX IF NOT EXISTS idx_products_certification ON products(certification);
CREATE INDEX IF NOT EXISTS idx_products_origin ON products(origin);

-- Add comments to document the diamond fields
COMMENT ON COLUMN products.carat_weight IS 'Diamond carat weight (e.g., 1.50)';
COMMENT ON COLUMN products.clarity IS 'Diamond clarity grade (FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2, I1, I2, I3)';
COMMENT ON COLUMN products.color IS 'Diamond color grade (D-Z)';
COMMENT ON COLUMN products.cut IS 'Diamond cut grade (Excellent, Very Good, Good, Fair, Poor)';
COMMENT ON COLUMN products.shape IS 'Diamond shape (Round, Princess, Cushion, Oval, etc.)';
COMMENT ON COLUMN products.certification IS 'Certification laboratory (GIA, IGI, AGS, etc.)';
COMMENT ON COLUMN products.fluorescence IS 'Fluorescence level (None, Faint, Medium, Strong, Very Strong)';
COMMENT ON COLUMN products.polish IS 'Polish grade (Excellent, Very Good, Good, Fair, Poor)';
COMMENT ON COLUMN products.symmetry IS 'Symmetry grade (Excellent, Very Good, Good, Fair, Poor)';
COMMENT ON COLUMN products.depth_percentage IS 'Depth percentage (e.g., 62.5)';
COMMENT ON COLUMN products.table_percentage IS 'Table percentage (e.g., 58.0)';
COMMENT ON COLUMN products.measurements IS 'Diamond measurements in mm (e.g., 6.50 x 6.52 x 4.05)';
COMMENT ON COLUMN products.origin IS 'Diamond origin (Natural, Lab Grown, Canada, Botswana, etc.)';
COMMENT ON COLUMN products.treatment IS 'Diamond treatment (None, HPHT, CVD, etc.)';

-- Update existing diamond products with sample data (optional)
-- This is just for demonstration - you can remove this if you don't want sample data
UPDATE products 
SET 
    carat_weight = 1.50,
    clarity = 'VS1',
    color = 'G',
    cut = 'Excellent',
    shape = 'Round',
    certification = 'GIA',
    fluorescence = 'None',
    polish = 'Excellent',
    symmetry = 'Excellent',
    depth_percentage = 62.5,
    table_percentage = 58.0,
    measurements = '6.50 x 6.52 x 4.05',
    origin = 'Natural',
    treatment = 'None'
WHERE sku = 'RING-001' AND category = 'rings';

UPDATE products 
SET 
    carat_weight = 3.00,
    clarity = 'VS2',
    color = 'H',
    cut = 'Very Good',
    shape = 'Round',
    certification = 'IGI',
    fluorescence = 'Faint',
    polish = 'Very Good',
    symmetry = 'Very Good',
    depth_percentage = 61.8,
    table_percentage = 59.2,
    measurements = '9.10 x 9.12 x 5.62',
    origin = 'Lab Grown',
    treatment = 'None'
WHERE sku = 'BRAC-001' AND category = 'bracelets'; 