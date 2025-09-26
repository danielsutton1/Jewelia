-- Add company column to customers table
ALTER TABLE customers ADD COLUMN company VARCHAR(255);

-- Update the schema.sql file to include the company column
-- This migration adds the company field that's already referenced in the TypeScript interface 