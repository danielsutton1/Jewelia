const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTables() {
  try {
    console.log('Testing database tables...\n');

    // Test products table
    console.log('1. Testing products table:');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError) {
      console.log('❌ Products table error:', productsError.message);
    } else {
      console.log('✅ Products table works!');
      console.log('   Sample data:', products?.length || 0, 'records');
    }

    // Test inventory table
    console.log('\n2. Testing inventory table:');
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .limit(1);
    
    if (inventoryError) {
      console.log('❌ Inventory table error:', inventoryError.message);
    } else {
      console.log('✅ Inventory table works!');
      console.log('   Sample data:', inventory?.length || 0, 'records');
    }

    // Test quotes table
    console.log('\n3. Testing quotes table:');
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .limit(1);
    
    if (quotesError) {
      console.log('❌ Quotes table error:', quotesError.message);
    } else {
      console.log('✅ Quotes table works!');
      console.log('   Sample data:', quotes?.length || 0, 'records');
    }

    // List all tables
    console.log('\n4. Listing all tables:');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tablesError) {
      console.log('❌ Error listing tables:', tablesError.message);
    } else {
      console.log('✅ Available tables:');
      tables?.forEach(table => {
        console.log('   -', table.table_name);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTables(); 