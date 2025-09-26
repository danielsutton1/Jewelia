import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const period = searchParams.get('period') || 'week'

    // Get production metrics
    const productionMetrics = await getProductionMetrics(supabase, startDate, endDate, period)
    
    // Get batch status
    const batchStatus = await getBatchStatus(supabase)
    
    // Get production efficiency
    const efficiencyData = await getProductionEfficiency(supabase, startDate, endDate)
    
    // Get equipment utilization
    const equipmentUtilization = await getEquipmentUtilization(supabase)
    
    // Get recent production activities
    const recentActivities = await getRecentProductionActivities(supabase)

    return NextResponse.json({
      success: true,
      data: {
        metrics: productionMetrics,
        batchStatus,
        efficiency: efficiencyData,
        equipmentUtilization,
        recentActivities
      }
    })

  } catch (error: any) {
    console.error('Production dashboard API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getProductionMetrics(supabase: any, startDate: string, endDate: string, period: string) {
  try {
    let dateFilter = ''
    if (startDate && endDate) {
      dateFilter = `created_at.gte.${startDate},created_at.lte.${endDate}`
    }

    // Total batches
    const { count: totalBatches, error: batchesError } = await supabase
      .from('production_batches')
      .select('*', { count: 'exact', head: true })

    // Completed batches
    const { count: completedBatches, error: completedError } = await supabase
      .from('production_batches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    // In progress batches
    const { count: inProgressBatches, error: inProgressError } = await supabase
      .from('production_batches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress')

    // Total production time
    const { data: timeTracking, error: timeError } = await supabase
      .from('time_tracking')
      .select('duration')
      .eq('category', 'production')

    const totalProductionTime = timeTracking?.reduce((sum: number, entry: any) => sum + (entry.duration || 0), 0) || 0

    return {
      totalBatches: totalBatches || 0,
      completedBatches: completedBatches || 0,
      inProgressBatches: inProgressBatches || 0,
      totalProductionTime,
      completionRate: totalBatches ? (completedBatches || 0) / totalBatches * 100 : 0
    }
  } catch (error) {
    console.error('Error getting production metrics:', error)
    return {
      totalBatches: 0,
      completedBatches: 0,
      inProgressBatches: 0,
      totalProductionTime: 0,
      completionRate: 0
    }
  }
}

async function getBatchStatus(supabase: any) {
  try {
    const { data: batchStatus, error } = await supabase
      .from('production_batches')
      .select('status, quantity')
      .in('status', ['pending', 'in_progress', 'completed', 'cancelled'])

    if (error) throw error

    const statusData = {
      pending: { count: 0, quantity: 0 },
      in_progress: { count: 0, quantity: 0 },
      completed: { count: 0, quantity: 0 },
      cancelled: { count: 0, quantity: 0 }
    }

    batchStatus?.forEach((batch: any) => {
      const status = batch.status as keyof typeof statusData
      if (statusData[status]) {
        statusData[status].count++
        statusData[status].quantity += batch.quantity || 0
      }
    })

    return statusData
  } catch (error) {
    console.error('Error getting batch status:', error)
    return {
      pending: { count: 0, quantity: 0 },
      in_progress: { count: 0, quantity: 0 },
      completed: { count: 0, quantity: 0 },
      cancelled: { count: 0, quantity: 0 }
    }
  }
}

async function getProductionEfficiency(supabase: any, startDate: string, endDate: string) {
  try {
    const { data: efficiency, error } = await supabase
      .from('production_batches')
      .select(`
        planned_duration,
        actual_duration,
        quantity,
        completed_quantity
      `)
      .eq('status', 'completed')

    if (error) throw error

    const efficiencyData = efficiency?.map((batch: any) => ({
      plannedDuration: batch.planned_duration || 0,
      actualDuration: batch.actual_duration || 0,
      plannedQuantity: batch.quantity || 0,
      completedQuantity: batch.completed_quantity || 0,
      timeEfficiency: batch.planned_duration ? (batch.planned_duration / (batch.actual_duration || 1)) * 100 : 0,
      quantityEfficiency: batch.quantity ? (batch.completed_quantity / batch.quantity) * 100 : 0
    })) || []

    return efficiencyData
  } catch (error) {
    console.error('Error getting production efficiency:', error)
    return []
  }
}

async function getEquipmentUtilization(supabase: any) {
  try {
    const { data: equipment, error } = await supabase
      .from('equipment')
      .select(`
        name,
        status,
        utilization_rate
      `)
      .order('utilization_rate', { ascending: false })
      .limit(10)

    if (error) throw error

    return equipment?.map((item: any) => ({
      name: item.name || 'Unknown',
      status: item.status || 'unknown',
      utilizationRate: item.utilization_rate || 0
    })) || []
  } catch (error) {
    console.error('Error getting equipment utilization:', error)
    return []
  }
}

async function getRecentProductionActivities(supabase: any) {
  try {
    const { data: activities, error } = await supabase
      .from('production_batches')
      .select(`
        *,
        products!inner(name)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return activities?.map((activity: any) => ({
      id: activity.id,
      batchNumber: activity.batch_number,
      productName: activity.products?.name || 'Unknown',
      status: activity.status,
      quantity: activity.quantity || 0,
      createdAt: activity.created_at
    })) || []
  } catch (error) {
    console.error('Error getting recent production activities:', error)
    return []
  }
} 