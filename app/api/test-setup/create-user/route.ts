import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Create a test user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@jewelia.com',
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User',
        role: 'admin'
      }
    })

    if (authError) {
      throw new Error(`Auth error: ${authError.message}`)
    }

    // Create a customer record for this user
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert({
        "Full Name": "Test Customer",
        "Email Address": "test@jewelia.com",
        "Phone Number": "+1234567890",
        "Address": "123 Test Street, Test City, TC 12345",
        "Company": "Test Jewelry Co.",
        "Notes": "Test customer created for development"
      })
      .select()
      .single()

    if (customerError) {
      console.warn('Customer creation warning:', customerError.message)
    }

    // Create some test inventory items
    const { data: inventoryData, error: inventoryError } = await supabase
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

    // Create a test order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerData?.id || null,
        status: 'pending',
        total_amount: 2500.00,
        payment_status: 'pending',
        notes: 'Test order created for development'
      })
      .select()
      .single()

    if (orderError) {
      console.warn('Order creation warning:', orderError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Test user and data created successfully',
      data: {
        user: {
          id: authData.user?.id,
          email: authData.user?.email,
          full_name: authData.user?.user_metadata?.full_name
        },
        customer: customerData,
        inventory_items: inventoryData?.length || 0,
        order: orderData
      },
      credentials: {
        email: 'test@jewelia.com',
        password: 'testpassword123'
      }
    })

  } catch (error: any) {
    console.error('Test setup error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create test user',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 