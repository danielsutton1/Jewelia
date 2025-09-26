
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
    import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { resourceSchema, resourceUpdateSchema } from '@/lib/validations/resources'

// Helper to get resource_type_id from type string
async function getResourceTypeId(type: string) {
  const { data, error } = await supabaseAdmin.from('resource_types').select('id').eq('type', type).single()
  if (error || !data) return null
  return data.id
}

// GET /api/resources (list, filter by type/status, or get single by id)
async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const id = searchParams.get('id')

  if (id) {
    const { data, error } = await supabaseAdmin
      .from('resources')
      .select('*, resource_types(type, description)')
      .eq('id', id)
      .single()
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    }
    return NextResponse.json({ success: true, data })
  }

  let query = supabaseAdmin
    .from('resources')
    .select('*, resource_types(type, description)')
    .order('created_at', { ascending: false })
  if (type) {
    query = query.eq('type', type)
  }
  if (status) {
    query = query.eq('status', status)
  }
  const { data, error } = await query
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, data })
}

// POST /api/resources (create)
async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = resourceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 })
    }
    let resource_type_id = body.resource_type_id
    if (!resource_type_id && body.type) {
      resource_type_id = await getResourceTypeId(body.type)
      if (!resource_type_id) {
        return NextResponse.json({ success: false, error: 'Invalid resource type.' }, { status: 400 })
      }
    }
    const insertData = { ...body, resource_type_id }
    const { data, error } = await supabaseAdmin.from('resources').insert([insertData]).select().single()
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}

// PUT /api/resources?id=... (update)
async function PUT(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Resource ID is required.' }, { status: 400 })
    }
    const body = await req.json()
    const parsed = resourceUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 })
    }
    let resource_type_id = body.resource_type_id
    if (!resource_type_id && body.type) {
      resource_type_id = await getResourceTypeId(body.type)
      if (!resource_type_id) {
        return NextResponse.json({ success: false, error: 'Invalid resource type.' }, { status: 400 })
      }
    }
    const updateData = { ...body, resource_type_id }
    const { data, error } = await supabaseAdmin.from('resources').update(updateData).eq('id', id).select().single()
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}

// DELETE /api/resources?id=... (delete)
async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ success: false, error: 'Resource ID is required.' }, { status: 400 })
  }
  const { error } = await supabaseAdmin.from('resources').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
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
