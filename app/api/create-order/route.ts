/// <reference types="node" />

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const OrderItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  price: z.number().positive(),
});

const OrderSchema = z.object({
  customer: z.string().min(1),
  order_date: z.string(),
  items: z.array(OrderItemSchema),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/create-order - Starting request');
    const body = await request.json();
    console.log('Request body:', body);
    
    const parse = OrderSchema.safeParse(body);
    if (!parse.success) {
      console.error('Validation error:', parse.error);
      return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
    }
    
    console.log('Validated data:', parse.data);
    
    // Calculate total amount from items
    const totalAmount = parse.data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order in database with existing schema
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_id: parse.data.customer,
        status: 'pending',
        total_amount: totalAmount,
        payment_status: 'pending',
        notes: parse.data.notes || `Items: ${parse.data.items.map(item => `${item.name} (${item.quantity}x $${item.price})`).join(', ')}`,
      }])
      .select();
    
    if (orderError) {
      console.error('Order creation error:', orderError);
      throw orderError;
    }
    
    const order = orderData[0];
    console.log('Order created:', order);
    
    console.log('Order created successfully');
    return NextResponse.json({ 
      data: { 
        order_id: order.id,
        message: 'Order created successfully'
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('POST /api/create-order error:', error);
    return NextResponse.json({ 
      error: (error as Error).message,
      details: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 500 });
  }
} 