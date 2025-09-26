import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Add sample customers - using the actual column names from the database
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .insert([
        {
          name: 'John Smith',
          email: 'john.smith.test@example.com',
          phone: '+1-555-0101',
          address: '123 Main St, New York, NY 10001',
          notes: 'Premium customer, interested in diamond jewelry'
        },
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson.test@example.com',
          phone: '+1-555-0102',
          address: '456 Oak Ave, Los Angeles, CA 90210',
          notes: 'Regular customer, prefers gold jewelry'
        },
        {
          name: 'Michael Brown',
          email: 'michael.brown.test@example.com',
          phone: '+1-555-0103',
          address: '789 Pine Rd, Chicago, IL 60601',
          notes: 'New customer, interested in engagement rings'
        },
        {
          name: 'Emily Davis',
          email: 'emily.davis.test@example.com',
          phone: '+1-555-0104',
          address: '321 Elm St, Miami, FL 33101',
          notes: 'VIP customer, high-end jewelry collector'
        },
        {
          name: 'David Wilson',
          email: 'david.wilson.test@example.com',
          phone: '+1-555-0105',
          address: '654 Maple Dr, Seattle, WA 98101',
          notes: 'Business customer, corporate gifts'
        }
      ])
      .select()

    if (customerError) {
      console.error('Error adding customers:', customerError)
      return NextResponse.json({ 
        error: 'Failed to add customers', 
        details: customerError.message,
        code: customerError.code 
      }, { status: 500 })
    }

    // Get customer IDs for orders
    const customerIds = customers?.map(c => c.id) || []

    // Add sample orders - using the actual column names from the database
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_id: customerIds[0],
          status: 'completed',
          total_amount: 2500.00,
          payment_status: 'paid',
          notes: 'Diamond engagement ring order',
          order_number: 'O-2025-001',
          tax_amount: 200.00,
          shipping_amount: 50.00,
          discount_amount: 0.00
        },
        {
          customer_id: customerIds[1],
          status: 'completed',
          total_amount: 1200.00,
          payment_status: 'paid',
          notes: 'Luxury watch order',
          order_number: 'O-2025-002',
          tax_amount: 96.00,
          shipping_amount: 25.00,
          discount_amount: 50.00
        },
        {
          customer_id: customerIds[2],
          status: 'completed',
          total_amount: 450.00,
          payment_status: 'paid',
          notes: 'Pearl necklace order',
          order_number: 'O-2025-003',
          tax_amount: 36.00,
          shipping_amount: 15.00,
          discount_amount: 0.00
        },
        {
          customer_id: customerIds[3],
          status: 'completed',
          total_amount: 1800.00,
          payment_status: 'paid',
          notes: 'Tennis bracelet order',
          order_number: 'O-2025-004',
          tax_amount: 144.00,
          shipping_amount: 30.00,
          discount_amount: 100.00
        },
        {
          customer_id: customerIds[4],
          status: 'completed',
          total_amount: 350.00,
          payment_status: 'paid',
          notes: 'Sapphire earrings order',
          order_number: 'O-2025-005',
          tax_amount: 28.00,
          shipping_amount: 10.00,
          discount_amount: 0.00
        },
        {
          customer_id: customerIds[0],
          status: 'completed',
          total_amount: 3200.00,
          payment_status: 'paid',
          notes: 'Wedding band set order',
          order_number: 'O-2025-006',
          tax_amount: 256.00,
          shipping_amount: 40.00,
          discount_amount: 0.00
        },
        {
          customer_id: customerIds[1],
          status: 'completed',
          total_amount: 950.00,
          payment_status: 'paid',
          notes: 'Gold chain order',
          order_number: 'O-2025-007',
          tax_amount: 76.00,
          shipping_amount: 20.00,
          discount_amount: 0.00
        },
        {
          customer_id: customerIds[2],
          status: 'completed',
          total_amount: 2800.00,
          payment_status: 'paid',
          notes: 'Diamond pendant order',
          order_number: 'O-2025-008',
          tax_amount: 224.00,
          shipping_amount: 35.00,
          discount_amount: 0.00
        }
      ])
      .select()

    if (orderError) {
      console.error('Error adding orders:', orderError)
      return NextResponse.json({ error: 'Failed to add orders' }, { status: 500 })
    }

    // Add sample inventory items - using the actual column names from the database
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .insert([
        {
          sku: 'DIAMOND-RING-001',
          name: 'Classic Diamond Ring',
          description: 'Beautiful 1-carat diamond ring in white gold setting',
          category: 'Rings',
          quantity: 5,
          status: 'in_stock',
          notes: 'Premium quality diamond ring'
        },
        {
          sku: 'WATCH-LUXURY-001',
          name: 'Luxury Watch',
          description: 'Premium Swiss watch with leather strap',
          category: 'Watches',
          quantity: 3,
          status: 'in_stock',
          notes: 'Swiss made luxury timepiece'
        },
        {
          sku: 'NECKLACE-PEARL-001',
          name: 'Pearl Necklace',
          description: 'Elegant freshwater pearl necklace',
          category: 'Necklaces',
          quantity: 8,
          status: 'in_stock',
          notes: 'Natural freshwater pearls'
        },
        {
          sku: 'BRACELET-TENNIS-001',
          name: 'Tennis Bracelet',
          description: 'Diamond tennis bracelet in white gold',
          category: 'Bracelets',
          quantity: 4,
          status: 'in_stock',
          notes: 'Diamond tennis bracelet'
        },
        {
          sku: 'EARRINGS-SAPPHIRE-001',
          name: 'Sapphire Earrings',
          description: 'Blue sapphire earrings in yellow gold',
          category: 'Earrings',
          quantity: 6,
          status: 'in_stock',
          notes: 'Blue sapphire earrings'
        }
      ])
      .select()

    if (inventoryError) {
      console.error('Error adding inventory:', inventoryError)
      return NextResponse.json({ error: 'Failed to add inventory' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data added successfully',
      data: {
        customersAdded: customers?.length || 0,
        ordersAdded: orders?.length || 0,
        inventoryAdded: inventory?.length || 0
      }
    })

  } catch (error: any) {
    console.error('Error adding sample data:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 