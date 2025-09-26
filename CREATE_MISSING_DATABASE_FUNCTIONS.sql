-- 🔴 IMMEDIATE FIX: Create Missing Database Functions
-- This fixes the "Could not find the function public.exec_sql(sql)" and "update_customer_company" errors

-- STEP 1: Create the exec_sql function (for automated fixes)
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE sql;
    RAISE NOTICE '✅ Executed SQL: %', sql;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error executing SQL: % - %', sql, SQLERRM;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 2: Create the update_customer_company function
CREATE OR REPLACE FUNCTION update_customer_company(customer_id UUID, company_name TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE customers 
    SET company = company_name, updated_at = NOW()
    WHERE id = customer_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Customer with ID % not found', customer_id;
    END IF;
    
    RAISE NOTICE '✅ Updated company for customer % to: %', customer_id, company_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Create a safe_exec_sql function with better error handling
CREATE OR REPLACE FUNCTION safe_exec_sql(sql TEXT, operation_name TEXT DEFAULT 'unknown')
RETURNS JSON AS $$
DECLARE
    result JSON;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
BEGIN
    start_time := NOW();
    
    BEGIN
        EXECUTE sql;
        end_time := NOW();
        
        result := json_build_object(
            'success', true,
            'operation', operation_name,
            'sql', sql,
            'start_time', start_time,
            'end_time', end_time,
            'duration_ms', EXTRACT(EPOCH FROM (end_time - start_time)) * 1000
        );
        
        RAISE NOTICE '✅ Successfully executed %: %', operation_name, sql;
        
    EXCEPTION
        WHEN OTHERS THEN
            end_time := NOW();
            
            result := json_build_object(
                'success', false,
                'operation', operation_name,
                'sql', sql,
                'error', SQLERRM,
                'error_code', SQLSTATE,
                'start_time', start_time,
                'end_time', end_time,
                'duration_ms', EXTRACT(EPOCH FROM (end_time - start_time)) * 1000
            );
            
            RAISE NOTICE '❌ Error executing %: % - %', operation_name, sql, SQLERRM;
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 4: Create a batch_update_customers function for bulk operations
CREATE OR REPLACE FUNCTION batch_update_customers(updates JSON)
RETURNS JSON AS $$
DECLARE
    update_record JSON;
    customer_id UUID;
    company_name TEXT;
    success_count INTEGER := 0;
    error_count INTEGER := 0;
    results JSON[] := '{}';
    result JSON;
BEGIN
    -- Process each update in the JSON array
    FOR update_record IN SELECT * FROM json_array_elements(updates)
    LOOP
        customer_id := (update_record->>'customer_id')::UUID;
        company_name := update_record->>'company_name';
        
        BEGIN
            PERFORM update_customer_company(customer_id, company_name);
            success_count := success_count + 1;
            
            result := json_build_object(
                'customer_id', customer_id,
                'status', 'success',
                'message', 'Company updated successfully'
            );
            
        EXCEPTION
            WHEN OTHERS THEN
                error_count := error_count + 1;
                
                result := json_build_object(
                    'customer_id', customer_id,
                    'status', 'error',
                    'message', SQLERRM
                );
        END;
        
        results := array_append(results, result);
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'total_updates', json_array_length(updates),
        'success_count', success_count,
        'error_count', error_count,
        'results', results
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 5: Create a utility function to check function existence
CREATE OR REPLACE FUNCTION function_exists(func_name TEXT, schema_name TEXT DEFAULT 'public')
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.routines 
        WHERE routine_name = func_name 
        AND routine_schema = schema_name
    );
END;
$$ LANGUAGE plpgsql;

-- STEP 6: Verify all functions were created successfully
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_schema
FROM information_schema.routines 
WHERE routine_name IN ('exec_sql', 'update_customer_company', 'safe_exec_sql', 'batch_update_customers', 'function_exists')
AND routine_schema = 'public'
ORDER BY routine_name;

-- STEP 7: Test the functions
SELECT 
    'exec_sql' as function_name,
    function_exists('exec_sql') as exists
UNION ALL
SELECT 
    'update_customer_company' as function_name,
    function_exists('update_customer_company') as exists
UNION ALL
SELECT 
    'safe_exec_sql' as function_name,
    function_exists('safe_exec_sql') as exists
UNION ALL
SELECT 
    'batch_update_customers' as function_name,
    function_exists('batch_update_customers') as exists
UNION ALL
SELECT 
    'function_exists' as function_name,
    function_exists('function_exists') as exists;

-- ✅ MISSING DATABASE FUNCTIONS CREATED
-- All critical functions are now available for API operations 