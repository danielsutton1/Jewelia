const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://jplmmjcwwhjrltlevkoh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwbG1tamN3d2hqcmx0bGV2a29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTI1MDksImV4cCI6MjA2MzMyODUwOX0.PQTyBGcwNWCCnlDkjOUjKhfeys8kDLfYi_ohcw02vu0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuotes() {
  try {
    console.log('Testing quotes table...');
    
    // Test if quotes table exists
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error fetching quotes:', error);
    } else {
      console.log('Quotes found:', quotes?.length || 0);
      console.log('Sample quote:', quotes?.[0]);
    }

    // Test customers table
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .limit(5);

    if (customerError) {
      console.error('Error fetching customers:', customerError);
    } else {
      console.log('Customers found:', customers?.length || 0);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testQuotes(); 