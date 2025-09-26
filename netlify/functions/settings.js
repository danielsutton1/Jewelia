
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
    import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"

const settingsSchema = z.object({
  user_id: z.string().uuid().nullable().optional(),
  org_id: z.string().uuid().nullable().optional(),
  key: z.string().min(1).max(100),
  value: z.any(),
  description: z.string().optional(),
})

// Backend per-key defaults
const defaultSettings: Record<string, any> = {
  theme: { color: 'gold', mode: 'light' },
  notifications: { enabled: true },
  // Add more CRM defaults as needed
}

// Helper: Check if user is org admin
async function isOrgAdmin(supabase: any, userId: string, orgId: string) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", userId)
    .eq("org_id", orgId)
    .single()
  return !error && data?.role === "admin"
}

// GET /api/settings/resolve?user_id=...&org_id=...&key=...
async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("user_id")
  const orgId = searchParams.get("org_id")
  const key = searchParams.get("key")
  const resolve = searchParams.get("resolve")

  // Fallback logic if resolve param is set
  if (resolve && key) {
    // 1. User setting
    if (userId) {
      const { data } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", userId)
        .eq("key", key)
        .maybeSingle()
      if (data) return NextResponse.json({ success: true, data })
    }
    // 2. Org setting
    if (orgId) {
      const { data } = await supabase
        .from("settings")
        .select("*")
        .eq("org_id", orgId)
        .eq("key", key)
        .maybeSingle()
      if (data) return NextResponse.json({ success: true, data })
    }
    // 3. Global setting
    const { data } = await supabase
      .from("settings")
      .select("*")
      .is("user_id", null)
      .is("org_id", null)
      .eq("key", key)
      .maybeSingle()
    if (data) return NextResponse.json({ success: true, data })
    // 4. Not found: return backend default if available
    if (key in defaultSettings) {
      return NextResponse.json({ success: true, data: { key, value: defaultSettings[key], source: 'default' } })
    }
    return NextResponse.json({ success: false, data: null })
  }

  // Default: list settings
  let query = supabase.from("settings").select("*")
  if (userId) query = query.eq("user_id", userId)
  if (orgId) query = query.eq("org_id", orgId)
  if (key) query = query.eq("key", key)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, data })
}

// POST /api/settings
async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const validatedData = settingsSchema.parse(body)
    // If org_id is set, check admin
    if (validatedData.org_id) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || !(await isOrgAdmin(supabase, user.id, validatedData.org_id))) {
        return NextResponse.json({ error: "Not authorized (org admin required)" }, { status: 403 })
      }
    }
    const { data, error } = await supabase
      .from("settings")
      .insert(validatedData)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/settings
async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }
    const body = await request.json()
    const validatedData = settingsSchema.parse(body)
    // If org_id is set, check admin
    if (validatedData.org_id) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || !(await isOrgAdmin(supabase, user.id, validatedData.org_id))) {
        return NextResponse.json({ error: "Not authorized (org admin required)" }, { status: 403 })
      }
    }
    const { data, error } = await supabase
      .from("settings")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/settings
async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }
  // Fetch setting to check org_id
  const { data: setting } = await supabase.from("settings").select("org_id").eq("id", id).single()
  if (setting?.org_id) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !(await isOrgAdmin(supabase, user.id, setting.org_id))) {
      return NextResponse.json({ error: "Not authorized (org admin required)" }, { status: 403 })
    }
  }
  const { error } = await supabase.from("settings").delete().eq("id", id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
