
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

const onboardingSchema = z.object({
  user_id: z.string().uuid(),
  org_id: z.string().uuid().nullable().optional(),
  step: z.string().min(1),
  completed: z.boolean().optional(),
  data: z.record(z.any()).optional(),
})

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

// GET /api/onboarding?user_id=...&org_id=...
async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("user_id")
  const orgId = searchParams.get("org_id")

  let query = supabase.from("onboarding_progress").select("*")
  if (userId) query = query.eq("user_id", userId)
  if (orgId) query = query.eq("org_id", orgId)

  const { data, error } = await query.maybeSingle()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, data })
}

// POST /api/onboarding
async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const validatedData = onboardingSchema.parse(body)
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
      .from("onboarding_progress")
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

// PUT /api/onboarding?id=...
async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }
    const body = await request.json()
    const validatedData = onboardingSchema.partial().parse(body)
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
      .from("onboarding_progress")
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

// DELETE /api/onboarding?id=...
async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }
  // Fetch onboarding to check org_id
  const { data: onboarding } = await supabase.from("onboarding_progress").select("org_id").eq("id", id).single()
  if (onboarding?.org_id) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !(await isOrgAdmin(supabase, user.id, onboarding.org_id))) {
      return NextResponse.json({ error: "Not authorized (org admin required)" }, { status: 403 })
    }
  }
  const { error } = await supabase.from("onboarding_progress").delete().eq("id", id)
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
