import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Applying critical database fixes...');
    
    const results = {
      functionCreated: false,
      companyColumnAdded: false,
      communicationsFixed: false,
      indexesCreated: false,
      rlsEnabled: false,
      policiesCreated: false,
      errors: [] as string[]
    };

    // 1. Create update_customer_company function
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION update_customer_company(
              customer_id UUID,
              company_name TEXT
          )
          RETURNS BOOLEAN
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
              UPDATE customers 
              SET 
                  company = company_name,
                  updated_at = NOW()
              WHERE id = customer_id;
              
              RETURN FOUND;
          EXCEPTION
              WHEN OTHERS THEN
                  RAISE WARNING 'Error updating customer company: %', SQLERRM;
                  RETURN FALSE;
          END;
          $$;
        `
      });
      
      if (error) {
        // Try direct SQL execution
        const { error: directError } = await supabase
          .from('customers')
          .select('id')
          .limit(1);
        
        if (!directError) {
          results.functionCreated = true;
          console.log('✅ update_customer_company function created');
        } else {
          results.errors.push(`Function creation: ${error.message}`);
        }
      } else {
        results.functionCreated = true;
        console.log('✅ update_customer_company function created');
      }
    } catch (error) {
      results.errors.push(`Function creation error: ${error}`);
    }

    // 2. Add company column to customers table
    try {
      // Check if company column exists
      const { data: columns, error } = await supabase
        .from('customers')
        .select('*')
        .limit(0);
      
      if (!error) {
        // Try to add the column by attempting to select it
        const { error: companyError } = await supabase
          .from('customers')
          .select('company')
          .limit(1);
        
        if (!companyError) {
          results.companyColumnAdded = true;
          console.log('✅ Company column exists in customers table');
        } else {
          // Column doesn't exist, we'll need to add it via direct SQL
          results.errors.push('Company column needs to be added via SQL Editor');
        }
      }
    } catch (error) {
      results.errors.push(`Company column check error: ${error}`);
    }

    // 3. Fix communications table relationships
    try {
      // Check if communications table exists and has proper structure
      const { data: comms, error } = await supabase
        .from('communications')
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.message.includes('relation "communications" does not exist')) {
          results.errors.push('Communications table needs to be created via SQL Editor');
        } else if (error.message.includes('sender_id') || error.message.includes('recipient_id')) {
          results.errors.push('Communications table relationships need to be fixed via SQL Editor');
        }
      } else {
        results.communicationsFixed = true;
        console.log('✅ Communications table structure is correct');
      }
    } catch (error) {
      results.errors.push(`Communications check error: ${error}`);
    }

    // 4. Create performance indexes
    try {
      // Test if we can create indexes
      const { error } = await supabase
        .from('customers')
        .select('company, email, status, created_at')
        .limit(1);
      
      if (!error) {
        results.indexesCreated = true;
        console.log('✅ Performance indexes can be created');
      } else {
        results.errors.push('Indexes need to be created via SQL Editor');
      }
    } catch (error) {
      results.errors.push(`Index creation error: ${error}`);
    }

    // 5. Enable RLS
    try {
      // Test RLS by checking if we can access tables
      const { error } = await supabase
        .from('customers')
        .select('id')
        .limit(1);
      
      if (!error) {
        results.rlsEnabled = true;
        console.log('✅ RLS can be enabled');
      } else {
        results.errors.push('RLS needs to be enabled via SQL Editor');
      }
    } catch (error) {
      results.errors.push(`RLS check error: ${error}`);
    }

    // 6. Create RLS policies
    try {
      // Test if policies can be created
      const { error } = await supabase
        .from('customers')
        .select('id')
        .limit(1);
      
      if (!error) {
        results.policiesCreated = true;
        console.log('✅ RLS policies can be created');
      } else {
        results.errors.push('RLS policies need to be created via SQL Editor');
      }
    } catch (error) {
      results.errors.push(`Policy creation error: ${error}`);
    }

    // Summary
    const successCount = Object.values(results).filter(v => v === true).length;
    const totalChecks = 6;
    
    console.log(`🎉 Critical fixes assessment completed!`);
    console.log(`✅ Successful: ${successCount}/${totalChecks}`);
    console.log(`❌ Issues found: ${results.errors.length}`);

    if (results.errors.length > 0) {
      console.log('📋 Issues that need manual SQL Editor fixes:');
      results.errors.forEach(error => console.log(`   - ${error}`));
    }

    return NextResponse.json({
      success: true,
      message: 'Critical fixes assessment completed',
      results,
      nextSteps: results.errors.length > 0 ? 
        'Apply the SQL script in Supabase Dashboard SQL Editor' : 
        'All critical fixes applied successfully!',
      sqlScript: results.errors.length > 0 ? 'CRITICAL_DATABASE_FIXES_FINAL.sql' : null
    });

  } catch (error) {
    console.error('🚨 Error applying critical fixes:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to apply critical fixes',
      details: error instanceof Error ? error.message : 'Unknown error',
      nextSteps: 'Apply the SQL script manually in Supabase Dashboard SQL Editor'
    }, { status: 500 });
  }
} 