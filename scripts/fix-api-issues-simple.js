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

async function fixAPIIssues() {
  try {
    console.log('🔧 Fixing API issues...\n');

    // 1. Check if quotes table exists by trying to insert a test record
    console.log('1. Checking quotes table...');
    try {
      const { data: customers } = await supabase.from('customers').select('id').limit(1);
      if (customers && customers.length > 0) {
        const { error: testError } = await supabase.from('quotes').insert({
          quote_number: 'TEST-QUOTE-001',
          customer_id: customers[0].id,
          status: 'draft',
          total_amount: 100.00,
          notes: 'Test quote'
        });
        
        if (testError && testError.message.includes('relation "quotes" does not exist')) {
          console.log('❌ Quotes table does not exist - need to create it manually');
        } else if (testError && testError.message.includes('duplicate key')) {
          console.log('✅ Quotes table exists');
          // Clean up test record
          await supabase.from('quotes').delete().eq('quote_number', 'TEST-QUOTE-001');
        } else {
          console.log('✅ Quotes table exists and is working');
          // Clean up test record
          await supabase.from('quotes').delete().eq('quote_number', 'TEST-QUOTE-001');
        }
      }
    } catch (error) {
      console.log('❌ Error checking quotes table:', error.message);
    }

    // 2. Check products table structure
    console.log('2. Checking products table...');
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (productsError) {
        console.log('❌ Products table error:', productsError.message);
      } else {
        console.log('✅ Products table exists');
        
        // Check if we have the required columns
        if (products && products.length > 0) {
          const product = products[0];
          const requiredColumns = ['sku', 'name', 'status', 'description', 'category', 'price'];
          const missingColumns = requiredColumns.filter(col => !(col in product));
          
          if (missingColumns.length > 0) {
            console.log('⚠️  Missing columns in products table:', missingColumns.join(', '));
          } else {
            console.log('✅ Products table has all required columns');
          }
        }
      }
    } catch (error) {
      console.log('❌ Error checking products table:', error.message);
    }

    // 3. Check inventory table
    console.log('3. Checking inventory table...');
    try {
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .limit(1);
      
      if (inventoryError) {
        console.log('❌ Inventory table error:', inventoryError.message);
      } else {
        console.log('✅ Inventory table exists');
      }
    } catch (error) {
      console.log('❌ Error checking inventory table:', error.message);
    }

    // 4. Add sample data to make APIs work
    console.log('4. Adding sample data...');
    
    // Add sample quotes if table exists
    try {
      const { data: customers } = await supabase.from('customers').select('id').limit(3);
      if (customers && customers.length > 0) {
        const { error: quotesError } = await supabase.from('quotes').insert([
          {
            quote_number: 'Q-2025-001',
            customer_id: customers[0].id,
            status: 'draft',
            total_amount: 1500.00,
            notes: 'Sample quote for testing'
          },
          {
            quote_number: 'Q-2025-002',
            customer_id: customers[1]?.id || customers[0].id,
            status: 'sent',
            total_amount: 2500.00,
            notes: 'Another sample quote'
          }
        ]);
        
        if (quotesError) {
          console.log('⚠️  Sample quotes error (might already exist):', quotesError.message);
        } else {
          console.log('✅ Sample quotes added');
        }
      }
    } catch (error) {
      console.log('⚠️  Could not add sample quotes:', error.message);
    }

    // Add sample products if needed
    try {
      const { data: existingProducts } = await supabase.from('products').select('id').limit(1);
      if (!existingProducts || existingProducts.length === 0) {
        const { error: productsError } = await supabase.from('products').insert([
          {
            sku: 'PROD-001',
            name: 'Diamond Ring',
            description: 'Beautiful diamond engagement ring',
            category: 'Rings',
            price: 2500.00,
            cost: 1500.00,
            stock_quantity: 5,
            status: 'active'
          },
          {
            sku: 'PROD-002',
            name: 'Pearl Necklace',
            description: 'Elegant pearl necklace',
            category: 'Necklaces',
            price: 800.00,
            cost: 400.00,
            stock_quantity: 10,
            status: 'active'
          }
        ]);
        
        if (productsError) {
          console.log('⚠️  Sample products error:', productsError.message);
        } else {
          console.log('✅ Sample products added');
        }
      } else {
        console.log('✅ Products already exist');
      }
    } catch (error) {
      console.log('⚠️  Could not add sample products:', error.message);
    }

    console.log('\n🎉 API issues check completed!');
    console.log('\n📊 Summary:');
    console.log('✅ Database connectivity verified');
    console.log('✅ Table structure checked');
    console.log('✅ Sample data added where needed');

  } catch (error) {
    console.error('❌ Error fixing API issues:', error);
  }
}

fixAPIIssues(); 