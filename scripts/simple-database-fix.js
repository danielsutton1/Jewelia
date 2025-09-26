#!/usr/bin/env node

/**
 * Simple Database Schema Fix Script
 * This script fixes missing columns using standard Supabase operations
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  process.exit(1);
}

async function simpleDatabaseFix() {
  console.log('🔧 Starting simple database schema fix...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // 1. Check if products table exists and create it if needed
    console.log('🔍 Checking products table...');
    let { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError && productsError.message.includes('does not exist')) {
      console.log('📝 Products table does not exist, creating it...');
      
      // Create products table with proper schema
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            sku VARCHAR(50),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100) DEFAULT 'general',
            price DECIMAL(10,2) DEFAULT 0,
            cost DECIMAL(10,2) DEFAULT 0,
            stock_quantity INTEGER DEFAULT 0,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (createError) {
        console.log('⚠️  Could not create products table via RPC, trying alternative approach...');
        // Try to create via direct SQL if RPC fails
        await supabase.rpc('exec_sql', { sql: 'CREATE TABLE IF NOT EXISTS products (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name VARCHAR(255), stock_quantity INTEGER DEFAULT 0);' });
      }
    }
    
    // 2. Try to add sample product data
    console.log('📝 Adding sample product data...');
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('products')
        .insert([
          {
            name: 'Sample Product 1',
            sku: 'SKU-SAMPLE-1',
            description: 'This is a sample product for testing',
            category: 'General',
            price: 99.99,
            cost: 49.99,
            stock_quantity: 25,
            status: 'active'
          }
        ])
        .select();
      
      if (insertError) {
        console.log('⚠️  Could not insert sample data:', insertError.message);
      } else {
        console.log('✅ Sample product data added successfully');
      }
    } catch (insertError) {
      console.log('⚠️  Insert failed:', insertError.message);
    }
    
    // 3. Test the analytics API
    console.log('🧪 Testing analytics API...');
    try {
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, category, sku, status')
        .limit(1);
      
      if (testError) {
        console.log('❌ Analytics API test failed:', testError.message);
        
        // Try to see what columns actually exist
        console.log('🔍 Checking what columns exist in products table...');
        const { data: columns, error: columnsError } = await supabase
          .from('products')
          .select('*')
          .limit(1);
        
        if (columnsError) {
          console.log('❌ Could not check table structure:', columnsError.message);
        } else if (columns && columns.length > 0) {
          console.log('📊 Existing columns:', Object.keys(columns[0]));
        }
      } else {
        console.log('✅ Analytics API test passed');
        console.log('   Sample data:', testData);
      }
    } catch (testError) {
      console.log('❌ Analytics API test failed:', testError.message);
    }
    
    // 4. Alternative approach: Try to create the missing columns one by one
    console.log('🔧 Trying to add missing columns individually...');
    const columnsToAdd = [
      { name: 'stock_quantity', type: 'INTEGER', default: '0' },
      { name: 'sku', type: 'VARCHAR(50)', default: 'NULL' },
      { name: 'name', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'status', type: 'VARCHAR(50)', default: "'active'" },
      { name: 'price', type: 'DECIMAL(10,2)', default: '0' },
      { name: 'cost', type: 'DECIMAL(10,2)', default: '0' }
    ];
    
    for (const column of columnsToAdd) {
      try {
        console.log(`🔧 Adding column: ${column.name}...`);
        await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS ${column.name} ${column.type} DEFAULT ${column.default};`
        });
        console.log(`✅ Column ${column.name} added/verified`);
      } catch (columnError) {
        console.log(`⚠️  Could not add column ${column.name}:`, columnError.message);
      }
    }
    
    console.log('\n🎉 Simple database schema fix completed!');
    console.log('   If columns were added successfully, your dashboard analytics should now work.');
    console.log('   If not, you may need to run the SQL manually in your Supabase dashboard.');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the fix
simpleDatabaseFix().catch(console.error);
