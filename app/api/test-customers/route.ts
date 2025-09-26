import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('Testing customers tables...');
    
    // Test customers table with all columns
    console.log('Querying customers table...');
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .limit(3);
    
    console.log('Customers query result:', { data: customersData, error: customersError });
    
    // Test crm_data table
    console.log('Querying crm_data table...');
    const { data: crmData, error: crmError } = await supabase
      .from('crm_data')
      .select('*')
      .limit(3);
    
    console.log('CRM data query result:', { data: crmData, error: crmError });
    
    // Test what happens when we query the customers table that the API is actually using
    console.log('Testing the actual customers table being used by the API...');
    const { data: actualCustomersData, error: actualCustomersError } = await supabase
      .from('customers')
      .select('id, "Full Name", "Email Address", "Phone Number", "Address", "Notes", "Company", created_at, updated_at')
      .limit(3);
    
    return NextResponse.json({ 
      success: true,
      customers: {
        data: customersData,
        error: customersError?.message,
        count: customersData?.length || 0,
        columns: customersData?.[0] ? Object.keys(customersData[0]) : []
      },
      crm_data: {
        data: crmData,
        error: crmError?.message,
        count: crmData?.length || 0,
        columns: crmData?.[0] ? Object.keys(crmData[0]) : []
      },
      actual_customers: {
        data: actualCustomersData,
        error: actualCustomersError?.message,
        count: actualCustomersData?.length || 0,
        columns: actualCustomersData?.[0] ? Object.keys(actualCustomersData[0]) : []
      }
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
} 