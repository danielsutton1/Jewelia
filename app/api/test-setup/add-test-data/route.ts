import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Add test customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .insert([
        {
          "Full Name": "John Smith",
          "Email Address": "john@example.com",
          "Phone Number": "+1234567890",
          "Address": "123 Main St, City, State 12345",
          "Company": "Smith Jewelry",
          "Notes": "Test customer 1"
        },
        {
          "Full Name": "Sarah Johnson",
          "Email Address": "sarah@example.com", 
          "Phone Number": "+1987654321",
          "Address": "456 Oak Ave, Town, State 67890",
          "Company": "Johnson Designs",
          "Notes": "Test customer 2"
        }
      ])
      .select()

    if (customersError) {
      console.warn('Customers creation warning:', customersError.message)
    }

    // Add test inventory
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .insert([
        {
          name: "Diamond Ring",
          sku: "DR001",
          description: "Beautiful diamond ring",
          category: "Rings",
          price: 2500.00,
          cost: 1500.00,
          quantity: 5,
          status: "in_stock"
        },
        {
          name: "Gold Necklace",
          sku: "GN001",
          description: "Elegant gold necklace", 
          category: "Necklaces",
          price: 1200.00,
          cost: 800.00,
          quantity: 3,
          status: "in_stock"
        },
        {
          name: "Silver Bracelet",
          sku: "SB001",
          description: "Classic silver bracelet",
          category: "Bracelets", 
          price: 450.00,
          cost: 300.00,
          quantity: 1,
          status: "low_stock"
        }
      ])
      .select()

    if (inventoryError) {
      console.warn('Inventory creation warning:', inventoryError.message)
    }

    // Add test orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .insert([
        {
          customer_id: customers?.[0]?.id || null,
          status: 'pending',
          total_amount: 2500.00,
          payment_status: 'pending',
          notes: 'Test order 1'
        },
        {
          customer_id: customers?.[1]?.id || null,
          status: 'completed',
          total_amount: 1200.00,
          payment_status: 'paid',
          notes: 'Test order 2'
        }
      ])
      .select()

    if (ordersError) {
      console.warn('Orders creation warning:', ordersError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Test data added successfully',
      data: {
        customers: customers?.length || 0,
        inventory: inventory?.length || 0,
        orders: orders?.length || 0
      }
    })

  } catch (error: any) {
    console.error('Test data creation error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to add test data',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 