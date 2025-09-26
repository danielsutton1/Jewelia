import { createSupabaseServerClient } from '@/lib/supabase/server'

// =====================================================
// INTERFACES
// =====================================================

export interface Partner {
  id: string
  name: string
  company: string
  avatar_url?: string
  location: string
  specialties: string[]
  rating: number
  reviewCount: number
  compatibilityScore: number
  mutualConnections: number
  sharedInterests: string[]
  recentActivity: string
  isOnline: boolean
  lastSeen?: string
  industry: string
  category: string
  description?: string
  website?: string
  contactPerson?: string
  email?: string
  phone?: string
}

export interface Connection {
  id: string
  partner_id: string
  user_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  message?: string
  created_at: string
  updated_at: string
  partner: Partner
  isIncoming?: boolean
}

export interface NetworkAnalytics {
  totalConnections: number
  pendingRequests: number
  acceptedConnections: number
  rejectedConnections: number
  blockedConnections: number
  mutualConnections: number
  connectionGrowth: {
    period: string
    growth: number
    newConnections: number
  }
  topIndustries: Array<{
    industry: string
    count: number
    percentage: number
  }>
  topLocations: Array<{
    location: string
    count: number
    percentage: number
  }>
  topSpecialties: Array<{
    specialty: string
    count: number
    percentage: number
  }>
  activityMetrics: {
    messagesSent: number
    messagesReceived: number
    profileViews: number
    searchQueries: number
  }
  recommendations: {
    total: number
    highCompatibility: number
    mutualConnections: number
    industryMatches: number
  }
  collaborationMetrics: {
    activeProjects: number
    completedProjects: number
    averageProjectDuration: number
    successRate: number
  }
}

export interface SearchFilters {
  query?: string
  category?: string
  location?: string
  industry?: string
  minRating?: number
  hasMutualConnections?: boolean
  isOnline?: boolean
  page?: number
  limit?: number
  userId: string
}

export interface SearchResults {
  partners: Partner[]
  total: number
  page: number
  limit: number
  totalPages: number
  filters: SearchFilters
}

export interface RecommendationFilters {
  minCompatibility?: number
  location?: string
  specialties?: string[]
  hasMutualConnections?: boolean
  isOnline?: boolean
  sortBy?: 'compatibility' | 'rating' | 'activity' | 'connections'
  limit?: number
}

// =====================================================
// NETWORK SERVICE
// =====================================================

export class NetworkService {
  private supabase: any

  constructor() {
    this.supabase = null
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createSupabaseServerClient()
    }
    return this.supabase
  }

  // =====================================================
  // PARTNER DISCOVERY & RECOMMENDATIONS
  // =====================================================

  async getRecommendations(userId: string, filters: RecommendationFilters = {}): Promise<Partner[]> {
    try {
      // Input validation
      if (!userId || userId.trim() === '') {
        throw new Error('User ID is required and cannot be empty')
      }
      
      if (filters.limit && (filters.limit < 0 || filters.limit > 100)) {
        throw new Error('Limit must be between 0 and 100')
      }

      const supabase = await this.getSupabase()
      
      // Get current user's profile to base recommendations on
      const { data: currentUser, error: userError } = await supabase
        .from('partners')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('Error fetching current user:', userError)
        throw new Error('Failed to fetch user profile')
      }

      // Get all potential partners (excluding current user and existing connections)
      const { data: existingConnections } = await supabase
        .from('partner_relationships')
        .select('partner_a, partner_b')
        .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)

      const connectedPartnerIds = new Set(
        existingConnections?.flatMap((conn: any) => 
          conn.partner_a === userId ? [conn.partner_b] : [conn.partner_a]
        ) || []
      )

      let query = supabase
        .from('partners')
        .select('*')
        .neq('id', userId)
        .eq('status', 'active')

      // Exclude already connected partners
      if (connectedPartnerIds.size > 0) {
        query = query.not('id', 'in', `(${Array.from(connectedPartnerIds).join(',')})`)
      }

      // Apply filters
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }

      if (filters.specialties && filters.specialties.length > 0) {
        query = query.overlaps('specialties', filters.specialties)
      }

      if (filters.isOnline) {
        query = query.eq('is_online', true)
      }

      // Apply limit (we'll get more than needed for scoring)
      const fetchLimit = Math.min((filters.limit || 20) * 3, 100)
      query = query.limit(fetchLimit)

      const { data: partners, error } = await query

      if (error) {
        console.error('Error fetching recommendations:', error)
        throw new Error('Failed to fetch recommendations')
      }

      // Calculate AI-powered compatibility scores
      const scoredPartners = await this.calculateCompatibilityScores(
        currentUser, 
        partners, 
        userId,
        filters.minCompatibility || 0
      )

      // Sort by compatibility and apply final limit
      const sortedPartners = scoredPartners
        .filter(partner => partner.compatibilityScore >= (filters.minCompatibility || 0))
        .sort((a, b) => {
          switch (filters.sortBy) {
            case 'rating':
              return (b.rating || 0) - (a.rating || 0)
            case 'activity':
              return new Date(b.recentActivity || 0).getTime() - new Date(a.recentActivity || 0).getTime()
            case 'connections':
              return (b.mutualConnections || 0) - (a.mutualConnections || 0)
            default: // compatibility
              return b.compatibilityScore - a.compatibilityScore
          }
        })
        .slice(0, filters.limit || 20)

      return sortedPartners

    } catch (error) {
      console.error('Error in getRecommendations:', error)
      throw error
    }
  }

  // AI-powered compatibility scoring algorithm
  private async calculateCompatibilityScores(
    currentUser: any, 
    partners: any[], 
    userId: string,
    minCompatibility: number = 0
  ): Promise<Partner[]> {
    const supabase = await this.getSupabase()

    const scoredPartners = await Promise.all(
      partners.map(async (partner) => {
        let compatibilityScore = 0
        let mutualConnections = 0
        let sharedInterests: string[] = []

        // 1. Specialty/Industry Compatibility (40% weight)
        const userSpecialties = currentUser.specialties || []
        const partnerSpecialties = partner.specialties || []
        
        // Perfect complementary matches (e.g., Designer + Manufacturer)
        const complementaryPairs = [
          ['Designer', 'Manufacturer'],
          ['Retailer', 'Supplier'],
          ['Gem Dealer', 'Designer'],
          ['Setter', 'Designer'],
          ['Polisher', 'Manufacturer']
        ]

        let specialtyScore = 0
        const hasComplementary = complementaryPairs.some(pair => 
          (userSpecialties.includes(pair[0]) && partnerSpecialties.includes(pair[1])) ||
          (userSpecialties.includes(pair[1]) && partnerSpecialties.includes(pair[0]))
        )

        if (hasComplementary) {
          specialtyScore = 40 // High score for complementary specialties
        } else {
          // Score based on shared specialties
          const sharedSpecialties = userSpecialties.filter((s: any) => partnerSpecialties.includes(s))
          specialtyScore = Math.min(30, sharedSpecialties.length * 10)
        }

        sharedInterests = userSpecialties.filter((s: any) => partnerSpecialties.includes(s))
        compatibilityScore += specialtyScore

        // 2. Location Proximity (20% weight)
        let locationScore = 0
        if (currentUser.location && partner.location) {
          if (currentUser.location === partner.location) {
            locationScore = 20 // Same city/region
          } else {
            // Extract state/country for broader matching
            const userRegion = currentUser.location.split(',').pop()?.trim()
            const partnerRegion = partner.location.split(',').pop()?.trim()
            if (userRegion === partnerRegion) {
              locationScore = 10 // Same state/country
            }
          }
        }
        compatibilityScore += locationScore

        // 3. Mutual Connections (15% weight)
        try {
          const { data: mutualConnectionsData } = await supabase
            .from('partner_relationships')
            .select('partner_a, partner_b')
            .eq('status', 'accepted')
            .or(`partner_a.eq.${partner.id},partner_b.eq.${partner.id}`)

          const partnerConnections = new Set(
            mutualConnectionsData?.flatMap((conn: any) => 
              conn.partner_a === partner.id ? [conn.partner_b] : [conn.partner_a]
            ) || []
          )

          const { data: userConnectionsData } = await supabase
            .from('partner_relationships')
            .select('partner_a, partner_b')
            .eq('status', 'accepted')
            .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)

          const userConnections = new Set(
            userConnectionsData?.flatMap((conn: any) => 
              conn.partner_a === userId ? [conn.partner_b] : [conn.partner_a]
            ) || []
          )

          mutualConnections = Array.from(partnerConnections).filter(id => 
            userConnections.has(id)
          ).length

          const mutualScore = Math.min(15, mutualConnections * 3)
          compatibilityScore += mutualScore
        } catch (error) {
          console.error('Error calculating mutual connections:', error)
        }

        // 4. Business Rating & Reviews (15% weight)
        const ratingScore = Math.min(15, (partner.rating || 0) * 3)
        compatibilityScore += ratingScore

        // 5. Recent Activity (10% weight)
        const activityScore = this.calculateActivityScore(partner.last_active_at)
        compatibilityScore += activityScore

        // Normalize to 0-100 scale
        compatibilityScore = Math.min(100, Math.round(compatibilityScore))

        return this.transformPartnerData({
          ...partner,
          compatibilityScore,
          mutualConnections,
          sharedInterests,
          recentActivity: partner.last_active_at || partner.updated_at
        })
      })
    )

    return scoredPartners.filter(partner => partner.compatibilityScore >= minCompatibility)
  }

  private calculateActivityScore(lastActiveAt: string | null): number {
    if (!lastActiveAt) return 0

    const now = new Date()
    const lastActive = new Date(lastActiveAt)
    const daysSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceActive <= 1) return 10      // Active today
    if (daysSinceActive <= 7) return 7       // Active this week
    if (daysSinceActive <= 30) return 4      // Active this month
    if (daysSinceActive <= 90) return 2      // Active in last 3 months
    return 0                                 // Inactive
  }

  async searchPartners(filters: SearchFilters): Promise<SearchResults> {
    try {
      const supabase = await this.getSupabase()
      
      let query = supabase
        .from('partners')
        .select('*', { count: 'exact' })
        .neq('id', filters.userId)
        .eq('status', 'active')

      // Apply search filters
      if (filters.query) {
        query = query.or(`
          name.ilike.%${filters.query}%,
          company.ilike.%${filters.query}%,
          description.ilike.%${filters.query}%,
          specialties.cs.{${filters.query}}
        `)
      }

      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }

      if (filters.industry) {
        query = query.eq('industry', filters.industry)
      }

      if (filters.minRating && filters.minRating > 0) {
        query = query.gte('rating', filters.minRating)
      }

      if (filters.isOnline) {
        query = query.eq('is_online', true)
      }

      // Apply pagination
      const page = filters.page || 1
      const limit = filters.limit || 20
      const offset = (page - 1) * limit

      const { data: partners, error, count } = await query
        .order('rating', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error searching partners:', error)
        throw new Error('Failed to search partners')
      }

      // Enhance partner data
      const enhancedPartners = await this.enhancePartnerData(partners, filters.userId)

      return {
        partners: enhancedPartners,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        filters
      }

    } catch (error) {
      console.error('Error in searchPartners:', error)
      throw error
    }
  }

  // =====================================================
  // CONNECTION MANAGEMENT
  // =====================================================

  async sendConnectionRequest(fromId: string, toId: string, message?: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      // Check if connection already exists
      const { data: existingConnection } = await supabase
        .from('partner_relationships')
        .select('*')
        .or(`partner_a.eq.${fromId},partner_b.eq.${fromId}`)
        .or(`partner_a.eq.${toId},partner_b.eq.${toId}`)
        .single()

      if (existingConnection) {
        throw new Error('Connection already exists')
      }

      // Create connection request
      const { error } = await supabase
        .from('partner_relationships')
        .insert({
          partner_a: fromId,
          partner_b: toId,
          status: 'pending',
          message: message || null,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error creating connection request:', error)
        throw new Error('Failed to create connection request')
      }

    } catch (error) {
      console.error('Error in sendConnectionRequest:', error)
      throw error
    }
  }

  async acceptConnection(connectionId: string, userId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      // Verify user owns the connection
      const { data: connection, error: fetchError } = await supabase
        .from('partner_relationships')
        .select('*')
        .eq('id', connectionId)
        .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)
        .single()

      if (fetchError || !connection) {
        throw new Error('Connection not found or access denied')
      }

      // Update connection status
      const { error } = await supabase
        .from('partner_relationships')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId)

      if (error) {
        console.error('Error accepting connection:', error)
        throw new Error('Failed to accept connection')
      }

    } catch (error) {
      console.error('Error in acceptConnection:', error)
      throw error
    }
  }

  async rejectConnection(connectionId: string, userId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      // Verify user owns the connection
      const { data: connection, error: fetchError } = await supabase
        .from('partner_relationships')
        .select('*')
        .eq('id', connectionId)
        .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)
        .single()

      if (fetchError || !connection) {
        throw new Error('Connection not found or access denied')
      }

      // Update connection status
      const { error } = await supabase
        .from('partner_relationships')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId)

      if (error) {
        console.error('Error rejecting connection:', error)
        throw new Error('Failed to reject connection')
      }

    } catch (error) {
      console.error('Error in rejectConnection:', error)
      throw error
    }
  }

  async blockConnection(connectionId: string, userId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      // Verify user owns the connection
      const { data: connection, error: fetchError } = await supabase
        .from('partner_relationships')
        .select('*')
        .eq('id', connectionId)
        .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)
        .single()

      if (fetchError || !connection) {
        throw new Error('Connection not found or access denied')
      }

      // Update connection status
      const { error } = await supabase
        .from('partner_relationships')
        .update({
          status: 'blocked',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId)

      if (error) {
        console.error('Error blocking connection:', error)
        throw new Error('Failed to block connection')
      }

    } catch (error) {
      console.error('Error in blockConnection:', error)
      throw error
    }
  }

  async removeConnection(connectionId: string, userId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      
      // Verify user owns the connection
      const { data: connection, error: fetchError } = await supabase
        .from('partner_relationships')
        .select('*')
        .eq('id', connectionId)
        .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)
        .single()

      if (fetchError || !connection) {
        throw new Error('Connection not found or access denied')
      }

      // Delete connection
      const { error } = await supabase
        .from('partner_relationships')
        .delete()
        .eq('id', connectionId)

      if (error) {
        console.error('Error removing connection:', error)
        throw new Error('Failed to remove connection')
      }

    } catch (error) {
      console.error('Error in removeConnection:', error)
      throw error
    }
  }

  async getUserConnections(userId: string, options: {
    status?: string
    limit?: number
    offset?: number
  } = {}): Promise<Connection[]> {
    try {
      const supabase = await this.getSupabase()
      
      let query = supabase
        .from('partner_relationships')
        .select(`
          *,
          partners!partner_a(*),
          partners!partner_b(*)
        `)
        .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)

      // Apply status filter
      if (options.status && options.status !== 'all') {
        query = query.eq('status', options.status)
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
      }

      const { data: connections, error } = await query
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user connections:', error)
        throw new Error('Failed to fetch user connections')
      }

      // Transform data to match Connection interface
      const transformedConnections: Connection[] = connections.map((conn: any) => {
        const isPartnerA = conn.partner_a === userId
        const partner = isPartnerA ? conn.partners_b : conn.partners_a
        
        return {
          id: conn.id,
          partner_id: partner.id,
          user_id: userId,
          status: conn.status,
          message: conn.message,
          created_at: conn.created_at,
          updated_at: conn.updated_at,
          partner: {
            id: partner.id,
            name: partner.name,
            company: partner.company,
            avatar_url: partner.avatar_url,
            location: partner.location,
            specialties: partner.specialties || [],
            rating: partner.rating || 0,
            reviewCount: partner.review_count || 0,
            compatibilityScore: 0, // Will be calculated
            mutualConnections: 0, // Will be calculated
            sharedInterests: [], // Will be calculated
            recentActivity: partner.updated_at,
            isOnline: partner.is_online || false,
            lastSeen: partner.last_seen,
            industry: partner.industry || '',
            category: partner.category || '',
            description: partner.description,
            website: partner.website,
            contactPerson: partner.contact_person,
            email: partner.email,
            phone: partner.phone
          }
        }
      })

      return transformedConnections

    } catch (error) {
      console.error('Error in getUserConnections:', error)
      throw error
    }
  }

  // =====================================================
  // CONNECTION REQUESTS MANAGEMENT
  // =====================================================

  async getPendingConnectionRequests(userId: string): Promise<Connection[]> {
    try {
      const supabase = await this.getSupabase()
      
      // Get incoming connection requests (where user is partner_b)
      const { data: incomingRequests, error: incomingError } = await supabase
        .from('partner_relationships')
        .select(`
          *,
          partners!partner_a(*)
        `)
        .eq('partner_b', userId)
        .eq('status', 'pending')

      if (incomingError) {
        console.error('Error fetching incoming requests:', incomingError)
        throw new Error('Failed to fetch incoming requests')
      }

      // Get outgoing connection requests (where user is partner_a)
      const { data: outgoingRequests, error: outgoingError } = await supabase
        .from('partner_relationships')
        .select(`
          *,
          partners!partner_b(*)
        `)
        .eq('partner_a', userId)
        .eq('status', 'pending')

      if (outgoingError) {
        console.error('Error fetching outgoing requests:', outgoingError)
        throw new Error('Failed to fetch outgoing requests')
      }

      // Transform incoming requests
      const transformedIncoming: Connection[] = incomingRequests.map((conn: any) => ({
        id: conn.id,
        partner_id: conn.partner_a,
        user_id: userId,
        status: conn.status,
        message: conn.message,
        created_at: conn.created_at,
        updated_at: conn.updated_at,
        isIncoming: true,
        partner: this.transformPartnerData(conn.partners_a)
      }))

      // Transform outgoing requests
      const transformedOutgoing: Connection[] = outgoingRequests.map((conn: any) => ({
        id: conn.id,
        partner_id: conn.partner_b,
        user_id: userId,
        status: conn.status,
        message: conn.message,
        created_at: conn.created_at,
        updated_at: conn.updated_at,
        isIncoming: false,
        partner: this.transformPartnerData(conn.partners_b)
      }))

      return [...transformedIncoming, ...transformedOutgoing]

    } catch (error) {
      console.error('Error in getPendingConnectionRequests:', error)
      throw error
    }
  }

  async getConnectionStatus(userId: string, partnerId: string): Promise<{
    status: 'connected' | 'pending' | 'not_connected' | 'blocked'
    connectionId?: string
    isIncoming?: boolean
    message?: string
  }> {
    try {
      const supabase = await this.getSupabase()
      
      // Check for existing connection
      const { data: connection, error } = await supabase
        .from('partner_relationships')
        .select('*')
        .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)
        .or(`partner_a.eq.${partnerId},partner_b.eq.${partnerId}`)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking connection status:', error)
        throw new Error('Failed to check connection status')
      }

      if (!connection) {
        return { status: 'not_connected' }
      }

      const isIncoming = connection.partner_a === partnerId && connection.partner_b === userId
      const isOutgoing = connection.partner_a === userId && connection.partner_b === partnerId

      if (!isIncoming && !isOutgoing) {
        return { status: 'not_connected' }
      }

      return {
        status: connection.status as any,
        connectionId: connection.id,
        isIncoming,
        message: connection.message
      }

    } catch (error) {
      console.error('Error in getConnectionStatus:', error)
      throw error
    }
  }

  private transformPartnerData(partner: any): Partner {
    return {
      id: partner.id,
      name: partner.name,
      company: partner.company,
      avatar_url: partner.avatar_url,
      location: partner.location,
      specialties: partner.specialties || [],
      rating: partner.rating || 0,
      reviewCount: partner.review_count || 0,
      compatibilityScore: 0,
      mutualConnections: 0,
      sharedInterests: [],
      recentActivity: partner.updated_at,
      isOnline: partner.is_online || false,
      lastSeen: partner.last_seen,
      industry: partner.industry || '',
      category: partner.category || '',
      description: partner.description,
      website: partner.website,
      contactPerson: partner.contact_person,
      email: partner.email,
      phone: partner.phone
    }
  }

  // =====================================================
  // NETWORK ANALYTICS
  // =====================================================

  async getNetworkAnalytics(userId: string, options: {
    period?: string
    includeDetails?: boolean
  } = {}): Promise<NetworkAnalytics> {
    try {
      const supabase = await this.getSupabase()
      
      // Get basic connection counts
      const { data: connections, error: connectionsError } = await supabase
        .from('partner_relationships')
        .select('status')
        .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)

      if (connectionsError) {
        console.error('Error fetching connections for analytics:', connectionsError)
        throw new Error('Failed to fetch connection data')
      }

      // Calculate connection statistics
      const totalConnections = connections.length
      const pendingRequests = connections.filter((c: any) => c.status === 'pending').length
      const acceptedConnections = connections.filter((c: any) => c.status === 'accepted').length
      const rejectedConnections = connections.filter((c: any) => c.status === 'rejected').length
      const blockedConnections = connections.filter((c: any) => c.status === 'blocked').length

      // Get mutual connections count
      const { data: mutualConnections, error: mutualError } = await supabase
        .from('partner_relationships')
        .select('partner_a, partner_b')
        .eq('status', 'accepted')
        .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)

      if (mutualError) {
        console.error('Error fetching mutual connections:', mutualError)
      }

      const mutualConnectionsCount = mutualConnections?.length || 0

      // Get industry distribution
      const { data: industryData, error: industryError } = await supabase
        .from('partners')
        .select('industry')
        .in('id', connections
          .filter((c: any) => c.status === 'accepted')
          .map((c: any) => c.partner_a === userId ? c.partner_b : c.partner_a)
        )

      if (industryError) {
        console.error('Error fetching industry data:', industryError)
      }

      // Calculate industry distribution
      const industryCounts = new Map<string, number>()
      industryData?.forEach((partner: any) => {
        if (partner.industry) {
          industryCounts.set(partner.industry, (industryCounts.get(partner.industry) || 0) + 1)
        }
      })

      const topIndustries = Array.from(industryCounts.entries())
        .map(([industry, count]) => ({
          industry,
          count,
          percentage: (count / acceptedConnections) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Get location distribution
      const { data: locationData, error: locationError } = await supabase
        .from('partners')
        .select('location')
        .in('id', connections
          .filter((c: any) => c.status === 'accepted')
          .map((c: any) => c.partner_a === userId ? c.partner_b : c.partner_a)
        )

      if (locationError) {
        console.error('Error fetching location data:', locationError)
      }

      // Calculate location distribution
      const locationCounts = new Map<string, number>()
      locationData?.forEach((partner: any) => {
        if (partner.location) {
          locationCounts.set(partner.location, (locationCounts.get(partner.location) || 0) + 1)
        }
      })

      const topLocations = Array.from(locationCounts.entries())
        .map(([location, count]) => ({
          location,
          count,
          percentage: (count / acceptedConnections) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Calculate connection growth (simplified - would need more complex logic for real periods)
      const connectionGrowth = {
        period: options.period || '30d',
        growth: 0, // Would calculate based on period
        newConnections: 0 // Would calculate based on period
      }

      // Activity metrics (simplified - would need to query actual activity data)
      const activityMetrics = {
        messagesSent: 0,
        messagesReceived: 0,
        profileViews: 0,
        searchQueries: 0
      }

      // Recommendations summary
      const recommendations = {
        total: 0,
        highCompatibility: 0,
        mutualConnections: 0,
        industryMatches: 0
      }

      return {
        totalConnections,
        pendingRequests,
        acceptedConnections,
        rejectedConnections,
        blockedConnections,
        mutualConnections: mutualConnectionsCount,
        connectionGrowth,
        topIndustries,
        topLocations,
        topSpecialties: [],
        activityMetrics,
        recommendations,
        collaborationMetrics: {
          activeProjects: 0,
          completedProjects: 0,
          averageProjectDuration: 0,
          successRate: 0
        }
      }

    } catch (error) {
      console.error('Error in getNetworkAnalytics:', error)
      throw error
    }
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private async enhancePartnerData(partners: any[], userId: string): Promise<Partner[]> {
    try {
      // This method would enhance partner data with:
      // - Compatibility scores
      // - Mutual connection counts
      // - Shared interests
      // - Online status
      
      const enhancedPartners: Partner[] = partners.map(partner => ({
        id: partner.id,
        name: partner.name,
        company: partner.company,
        avatar_url: partner.avatar_url,
        location: partner.location,
        specialties: partner.specialties || [],
        rating: partner.rating || 0,
        reviewCount: partner.review_count || 0,
        compatibilityScore: this.calculateCompatibilityScore(partner, userId),
        mutualConnections: 0, // Would calculate from database
        sharedInterests: [], // Would calculate from database
        recentActivity: partner.updated_at,
        isOnline: partner.is_online || false,
        lastSeen: partner.last_seen,
        industry: partner.industry || '',
        category: partner.category || '',
        description: partner.description,
        website: partner.website,
        contactPerson: partner.contact_person,
        email: partner.email,
        phone: partner.phone
      }))

      return enhancedPartners

    } catch (error) {
      console.error('Error enhancing partner data:', error)
      return partners
    }
  }

  private calculateCompatibilityScore(partner: any, userId: string): number {
    // Simplified compatibility calculation
    // In a real implementation, this would consider:
    // - Industry match
    // - Location proximity
    // - Specialties overlap
    // - Mutual connections
    // - Activity patterns
    
    let score = 50 // Base score

    // Industry bonus
    if (partner.industry) {
      score += 10
    }

    // Rating bonus
    if (partner.rating) {
      score += Math.min(partner.rating * 2, 20)
    }

    // Location bonus (if same city/region)
    if (partner.location) {
      score += 5
    }

    // Specialties bonus
    if (partner.specialties && partner.specialties.length > 0) {
      score += Math.min(partner.specialties.length * 3, 15)
    }

    return Math.min(score, 100)
  }

  // =====================================================
  // MISSING METHODS
  // =====================================================

  async discoverPartners(filters: {
    search?: string
    specialties?: string[]
    location?: string
    industry?: string
    rating?: number
    limit?: number
  }): Promise<{ partners: Partner[], total: number }> {
    try {
      const supabase = await this.getSupabase()
      
      let query = supabase
        .from('partners')
        .select('*')
        .eq('status', 'active')

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters.specialties && filters.specialties.length > 0) {
        query = query.overlaps('specialties', filters.specialties)
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }

      if (filters.industry) {
        query = query.eq('industry', filters.industry)
      }

      if (filters.rating) {
        query = query.gte('rating', filters.rating)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data: partners, error, count } = await query

      if (error) {
        console.error('Error discovering partners:', error)
        return { partners: [], total: 0 }
      }

      const enhancedPartners = await this.enhancePartnerData(partners || [], '')
      return {
        partners: enhancedPartners,
        total: count || enhancedPartners.length
      }
    } catch (error) {
      console.error('Error in discoverPartners:', error)
      return { partners: [], total: 0 }
    }
  }


  async getCollaborationSpaces(userId: string): Promise<any[]> {
    try {
      const supabase = await this.getSupabase()
      
      // Get user's connections
      const { data: connections } = await supabase
        .from('partner_relationships')
        .select('partner_a, partner_b')
        .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)
        .eq('status', 'accepted')

      if (!connections || connections.length === 0) {
        return []
      }

      // Get collaboration spaces for these connections
      const partnerIds = connections.flatMap((conn: { partner_a: string; partner_b: string }) => 
        conn.partner_a === userId ? conn.partner_b : conn.partner_a
      )

      const { data: spaces, error } = await supabase
        .from('collaboration_spaces')
        .select(`
          *,
          participants:users!collaboration_spaces_participants_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .in('created_by', partnerIds)
        .eq('is_active', true)

      if (error) {
        console.error('Error getting collaboration spaces:', error)
        return []
      }

      return spaces || []
    } catch (error) {
      console.error('Error in getCollaborationSpaces:', error)
      return []
    }
  }
} 