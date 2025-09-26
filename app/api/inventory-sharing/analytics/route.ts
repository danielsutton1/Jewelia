import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// =====================================================
// INVENTORY SHARING ANALYTICS API ENDPOINT
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get current user from auth
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is requesting their own analytics or has permission
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'You can only view your own analytics' },
        { status: 403 }
      )
    }

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get analytics summary for the user
    const { data: analyticsSummary, error: summaryError } = await supabase
      .from('inventory_sharing_analytics_summary')
      .select('*')
      .eq('owner_id', userId)

    if (summaryError) throw summaryError

    // Get detailed analytics for the period
    const { data: periodAnalytics, error: periodError } = await supabase
      .from('inventory_sharing_analytics')
      .select(`
        *,
        sharing:inventory_sharing!inner(
          inventory:inventory(*)
        )
      `)
      .eq('sharing.owner_id', userId)
      .gte('last_viewed_at', startDate.toISOString())
      .order('last_viewed_at', { ascending: false })

    if (periodError) throw periodError

    // Calculate statistics
    const stats = calculateAnalyticsStats(analyticsSummary || [], periodAnalytics || [])

    // Get top performing items
    const topItems = await getTopPerformingItems(supabase, userId, period)

    // Get recent activity
    const recentActivity = await getRecentActivity(supabase, userId, period)

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        top_performing_items: topItems,
        recent_activity: recentActivity,
        period,
        start_date: startDate.toISOString(),
        end_date: now.toISOString()
      }
    })

  } catch (error: any) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// =====================================================
// ANALYTICS CALCULATION FUNCTIONS
// =====================================================

function calculateAnalyticsStats(summary: any[], periodAnalytics: any[]) {
  const totalSharedItems = summary.length
  let totalViewers = 0
  let totalViews = 0
  let totalQuoteRequests = 0
  let totalOrderRequests = 0
  let totalPartnershipRequests = 0

  // Calculate totals from summary
  summary.forEach(item => {
    totalViewers += item.unique_viewers || 0
    totalViews += item.total_views || 0
    totalQuoteRequests += item.total_quote_requests || 0
    totalOrderRequests += item.total_order_requests || 0
    totalPartnershipRequests += item.total_partnership_requests || 0
  })

  // Calculate engagement rate
  const totalRequests = totalQuoteRequests + totalOrderRequests + totalPartnershipRequests
  const averageEngagementRate = totalViews > 0 ? totalRequests / totalViews : 0

  return {
    total_shared_items: totalSharedItems,
    total_viewers: totalViewers,
    total_views: totalViews,
    total_quote_requests: totalQuoteRequests,
    total_order_requests: totalOrderRequests,
    total_partnership_requests: totalPartnershipRequests,
    average_engagement_rate: Math.round(averageEngagementRate * 100) / 100
  }
}

async function getTopPerformingItems(supabase: any, userId: string, period: string) {
  try {
    const { data: topItems, error } = await supabase
      .from('inventory_sharing_analytics_summary')
      .select(`
        *,
        sharing:inventory_sharing!inner(
          inventory:inventory(*)
        )
      `)
      .eq('owner_id', userId)
      .order('total_views', { ascending: false })
      .limit(5)

    if (error) throw error

    return topItems?.map((item: any) => ({
      id: item.inventory?.id,
      name: item.inventory?.name,
      sku: item.inventory?.sku,
      category: item.inventory?.category,
      total_views: item.total_views,
      total_quote_requests: item.total_quote_requests,
      total_order_requests: item.total_order_requests,
      engagement_rate: item.total_views > 0 
        ? ((item.total_quote_requests + item.total_order_requests) / item.total_views * 100).toFixed(1)
        : 0
    })) || []
  } catch (error) {
    console.error('Error getting top performing items:', error)
    return []
  }
}

async function getRecentActivity(supabase: any, userId: string, period: string) {
  try {
    const { data: recentActivity, error } = await supabase
      .from('inventory_sharing_analytics')
      .select(`
        *,
        sharing:inventory_sharing!inner(
          inventory:inventory(*)
        ),
        viewer:profiles!viewer_id(*)
      `)
      .eq('sharing.owner_id', userId)
      .order('last_viewed_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return recentActivity?.map((activity: any) => ({
      id: activity.id,
      type: 'view',
      item_name: activity.sharing?.inventory?.name,
      item_sku: activity.sharing?.inventory?.sku,
      viewer_name: activity.viewer?.full_name || 'Unknown',
      viewer_company: activity.viewer?.company_name || 'Unknown',
      timestamp: activity.last_viewed_at,
      metadata: activity.metadata
    })) || []
  } catch (error) {
    console.error('Error getting recent activity:', error)
    return []
  }
}
