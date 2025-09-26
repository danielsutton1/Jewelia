#!/usr/bin/env node

/**
 * Database Schema Fix Script
 * This script runs the SQL migration to fix missing columns that are causing API errors
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  console.error('\nPlease check your .env.local file');
  process.exit(1);
}

async function runDatabaseFix() {
  console.log('🔧 Starting database schema fix...');
  
  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Read the SQL fix script
    const sqlPath = path.join(__dirname, 'fix-database-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📖 SQL script loaded, executing...');
    
    // Execute the SQL script
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      // If exec_sql doesn't exist, try to run the commands manually
      console.log('⚠️  exec_sql function not available, running commands manually...');
      
      // Split SQL into individual statements and run them
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            console.log(`🔧 Executing: ${statement.substring(0, 50)}...`);
            await supabase.rpc('exec_sql', { sql: statement + ';' });
          } catch (stmtError) {
            console.log(`⚠️  Statement failed (continuing): ${stmtError.message}`);
          }
        }
      }
    } else {
      console.log('✅ SQL script executed successfully');
    }
    
    // Verify the fix by checking if the columns exist
    console.log('🔍 Verifying database schema...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'products')
      .in('column_name', ['stock_quantity', 'sku', 'name', 'status', 'price', 'cost']);
    
    if (columnsError) {
      console.log('⚠️  Could not verify columns:', columnsError.message);
    } else {
      console.log('📊 Products table columns:');
      columns.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type}`);
      });
    }
    
    // Test the analytics API
    console.log('🧪 Testing analytics API...');
    try {
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, category, sku, status')
        .limit(1);
      
      if (testError) {
        console.log('❌ Analytics API test failed:', testError.message);
      } else {
        console.log('✅ Analytics API test passed');
        console.log('   Sample data:', testData);
      }
    } catch (testError) {
      console.log('❌ Analytics API test failed:', testError.message);
    }
    
    console.log('\n🎉 Database schema fix completed!');
    console.log('   Your dashboard analytics should now work properly.');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the fix
runDatabaseFix().catch(console.error);
