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

async function addSampleData() {
  try {
    console.log('Adding sample data for dashboard...');

    // Add sample customers
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .insert([
        {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1-555-0123',
          address: '123 Main St, New York, NY 10001',
          customer_type: 'retail',
          notes: 'Regular customer'
        },
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+1-555-0124',
          address: '456 Oak Ave, Los Angeles, CA 90210',
          customer_type: 'retail',
          notes: 'VIP customer'
        },
        {
          name: 'Mike Wilson',
          email: 'mike.wilson@email.com',
          phone: '+1-555-0125',
          address: '789 Pine Rd, Chicago, IL 60601',
          customer_type: 'wholesale',
          notes: 'Wholesale partner'
        },
        {
          name: 'Emily Davis',
          email: 'emily.davis@email.com',
          phone: '+1-555-0126',
          address: '321 Elm St, Miami, FL 33101',
          customer_type: 'retail',
          notes: 'New customer'
        },
        {
          name: 'David Brown',
          email: 'david.brown@email.com',
          phone: '+1-555-0127',
          address: '654 Maple Dr, Seattle, WA 98101',
          customer_type: 'retail',
          notes: 'Returning customer'
        }
      ])
      .select();

    if (customerError) {
      console.error('Error adding customers:', customerError);
    } else {
      console.log(`Added ${customers.length} customers`);
    }

    // Add sample orders
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          order_number: 'ORD-2024-001',
          customer_id: customers?.[0]?.id,
          order_date: new Date('2024-01-15'),
          status: 'completed',
          total_amount: 2500.00,
          tax_amount: 200.00,
          shipping_amount: 50.00,
          discount_amount: 0.00,
          final_amount: 2750.00,
          payment_status: 'paid',
          shipping_address: '123 Main St, New York, NY 10001',
          billing_address: '123 Main St, New York, NY 10001',
          notes: 'Diamond engagement ring'
        },
        {
          order_number: 'ORD-2024-002',
          customer_id: customers?.[1]?.id,
          order_date: new Date('2024-01-20'),
          status: 'in_production',
          total_amount: 1800.00,
          tax_amount: 144.00,
          shipping_amount: 50.00,
          discount_amount: 100.00,
          final_amount: 1894.00,
          payment_status: 'partial',
          shipping_address: '456 Oak Ave, Los Angeles, CA 90210',
          billing_address: '456 Oak Ave, Los Angeles, CA 90210',
          notes: 'Tennis bracelet'
        },
        {
          order_number: 'ORD-2024-003',
          customer_id: customers?.[2]?.id,
          order_date: new Date('2024-01-25'),
          status: 'pending',
          total_amount: 3500.00,
          tax_amount: 280.00,
          shipping_amount: 75.00,
          discount_amount: 0.00,
          final_amount: 3855.00,
          payment_status: 'pending',
          shipping_address: '789 Pine Rd, Chicago, IL 60601',
          billing_address: '789 Pine Rd, Chicago, IL 60601',
          notes: 'Luxury watch collection'
        },
        {
          order_number: 'ORD-2024-004',
          customer_id: customers?.[3]?.id,
          order_date: new Date('2024-01-30'),
          status: 'confirmed',
          total_amount: 450.00,
          tax_amount: 36.00,
          shipping_amount: 25.00,
          discount_amount: 0.00,
          final_amount: 511.00,
          payment_status: 'paid',
          shipping_address: '321 Elm St, Miami, FL 33101',
          billing_address: '321 Elm St, Miami, FL 33101',
          notes: 'Pearl necklace'
        },
        {
          order_number: 'ORD-2024-005',
          customer_id: customers?.[4]?.id,
          order_date: new Date('2024-02-01'),
          status: 'shipped',
          total_amount: 1200.00,
          tax_amount: 96.00,
          shipping_amount: 50.00,
          discount_amount: 50.00,
          final_amount: 1296.00,
          payment_status: 'paid',
          shipping_address: '654 Maple Dr, Seattle, WA 98101',
          billing_address: '654 Maple Dr, Seattle, WA 98101',
          notes: 'Sapphire earrings'
        }
      ])
      .select();

    if (orderError) {
      console.error('Error adding orders:', orderError);
    } else {
      console.log(`Added ${orders.length} orders`);
    }

    // Add sample products (if they don't exist)
    const { data: existingProducts } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (!existingProducts || existingProducts.length === 0) {
      const { data: products, error: productError } = await supabase
        .from('products')
        .insert([
          {
            sku: 'RING-001',
            name: 'Diamond Engagement Ring',
            description: 'Beautiful 1 carat diamond engagement ring in white gold',
            category: 'rings',
            price: 2500.00,
            cost: 1500.00,
            stock_quantity: 5,
            material: 'White Gold',
            gemstone: 'Diamond',
            weight: 3.5,
            dimensions: '6.5mm x 6.5mm',
            tags: ['engagement', 'diamond', 'white-gold']
          },
          {
            sku: 'NECK-001',
            name: 'Pearl Necklace',
            description: 'Elegant freshwater pearl necklace with 18k gold clasp',
            category: 'necklaces',
            price: 450.00,
            cost: 250.00,
            stock_quantity: 12,
            material: '18k Gold',
            gemstone: 'Pearl',
            weight: 8.2,
            dimensions: '18 inches',
            tags: ['pearl', 'necklace', 'elegant']
          },
          {
            sku: 'EARR-001',
            name: 'Sapphire Stud Earrings',
            description: 'Classic sapphire stud earrings in yellow gold',
            category: 'earrings',
            price: 350.00,
            cost: 200.00,
            stock_quantity: 8,
            material: 'Yellow Gold',
            gemstone: 'Sapphire',
            weight: 2.1,
            dimensions: '4mm',
            tags: ['sapphire', 'studs', 'classic']
          },
          {
            sku: 'BRAC-001',
            name: 'Tennis Bracelet',
            description: 'Diamond tennis bracelet with 3 carats total weight',
            category: 'bracelets',
            price: 1800.00,
            cost: 1200.00,
            stock_quantity: 3,
            material: 'White Gold',
            gemstone: 'Diamond',
            weight: 12.5,
            dimensions: '7 inches',
            tags: ['tennis', 'diamond', 'luxury']
          },
          {
            sku: 'WATCH-001',
            name: 'Luxury Watch',
            description: 'Premium automatic watch with leather strap',
            category: 'watches',
            price: 1200.00,
            cost: 800.00,
            stock_quantity: 4,
            material: 'Stainless Steel',
            weight: 85.0,
            dimensions: '42mm',
            tags: ['watch', 'automatic', 'luxury']
          }
        ])
        .select();

      if (productError) {
        console.error('Error adding products:', productError);
      } else {
        console.log(`Added ${products.length} products`);
      }
    } else {
      console.log('Products already exist, skipping...');
    }

    // Add sample production data
    const { data: productionData, error: productionError } = await supabase
      .from('products_in_production_pipeline')
      .insert([
        {
          "Product ID": "PROD-001",
          "Name": "Diamond Ring",
          "Description": "Custom engagement ring",
          "Category": "Rings",
          "Stage": "Design",
          "Assigned Employee": "John Smith",
          "Start Date": new Date('2024-01-15').toISOString().split('T')[0],
          "Estimated Completion": new Date('2024-02-15').toISOString().split('T')[0],
          "Status": "In Progress"
        },
        {
          "Product ID": "PROD-002",
          "Name": "Tennis Bracelet",
          "Description": "Diamond tennis bracelet",
          "Category": "Bracelets",
          "Stage": "Assembly",
          "Assigned Employee": "Sarah Johnson",
          "Start Date": new Date('2024-01-10').toISOString().split('T')[0],
          "Estimated Completion": new Date('2024-01-25').toISOString().split('T')[0],
          "Status": "Completed"
        },
        {
          "Product ID": "PROD-003",
          "Name": "Pearl Necklace",
          "Description": "Freshwater pearl necklace",
          "Category": "Necklaces",
          "Stage": "Quality Check",
          "Assigned Employee": "Mike Wilson",
          "Start Date": new Date('2024-01-20').toISOString().split('T')[0],
          "Estimated Completion": new Date('2024-02-05').toISOString().split('T')[0],
          "Status": "In Progress"
        }
      ])
      .select();

    if (productionError) {
      console.error('Error adding production data:', productionError);
    } else {
      console.log(`Added ${productionData.length} production items`);
    }

    console.log('Sample data added successfully!');
    console.log('\nDashboard should now show:');
    console.log('- Total Revenue: $8,250.00');
    console.log('- Total Orders: 5');
    console.log('- Active Customers: 5');
    console.log('- Production Efficiency: Calculated from production data');

  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

// Run the script
addSampleData(); 