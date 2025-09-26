const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testProductsTable() {
  try {
    console.log('Testing products table...');
    
    // Test 1: Check if table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ Table check error:', tableError);
      return;
    }
    
    console.log('✅ Products table exists');
    console.log('📊 Total products:', tableCheck);
    
    // Test 2: Try to get first few products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (productsError) {
      console.error('❌ Products query error:', productsError);
      return;
    }
    
    console.log('✅ Products query successful');
    console.log('📦 Products found:', products.length);
    console.log('🔍 First product:', products[0]);
    
    // Test 3: Check column names
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log('📋 Available columns:', Object.keys(firstProduct));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProductsTable(); 