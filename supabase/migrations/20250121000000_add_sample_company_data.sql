-- Add sample company data to existing customers
-- This migration adds realistic company names to existing customers

UPDATE customers 
SET company = CASE 
  WHEN full_name LIKE '%Sarah%' THEN 'Johnson & Associates'
  WHEN full_name LIKE '%Michael%' THEN 'Chen Technologies'
  WHEN full_name LIKE '%Emily%' THEN 'Davis Consulting'
  WHEN full_name LIKE '%David%' THEN 'Wilson Enterprises'
  WHEN full_name LIKE '%Jessica%' THEN 'Brown & Co.'
  WHEN full_name LIKE '%Christopher%' THEN 'Miller Solutions'
  WHEN full_name LIKE '%Amanda%' THEN 'Taylor Design Studio'
  WHEN full_name LIKE '%Robert%' THEN 'Anderson Manufacturing'
  WHEN full_name LIKE '%Lisa%' THEN 'Garcia Creative'
  WHEN full_name LIKE '%James%' THEN 'Martinez Consulting'
  ELSE 'Independent'
END
WHERE company IS NULL OR company = ''; 