import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const itemType = searchParams.get('itemType') || ''

    // Build base query
    let query = supabase
      .from('ai_estimations')
      .select('*')

    // Apply date filters
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    if (itemType) {
      query = query.eq('item_type', itemType)
    }

    const { data: estimations, error } = await query

    if (error) {
      console.error('Error fetching estimations for analytics:', error)
      return NextResponse.json(
        { error: 'Failed to fetch estimation data' },
        { status: 500 }
      )
    }

    if (!estimations || estimations.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalEstimations: 0,
          averagePrice: 0,
          totalValue: 0,
          itemTypeBreakdown: {},
          complexityBreakdown: {},
          confidenceStats: {
            average: 0,
            min: 0,
            max: 0
          },
          timeEstimates: {},
          marketTrends: {
            up: 0,
            down: 0,
            stable: 0
          }
        }
      })
    }

    // Calculate analytics
    const totalEstimations = estimations.length
    const totalValue = estimations.reduce((sum: number, est: any) => sum + parseFloat(est.total_price), 0)
    const averagePrice = totalValue / totalEstimations

    // Item type breakdown
    const itemTypeBreakdown = estimations.reduce((acc: Record<string, number>, est: any) => {
      acc[est.item_type] = (acc[est.item_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Complexity breakdown
    const complexityBreakdown = estimations.reduce((acc: Record<string, number>, est: any) => {
      acc[est.complexity] = (acc[est.complexity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Confidence statistics
    const confidences = estimations.map((est: any) => parseFloat(est.confidence))
    const confidenceStats = {
      average: confidences.reduce((sum: number, conf: number) => sum + conf, 0) / confidences.length,
      min: Math.min(...confidences),
      max: Math.max(...confidences)
    }

    // Time estimates breakdown
    const timeEstimates = estimations.reduce((acc: Record<string, number>, est: any) => {
      acc[est.estimated_time] = (acc[est.estimated_time] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Market trends
    const marketTrends = estimations.reduce((acc: Record<string, number>, est: any) => {
      const trend = est.market_factors?.trend || 'stable'
      acc[trend] = (acc[trend] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Price range analysis
    const prices = estimations.map((est: any) => parseFloat(est.total_price))
    const priceRanges = {
      'Under $100': prices.filter((p: number) => p < 100).length,
      '$100-$500': prices.filter((p: number) => p >= 100 && p < 500).length,
      '$500-$1000': prices.filter((p: number) => p >= 500 && p < 1000).length,
      '$1000-$5000': prices.filter((p: number) => p >= 1000 && p < 5000).length,
      'Over $5000': prices.filter((p: number) => p >= 5000).length
    }

    // Material cost vs labor cost analysis
    const materialCosts = estimations.map((est: any) => parseFloat(est.material_cost))
    const laborCosts = estimations.map((est: any) => parseFloat(est.labor_cost))
    const avgMaterialCost = materialCosts.reduce((sum: number, cost: number) => sum + cost, 0) / materialCosts.length
    const avgLaborCost = laborCosts.reduce((sum: number, cost: number) => sum + cost, 0) / laborCosts.length

    // Rush order analysis
    const rushOrders = estimations.filter((est: any) => parseFloat(est.rush_fee) > 0).length
    const rushOrderPercentage = (rushOrders / totalEstimations) * 100

    return NextResponse.json({
      success: true,
      data: {
        totalEstimations,
        averagePrice: Math.round(averagePrice * 100) / 100,
        totalValue: Math.round(totalValue * 100) / 100,
        itemTypeBreakdown,
        complexityBreakdown,
        confidenceStats: {
          average: Math.round(confidenceStats.average * 100) / 100,
          min: Math.round(confidenceStats.min * 100) / 100,
          max: Math.round(confidenceStats.max * 100) / 100
        },
        timeEstimates,
        marketTrends,
        priceRanges,
        costAnalysis: {
          averageMaterialCost: Math.round(avgMaterialCost * 100) / 100,
          averageLaborCost: Math.round(avgLaborCost * 100) / 100,
          materialToLaborRatio: Math.round((avgMaterialCost / avgLaborCost) * 100) / 100
        },
        rushOrderAnalysis: {
          totalRushOrders: rushOrders,
          rushOrderPercentage: Math.round(rushOrderPercentage * 100) / 100
        },
        dateRange: {
          from: dateFrom || 'all time',
          to: dateTo || 'now'
        }
      }
    })

  } catch (error: any) {
    console.error('AI estimation analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 