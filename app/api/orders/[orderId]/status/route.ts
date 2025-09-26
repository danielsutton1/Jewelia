/// <reference types="node" />

import { NextRequest, NextResponse } from 'next/server';
import { OrdersService } from '../../../../../lib/services/OrdersService';
import { z } from 'zod';

const ordersService = new OrdersService();

// Validation schema for status updates - using correct OrderStatus values
const UpdateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_production', 'ready', 'shipped', 'delivered', 'cancelled']),
  notes: z.string().optional()
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    console.log('PUT /api/orders/[orderId]/status - Starting request');
    const resolvedParams = await params;
    console.log('Order ID:', resolvedParams.orderId);
    
    const body = await request.json();
    console.log('Request body:', body);
    
    // Validate request body
    const parse = UpdateStatusSchema.safeParse(body);
    if (!parse.success) {
      console.error('Validation error:', parse.error);
      return NextResponse.json({ 
        error: 'Invalid status data',
        details: parse.error.flatten()
      }, { status: 400 });
    }
    
    console.log('Validated status data:', parse.data);
    
    // Use OrdersService to update order status (only pass id and status)
    const order = await ordersService.updateStatus(
      resolvedParams.orderId, 
      parse.data.status
    );
    
    console.log('Order status updated successfully');
    return NextResponse.json({ 
      success: true,
      data: order,
      message: `Order status updated to ${parse.data.status}`
    });
    
  } catch (error) {
    console.error('PUT /api/orders/[orderId]/status error:', error);
    
    // Handle specific business logic errors
    if (error instanceof Error && error.message.includes('Order not found')) {
      return NextResponse.json({ 
        success: false,
        error: 'Order not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: false,
      error: (error as Error).message || 'Failed to update order status'
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log('GET /api/orders/[orderId]/status - Starting request');
    console.log('Order ID:', resolvedParams.orderId);
    
    // Get order details (status history doesn't exist, so return current status)
    const order = await ordersService.get(resolvedParams.orderId);
    
    if (!order) {
      return NextResponse.json({ 
        success: false,
        error: 'Order not found' 
      }, { status: 404 });
    }
    
    console.log('Order status retrieved successfully');
    return NextResponse.json({ 
      success: true,
      data: {
        current_status: order.status,
        order_id: order.id,
        order_number: order.order_number,
        updated_at: order.updated_at
      },
      message: 'Order status retrieved'
    });
    
  } catch (error) {
    console.error('GET /api/orders/[orderId]/status error:', error);
    return NextResponse.json({ 
      success: false,
      error: (error as Error).message || 'Failed to get order status'
    }, { status: 500 });
  }
} 