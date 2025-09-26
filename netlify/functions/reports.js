
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
    import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import ReportingService from '@/lib/services/ReportingService';

const ReportQuerySchema = z.object({
  type: z.enum(['sales', 'inventory', 'customer', 'employee', 'financial'], { message: 'Invalid report type.' }),
  startDate: z.string().datetime({ message: 'Invalid start date.' }),
  endDate: z.string().datetime({ message: 'Invalid end date.' }),
  customerId: z.string().uuid().optional(),
  export: z.enum(['json', 'csv', 'pdf']).optional(),
});

async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = Object.fromEntries(searchParams.entries());
    const validated = ReportQuerySchema.parse(query);
    const reportingService = new ReportingService();
    let data;
    switch (validated.type) {
      case 'sales':
        data = await reportingService.getSalesReport(validated);
        break;
      case 'inventory':
        data = await reportingService.getInventoryTurnover(validated);
        break;
      case 'customer':
        data = await reportingService.getCustomerLifetimeValue(validated);
        break;
      case 'employee':
        data = await reportingService.getEmployeeProductivity(validated);
        break;
      case 'financial':
        data = await reportingService.getFinancialSummary(validated);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type.' }, { status: 400 });
    }
    // Export logic (mocked)
    if (validated.export && validated.export !== 'json') {
      // TODO: Implement CSV/PDF export
      return NextResponse.json({ error: 'Export format not implemented yet.' }, { status: 501 });
    }
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
