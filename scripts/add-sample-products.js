#!/usr/bin/env node

/**
 * Add Sample Products Script
 * This script adds sample product data to test the analytics API
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

async function addSampleProducts() {
  console.log('📝 Adding sample products for analytics testing...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const sampleProducts = [
      {
        name: 'Diamond Ring - Classic',
        sku: 'DR-CLASSIC-001',
        description: 'Beautiful classic diamond ring with 1.5 carat center stone',
        category: 'Rings',
        price: 2999.99,
        cost: 1500.00,
        stock_quantity: 5,
        status: 'active'
      },
      {
        name: 'Gold Necklace - Delicate',
        sku: 'GN-DELICATE-001',
        description: 'Elegant 18k gold necklace with delicate chain',
        category: 'Necklaces',
        price: 899.99,
        cost: 450.00,
        stock_quantity: 12,
        status: 'active'
      },
      {
        name: 'Sapphire Earrings - Stud',
        sku: 'SE-STUD-001',
        description: 'Stunning sapphire stud earrings in white gold setting',
        category: 'Earrings',
        price: 599.99,
        cost: 300.00,
        stock_quantity: 8,
        status: 'active'
      },
      {
        name: 'Pearl Bracelet - Elegant',
        sku: 'PB-ELEGANT-001',
        description: 'Sophisticated freshwater pearl bracelet with gold clasp',
        category: 'Bracelets',
        price: 399.99,
        cost: 200.00,
        stock_quantity: 15,
        status: 'active'
      },
      {
        name: 'Emerald Pendant - Vintage',
        sku: 'EP-VINTAGE-001',
        description: 'Vintage-style emerald pendant in rose gold setting',
        category: 'Pendants',
        price: 799.99,
        cost: 400.00,
        stock_quantity: 3,
        status: 'active'
      }
    ];
    
    console.log('🔧 Inserting sample products...');
    const { data, error } = await supabase
      .from('products')
      .insert(sampleProducts)
      .select();
    
    if (error) {
      console.error('❌ Failed to insert sample products:', error.message);
    } else {
      console.log('✅ Successfully added sample products:');
      data.forEach(product => {
        console.log(`   - ${product.name} (${product.sku}): $${product.price} - Stock: ${product.stock_quantity}`);
      });
    }
    
    // Test the analytics API
    console.log('\n🧪 Testing analytics API with new data...');
    try {
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, category, sku, status')
        .limit(3);
      
      if (testError) {
        console.log('❌ Analytics API test failed:', testError.message);
      } else {
        console.log('✅ Analytics API test passed!');
        console.log('   Products found:', testData.length);
        console.log('   Sample data:', testData[0]);
      }
    } catch (testError) {
      console.log('❌ Analytics API test failed:', testError.message);
    }
    
    console.log('\n🎉 Sample products added successfully!');
    console.log('   Your dashboard analytics should now display real data.');
    
  } catch (error) {
    console.error('❌ Failed to add sample products:', error.message);
  }
}

// Run the script
addSampleProducts().catch(console.error); 