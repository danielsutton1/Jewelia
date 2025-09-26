
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
    import { NextResponse } from 'next/server'
import { TradeInService } from '@/services/trade-in.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const tradeInService = new TradeInService()

const calculateSchema = z.object({
  items: z.array(z.object({
    itemType: z.string(),
    metalType: z.string(),
    metalPurity: z.string(),
    weight: z.number(),
    weightUnit: z.string(),
    condition: z.string(),
    acceptedValue: z.number(),
    appraisalValue: z.number(),
    description: z.string(),
    photos: z.array(z.string()),
    gemstone: z.object({
      type: z.string(),
      carat: z.number(),
      quality: z.string(),
      cert: z.string().optional(),
    }).optional(),
  })),
  newItems: z.array(z.object({
    name: z.string(),
    sku: z.string(),
    price: z.number(),
    quantity: z.number(),
    status: z.string(),
    isCustom: z.boolean().optional(),
    specs: z.string().optional(),
    dueDate: z.string().optional(),
  })),
})

// POST /api/trade-ins/[id]/calculate - Calculate totals
async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const validated = calculateSchema.parse(data)

    const totals = await tradeInService.calculateTotals(
      validated.items,
      validated.newItems
    )

    return NextResponse.json(totals)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error calculating totals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
