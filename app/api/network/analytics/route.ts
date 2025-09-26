import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // For development, use a demo user ID if no auth
    let user = { id: '6d1a08f1-134c-46dd-aa1e-21f95b80bed4' } // Demo user
    
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authUser && !authError) {
        user = authUser
      }
    } catch (error) {
      console.log('🔧 Using demo user for analytics in development mode')
    }

    // Get total connections
    const { data: connections, error: connectionsError } = await supabase
      .from('partner_relationships')
      .select('status, created_at, partner_a, partner_b')
      .or(`partner_a.eq.${user.id},partner_b.eq.${user.id}`)

    if (connectionsError) {
      console.error('Error fetching connections:', connectionsError)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    // Calculate basic metrics
    const totalConnections = connections?.length || 0
    const acceptedConnections = connections?.filter((c: any) => c.status === 'accepted').length || 0
    const pendingRequests = connections?.filter((c: any) => c.status === 'pending').length || 0
    const rejectedConnections = connections?.filter((c: any) => c.status === 'rejected').length || 0

    // Calculate growth (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const newConnections = connections?.filter((c: any) => 
      new Date(c.created_at) > thirtyDaysAgo
    ).length || 0

    // Get partner details for analytics
    const partnerIds = Array.from(new Set(
      connections
        ?.filter((c: any) => c.status === 'accepted')
        .map((c: any) => c.partner_a === user.id ? c.partner_b : c.partner_a) || []
    ))

    let topIndustries: Array<{ industry: string; count: number; percentage: number }> = []
    let topLocations: Array<{ location: string; count: number; percentage: number }> = []

    if (partnerIds.length > 0) {
      const { data: partners } = await supabase
        .from('partners')
        .select('industry, location, specialties')
        .in('id', partnerIds)

      if (partners) {
        // Calculate industry distribution
        const industryCount: Record<string, number> = {}
        const locationCount: Record<string, number> = {}

        partners.forEach((partner: any) => {
          // Count specialties as industries
          if (partner.specialties && Array.isArray(partner.specialties)) {
            partner.specialties.forEach((specialty: string) => {
              industryCount[specialty] = (industryCount[specialty] || 0) + 1
            })
          }

          // Count locations
          if (partner.location) {
            const location = partner.location.split(',')[0].trim() // Get city
            locationCount[location] = (locationCount[location] || 0) + 1
          }
        })

        // Convert to arrays and calculate percentages
        topIndustries = Object.entries(industryCount)
          .map(([industry, count]) => ({
            industry,
            count,
            percentage: Math.round((count / totalConnections) * 100)
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)

        topLocations = Object.entries(locationCount)
          .map(([location, count]) => ({
            location,
            count,
            percentage: Math.round((count / totalConnections) * 100)
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)
      }
    }

    // Mock activity metrics (in a real app, these would come from actual tracking)
    const activityMetrics = {
      messagesSent: Math.floor(Math.random() * 50) + acceptedConnections * 2,
      messagesReceived: Math.floor(Math.random() * 40) + acceptedConnections * 1.5,
      profileViews: Math.floor(Math.random() * 100) + totalConnections * 3,
      searchQueries: Math.floor(Math.random() * 30) + 10
    }

    // Mock recommendation metrics
    const recommendations = {
      total: Math.floor(Math.random() * 20) + 15,
      highCompatibility: Math.floor(Math.random() * 8) + 5,
      mutualConnections: Math.floor(Math.random() * 10) + 3,
      industryMatches: Math.floor(Math.random() * 12) + 8
    }

    const networkStats = {
      totalConnections,
      pendingRequests,
      acceptedConnections,
      rejectedConnections,
      connectionGrowth: {
        period: "last_30_days",
        growth: newConnections > 0 ? Math.round((newConnections / totalConnections) * 100) : 0,
        newConnections
      },
      topIndustries,
      topLocations,
      activityMetrics,
      recommendations
    }

    return NextResponse.json({
      success: true,
      data: networkStats
    })

  } catch (error) {
    console.error('Error fetching network analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch network analytics' },
      { status: 500 }
    )
  }
}