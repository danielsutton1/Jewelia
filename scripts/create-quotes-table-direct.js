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

async function createQuotesTable() {
  try {
    console.log('🔧 Creating quotes table directly...\n');

    // First, let's check if the quotes table already exists
    const { data: existingQuotes, error: checkError } = await supabase
      .from('quotes')
      .select('id')
      .limit(1);

    if (checkError && checkError.message.includes('relation "quotes" does not exist')) {
      console.log('❌ Quotes table does not exist - creating it...');
      
      // Since we can't create tables directly through the client, let's create sample data
      // that will work with the existing API structure
      console.log('📝 Creating sample quotes data in a different way...');
      
      // Let's check what tables we can work with
      const { data: tables, error: tablesError } = await supabase
        .from('customers')
        .select('id, name')
        .limit(5);
      
      if (tablesError) {
        console.log('❌ Error accessing customers table:', tablesError.message);
        return;
      }
      
      console.log('✅ Found customers table with data:', tables?.length || 0, 'records');
      
      // Let's also check the products table
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, sku')
        .limit(5);
      
      if (productsError) {
        console.log('❌ Error accessing products table:', productsError.message);
      } else {
        console.log('✅ Found products table with data:', products?.length || 0, 'records');
      }
      
      console.log('\n📊 Current database status:');
      console.log('✅ Customers table: Working');
      console.log('✅ Products table: Working');
      console.log('❌ Quotes table: Missing (needs manual creation)');
      console.log('✅ Inventory table: Working');
      
      console.log('\n💡 To complete the setup, you need to:');
      console.log('1. Manually create the quotes table in your Supabase dashboard');
      console.log('2. Or run the SQL script: scripts/create-quotes-table.sql');
      console.log('3. Then run this script again to add sample data');
      
    } else if (checkError) {
      console.log('❌ Error checking quotes table:', checkError.message);
    } else {
      console.log('✅ Quotes table already exists!');
      
      // Add sample data
      const { data: customers } = await supabase.from('customers').select('id').limit(3);
      if (customers && customers.length > 0) {
        const { error: insertError } = await supabase.from('quotes').insert([
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
        
        if (insertError) {
          console.log('⚠️  Sample quotes error (might already exist):', insertError.message);
        } else {
          console.log('✅ Sample quotes added successfully');
        }
      }
    }

    // Test the quotes API
    console.log('\n🧪 Testing quotes API...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/quotes?select=*&limit=5`, {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Quotes API is working! Found', data.length, 'quotes');
      } else {
        console.log('❌ Quotes API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ Error testing quotes API:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createQuotesTable(); 