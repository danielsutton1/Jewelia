const { createClient } = require('@supabase/supabase-js');

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testQuotesTable() {
  try {
    console.log('Testing quotes table...');
    
    // Test direct query
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error querying quotes:', error);
      return;
    }

    console.log('✅ Successfully queried quotes table!');
    console.log(`📊 Found ${data.length} quotes:`);
    data.forEach(quote => {
      console.log(`   - ${quote.quote_number}: $${quote.total_amount} (${quote.status})`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testQuotesTable(); 