-- Add budget field to quotes table
-- This field will store the original budget from the call log, separate from the quote amount

ALTER TABLE quotes
ADD COLUMN budget DECIMAL(10,2) DEFAULT 0.00;

-- Add comment to explain the field
COMMENT ON COLUMN quotes.budget IS 'Original budget amount from call log - this should not change when quote is edited';

-- Update existing quotes to set budget = total_amount * 0.8 for now
-- This ensures existing quotes have a realistic budget value
UPDATE quotes
SET budget = ROUND(total_amount * 0.8, 2)
WHERE budget IS NULL OR budget = 0;

-- Make budget field NOT NULL after setting default values
ALTER TABLE quotes
ALTER COLUMN budget SET NOT NULL;

-- Add index on budget field for better query performance
CREATE INDEX idx_quotes_budget ON quotes(budget);

-- Verify the changes
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'quotes'
AND column_name = 'budget';

-- Show sample of updated data
SELECT
    quote_number,
    customer_name,
    total_amount,
    budget,
    ROUND((budget / total_amount) * 100, 1) as budget_percentage
FROM quotes
LIMIT 10; 