#!/usr/bin/env node

// Script to populate Supabase database with sample data for Jewelia CRM
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jplmmjcwwhjrltlevkoh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwbG1tamN3d2hqcmx0bGV2a29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTI1MDksImV4cCI6MjA2MzMyODUwOX0.PQTyBGcwNWCCnlDkjOUjKhfeys8kDLfYi_ohcw02vu0'

const supabase = createClient(supabaseUrl, supabaseKey)

// Sample customers data
const customers = [
  {
    id: '1',
    full_name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0123',
    address: '123 Main St, New York, NY 10001',
    created_at: new Date('2024-01-15').toISOString(),
    spending_tier: 'high',
    location: 'New York'
  },
  {
    id: '2',
    full_name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1-555-0124',
    address: '456 Oak Ave, Los Angeles, CA 90210',
    created_at: new Date('2024-02-20').toISOString(),
    spending_tier: 'medium',
    location: 'Los Angeles'
  },
  {
    id: '3',
    full_name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1-555-0125',
    address: '789 Pine St, Chicago, IL 60601',
    created_at: new Date('2024-03-10').toISOString(),
    spending_tier: 'high',
    location: 'Chicago'
  },
  {
    id: '4',
    full_name: 'David Thompson',
    email: 'david.thompson@email.com',
    phone: '+1-555-0126',
    address: '321 Elm St, Miami, FL 33101',
    created_at: new Date('2024-04-05').toISOString(),
    spending_tier: 'low',
    location: 'Miami'
  },
  {
    id: '5',
    full_name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    phone: '+1-555-0127',
    address: '654 Maple Dr, Seattle, WA 98101',
    created_at: new Date('2024-05-12').toISOString(),
    spending_tier: 'high',
    location: 'Seattle'
  }
]

// Sample inventory/products data
const inventory = [
  {
    id: '1',
    name: 'Diamond Engagement Ring',
    sku: 'RING-001',
    category: 'Rings',
    unit_price: 2500.00,
    quantity: 8,
    status: 'active',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: '2',
    name: 'Gold Necklace',
    sku: 'NECK-001',
    category: 'Necklaces',
    unit_price: 1200.00,
    quantity: 15,
    status: 'active',
    created_at: new Date('2024-01-02').toISOString()
  },
  {
    id: '3',
    name: 'Pearl Earrings',
    sku: 'EARR-001',
    category: 'Earrings',
    unit_price: 800.00,
    quantity: 22,
    status: 'active',
    created_at: new Date('2024-01-03').toISOString()
  },
  {
    id: '4',
    name: 'Sapphire Bracelet',
    sku: 'BRAC-001',
    category: 'Bracelets',
    unit_price: 1800.00,
    quantity: 12,
    status: 'active',
    created_at: new Date('2024-01-04').toISOString()
  },
  {
    id: '5',
    name: 'Emerald Pendant',
    sku: 'PEND-001',
    category: 'Pendants',
    unit_price: 950.00,
    quantity: 18,
    status: 'active',
    created_at: new Date('2024-01-05').toISOString()
  }
]

// Sample orders data
const orders = [
  {
    id: '1',
    order_number: 'ORD-001',
    customer_id: '1',
    total_amount: 2500.00,
    status: 'completed',
    created_at: new Date('2024-01-20').toISOString(),
    items: [
      { product_id: '1', quantity: 1, unit_price: 2500.00, total_price: 2500.00 }
    ]
  },
  {
    id: '2',
    order_number: 'ORD-002',
    customer_id: '2',
    total_amount: 1200.00,
    status: 'completed',
    created_at: new Date('2024-02-25').toISOString(),
    items: [
      { product_id: '2', quantity: 1, unit_price: 1200.00, total_price: 1200.00 }
    ]
  },
  {
    id: '3',
    order_number: 'ORD-003',
    customer_id: '3',
    total_amount: 1600.00,
    status: 'completed',
    created_at: new Date('2024-03-15').toISOString(),
    items: [
      { product_id: '3', quantity: 2, unit_price: 800.00, total_price: 1600.00 }
    ]
  },
  {
    id: '4',
    order_number: 'ORD-004',
    customer_id: '4',
    total_amount: 1800.00,
    status: 'pending',
    created_at: new Date('2024-04-10').toISOString(),
    items: [
      { product_id: '4', quantity: 1, unit_price: 1800.00, total_price: 1800.00 }
    ]
  },
  {
    id: '5',
    order_number: 'ORD-005',
    customer_id: '5',
    total_amount: 950.00,
    status: 'completed',
    created_at: new Date('2024-05-18').toISOString(),
    items: [
      { product_id: '5', quantity: 1, unit_price: 950.00, total_price: 950.00 }
    ]
  },
  {
    id: '6',
    order_number: 'ORD-006',
    customer_id: '1',
    total_amount: 2400.00,
    status: 'completed',
    created_at: new Date('2024-06-05').toISOString(),
    items: [
      { product_id: '2', quantity: 2, unit_price: 1200.00, total_price: 2400.00 }
    ]
  },
  {
    id: '7',
    order_number: 'ORD-007',
    customer_id: '3',
    total_amount: 3600.00,
    status: 'completed',
    created_at: new Date('2024-07-12').toISOString(),
    items: [
      { product_id: '1', quantity: 1, unit_price: 2500.00, total_price: 2500.00 },
      { product_id: '3', quantity: 1, unit_price: 800.00, total_price: 800.00 },
      { product_id: '5', quantity: 1, unit_price: 950.00, total_price: 950.00 }
    ]
  },
  {
    id: '8',
    order_number: 'ORD-008',
    customer_id: '2',
    total_amount: 1900.00,
    status: 'completed',
    created_at: new Date('2024-08-08').toISOString(),
    items: [
      { product_id: '4', quantity: 1, unit_price: 1800.00, total_price: 1800.00 },
      { product_id: '5', quantity: 1, unit_price: 950.00, total_price: 950.00 }
    ]
  }
]

// Sample production data
const production = [
  {
    id: '1',
    'Product ID': 'PROD-001',
    Name: 'Custom Diamond Ring',
    Description: 'Custom engagement ring with 1ct diamond',
    Category: 'Rings',
    Stage: 'Design',
    Status: 'In Progress',
    'Assigned Employee': 'John Smith',
    'Start Date': new Date('2024-08-01').toISOString(),
    'Estimated Completion': new Date('2024-08-15').toISOString(),
    priority: 'high',
    Notes: 'Client requested specific design modifications',
    order_id: '1',
    customer_name: 'Sarah Johnson',
    created_at: new Date('2024-08-01').toISOString()
  },
  {
    id: '2',
    'Product ID': 'PROD-002',
    Name: 'Gold Chain Necklace',
    Description: '18k gold chain necklace',
    Category: 'Necklaces',
    Stage: 'Casting',
    Status: 'In Progress',
    'Assigned Employee': 'Maria Garcia',
    'Start Date': new Date('2024-08-05').toISOString(),
    'Estimated Completion': new Date('2024-08-20').toISOString(),
    priority: 'medium',
    Notes: 'Standard production process',
    order_id: '2',
    customer_name: 'Michael Chen',
    created_at: new Date('2024-08-05').toISOString()
  },
  {
    id: '3',
    'Product ID': 'PROD-003',
    Name: 'Pearl Drop Earrings',
    Description: 'South Sea pearl drop earrings',
    Category: 'Earrings',
    Stage: 'Completed',
    Status: 'Completed',
    'Assigned Employee': 'David Lee',
    'Start Date': new Date('2024-07-20').toISOString(),
    'Estimated Completion': new Date('2024-08-01').toISOString(),
    'actual_completion': new Date('2024-08-01').toISOString(),
    priority: 'medium',
    Notes: 'Completed on time',
    order_id: '3',
    customer_name: 'Emily Rodriguez',
    created_at: new Date('2024-07-20').toISOString()
  }
]

async function populateDatabase() {
  console.log('🚀 Starting to populate Jewelia CRM database with sample data...')
  
  try {
    // Insert customers
    console.log('📝 Inserting customers...')
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .insert(customers)
    
    if (customersError) {
      console.error('Error inserting customers:', customersError)
    } else {
      console.log('✅ Customers inserted successfully')
    }

    // Insert inventory
    console.log('📝 Inserting inventory...')
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .insert(inventory)
    
    if (inventoryError) {
      console.error('Error inserting inventory:', inventoryError)
    } else {
      console.log('✅ Inventory inserted successfully')
    }

    // Insert orders
    console.log('📝 Inserting orders...')
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .insert(orders)
    
    if (ordersError) {
      console.error('Error inserting orders:', ordersError)
    } else {
      console.log('✅ Orders inserted successfully')
    }

    // Insert production data
    console.log('📝 Inserting production data...')
    const { data: productionData, error: productionError } = await supabase
      .from('products_in_production_pipeline')
      .insert(production)
    
    if (productionError) {
      console.error('Error inserting production data:', productionError)
    } else {
      console.log('✅ Production data inserted successfully')
    }

    console.log('🎉 Database population completed!')
    console.log('📊 Summary:')
    console.log(`   - ${customers.length} customers`)
    console.log(`   - ${inventory.length} inventory items`)
    console.log(`   - ${orders.length} orders`)
    console.log(`   - ${production.length} production items`)
    console.log('')
    console.log('🔄 Refresh your dashboard to see the real data!')

  } catch (error) {
    console.error('❌ Error populating database:', error)
  }
}

// Run the script
populateDatabase()
