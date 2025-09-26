import { NextRequest, NextResponse } from 'next/server';
import { ordersService } from '@/lib/services/OrdersService';
import { z } from 'zod';

const ConvertQuoteSchema = z.object({
  quoteId: z.string().uuid('Valid quote ID is required'),
  customerId: z.string().uuid('Valid customer ID is required'),
  items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().min(1),
    unit_price: z.number().min(0),
    total_price: z.number().min(0),
    notes: z.string().optional(),
  })),
  payment_method: z.string().optional(),
  shipping_address: z.string().optional(),
  billing_address: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ConvertQuoteSchema.parse(body);

    const order = await ordersService.convertQuoteToOrder(
      validatedData.quoteId,
      validatedData.customerId,
      validatedData.items
    );

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Quote successfully converted to order'
    });
  } catch (error) {
    console.error('Error in convert quote API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
} 