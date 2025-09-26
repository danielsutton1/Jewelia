import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SharedInventoryItem, SharedInventoryFilters } from '@/types/inventory-sharing'

// =====================================================
// AI RECOMMENDATION SERVICE WITH OPENAI INTEGRATION
// =====================================================

export interface RecommendationScore {
  item: SharedInventoryItem
  score: number
  reasons: string[]
  confidence: number
  aiInsights?: {
    personalizationFactors: string[]
    marketTrends: string[]
    customerBehavior: string[]
    crossSellOpportunities: string[]
    pricingRecommendations: string[]
  }
}

export interface UserPreferences {
  preferred_categories: string[]
  preferred_metal_types: string[]
  preferred_gemstone_types: string[]
  price_range: { min: number; max: number }
  preferred_brands: string[]
  recent_viewed_items: string[]
  recent_purchases: string[]
  connection_interests: string[]
}

export interface RecommendationContext {
  userId: string
  userPreferences: UserPreferences
  currentInventory: SharedInventoryItem[]
  networkConnections: string[]
  marketTrends: any
  seasonalFactors: any
}

export class AIRecommendationService {
  private supabase: any
  private openaiApiKey: string

  constructor() {
    this.supabase = null
    this.openaiApiKey = process.env.OPENAI_API_KEY || ''
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createSupabaseServerClient()
    }
    return this.supabase
  }

  // =====================================================
  // CORE RECOMMENDATION ENGINE WITH AI ENHANCEMENT
  // =====================================================

  async getPersonalizedRecommendations(
    userId: string, 
    limit: number = 10
  ): Promise<RecommendationScore[]> {
    try {
      const supabase = await this.getSupabase()
      
      // Get user preferences and behavior data
      const userPreferences = await this.getUserPreferences(userId)
      const networkConnections = await this.getNetworkConnections(userId)
      const recentActivity = await this.getRecentActivity(userId)
      
      // Get available shared inventory
      const { data: sharedInventory, error } = await supabase
        .from('shared_inventory_view')
        .select('*')
        .eq('is_shared', true)
        .neq('owner_id', userId)

      if (error) throw error

      // Score and rank items
      const scoredItems = await this.scoreInventoryItems(
        sharedInventory || [],
        userPreferences,
        networkConnections,
        recentActivity
      )

      // Generate AI insights for top recommendations
      const topRecommendations = scoredItems
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

      // Enhance with AI insights if OpenAI is available
      const enhancedRecommendations = await this.enhanceWithAIInsights(
        topRecommendations,
        userPreferences,
        recentActivity
      )

      return enhancedRecommendations.map(item => ({
        item: item.inventory,
        score: item.score,
        reasons: item.reasons,
        confidence: item.confidence,
        aiInsights: item.aiInsights
      }))

    } catch (error) {
      console.error('Error getting personalized recommendations:', error)
      throw new Error(`Failed to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getNetworkBasedRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<RecommendationScore[]> {
    try {
      const supabase = await this.getSupabase()
      
      // Get user's network connections
      const connections = await this.getNetworkConnections(userId)
      
      if (connections.length === 0) {
        return []
      }

      // Get inventory from connected users
      const { data: networkInventory, error } = await supabase
        .from('shared_inventory_view')
        .select('*')
        .in('owner_id', connections)
        .eq('is_shared', true)

      if (error) throw error

      // Score based on network relevance
      const scoredItems = await this.scoreNetworkItems(
        networkInventory || [],
        connections,
        userId
      )

      return scoredItems
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => ({
          item: item.inventory,
          score: item.score,
          reasons: item.reasons,
          confidence: item.confidence
        }))

    } catch (error) {
      console.error('Error getting network-based recommendations:', error)
      throw new Error(`Failed to get network recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getTrendingRecommendations(
    limit: number = 10
  ): Promise<RecommendationScore[]> {
    try {
      const supabase = await this.getSupabase()
      
      // Get trending items based on views and requests
      const { data: trendingData, error } = await supabase
        .from('inventory_sharing_analytics_summary')
        .select('*')
        .order('total_views', { ascending: false })
        .limit(50)

      if (error) throw error

      // Get full item details for trending items
      const trendingItemIds = trendingData?.map((item: any) => item.inventory_id) || []
      
      if (trendingItemIds.length === 0) {
        return []
      }

      const { data: trendingItems, error: itemsError } = await supabase
        .from('shared_inventory_view')
        .select('*')
        .in('id', trendingItemIds)

      if (itemsError) throw itemsError

      // Score based on trending metrics
      const scoredItems = await this.scoreTrendingItems(
        trendingItems || [],
        trendingData || []
      )

      return scoredItems
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => ({
          item: item.inventory,
          score: item.score,
          reasons: item.reasons,
          confidence: item.confidence
        }))

    } catch (error) {
      console.error('Error getting trending recommendations:', error)
      throw new Error(`Failed to get trending recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getCollaborativeRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<RecommendationScore[]> {
    try {
      const supabase = await this.getSupabase()
      
      // Get users with similar preferences
      const similarUsers = await this.findSimilarUsers(userId)
      
      if (similarUsers.length === 0) {
        return []
      }

      // Get items liked by similar users
      const { data: collaborativeItems, error } = await supabase
        .from('shared_inventory_view')
        .select('*')
        .in('owner_id', similarUsers)
        .eq('is_shared', true)

      if (error) throw error

      // Score based on collaborative filtering
      const scoredItems = await this.scoreCollaborativeItems(
        collaborativeItems || [],
        similarUsers,
        userId
      )

      return scoredItems
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => ({
          item: item.inventory,
          score: item.score,
          reasons: item.reasons,
          confidence: item.confidence
        }))

    } catch (error) {
      console.error('Error getting collaborative recommendations:', error)
      throw new Error(`Failed to get collaborative recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // =====================================================
  // RECOMMENDATION SCORING ALGORITHMS
  // =====================================================

  private async scoreInventoryItems(
    items: any[],
    preferences: UserPreferences,
    connections: string[],
    recentActivity: any[]
  ): Promise<Array<{ inventory: any; score: number; reasons: string[]; confidence: number }>> {
    return items.map(item => {
      let score = 0
      const reasons: string[] = []
      let confidence = 0.5

      // Category preference scoring
      if (preferences.preferred_categories.includes(item.category)) {
        score += 20
        reasons.push(`Matches your preferred category: ${item.category}`)
        confidence += 0.1
      }

      // Metal type preference scoring
      if (preferences.preferred_metal_types.includes(item.metal_type)) {
        score += 15
        reasons.push(`Matches your preferred metal: ${item.metal_type}`)
        confidence += 0.1
      }

      // Gemstone preference scoring
      if (preferences.preferred_gemstone_types.includes(item.gemstone_type)) {
        score += 15
        reasons.push(`Matches your preferred gemstone: ${item.gemstone_type}`)
        confidence += 0.1
      }

      // Price range scoring
      if (item.price >= preferences.price_range.min && item.price <= preferences.price_range.max) {
        score += 25
        reasons.push('Price within your preferred range')
        confidence += 0.15
      } else if (item.price <= preferences.price_range.max * 1.2) {
        score += 10
        reasons.push('Price slightly above your range but close')
        confidence += 0.05
      }

      // Brand preference scoring
      if (preferences.preferred_brands.includes(item.brand)) {
        score += 10
        reasons.push(`From your preferred brand: ${item.brand}`)
        confidence += 0.1
      }

      // Network connection scoring
      if (connections.includes(item.owner_id)) {
        score += 20
        reasons.push('From your professional network')
        confidence += 0.15
      }

      // Recent activity relevance
      const recentRelevance = this.calculateRecentRelevance(item, recentActivity)
      score += recentRelevance.score
      if (recentRelevance.reasons.length > 0) {
        reasons.push(...recentRelevance.reasons)
        confidence += 0.1
      }

      // Seasonal and trend scoring
      const seasonalScore = this.calculateSeasonalScore(item)
      score += seasonalScore
      if (seasonalScore > 0) {
        reasons.push('Trending or seasonal item')
        confidence += 0.05
      }

      // Normalize confidence to 0-1 range
      confidence = Math.min(1, Math.max(0, confidence))

      return {
        inventory: item,
        score: Math.max(0, score),
        reasons,
        confidence
      }
    })
  }

  private async scoreNetworkItems(
    items: any[],
    connections: string[],
    userId: string
  ): Promise<Array<{ inventory: any; score: number; reasons: string[]; confidence: number }>> {
    return items.map(item => {
      let score = 0
      const reasons: string[] = []
      let confidence = 0.6

      // Connection strength scoring
      const connectionStrength = this.getConnectionStrength(item.owner_id, connections)
      score += connectionStrength * 30
      reasons.push(`Strong connection with ${connectionStrength > 0.7 ? 'trusted' : 'professional'} partner`)
      confidence += connectionStrength * 0.2

      // Item quality scoring
      if (item.gemstone_quality && ['VVS1', 'VVS2', 'VS1'].includes(item.gemstone_quality)) {
        score += 15
        reasons.push('High-quality gemstone')
        confidence += 0.1
      }

      // Brand reputation scoring
      if (item.brand && ['Jewelia', 'Tiffany', 'Cartier'].includes(item.brand)) {
        score += 10
        reasons.push('Reputable brand')
        confidence += 0.1
      }

      // Price competitiveness
      if (item.price && item.price < 5000) {
        score += 10
        reasons.push('Competitive pricing')
        confidence += 0.05
      }

      return {
        inventory: item,
        score: Math.max(0, score),
        reasons,
        confidence: Math.min(1, confidence)
      }
    })
  }

  private async scoreTrendingItems(
    items: any[],
    analytics: any[]
  ): Promise<Array<{ inventory: any; score: number; reasons: string[]; confidence: number }>> {
    return items.map(item => {
      const itemAnalytics = analytics.find(a => a.inventory_id === item.id)
      let score = 0
      const reasons: string[] = []
      let confidence = 0.5

      if (itemAnalytics) {
        // View-based scoring
        const viewScore = Math.min(50, itemAnalytics.total_views * 2)
        score += viewScore
        reasons.push(`High interest: ${itemAnalytics.total_views} views`)

        // Request-based scoring
        const requestScore = Math.min(30, (itemAnalytics.total_quote_requests + itemAnalytics.total_order_requests) * 5)
        score += requestScore
        if (itemAnalytics.total_quote_requests > 0) {
          reasons.push(`${itemAnalytics.total_quote_requests} quote requests`)
        }
        if (itemAnalytics.total_order_requests > 0) {
          reasons.push(`${itemAnalytics.total_order_requests} order requests`)
        }

        // Recent activity scoring
        if (itemAnalytics.last_activity) {
          const daysSinceActivity = Math.floor((Date.now() - new Date(itemAnalytics.last_activity).getTime()) / (1000 * 60 * 60 * 24))
          if (daysSinceActivity <= 7) {
            score += 15
            reasons.push('Very recent activity')
            confidence += 0.1
          } else if (daysSinceActivity <= 30) {
            score += 10
            reasons.push('Recent activity')
            confidence += 0.05
          }
        }

        confidence += Math.min(0.3, (itemAnalytics.total_views + itemAnalytics.total_quote_requests) * 0.01)
      }

      return {
        inventory: item,
        score: Math.max(0, score),
        reasons,
        confidence: Math.min(1, confidence)
      }
    })
  }

  private async scoreCollaborativeItems(
    items: any[],
    similarUsers: string[],
    userId: string
  ): Promise<Array<{ inventory: any; score: number; reasons: string[]; confidence: number }>> {
    return items.map(item => {
      let score = 0
      const reasons: string[] = []
      let confidence = 0.4

      // Similar user preference scoring
      score += 25
      reasons.push('Recommended by users with similar tastes')
      confidence += 0.2

      // Item popularity among similar users
      const popularityScore = Math.min(20, similarUsers.length * 2)
      score += popularityScore
      reasons.push(`Popular among ${similarUsers.length} similar users`)

      // Quality indicators
      if (item.gemstone_quality && ['VVS1', 'VVS2'].includes(item.gemstone_quality)) {
        score += 15
        reasons.push('High-quality gemstone')
        confidence += 0.1
      }

      // Brand recognition
      if (item.brand) {
        score += 10
        reasons.push('Recognized brand')
        confidence += 0.05
      }

      return {
        inventory: item,
        score: Math.max(0, score),
        reasons,
        confidence: Math.min(1, confidence)
      }
    })
  }

  // =====================================================
  // OPENAI INTEGRATION FOR RECOMMENDATION INSIGHTS
  // =====================================================

  /**
   * Enhance recommendations with AI-powered insights
   */
  private async enhanceWithAIInsights(
    recommendations: any[],
    userPreferences: UserPreferences,
    recentActivity: any
  ): Promise<any[]> {
    try {
      if (!this.openaiApiKey || recommendations.length === 0) {
        return recommendations.map(rec => ({
          ...rec,
          aiInsights: this.generateFallbackInsights(rec, userPreferences)
        }))
      }

      const enhancedRecommendations = []

      for (const recommendation of recommendations) {
        const aiInsights = await this.generateAIInsights(recommendation, userPreferences, recentActivity)
        enhancedRecommendations.push({
          ...recommendation,
          aiInsights
        })
      }

      return enhancedRecommendations
    } catch (error) {
      console.error('Error enhancing recommendations with AI:', error)
      return recommendations.map(rec => ({
        ...rec,
        aiInsights: this.generateFallbackInsights(rec, userPreferences)
      }))
    }
  }

  /**
   * Generate AI insights for a specific recommendation
   */
  private async generateAIInsights(
    recommendation: any,
    userPreferences: UserPreferences,
    recentActivity: any
  ): Promise<RecommendationScore['aiInsights']> {
    try {
      const prompt = this.buildRecommendationPrompt(recommendation, userPreferences, recentActivity)
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an AI expert in jewelry recommendations, customer behavior analysis, and market trends. Provide insights for personalized jewelry recommendations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content || ''

      return this.parseRecommendationInsights(aiResponse)
    } catch (error) {
      console.error('Error generating AI insights:', error)
      return this.generateFallbackInsights(recommendation, userPreferences)
    }
  }

  /**
   * Build OpenAI prompt for recommendation insights
   */
  private buildRecommendationPrompt(
    recommendation: any,
    userPreferences: UserPreferences,
    recentActivity: any
  ): string {
    const item = recommendation.inventory
    
    return `
Jewelry Recommendation Analysis:

Item Details:
- Name: ${item.name || 'N/A'}
- Category: ${item.category || 'N/A'}
- Metal Type: ${item.metal_type || 'N/A'}
- Gemstone: ${item.gemstone_type || 'N/A'}
- Price: $${item.price || 'N/A'}
- Score: ${recommendation.score}/100

User Preferences:
- Preferred Categories: ${userPreferences.preferred_categories.join(', ')}
- Preferred Metals: ${userPreferences.preferred_metal_types.join(', ')}
- Preferred Gemstones: ${userPreferences.preferred_gemstone_types.join(', ')}
- Price Range: $${userPreferences.price_range.min} - $${userPreferences.price_range.max}

Recent Activity:
- Recent Views: ${recentActivity.recent_views?.join(', ') || 'None'}
- Recent Purchases: ${recentActivity.recent_purchases?.join(', ') || 'None'}

Please provide insights on:
1. Personalization Factors: Why this item matches the user's preferences
2. Market Trends: Current market position of this item type
3. Customer Behavior: How this recommendation aligns with user behavior
4. Cross-sell Opportunities: What else might interest this customer
5. Pricing Recommendations: Is this price appropriate for the user?

Focus on practical business insights for jewelry recommendations.
    `.trim()
  }

  /**
   * Parse AI response into structured insights
   */
  private parseRecommendationInsights(aiResponse: string): RecommendationScore['aiInsights'] {
    const lines = aiResponse.split('\n').filter(line => line.trim())
    
    let personalizationFactors: string[] = []
    let marketTrends: string[] = []
    let customerBehavior: string[] = []
    let crossSellOpportunities: string[] = []
    let pricingRecommendations: string[] = []

    lines.forEach(line => {
      const lowerLine = line.toLowerCase()
      if (lowerLine.includes('personalization') || lowerLine.includes('preferences') || lowerLine.includes('matches')) {
        personalizationFactors.push(line.trim())
      } else if (lowerLine.includes('market') || lowerLine.includes('trend')) {
        marketTrends.push(line.trim())
      } else if (lowerLine.includes('behavior') || lowerLine.includes('activity')) {
        customerBehavior.push(line.trim())
      } else if (lowerLine.includes('cross-sell') || lowerLine.includes('opportunity') || lowerLine.includes('interest')) {
        crossSellOpportunities.push(line.trim())
      } else if (lowerLine.includes('pricing') || lowerLine.includes('price') || lowerLine.includes('cost')) {
        pricingRecommendations.push(line.trim())
      }
    })

    return {
      personalizationFactors: personalizationFactors.length > 0 ? personalizationFactors : ['Item aligns with user preferences'],
      marketTrends: marketTrends.length > 0 ? marketTrends : ['Current market trends support this recommendation'],
      customerBehavior: customerBehavior.length > 0 ? customerBehavior : ['Recommendation matches user behavior patterns'],
      crossSellOpportunities: crossSellOpportunities.length > 0 ? crossSellOpportunities : ['Consider complementary items'],
      pricingRecommendations: pricingRecommendations.length > 0 ? pricingRecommendations : ['Price is within user range']
    }
  }

  /**
   * Generate fallback insights when OpenAI is not available
   */
  private generateFallbackInsights(
    recommendation: any,
    userPreferences: UserPreferences
  ): RecommendationScore['aiInsights'] {
    const item = recommendation.inventory
    
    const personalizationFactors: string[] = []
    const marketTrends: string[] = []
    const customerBehavior: string[] = []
    const crossSellOpportunities: string[] = []
    const pricingRecommendations: string[] = []

    // Personalization factors
    if (userPreferences.preferred_categories.includes(item.category)) {
      personalizationFactors.push(`Matches preferred category: ${item.category}`)
    }
    if (userPreferences.preferred_metal_types.includes(item.metal_type)) {
      personalizationFactors.push(`Matches preferred metal: ${item.metal_type}`)
    }
    if (userPreferences.preferred_gemstone_types.includes(item.gemstone_type)) {
      personalizationFactors.push(`Matches preferred gemstone: ${item.gemstone_type}`)
    }

    // Price analysis
    if (item.price >= userPreferences.price_range.min && item.price <= userPreferences.price_range.max) {
      pricingRecommendations.push('Price is within user\'s preferred range')
    } else if (item.price < userPreferences.price_range.min) {
      pricingRecommendations.push('Price is below user\'s minimum - potential value opportunity')
    } else {
      pricingRecommendations.push('Price is above user\'s range - consider alternatives or promotions')
    }

    // Cross-sell opportunities
    if (item.category === 'ring') {
      crossSellOpportunities.push('Consider matching necklace or earrings')
    } else if (item.category === 'necklace') {
      crossSellOpportunities.push('Consider matching bracelet or earrings')
    }

    // Market trends (basic)
    marketTrends.push('Based on current inventory availability')
    customerBehavior.push('Recommendation based on user preference analysis')

    return {
      personalizationFactors: personalizationFactors.length > 0 ? personalizationFactors : ['Item matches general preferences'],
      marketTrends: marketTrends.length > 0 ? marketTrends : ['Standard market analysis applied'],
      customerBehavior: customerBehavior.length > 0 ? customerBehavior : ['Based on user activity patterns'],
      crossSellOpportunities: crossSellOpportunities.length > 0 ? crossSellOpportunities : ['Standard cross-sell suggestions'],
      pricingRecommendations: pricingRecommendations.length > 0 ? pricingRecommendations : ['Price analysis completed']
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const supabase = await this.getSupabase()
      
      // Get user's viewing and interaction history
      const { data: userActivity, error } = await supabase
        .from('inventory_sharing_analytics')
        .select(`
          *,
          sharing:inventory_sharing!inner(
            inventory:inventory(*)
          )
        `)
        .eq('viewer_id', userId)
        .order('last_viewed_at', { ascending: false })
        .limit(100)

      if (error) throw error

      // Analyze preferences from activity
      const preferences: UserPreferences = {
        preferred_categories: this.extractPreferredCategories(userActivity || []),
        preferred_metal_types: this.extractPreferredMetalTypes(userActivity || []),
        preferred_gemstone_types: this.extractPreferredGemstoneTypes(userActivity || []),
        price_range: this.extractPriceRange(userActivity || []),
        preferred_brands: this.extractPreferredBrands(userActivity || []),
        recent_viewed_items: (userActivity || []).map((a: any) => a.sharing?.inventory?.id).filter(Boolean),
        recent_purchases: [], // Would come from orders table
        connection_interests: [] // Would come from network analysis
      }

      return preferences
    } catch (error) {
      console.error('Error getting user preferences:', error)
      return this.getDefaultPreferences()
    }
  }

  private async getNetworkConnections(userId: string): Promise<string[]> {
    try {
      const supabase = await this.getSupabase()
      
      // Get user's network connections
      const { data: connections, error } = await supabase
        .from('inventory_sharing_connections')
        .select('viewer_id')
        .eq('viewer_id', userId)

      if (error) throw error

      return (connections || []).map((c: any) => c.viewer_id)
    } catch (error) {
      console.error('Error getting network connections:', error)
      return []
    }
  }

  private async getRecentActivity(userId: string): Promise<any[]> {
    try {
      const supabase = await this.getSupabase()
      
      // Get recent viewing activity
      const { data: activity, error } = await supabase
        .from('inventory_sharing_analytics')
        .select(`
          *,
          sharing:inventory_sharing!inner(
            inventory:inventory(*)
          )
        `)
        .eq('viewer_id', userId)
        .order('last_viewed_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return activity || []
    } catch (error) {
      console.error('Error getting recent activity:', error)
      return []
    }
  }

  private async findSimilarUsers(userId: string): Promise<string[]> {
    try {
      const supabase = await this.getSupabase()
      
      // Get users with similar viewing patterns
      const { data: similarUsers, error } = await supabase
        .from('inventory_sharing_analytics')
        .select('viewer_id')
        .neq('viewer_id', userId)
        .limit(20)

      if (error) throw error

      return [...new Set((similarUsers || []).map((u: any) => u.viewer_id))] as string[]
    } catch (error) {
      console.error('Error finding similar users:', error)
      return []
    }
  }

  private calculateRecentRelevance(item: any, recentActivity: any[]): { score: number; reasons: string[] } {
    let score = 0
    const reasons: string[] = []

    // Check if item is similar to recently viewed items
    const similarItems = recentActivity.filter(activity => {
      const viewedItem = activity.sharing?.inventory
      if (!viewedItem) return false

      // Check category similarity
      if (viewedItem.category === item.category) return true
      
      // Check metal type similarity
      if (viewedItem.metal_type === item.metal_type) return true
      
      // Check gemstone similarity
      if (viewedItem.gemstone_type === item.gemstone_type) return true
      
      // Check price range similarity
      const priceDiff = Math.abs(viewedItem.price - item.price) / Math.max(viewedItem.price, item.price)
      if (priceDiff < 0.3) return true

      return false
    })

    if (similarItems.length > 0) {
      score += Math.min(20, similarItems.length * 5)
      reasons.push(`Similar to ${similarItems.length} recently viewed items`)
    }

    return { score, reasons }
  }

  private calculateSeasonalScore(item: any): number {
    const now = new Date()
    const month = now.getMonth() + 1
    let score = 0

    // Seasonal scoring based on gemstone birthstones
    const birthstoneMonths: { [key: string]: number[] } = {
      'Diamond': [4], // April
      'Emerald': [5], // May
      'Pearl': [6], // June
      'Ruby': [7], // July
      'Peridot': [8], // August
      'Sapphire': [9], // September
      'Opal': [10], // October
      'Topaz': [11], // November
      'Garnet': [1], // January
      'Amethyst': [2], // February
      'Aquamarine': [3] // March
    }

    if (item.gemstone_type && birthstoneMonths[item.gemstone_type]?.includes(month)) {
      score += 15
    }

    // Holiday season scoring
    if (month === 12) { // December
      score += 10 // Holiday season
    }

    return score
  }

  private getConnectionStrength(ownerId: string, connections: string[]): number {
    // This would be enhanced with actual connection strength metrics
    // For now, return a basic score based on connection existence
    return connections.includes(ownerId) ? 0.8 : 0.3
  }

  private extractPreferredCategories(activity: any[]): string[] {
    const categoryCounts: { [key: string]: number } = {}
    
    activity.forEach(a => {
      const category = a.sharing?.inventory?.category
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      }
    })

    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category)
  }

  private extractPreferredMetalTypes(activity: any[]): string[] {
    const metalCounts: { [key: string]: number } = {}
    
    activity.forEach(a => {
      const metal = a.sharing?.inventory?.metal_type
      if (metal) {
        metalCounts[metal] = (metalCounts[metal] || 0) + 1
      }
    })

    return Object.entries(metalCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([metal]) => metal)
  }

  private extractPreferredGemstoneTypes(activity: any[]): string[] {
    const gemstoneCounts: { [key: string]: number } = {}
    
    activity.forEach(a => {
      const gemstone = a.sharing?.inventory?.gemstone_type
      if (gemstone) {
        gemstoneCounts[gemstone] = (gemstoneCounts[gemstone] || 0) + 1
      }
    })

    return Object.entries(gemstoneCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([gemstone]) => gemstone)
  }

  private extractPriceRange(activity: any[]): { min: number; max: number } {
    const prices = activity
      .map(a => a.sharing?.inventory?.price)
      .filter(price => price && price > 0)

    if (prices.length === 0) {
      return { min: 100, max: 10000 }
    }

    const sortedPrices = prices.sort((a, b) => a - b)
    const min = Math.floor(sortedPrices[0] * 0.8)
    const max = Math.ceil(sortedPrices[sortedPrices.length - 1] * 1.2)

    return { min, max }
  }

  private extractPreferredBrands(activity: any[]): string[] {
    const brandCounts: { [key: string]: number } = {}
    
    activity.forEach(a => {
      const brand = a.sharing?.inventory?.brand
      if (brand) {
        brandCounts[brand] = (brandCounts[brand] || 0) + 1
      }
    })

    return Object.entries(brandCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([brand]) => brand)
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      preferred_categories: ['Rings', 'Necklaces', 'Earrings'],
      preferred_metal_types: ['White Gold', 'Yellow Gold', 'Platinum'],
      preferred_gemstone_types: ['Diamond', 'Sapphire', 'Emerald'],
      price_range: { min: 500, max: 5000 },
      preferred_brands: ['Jewelia'],
      recent_viewed_items: [],
      recent_purchases: [],
      connection_interests: []
    }
  }
}
