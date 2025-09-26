import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateRepairSchema = z.object({
  customer_id: z.string().uuid(),
  item_description: z.string().min(1),
  repair_type: z.enum(['resize', 'polish', 'stone_replacement', 'clasp_repair', 'engraving', 'other']),
  estimated_cost: z.number().positive(),
  estimated_completion: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional()
})

const UpdateRepairSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'review', 'completed', 'cancelled']).optional(),
  actual_cost: z.number().positive().optional(),
  completion_date: z.string().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const status = searchParams.get('status') || undefined
    const customerId = searchParams.get('customerId') || undefined
    const priority = searchParams.get('priority') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Build query
    let query = supabase
      .from('repairs')
      .select(`
        *,
        customers (
          "Full Name",
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false })
    
    if (status) query = query.eq('status', status)
    if (customerId) query = query.eq('customer_id', customerId)
    if (priority) query = query.eq('priority', priority)
    
    const { data: repairs, error: repairsError } = await query
      .range(offset, offset + limit - 1)
    
    if (repairsError) throw repairsError
    
    // Get repair metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('repairs')
      .select('status, estimated_cost, actual_cost')
    
    if (metricsError) throw metricsError
    
    // Calculate metrics
    const pendingRepairs = metrics?.filter((repair: any) => repair.status === 'pending').length || 0
    const inProgress = metrics?.filter((repair: any) => repair.status === 'in_progress').length || 0
    const completed = metrics?.filter((repair: any) => repair.status === 'completed').length || 0
    const totalRevenue = metrics?.reduce((sum: number, repair: any) => sum + (repair.actual_cost || 0), 0) || 0
    
    return NextResponse.json({
      success: true,
      data: {
        repairs,
        metrics: {
          pendingRepairs,
          inProgress,
          completed,
          totalRevenue,
          totalRepairs: repairs?.length || 0
        },
        pagination: {
          limit,
          offset,
          total: repairs?.length || 0
        }
      }
    })
    
  } catch (error: any) {
    console.error('Repairs API error:', error)
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
    
    // Validate request body
    const parse = CreateRepairSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: parse.error.flatten()
      }, { status: 400 })
    }
    
    const repairData = parse.data
    
    // Create repair record
    const { data: repair, error: repairError } = await supabase
      .from('repairs')
      .insert([{
        ...repairData,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (repairError) throw repairError
    
    return NextResponse.json({
      success: true,
      data: repair,
      message: 'Repair request created successfully'
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Create repair API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    
    const { repair_id, ...updateData } = body
    
    if (!repair_id) {
      return NextResponse.json({ error: 'Repair ID is required' }, { status: 400 })
    }
    
    // Validate update data
    const parse = UpdateRepairSchema.safeParse(updateData)
    if (!parse.success) {
      return NextResponse.json({ 
        error: 'Invalid update data',
        details: parse.error.flatten()
      }, { status: 400 })
    }
    
    // Update repair
    const { data: updatedRepair, error: updateError } = await supabase
      .from('repairs')
      .update({
        ...parse.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', repair_id)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    return NextResponse.json({
      success: true,
      data: updatedRepair,
      message: 'Repair updated successfully'
    })
    
  } catch (error: any) {
    console.error('Update repair API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 