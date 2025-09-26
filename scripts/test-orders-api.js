#!/usr/bin/env node

/**
 * Test script for Orders API endpoints
 * Run with: node scripts/test-orders-api.js
 */

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing Orders API endpoints...\n');

  try {
    // Test 1: GET /api/orders (should return 200 OK)
    console.log('1️⃣ Testing GET /api/orders...');
    const getResponse = await fetch(`${BASE_URL}/orders`);
    console.log(`   Status: ${getResponse.status} ${getResponse.statusText}`);
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log(`   ✅ Success! Found ${data.data?.length || 0} orders`);
      console.log(`   Meta:`, data.meta);
    } else {
      const error = await getResponse.text();
      console.log(`   ❌ Error: ${error}`);
    }

    // Test 2: GET /api/orders with filters
    console.log('\n2️⃣ Testing GET /api/orders with filters...');
    const filteredResponse = await fetch(`${BASE_URL}/orders?limit=5&status=pending`);
    console.log(`   Status: ${filteredResponse.status} ${filteredResponse.statusText}`);
    
    if (filteredResponse.ok) {
      const data = await filteredResponse.json();
      console.log(`   ✅ Success! Found ${data.data?.length || 0} pending orders`);
    } else {
      const error = await filteredResponse.text();
      console.log(`   ❌ Error: ${error}`);
    }

    // Test 3: POST /api/orders (create new order)
    console.log('\n3️⃣ Testing POST /api/orders...');
    const testOrder = {
      customer_id: '00000000-0000-0000-0000-000000000001', // Test customer ID
      items: [
        {
          inventory_id: '00000000-0000-0000-0000-000000000001', // Test inventory ID
          quantity: 1,
          unit_price: 100.00
        }
      ],
      notes: 'Test order from API script',
      payment_status: 'pending'
    };

    const postResponse = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder)
    });

    console.log(`   Status: ${postResponse.status} ${postResponse.statusText}`);
    
    if (postResponse.ok) {
      const data = await postResponse.json();
      console.log(`   ✅ Success! Created order: ${data.data?.id}`);
      
      // Test 4: GET specific order
      console.log('\n4️⃣ Testing GET /api/orders/[orderId]...');
      const orderId = data.data.id;
      const getOrderResponse = await fetch(`${BASE_URL}/orders/${orderId}`);
      console.log(`   Status: ${getOrderResponse.status} ${getOrderResponse.statusText}`);
      
      if (getOrderResponse.ok) {
        const orderData = await getOrderResponse.json();
        console.log(`   ✅ Success! Retrieved order: ${orderData.data?.id}`);
        console.log(`   Order status: ${orderData.data?.status}`);
      } else {
        const error = await getOrderResponse.text();
        console.log(`   ❌ Error: ${error}`);
      }

      // Test 5: Update order status
      console.log('\n5️⃣ Testing PUT /api/orders/[orderId]/status...');
      const statusResponse = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'in_progress',
          metadata: { reason: 'Production started' }
        })
      });

      console.log(`   Status: ${statusResponse.status} ${statusResponse.statusText}`);
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log(`   ✅ Success! Updated status to: ${statusData.data?.status}`);
      } else {
        const error = await statusResponse.text();
        console.log(`   ❌ Error: ${error}`);
      }

    } else {
      const error = await postResponse.text();
      console.log(`   ❌ Error: ${error}`);
    }

    // Test 6: Test invalid status transition
    console.log('\n6️⃣ Testing invalid status transition...');
    const invalidStatusResponse = await fetch(`${BASE_URL}/orders/00000000-0000-0000-0000-000000000001/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'completed'
      })
    });

    console.log(`   Status: ${invalidStatusResponse.status} ${invalidStatusResponse.statusText}`);
    
    if (invalidStatusResponse.status === 400) {
      const errorData = await invalidStatusResponse.json();
      console.log(`   ✅ Correctly rejected invalid transition: ${errorData.error}`);
    } else {
      console.log(`   ⚠️  Unexpected response for invalid transition`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 API testing complete!');
}

// Run the tests
testAPI().catch(console.error); 