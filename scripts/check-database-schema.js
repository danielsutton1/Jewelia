#!/usr/bin/env node

/**
 * Check Database Schema Script
 * This script checks what columns actually exist in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Check if products table exists
    console.log('📊 Checking products table...');
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (productsError) {
        console.log('❌ Products table error:', productsError.message);
      } else {
        console.log('✅ Products table exists');
        if (products && products.length > 0) {
          console.log('📋 Existing columns:', Object.keys(products[0]));
          console.log('📊 Sample row:', products[0]);
        } else {
          console.log('📋 Table exists but is empty');
        }
      }
    } catch (error) {
      console.log('❌ Could not check products table:', error.message);
    }
    
    // Check if inventory table exists
    console.log('\n📊 Checking inventory table...');
    try {
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .limit(1);
      
      if (inventoryError) {
        console.log('❌ Inventory table error:', inventoryError.message);
      } else {
        console.log('✅ Inventory table exists');
        if (inventory && inventory.length > 0) {
          console.log('📋 Existing columns:', Object.keys(inventory[0]));
        } else {
          console.log('📋 Table exists but is empty');
        }
      }
    } catch (error) {
      console.log('❌ Could not check inventory table:', error.message);
    }
    
    // Try to create a simple product to see what happens
    console.log('\n🧪 Testing product creation...');
    try {
      const { data: testProduct, error: testError } = await supabase
        .from('products')
        .insert({
          name: 'Test Product',
          sku: 'TEST-001',
          price: 100.00,
          stock_quantity: 10
        })
        .select();
      
      if (testError) {
        console.log('❌ Product creation failed:', testError.message);
        
        // Try without stock_quantity
        console.log('🔄 Trying without stock_quantity...');
        const { data: testProduct2, error: testError2 } = await supabase
          .from('products')
          .insert({
            name: 'Test Product 2',
            sku: 'TEST-002',
            price: 100.00
          })
          .select();
        
        if (testError2) {
          console.log('❌ Still failed:', testError2.message);
        } else {
          console.log('✅ Product created without stock_quantity');
        }
      } else {
        console.log('✅ Test product created successfully');
        console.log('   Product:', testProduct[0]);
      }
    } catch (error) {
      console.log('❌ Product creation test failed:', error.message);
    }
    
    console.log('\n🎯 Schema check completed!');
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  }
}

// Run the check
checkDatabaseSchema().catch(console.error);
