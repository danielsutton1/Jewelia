import { NextRequest, NextResponse } from 'next/server'
import EnhancedAnalyticsService from '@/lib/services/EnhancedAnalyticsService'

const enhancedAnalyticsService = new EnhancedAnalyticsService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'executive-summary'
    
    let result

    switch (type) {
      case 'executive-summary':
        const period = searchParams.get('period') || 'month'
        result = await enhancedAnalyticsService.generateExecutiveSummary(period)
        break
        
      case 'comparative-analysis':
        const currentStart = searchParams.get('currentStart')
        const currentEnd = searchParams.get('currentEnd')
        const previousStart = searchParams.get('previousStart')
        const previousEnd = searchParams.get('previousEnd')
        
        if (!currentStart || !currentEnd || !previousStart || !previousEnd) {
          return NextResponse.json(
            { error: 'Missing required date parameters for comparative analysis' },
            { status: 400 }
          )
        }
        
        result = await enhancedAnalyticsService.generateComparativeAnalysis(
          { start: currentStart, end: currentEnd },
          { start: previousStart, end: previousEnd }
        )
        break
        
      case 'performance-benchmarks':
        result = await enhancedAnalyticsService.generatePerformanceBenchmarks()
        break
        
      case 'active-alerts':
        const alerts = await enhancedAnalyticsService.getActiveAlerts()
        result = { data: alerts, error: null }
        break
        
      case 'cache-stats':
        const cacheStats = enhancedAnalyticsService.getCacheStats()
        result = { data: cacheStats, error: null }
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        )
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error: any) {
    console.error('Enhanced Analytics API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    let result

    switch (action) {
      case 'export':
        const { type, options } = await params
        if (!type || !options) {
          return NextResponse.json(
            { error: 'Missing required parameters for export' },
            { status: 400 }
          )
        }
        result = await enhancedAnalyticsService.exportAnalytics(type, options)
        break
        
      case 'schedule-report':
        const { reportType, schedule } = await params
        if (!reportType || !schedule) {
          return NextResponse.json(
            { error: 'Missing required parameters for scheduling report' },
            { status: 400 }
          )
        }
        result = await enhancedAnalyticsService.scheduleReport(reportType, schedule)
        break
        
      case 'configure-alert':
        const { rule } = await params
        if (!rule) {
          return NextResponse.json(
            { error: 'Missing alert rule configuration' },
            { status: 400 }
          )
        }
        result = await enhancedAnalyticsService.configureAlertRule(rule)
        break
        
      case 'clear-cache':
        const { pattern } = await params
        enhancedAnalyticsService.clearCache(pattern)
        result = { data: { message: 'Cache cleared successfully' }, error: null }
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error: any) {
    console.error('Enhanced Analytics API POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 