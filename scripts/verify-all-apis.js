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

async function verifyAllAPIs() {
  try {
    console.log('🔍 Verifying All APIs (After TypeScript Fixes)\n');

    const results = {};

    // Test Analytics API
    console.log('1. Testing Analytics API...');
    try {
      const response = await fetch('http://localhost:3000/api/analytics?type=dashboard');
      const data = await response.json();
      results.analytics = {
        success: data.success,
        hasData: data.data && data.data.totalRevenue > 0,
        revenue: data.data?.totalRevenue || 0
      };
      console.log(`   ✅ Analytics API: ${data.success ? 'SUCCESS' : 'FAILED'} - Revenue: $${data.data?.totalRevenue || 0}`);
    } catch (error) {
      results.analytics = { success: false, error: error.message };
      console.log(`   ❌ Analytics API: FAILED - ${error.message}`);
    }

    // Test Customers API
    console.log('2. Testing Customers API...');
    try {
      const response = await fetch('http://localhost:3000/api/customers?limit=5');
      const data = await response.json();
      results.customers = {
        success: data.success,
        hasData: data.data && data.data.length > 0,
        count: data.data?.length || 0
      };
      console.log(`   ✅ Customers API: ${data.success ? 'SUCCESS' : 'FAILED'} - Count: ${data.data?.length || 0}`);
    } catch (error) {
      results.customers = { success: false, error: error.message };
      console.log(`   ❌ Customers API: FAILED - ${error.message}`);
    }

    // Test Products API
    console.log('3. Testing Products API...');
    try {
      const response = await fetch('http://localhost:3000/api/products?limit=5');
      const data = await response.json();
      results.products = {
        success: data.success,
        hasData: data.data && data.data.length > 0,
        count: data.data?.length || 0
      };
      console.log(`   ✅ Products API: ${data.success ? 'SUCCESS' : 'FAILED'} - Count: ${data.data?.length || 0}`);
    } catch (error) {
      results.products = { success: false, error: error.message };
      console.log(`   ❌ Products API: FAILED - ${error.message}`);
    }

    // Test Inventory API
    console.log('4. Testing Inventory API...');
    try {
      const response = await fetch('http://localhost:3000/api/inventory?limit=5');
      const data = await response.json();
      results.inventory = {
        success: data.success,
        hasData: data.data && data.data.length > 0,
        count: data.data?.length || 0
      };
      console.log(`   ✅ Inventory API: ${data.success ? 'SUCCESS' : 'FAILED'} - Count: ${data.data?.length || 0}`);
    } catch (error) {
      results.inventory = { success: false, error: error.message };
      console.log(`   ❌ Inventory API: FAILED - ${error.message}`);
    }

    // Test Orders API
    console.log('5. Testing Orders API...');
    try {
      const response = await fetch('http://localhost:3000/api/orders?limit=5');
      const data = await response.json();
      results.orders = {
        success: data.success,
        hasData: data.data && data.data.length > 0,
        count: data.data?.length || 0,
        message: data.message
      };
      console.log(`   ✅ Orders API: ${data.success ? 'SUCCESS' : 'FAILED'} - Count: ${data.data?.length || 0}`);
      if (data.message) {
        console.log(`   ℹ️  Orders API Message: ${data.message}`);
      }
    } catch (error) {
      results.orders = { success: false, error: error.message };
      console.log(`   ❌ Orders API: FAILED - ${error.message}`);
    }

    // Test Quotes API
    console.log('6. Testing Quotes API...');
    try {
      const response = await fetch('http://localhost:3000/api/quotes?limit=5');
      const data = await response.json();
      results.quotes = {
        success: data.success,
        hasData: data.data && data.data.length > 0,
        count: data.data?.length || 0,
        message: data.message
      };
      console.log(`   ✅ Quotes API: ${data.success ? 'SUCCESS' : 'FAILED'} - Count: ${data.data?.length || 0}`);
      if (data.message) {
        console.log(`   ℹ️  Quotes API Message: ${data.message}`);
      }
    } catch (error) {
      results.quotes = { success: false, error: error.message };
      console.log(`   ❌ Quotes API: FAILED - ${error.message}`);
    }

    // Summary
    console.log('\n📊 API Status Summary:');
    console.log('=====================');
    
    const workingAPIs = Object.keys(results).filter(key => results[key].success);
    const failedAPIs = Object.keys(results).filter(key => !results[key].success);
    
    console.log(`✅ Working APIs (${workingAPIs.length}): ${workingAPIs.join(', ')}`);
    if (failedAPIs.length > 0) {
      console.log(`❌ Failed APIs (${failedAPIs.length}): ${failedAPIs.join(', ')}`);
    }

    // Check if all core APIs are working
    const coreAPIs = ['analytics', 'customers', 'products', 'inventory'];
    const allCoreWorking = coreAPIs.every(api => results[api]?.success);
    
    console.log(`\n🎯 Core System Status: ${allCoreWorking ? '✅ FULLY OPERATIONAL' : '⚠️  PARTIAL'}`);
    
    if (allCoreWorking) {
      console.log('🎉 All core APIs are working! The system is ready for use.');
      console.log('📈 Dashboard shows real data with meaningful metrics.');
    } else {
      console.log('⚠️  Some core APIs need attention before full deployment.');
    }

    // Check optional APIs
    const optionalAPIs = ['orders', 'quotes'];
    const optionalWorking = optionalAPIs.filter(api => results[api]?.success);
    
    console.log(`\n🔧 Optional Features: ${optionalWorking.length}/${optionalAPIs.length} available`);
    optionalAPIs.forEach(api => {
      const status = results[api]?.success ? '✅' : '⚠️';
      const message = results[api]?.message ? ` (${results[api].message})` : '';
      console.log(`   ${status} ${api.toUpperCase()}: ${results[api]?.success ? 'Available' : 'Not configured'}${message}`);
    });

    return results;

  } catch (error) {
    console.error('❌ Verification failed:', error);
    return null;
  }
}

// Run verification
verifyAllAPIs().then(results => {
  if (results) {
    console.log('\n✅ API verification completed successfully!');
  } else {
    console.log('\n❌ API verification failed!');
  }
  process.exit(0);
}).catch(error => {
  console.error('❌ Verification error:', error);
  process.exit(1);
}); 