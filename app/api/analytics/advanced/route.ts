import { NextRequest, NextResponse } from 'next/server'
import PredictiveAnalyticsService from '@/lib/services/PredictiveAnalyticsService'

const predictiveService = new PredictiveAnalyticsService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate forecast period
    const allowedPeriods = ['7d', '30d', '90d', '6m', '1y'] as const
    type ForecastPeriod = typeof allowedPeriods[number]
    
    const rawPeriod = searchParams.get('forecastPeriod')
    const forecastPeriod: ForecastPeriod = allowedPeriods.includes(rawPeriod as ForecastPeriod)
      ? (rawPeriod as ForecastPeriod)
      : '30d'
    
    // Parse filters from query parameters
    const filters = {
      forecastPeriod,
      confidenceLevel: parseFloat(searchParams.get('confidenceLevel') || '0.95'),
      includeSeasonality: searchParams.get('includeSeasonality') === 'true'
    }

    // Get the type of advanced analytics requested
    const type = searchParams.get('type') || 'sales-forecast'

    let result

    switch (type) {
      case 'sales-forecast':
        result = await predictiveService.getSalesForecast(filters)
        break
      case 'demand-prediction':
        result = await predictiveService.getDemandPrediction(filters)
        break
      case 'inventory-optimization':
        result = await predictiveService.getInventoryOptimization(filters)
        break
      case 'production-capacity':
        result = await predictiveService.getProductionCapacityPlanning(filters)
        break
      case 'all-predictive':
        // Get all predictive analytics
        const [salesForecast, demandPrediction, inventoryOptimization, productionCapacity] = await Promise.all([
          predictiveService.getSalesForecast(filters),
          predictiveService.getDemandPrediction(filters),
          predictiveService.getInventoryOptimization(filters),
          predictiveService.getProductionCapacityPlanning(filters)
        ])
        
        result = {
          data: {
            salesForecast: salesForecast.data || [],
            demandPrediction: demandPrediction.data || [],
            inventoryOptimization: inventoryOptimization.data || [],
            productionCapacity: productionCapacity.data || null
          },
          error: null
        }
        break
      default:
        result = await predictiveService.getSalesForecast(filters)
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: {
        generatedAt: new Date().toISOString(),
        filters,
        type
      }
    })

  } catch (error: any) {
    console.error('Advanced Analytics API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 