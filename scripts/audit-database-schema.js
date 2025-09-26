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

async function auditDatabaseSchema() {
  try {
    console.log('🔍 COMPREHENSIVE DATABASE AUDIT\n');
    console.log('=' .repeat(60));

    // 1. Test each table individually to see what exists
    console.log('\n📊 1. EXISTING TABLES ANALYSIS');
    console.log('-'.repeat(40));
    
    const criticalTables = [
      'quotes', 'quote_items', 'order_items', 'products', 'customers', 
      'orders', 'inventory', 'users', 'audit_logs', 'asset_locations',
      'asset_movements', 'asset_assignments', 'material_categories',
      'material_types', 'material_suppliers', 'materials', 'cad_files',
      'accounts_payable', 'accounts_receivable', 'vendors', 'locations',
      'consignors', 'consigned_items', 'diamonds', 'repairs',
      'trade_ins', 'trade_in_items', 'organizations', 'organization_members'
    ];

    const existingTables = [];
    const missingTables = [];

    for (const tableName of criticalTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          if (error.message.includes('does not exist') || error.message.includes('relation')) {
            missingTables.push(tableName);
          } else {
            // Table exists but has other issues
            existingTables.push({ name: tableName, error: error.message });
          }
        } else {
          existingTables.push({ name: tableName, accessible: true });
        }
      } catch (error) {
        missingTables.push(tableName);
      }
    }

    console.log(`✅ Found ${existingTables.length} accessible tables:`);
    existingTables.forEach(table => {
      if (table.accessible) {
        console.log(`   - ${table.name}`);
      } else {
        console.log(`   - ${table.name} (⚠️ ${table.error})`);
      }
    });

    console.log(`\n❌ Missing ${missingTables.length} tables:`);
    missingTables.forEach(table => {
      console.log(`   - ${table}`);
    });

    // 2. Analyze existing table schemas
    console.log('\n📋 2. TABLE SCHEMA ANALYSIS');
    console.log('-'.repeat(40));

    for (const table of existingTables.filter(t => t.accessible)) {
      const tableName = table.name;
      
      try {
        // Get sample data to understand structure
        const { data: sampleData, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (sampleError) {
          console.log(`❌ Error accessing ${tableName}: ${sampleError.message}`);
          continue;
        }

        if (sampleData && sampleData.length > 0) {
          const columns = Object.keys(sampleData[0]);
          console.log(`\n📄 ${tableName.toUpperCase()}:`);
          console.log(`   Columns (${columns.length}):`);
          columns.forEach(col => {
            const value = sampleData[0][col];
            const type = value === null ? 'NULL' : typeof value;
            console.log(`     - ${col}: ${type}${value === null ? '' : ` (${JSON.stringify(value).substring(0, 50)})`}`);
          });
        } else {
          console.log(`\n📄 ${tableName.toUpperCase()}: Empty table`);
        }

        // Count records
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!countError) {
          console.log(`   Records: ${count}`);
        }

      } catch (error) {
        console.log(`❌ Error analyzing ${tableName}: ${error.message}`);
      }
    }

    // 3. Check API functionality
    console.log('\n🔌 3. API FUNCTIONALITY ANALYSIS');
    console.log('-'.repeat(40));

    const apiEndpoints = [
      { name: 'Analytics', path: '/api/analytics' },
      { name: 'Customers', path: '/api/customers' },
      { name: 'Products', path: '/api/products' },
      { name: 'Orders', path: '/api/orders' },
      { name: 'Quotes', path: '/api/quotes' },
      { name: 'Inventory', path: '/api/inventory' }
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(`http://localhost:3000${endpoint.path}?limit=1`);
        const data = await response.json();
        
        if (response.ok) {
          console.log(`✅ ${endpoint.name} API: Working`);
        } else {
          console.log(`❌ ${endpoint.name} API: ${response.status} - ${data.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name} API: Connection failed - ${error.message}`);
      }
    }

    // 4. Business Logic Analysis
    console.log('\n🏢 4. BUSINESS LOGIC ANALYSIS');
    console.log('-'.repeat(40));

    const businessModules = {
      'Customer Management': ['customers'],
      'Order Processing': ['orders', 'order_items'],
      'Product Management': ['products'],
      'Inventory Management': ['inventory'],
      'Quote System': ['quotes', 'quote_items'],
      'Asset Tracking': ['asset_locations', 'asset_movements', 'asset_assignments'],
      'Materials Management': ['material_categories', 'material_types', 'material_suppliers', 'materials'],
      'CAD Files': ['cad_files'],
      'Financial Management': ['accounts_payable', 'accounts_receivable'],
      'Trade-ins': ['trade_ins', 'trade_in_items'],
      'Consignment': ['consignors', 'consigned_items'],
      'Repairs': ['repairs'],
      'User Management': ['users', 'organizations', 'organization_members']
    };

    Object.entries(businessModules).forEach(([module, requiredTables]) => {
      const existingCount = requiredTables.filter(table => 
        existingTables.some(t => t.name === table && t.accessible)
      ).length;
      const missingCount = requiredTables.length - existingCount;
      
      if (missingCount === 0) {
        console.log(`✅ ${module}: Complete (${existingCount}/${requiredTables.length})`);
      } else if (existingCount > 0) {
        console.log(`🟡 ${module}: Partial (${existingCount}/${requiredTables.length})`);
      } else {
        console.log(`❌ ${module}: Missing (${existingCount}/${requiredTables.length})`);
      }
    });

    // 5. Recommendations
    console.log('\n🎯 5. RECOMMENDATIONS');
    console.log('-'.repeat(40));

    if (missingTables.length > 0) {
      console.log('🔧 IMMEDIATE ACTIONS NEEDED:');
      console.log('   1. Create missing critical tables:');
      missingTables.slice(0, 5).forEach(table => {
        console.log(`      - ${table}`);
      });
      if (missingTables.length > 5) {
        console.log(`      ... and ${missingTables.length - 5} more`);
      }
    }

    const partialModules = Object.entries(businessModules).filter(([module, requiredTables]) => {
      const existingCount = requiredTables.filter(table => 
        existingTables.some(t => t.name === table && t.accessible)
      ).length;
      return existingCount > 0 && existingCount < requiredTables.length;
    });

    if (partialModules.length > 0) {
      console.log('\n🟡 PARTIALLY IMPLEMENTED MODULES:');
      partialModules.forEach(([module, requiredTables]) => {
        const existingCount = requiredTables.filter(table => 
          existingTables.some(t => t.name === table && t.accessible)
        ).length;
        console.log(`   - ${module}: ${existingCount}/${requiredTables.length} tables exist`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 DATABASE AUDIT COMPLETE');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Database audit failed:', error);
  }
}

auditDatabaseSchema(); 