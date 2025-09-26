
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

// GET /api/dashboard
async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Optionally, get org_id from user/org context if needed
  // const orgId = ...

  // Fetch summary stats
  const [usersCount, resourcesCount, workOrdersCount, invoicesCount, recentWorkOrders, recentInvoices] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("resources").select("id", { count: "exact", head: true }),
    supabase.from("work_orders").select("id", { count: "exact", head: true }),
    supabase.from("billing_invoices").select("id", { count: "exact", head: true }),
    supabase.from("work_orders").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
    supabase.from("billing_invoices").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
  ])

  // Example: fetch analytics KPIs (customize as needed)
  const { data: productionMetrics } = await supabase
    .from("production_metrics")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)

  // Example: fetch efficiency metrics
  const { data: efficiencyMetrics } = await supabase
    .from("efficiency_metrics")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)

  // Compose dashboard data
  const dashboard = {
    stats: {
      users: usersCount.count ?? 0,
      resources: resourcesCount.count ?? 0,
      workOrders: workOrdersCount.count ?? 0,
      invoices: invoicesCount.count ?? 0,
    },
    recent: {
      workOrders: recentWorkOrders.data || [],
      invoices: recentInvoices.data || [],
    },
    kpis: {
      production: productionMetrics?.[0] || null,
      efficiency: efficiencyMetrics?.[0] || null,
    },
  }

  return NextResponse.json({ success: true, data: dashboard })
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
