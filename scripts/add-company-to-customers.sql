-- Add company names to existing customers
-- This script updates existing customers with realistic company names

UPDATE customers 
SET company = CASE 
  WHEN id = (SELECT id FROM customers WHERE full_name LIKE '%Sarah%' LIMIT 1) THEN 'Johnson & Associates'
  WHEN id = (SELECT id FROM customers WHERE full_name LIKE '%Michael%' LIMIT 1) THEN 'Chen Technologies'
  WHEN id = (SELECT id FROM customers WHERE full_name LIKE '%Emily%' LIMIT 1) THEN 'Davis Consulting'
  WHEN id = (SELECT id FROM customers WHERE full_name LIKE '%David%' LIMIT 1) THEN 'Wilson Enterprises'
  WHEN id = (SELECT id FROM customers WHERE full_name LIKE '%Jessica%' LIMIT 1) THEN 'Brown & Co.'
  WHEN id = (SELECT id FROM customers WHERE full_name LIKE '%Christopher%' LIMIT 1) THEN 'Miller Solutions'
  WHEN id = (SELECT id FROM customers WHERE full_name LIKE '%Amanda%' LIMIT 1) THEN 'Taylor Group'
  WHEN id = (SELECT id FROM customers WHERE full_name LIKE '%Matthew%' LIMIT 1) THEN 'Anderson Industries'
  WHEN id = (SELECT id FROM customers WHERE full_name LIKE '%Ashley%' LIMIT 1) THEN 'Thomas Partners'
  WHEN id = (SELECT id FROM customers WHERE full_name LIKE '%Joshua%' LIMIT 1) THEN 'Jackson Corp'
  ELSE 'Independent'
END
WHERE company IS NULL;

-- Verify the updates
SELECT id, full_name, company FROM customers ORDER BY created_at; 