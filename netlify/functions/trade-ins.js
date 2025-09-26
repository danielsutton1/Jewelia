
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Parse the request body
  const body = event.body ? JSON.parse(event.body) : {};
  
  // Convert Next.js API route to Netlify function
  try {
    // Extract the handler from the route file
    import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CreateTradeInDTO, TradeInSearchParams, UpdateTradeInDTO } from '@/types/trade-in';
import { TradeInService } from '@/services/trade-in.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const createTradeInSchema = z.object({
  customer_id: z.string().optional(),
  trade_in_date: z.string().optional(),
  notes: z.string().optional(),
  trade_in_items: z.array(z.object({
    item_type: z.enum(['ring', 'necklace', 'earrings', 'bracelet', 'watch', 'other']),
    metal_type: z.enum(['gold', 'silver', 'platinum', 'palladium', 'other']),
    metal_purity: z.enum(['10k', '14k', '18k', '22k', '24k', 'sterling', 'platinum_950', 'platinum_900', 'other']),
    weight_grams: z.number().positive(),
    gemstone_type: z.string().optional(),
    gemstone_carat: z.number().positive().optional(),
    gemstone_quality: z.string().optional(),
    brand: z.string().optional(),
    condition: z.enum(['excellent', 'very_good', 'good', 'fair', 'poor']),
    appraised_value: z.number().positive(),
    accepted_value: z.number().positive(),
    description: z.string().optional(),
    photo_urls: z.array(z.string()).optional(),
  })),
  trade_for_items: z.array(z.object({
    item_type: z.string(),
    inventory_item_id: z.string().optional(),
    is_custom: z.boolean(),
    custom_specifications: z.record(z.any()).optional(),
    quantity: z.number().positive(),
    unit_price: z.number().positive(),
    special_requests: z.string().optional(),
  })),
});

const updateTradeInSchema = z.object({
  status: z.enum(['pending', 'approved', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
  trade_in_items: createTradeInSchema.shape.trade_in_items.optional(),
  trade_for_items: createTradeInSchema.shape.trade_for_items.optional(),
});

const tradeInService = new TradeInService();

async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const tradeIn = await tradeInService.createTradeIn({
      ...data,
      staffId: session.user.id,
    });

    return NextResponse.json(tradeIn);
  } catch (error) {
    console.error('Error creating trade-in:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const tradeIns = await tradeInService.listTradeIns({
      status: status as any,
      customerId: customerId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit,
    });

    return NextResponse.json(tradeIns);
  } catch (error) {
    console.error('Error listing trade-ins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    // Validate request body
    const validatedData = updateTradeInSchema.parse(body);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get trade-in ID from URL
    const { searchParams } = new URL(request.url);
    const tradeInId = searchParams.get('id');
    if (!tradeInId) {
      return NextResponse.json({ error: 'Trade-in ID is required' }, { status: 400 });
    }

    // Update trade-in record
    const { data: tradeIn, error: tradeInError } = await supabase
      .from('trade_ins')
      .update({
        status: validatedData.status,
        notes: validatedData.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tradeInId)
      .select()
      .single();

    if (tradeInError) {
      return NextResponse.json({ error: tradeInError.message }, { status: 400 });
    }

    // Update trade-in items if provided
    if (validatedData.trade_in_items) {
      // Delete existing items
      await supabase
        .from('trade_in_items')
        .delete()
        .eq('trade_in_id', tradeInId);

      // Insert new items
      const { error: itemsError } = await supabase
        .from('trade_in_items')
        .insert(
          validatedData.trade_in_items.map(item => ({
            trade_in_id: tradeInId,
            ...item,
          }))
        );

      if (itemsError) {
        return NextResponse.json({ error: itemsError.message }, { status: 400 });
      }
    }

    // Update trade-for items if provided
    if (validatedData.trade_for_items) {
      // Delete existing items
      await supabase
        .from('trade_for_items')
        .delete()
        .eq('trade_in_id', tradeInId);

      // Insert new items
      const { error: tradeForError } = await supabase
        .from('trade_for_items')
        .insert(
          validatedData.trade_for_items.map(item => ({
            trade_in_id: tradeInId,
            ...item,
            total_price: item.unit_price * item.quantity,
          }))
        );

      if (tradeForError) {
        return NextResponse.json({ error: tradeForError.message }, { status: 400 });
      }
    }

    return NextResponse.json(tradeIn);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get trade-in ID from URL
    const { searchParams } = new URL(request.url);
    const tradeInId = searchParams.get('id');
    if (!tradeInId) {
      return NextResponse.json({ error: 'Trade-in ID is required' }, { status: 400 });
    }

    // Soft delete trade-in record
    const { error: deleteError } = await supabase
      .from('trade_ins')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', tradeInId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 

    // Handle the request based on the HTTP method
    const method = event.httpMethod;
    let response;
    
    switch (method) {
      case 'GET':
        response = await GET({ req: event, supabase });
        break;
      case 'POST':
        response = await POST({ req: event, supabase });
        break;
      case 'PUT':
        response = await PUT({ req: event, supabase });
        break;
      case 'DELETE':
        response = await DELETE({ req: event, supabase });
        break;
      case 'PATCH':
        response = await PATCH({ req: event, supabase });
        break;
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
