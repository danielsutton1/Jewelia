#!/usr/bin/env node

/**
 * Test script for Inventory API
 * Run with: node scripts/test-inventory-api.js
 */

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing Inventory API...\n');

  try {
    // Test 1: Get all inventory items
    console.log('1. Testing GET /api/inventory');
    const listResponse = await fetch(`${BASE_URL}/inventory`);
    const listData = await listResponse.json();
    console.log('✅ List inventory:', listData.data?.length || 0, 'items found');
    console.log('   Sample item:', listData.data?.[0]?.name || 'No items');
    console.log('');

    // Test 2: Create new inventory item
    console.log('2. Testing POST /api/inventory');
    const newItem = {
      sku: 'TEST001',
      name: 'Test Diamond Ring',
      description: 'A beautiful test ring',
      category: 'Rings',
      price: 2500.00,
      cost: 1500.00,
      quantity: 3
    };
    
    const createResponse = await fetch(`${BASE_URL}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });
    const createData = await createResponse.json();
    console.log('✅ Created item:', createData.data?.name);
    console.log('   Status:', createData.data?.status);
    console.log('');

    // Test 3: Get specific inventory item
    console.log('3. Testing GET /api/inventory/[id]');
    const itemId = createData.data?.id;
    if (itemId) {
      const getResponse = await fetch(`${BASE_URL}/inventory/${itemId}`);
      const getData = await getResponse.json();
      console.log('✅ Retrieved item:', getData.data?.name);
      console.log('   Quantity:', getData.data?.quantity);
      console.log('');
    }

    // Test 4: Update inventory item
    console.log('4. Testing PUT /api/inventory/[id]');
    if (itemId) {
      const updateData = { quantity: 10, price: 2700.00 };
      const updateResponse = await fetch(`${BASE_URL}/inventory/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const updatedItem = await updateResponse.json();
      console.log('✅ Updated item:', updatedItem.data?.name);
      console.log('   New quantity:', updatedItem.data?.quantity);
      console.log('   New price:', updatedItem.data?.price);
      console.log('   New status:', updatedItem.data?.status);
      console.log('');
    }

    // Test 5: Get low stock items
    console.log('5. Testing GET /api/inventory/low-stock');
    const lowStockResponse = await fetch(`${BASE_URL}/inventory/low-stock`);
    const lowStockData = await lowStockResponse.json();
    console.log('✅ Low stock items:', lowStockData.data?.length || 0, 'items');
    console.log('   Items:', lowStockData.data?.map(item => `${item.name} (${item.quantity})`).join(', ') || 'None');
    console.log('');

    // Test 6: Get inventory statistics
    console.log('6. Testing GET /api/inventory/statistics');
    const statsResponse = await fetch(`${BASE_URL}/inventory/statistics`);
    const statsData = await statsResponse.json();
    console.log('✅ Statistics:');
    console.log('   Total items:', statsData.data?.total_items);
    console.log('   Total value: $', statsData.data?.total_value?.toFixed(2));
    console.log('   Low stock count:', statsData.data?.low_stock_count);
    console.log('   Out of stock count:', statsData.data?.out_of_stock_count);
    console.log('   Categories:', statsData.data?.categories?.map(c => `${c.category} (${c.count})`).join(', ') || 'None');
    console.log('');

    // Test 7: Test filtering
    console.log('7. Testing GET /api/inventory with filters');
    const filterResponse = await fetch(`${BASE_URL}/inventory?category=Rings&limit=5`);
    const filterData = await filterResponse.json();
    console.log('✅ Filtered items (Rings category):', filterData.data?.length || 0, 'items');
    console.log('');

    // Test 8: Clean up - Delete test item
    console.log('8. Testing DELETE /api/inventory/[id]');
    if (itemId) {
      const deleteResponse = await fetch(`${BASE_URL}/inventory/${itemId}`, {
        method: 'DELETE'
      });
      const deleteData = await deleteResponse.json();
      console.log('✅ Deleted test item:', deleteData.success ? 'Success' : 'Failed');
      console.log('');
    }

    console.log('🎉 All Inventory API tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
testAPI(); 