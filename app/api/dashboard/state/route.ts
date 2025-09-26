import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set')
}

function getSupabaseClient() {
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set')
  }
  return createClient(supabaseUrl, supabaseKey)
}

function getSupabaseJwtSecret() {
  const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET
  if (!supabaseJwtSecret) {
    throw new Error('SUPABASE_JWT_SECRET environment variable is not set')
  }
  return supabaseJwtSecret
}

// Types for dashboard state
interface LayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
}

interface DashboardState {
  activeWidgets: string[]
  layout: LayoutItem[]
}

function isValidLayoutItem(item: any): item is LayoutItem {
  return (
    typeof item === 'object' &&
    typeof item.i === 'string' &&
    typeof item.x === 'number' &&
    typeof item.y === 'number' &&
    typeof item.w === 'number' &&
    typeof item.h === 'number'
  )
}

async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.replace('Bearer ', '')
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(getSupabaseJwtSecret()))
    return payload.sub as string
  } catch (e) {
    console.error('JWT verification failed:', e)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const user_id = await getUserIdFromRequest(request)
    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('dashboard_state')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
      console.error('Error fetching dashboard state:', error)
      return NextResponse.json(
        { error: 'Failed to fetch dashboard state' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || { activeWidgets: [], layout: [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user_id = await getUserIdFromRequest(request)
    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json() as DashboardState
    const { activeWidgets, layout } = body

    // Validate the request body
    if (!activeWidgets || !Array.isArray(activeWidgets)) {
      return NextResponse.json(
        { error: 'activeWidgets must be an array' },
        { status: 400 }
      )
    }
    if (!layout || !Array.isArray(layout) || !layout.every(isValidLayoutItem)) {
      return NextResponse.json(
        { error: 'layout must be an array of valid LayoutItem objects' },
        { status: 400 }
      )
    }

    // Upsert the dashboard state for the user
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('dashboard_state')
      .upsert({
        user_id,
        activeWidgets,
        layout
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('Error saving dashboard state:', error)
      return NextResponse.json(
        { error: 'Failed to save dashboard state' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const user_id = await getUserIdFromRequest(request)
    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('dashboard_state')
      .delete()
      .eq('user_id', user_id)
    if (error) {
      console.error('Error deleting dashboard state:', error)
      return NextResponse.json(
        { error: 'Failed to delete dashboard state' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
