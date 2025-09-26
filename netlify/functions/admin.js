
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
import { authMiddleware } from '@/lib/middleware/auth';
import { getDatabaseClient } from '@/lib/config/database';

async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request);
  if (authResult instanceof NextResponse && authResult.status !== 200) return authResult;
  const db = getDatabaseClient();
  // Example: Fetch tenants, users, roles, and system metrics
  const [tenants, users, roles] = await Promise.all([
    db.from('tenants').select('*'),
    db.from('users').select('*'),
    db.from('roles').select('*'),
  ]);
  return NextResponse.json({
    tenants: tenants.data,
    users: users.data,
    roles: roles.data,
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    },
  });
}

async function POST(request: NextRequest) {
  const authResult = await authMiddleware(request);
  if (authResult instanceof NextResponse && authResult.status !== 200) return authResult;
  const db = getDatabaseClient();
  const body = await request.json();
  // Example: Create/update tenant/user/role
  if (body.type === 'tenant') {
    const { data, error } = await db.from('tenants').insert([body.data]);
    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ data });
  }
  if (body.type === 'user') {
    const { data, error } = await db.from('users').insert([body.data]);
    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ data });
  }
  if (body.type === 'role') {
    const { data, error } = await db.from('roles').insert([body.data]);
    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ data });
  }
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
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
