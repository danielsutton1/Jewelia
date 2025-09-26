-- Add sample company data to existing customers
-- This migration adds realistic company names to existing customers

UPDATE customers SET company = 'Johnson & Associates' WHERE full_name LIKE '%Sarah%';
UPDATE customers SET company = 'Chen Technologies' WHERE full_name LIKE '%Michael%';
UPDATE customers SET company = 'Davis Consulting' WHERE full_name LIKE '%Emily%';
UPDATE customers SET company = 'Wilson Enterprises' WHERE full_name LIKE '%David%';
UPDATE customers SET company = 'Brown & Co.' WHERE full_name LIKE '%Jessica%';
UPDATE customers SET company = 'Miller Solutions' WHERE full_name LIKE '%Christopher%';
UPDATE customers SET company = 'Taylor Design Studio' WHERE full_name LIKE '%Amanda%';
UPDATE customers SET company = 'Anderson Manufacturing' WHERE full_name LIKE '%Robert%';
UPDATE customers SET company = 'Garcia Creative' WHERE full_name LIKE '%Lisa%';
UPDATE customers SET company = 'Martinez Consulting' WHERE full_name LIKE '%James%';

-- Set default company for any remaining customers
UPDATE customers SET company = 'Independent' WHERE company IS NULL OR company = ''; 