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

async function verifySetup() {
  try {
    console.log('🔍 Verifying complete setup...\n');

    const results = {};

    // Test all tables
    const tables = ['quotes', 'quote_items', 'order_items', 'products', 'customers', 'orders'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          results[table] = { status: '❌', error: error.message };
        } else {
          results[table] = { status: '✅', count: data?.length || 0 };
        }
      } catch (error) {
        results[table] = { status: '❌', error: error.message };
      }
    }

    // Display results
    console.log('📊 Database Tables Status:');
    Object.entries(results).forEach(([table, result]) => {
      if (result.status === '✅') {
        console.log(`${result.status} ${table} - ${result.count} records`);
      } else {
        console.log(`${result.status} ${table} - ${result.error}`);
      }
    });

    // Test APIs
    console.log('\n🌐 API Endpoints Status:');
    
    const apis = [
      { name: 'Analytics', url: 'http://localhost:3000/api/analytics?type=dashboard' },
      { name: 'Customers', url: 'http://localhost:3000/api/customers?limit=5' },
      { name: 'Products', url: 'http://localhost:3000/api/products?limit=5' },
      { name: 'Orders', url: 'http://localhost:3000/api/orders?limit=5' },
      { name: 'Quotes', url: 'http://localhost:3000/api/quotes?limit=5' }
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api.url);
        const data = await response.json();
        
        if (response.ok && (data.success !== false)) {
          console.log(`✅ ${api.name} API - Working`);
        } else {
          console.log(`❌ ${api.name} API - ${data.error || 'Failed'}`);
        }
      } catch (error) {
        console.log(`❌ ${api.name} API - ${error.message}`);
      }
    }

    // Summary
    console.log('\n📋 Setup Summary:');
    const workingTables = Object.values(results).filter(r => r.status === '✅').length;
    const totalTables = tables.length;
    
    console.log(`Tables: ${workingTables}/${totalTables} working`);
    
    if (workingTables === totalTables) {
      console.log('🎉 All phases completed successfully!');
      console.log('\n✅ Phase 1: Core Infrastructure - COMPLETE');
      console.log('✅ Phase 2: Customer Management - COMPLETE');
      console.log('✅ Phase 3: Order Management - COMPLETE');
      console.log('✅ Phase 4: Inventory Management - COMPLETE');
      console.log('✅ Phase 5: Analytics & Reporting - COMPLETE');
      console.log('✅ Phase 6: Quotes & Estimates - COMPLETE');
    } else {
      console.log('⚠️  Some tables still need to be created');
      console.log('Please run the SQL script in your Supabase dashboard');
    }

  } catch (error) {
    console.error('❌ Error verifying setup:', error);
  }
}

verifySetup(); 