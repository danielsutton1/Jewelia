const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDatabaseTables() {
  try {
    console.log('🔍 Testing database tables...\n');

    // Test quotes table
    console.log('1. Testing quotes table...');
    try {
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .limit(1);
      
      if (quotesError) {
        console.log('❌ Quotes table error:', quotesError.message);
      } else {
        console.log('✅ Quotes table exists and accessible');
        console.log('   Found', quotes?.length || 0, 'quotes');
      }
    } catch (error) {
      console.log('❌ Quotes table error:', error.message);
    }

    // Test order_items table
    console.log('\n2. Testing order_items table...');
    try {
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('*')
        .limit(1);
      
      if (orderItemsError) {
        console.log('❌ Order items table error:', orderItemsError.message);
      } else {
        console.log('✅ Order items table exists and accessible');
        console.log('   Found', orderItems?.length || 0, 'order items');
      }
    } catch (error) {
      console.log('❌ Order items table error:', error.message);
    }

    // Test orders table with join
    console.log('\n3. Testing orders table with join...');
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          items:order_items(*)
        `)
        .limit(1);
      
      if (ordersError) {
        console.log('❌ Orders table join error:', ordersError.message);
      } else {
        console.log('✅ Orders table with join works');
        console.log('   Found', orders?.length || 0, 'orders');
      }
    } catch (error) {
      console.log('❌ Orders table join error:', error.message);
    }

    // Test products table
    console.log('\n4. Testing products table...');
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (productsError) {
        console.log('❌ Products table error:', productsError.message);
      } else {
        console.log('✅ Products table exists and accessible');
        console.log('   Found', products?.length || 0, 'products');
      }
    } catch (error) {
      console.log('❌ Products table error:', error.message);
    }

    // Test customers table
    console.log('\n5. Testing customers table...');
    try {
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .limit(1);
      
      if (customersError) {
        console.log('❌ Customers table error:', customersError.message);
      } else {
        console.log('✅ Customers table exists and accessible');
        console.log('   Found', customers?.length || 0, 'customers');
      }
    } catch (error) {
      console.log('❌ Customers table error:', error.message);
    }

    console.log('\n🎉 Database table testing completed!');

  } catch (error) {
    console.error('❌ Error testing database tables:', error);
  }
}

testDatabaseTables(); 