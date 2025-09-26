import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ReworkSchema = z.object({
  production_item_id: z.string().uuid(),
  issue_type: z.enum(['quality', 'specification', 'damage', 'material', 'other']),
  description: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  assigned_to: z.string().uuid().optional(),
  estimated_hours: z.number().positive().optional(),
  corrective_action: z.string().optional(),
  cost_impact: z.number().positive().optional()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status') || undefined
    const severity = searchParams.get('severity') || undefined
    const assignedTo = searchParams.get('assignedTo') || undefined
    
    let query = supabase
      .from('rework_items')
      .select(`
        *,
        production_items (
          name,
          sku,
          stage
        ),
        assigned_user:users!rework_items_assigned_to_fkey("Full Name", email)
      `)
      .order('created_at', { ascending: false })
    
    if (status) query = query.eq('status', status)
    if (severity) query = query.eq('severity', severity)
    if (assignedTo) query = query.eq('assigned_to', assignedTo)
    
    const { data: reworkItems, error: reworkError } = await query
    
    if (reworkError) throw reworkError
    
    // Get rework metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('rework_items')
      .select('status, severity, cost_impact, estimated_hours')
    
    if (metricsError) throw metricsError
    
    // Calculate metrics
    const openRework = metrics?.filter((item: any) => item.status === 'open').length || 0
    const inProgress = metrics?.filter((item: any) => item.status === 'in_progress').length || 0
    const completed = metrics?.filter((item: any) => item.status === 'completed').length || 0
    const totalCost = metrics?.reduce((sum: number, item: any) => sum + (item.cost_impact || 0), 0) || 0
    
    return NextResponse.json({
      success: true,
      data: {
        reworkItems,
        metrics: {
          openRework,
          inProgress,
          completed,
          totalCost,
          totalItems: reworkItems?.length || 0
        }
      }
    })
    
  } catch (error: any) {
    console.error('Rework API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    
    const parse = ReworkSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: parse.error.flatten()
      }, { status: 400 })
    }
    
    const reworkData = parse.data
    
    // Create rework item
    const { data: reworkItem, error: reworkError } = await supabase
      .from('rework_items')
      .insert([{
        ...reworkData,
        status: 'open',
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (reworkError) throw reworkError
    
    return NextResponse.json({
      success: true,
      data: reworkItem,
      message: 'Rework item created successfully'
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Create rework API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 