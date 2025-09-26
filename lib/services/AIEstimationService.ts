import { createSupabaseServerClient } from '@/lib/supabase/server'

// =====================================================
// AI ESTIMATION SERVICE WITH OPENAI INTEGRATION
// =====================================================

export interface EstimationRequest {
  itemType: string
  materials: Material[]
  complexity: 'simple' | 'moderate' | 'complex' | 'expert'
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
  customizations?: string[]
  rushOrder?: boolean
  quantity?: number
}

export interface Material {
  type: string
  purity?: string
  weight?: number
  unit?: string
  quality?: string
}

export interface EstimationResult {
  id: string
  itemType: string
  materials: Material[]
  complexity: string
  basePrice: number
  laborCost: number
  materialCost: number
  customizationCost: number
  rushFee: number
  totalPrice: number
  estimatedTime: string
  confidence: number
  breakdown: {
    materials: Record<string, number>
    labor: Record<string, number>
    customizations: Record<string, number>
  }
  marketFactors: {
    demand: number
    supply: number
    trend: 'up' | 'down' | 'stable'
  }
  recommendations: string[]
  aiInsights: {
    pricingStrategy: string
    marketPositioning: string
    competitiveAnalysis: string
    riskAssessment: string
    optimizationSuggestions: string[]
  }
  createdAt: string
}

export class AIEstimationService {
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

  async generateEstimation(request: EstimationRequest): Promise<EstimationResult> {
    const supabase = await this.getSupabase()

    // Calculate material costs
    const materialCosts = await this.calculateMaterialCosts(request.materials)
    const totalMaterialCost = Object.values(materialCosts).reduce((sum, cost) => sum + cost, 0)

    // Calculate labor costs based on complexity
    const laborCosts = this.calculateLaborCosts(request.complexity, request.itemType)
    const totalLaborCost = Object.values(laborCosts).reduce((sum, cost) => sum + cost, 0)

    // Calculate customization costs
    const customizationCosts = this.calculateCustomizationCosts(request.customizations || [])
    const totalCustomizationCost = Object.values(customizationCosts).reduce((sum, cost) => sum + cost, 0)

    // Calculate rush fee
    const rushFee = request.rushOrder ? this.calculateRushFee(totalMaterialCost + totalLaborCost) : 0

    // Calculate base price (materials + labor)
    const basePrice = totalMaterialCost + totalLaborCost

    // Calculate total price
    const totalPrice = basePrice + totalCustomizationCost + rushFee

    // Get market factors
    const marketFactors = await this.getMarketFactors(request.itemType, request.materials)

    // Generate recommendations
    const recommendations = this.generateRecommendations(request, marketFactors)

    // Calculate confidence score
    const confidence = this.calculateConfidence(request, marketFactors)

    // Estimate completion time
    const estimatedTime = this.estimateCompletionTime(request.complexity, request.itemType)

    // Generate AI insights if OpenAI is available
    const aiInsights = await this.generateAIInsights(request, {
      basePrice,
      totalPrice,
      marketFactors,
      materials: request.materials,
      complexity: request.complexity
    })

    // Create estimation result
    const estimation: EstimationResult = {
      id: crypto.randomUUID(),
      itemType: request.itemType,
      materials: request.materials,
      complexity: request.complexity,
      basePrice,
      laborCost: totalLaborCost,
      materialCost: totalMaterialCost,
      customizationCost: totalCustomizationCost,
      rushFee,
      totalPrice,
      estimatedTime,
      confidence,
      breakdown: {
        materials: materialCosts,
        labor: laborCosts,
        customizations: customizationCosts
      },
      marketFactors,
      recommendations,
      aiInsights,
      createdAt: new Date().toISOString()
    }

    // Save to database
    await this.saveEstimation(estimation)

    return estimation
  }

  // =====================================================
  // OPENAI INTEGRATION FOR AI INSIGHTS
  // =====================================================

  /**
   * Generate AI-powered insights for pricing and market analysis
   */
  private async generateAIInsights(
    request: EstimationRequest,
    pricingData: {
      basePrice: number
      totalPrice: number
      marketFactors: any
      materials: Material[]
      complexity: string
    }
  ): Promise<EstimationResult['aiInsights']> {
    try {
      if (!this.openaiApiKey) {
        return this.generateFallbackInsights(request, pricingData)
      }

      const prompt = this.buildOpenAIPrompt(request, pricingData)
      
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
              content: 'You are an AI expert in jewelry pricing, market analysis, and business strategy. Provide professional insights for jewelry business decisions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content || ''

      return this.parseAIInsights(aiResponse)
    } catch (error) {
      console.error('Error generating AI insights:', error)
      return this.generateFallbackInsights(request, pricingData)
    }
  }

  /**
   * Build OpenAI prompt for AI insights
   */
  private buildOpenAIPrompt(
    request: EstimationRequest,
    pricingData: any
  ): string {
    return `
Jewelry Business Analysis Request:

Item Details:
- Type: ${request.itemType}
- Complexity: ${request.complexity}
- Materials: ${request.materials.map(m => `${m.type} (${m.purity || 'N/A'}%, ${m.weight || 'N/A'}${m.unit || 'g'})`).join(', ')}
- Customizations: ${request.customizations?.join(', ') || 'None'}
- Rush Order: ${request.rushOrder ? 'Yes' : 'No'}

Pricing Data:
- Base Price: $${pricingData.basePrice}
- Total Price: $${pricingData.totalPrice}
- Market Factors: ${JSON.stringify(pricingData.marketFactors)}

Please provide:
1. Pricing Strategy: Is this price competitive and profitable?
2. Market Positioning: How does this price compare to market standards?
3. Competitive Analysis: What are the key competitive factors?
4. Risk Assessment: What pricing risks should be considered?
5. Optimization Suggestions: How can we improve pricing or efficiency?

Focus on practical business advice for a jewelry business.
    `.trim()
  }

  /**
   * Parse AI response into structured insights
   */
  private parseAIInsights(aiResponse: string): EstimationResult['aiInsights'] {
    // Simple parsing - in production, you might want more sophisticated parsing
    const lines = aiResponse.split('\n').filter(line => line.trim())
    
    let pricingStrategy = 'AI analysis not available'
    let marketPositioning = 'Market analysis not available'
    let competitiveAnalysis = 'Competitive analysis not available'
    let riskAssessment = 'Risk assessment not available'
    let optimizationSuggestions: string[] = []

    lines.forEach(line => {
      const lowerLine = line.toLowerCase()
      if (lowerLine.includes('pricing strategy') || lowerLine.includes('price')) {
        pricingStrategy = line.replace(/^[^:]*:\s*/, '').trim()
      } else if (lowerLine.includes('market') || lowerLine.includes('positioning')) {
        marketPositioning = line.replace(/^[^:]*:\s*/, '').trim()
      } else if (lowerLine.includes('competitive') || lowerLine.includes('competition')) {
        competitiveAnalysis = line.replace(/^[^:]*:\s*/, '').trim()
      } else if (lowerLine.includes('risk') || lowerLine.includes('assessment')) {
        riskAssessment = line.replace(/^[^:]*:\s*/, '').trim()
      } else if (lowerLine.includes('optimization') || lowerLine.includes('suggestion') || lowerLine.includes('improve')) {
        optimizationSuggestions.push(line.replace(/^[^:]*:\s*/, '').trim())
      }
    })

    return {
      pricingStrategy: pricingStrategy || 'AI analysis not available',
      marketPositioning: marketPositioning || 'Market analysis not available',
      competitiveAnalysis: competitiveAnalysis || 'Competitive analysis not available',
      riskAssessment: riskAssessment || 'Risk assessment not available',
      optimizationSuggestions: optimizationSuggestions.length > 0 ? optimizationSuggestions : ['Consider market research for optimal pricing']
    }
  }

  /**
   * Generate fallback insights when OpenAI is not available
   */
  private generateFallbackInsights(
    request: EstimationRequest,
    pricingData: any
  ): EstimationResult['aiInsights'] {
    const basePrice = pricingData.basePrice
    const totalPrice = pricingData.totalPrice
    
    let pricingStrategy = 'Standard pricing applied'
    let marketPositioning = 'Mid-market positioning'
    let competitiveAnalysis = 'Based on standard industry rates'
    let riskAssessment = 'Standard risk assessment'
    let optimizationSuggestions: string[] = []

    // Basic pricing strategy based on complexity
    if (request.complexity === 'expert') {
      pricingStrategy = 'Premium pricing for expert-level craftsmanship'
      marketPositioning = 'High-end market positioning'
    } else if (request.complexity === 'simple') {
      pricingStrategy = 'Competitive pricing for simple designs'
      marketPositioning = 'Value-focused positioning'
    }

    // Risk assessment based on materials
    const hasPreciousMetals = request.materials.some(m => 
      ['gold', 'platinum', 'silver', 'palladium'].includes(m.type.toLowerCase())
    )
    if (hasPreciousMetals) {
      riskAssessment = 'Material price volatility risk - consider hedging strategies'
    }

    // Optimization suggestions
    if (request.rushOrder && pricingData.rushFee < totalPrice * 0.15) {
      optimizationSuggestions.push('Consider increasing rush order premium')
    }
    if (request.customizations && request.customizations.length > 3) {
      optimizationSuggestions.push('Bundle customization options for better pricing')
    }
    if (request.quantity && request.quantity > 1) {
      optimizationSuggestions.push('Offer volume discounts for bulk orders')
    }

    return {
      pricingStrategy,
      marketPositioning,
      competitiveAnalysis,
      riskAssessment,
      optimizationSuggestions: optimizationSuggestions.length > 0 ? optimizationSuggestions : ['Monitor market trends for pricing adjustments']
    }
  }

  private async calculateMaterialCosts(materials: Material[]): Promise<Record<string, number>> {
    const costs: Record<string, number> = {}
    
    // Current market prices (in USD per unit)
    const marketPrices: Record<string, number> = {
      '14k_gold': 35.0, // per gram
      '18k_gold': 45.0,
      'platinum': 30.0,
      'silver': 0.8,
      'diamond': 1200.0, // per carat
      'emerald': 800.0,
      'sapphire': 700.0,
      'ruby': 900.0,
      'pearl': 50.0,
      'opal': 200.0
    }

    for (const material of materials) {
      let cost = 0
      const key = `${material.purity || 'standard'}_${material.type}`.toLowerCase()
      
      if (material.weight && marketPrices[key]) {
        cost = material.weight * marketPrices[key]
      } else if (marketPrices[material.type.toLowerCase()]) {
        cost = (material.weight || 1) * marketPrices[material.type.toLowerCase()]
      } else {
        // Default cost for unknown materials
        cost = (material.weight || 1) * 10
      }

      // Apply quality multiplier
      if (material.quality) {
        const qualityMultipliers: Record<string, number> = {
          'premium': 1.5,
          'high': 1.3,
          'standard': 1.0,
          'low': 0.7
        }
        cost *= qualityMultipliers[material.quality] || 1.0
      }

      costs[material.type] = cost
    }

    return costs
  }

  private calculateLaborCosts(complexity: string, itemType: string): Record<string, number> {
    const baseRates: Record<string, number> = {
      'ring': 50,
      'necklace': 75,
      'bracelet': 60,
      'earrings': 40,
      'pendant': 35,
      'watch': 200,
      'custom': 100
    }

    const complexityMultipliers: Record<string, number> = {
      'simple': 1.0,
      'moderate': 1.5,
      'complex': 2.5,
      'expert': 4.0
    }

    const baseRate = baseRates[itemType.toLowerCase()] || baseRates.custom
    const multiplier = complexityMultipliers[complexity] || 1.0

    return {
      'design': baseRate * multiplier * 0.3,
      'fabrication': baseRate * multiplier * 0.4,
      'finishing': baseRate * multiplier * 0.2,
      'quality_control': baseRate * multiplier * 0.1
    }
  }

  private calculateCustomizationCosts(customizations: string[]): Record<string, number> {
    const customizationCosts: Record<string, number> = {}
    
    const costs: Record<string, number> = {
      'engraving': 25,
      'stone_setting': 50,
      'custom_design': 100,
      'size_adjustment': 15,
      'finish_change': 30,
      'personalization': 20,
      'certification': 75,
      'appraisal': 150
    }

    for (const customization of customizations) {
      customizationCosts[customization] = costs[customization] || 25
    }

    return customizationCosts
  }

  private calculateRushFee(baseCost: number): number {
    // Rush fee is 25% of base cost
    return baseCost * 0.25
  }

  private async getMarketFactors(itemType: string, materials: Material[]): Promise<EstimationResult['marketFactors']> {
    // In a real implementation, this would fetch from market data APIs
    // For now, we'll use simulated data
    
    const demand = Math.random() * 0.4 + 0.6 // 0.6 to 1.0
    const supply = Math.random() * 0.3 + 0.7 // 0.7 to 1.0
    
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (demand > 0.8) trend = 'up'
    else if (demand < 0.7) trend = 'down'

    return { demand, supply, trend }
  }

  private generateRecommendations(request: EstimationRequest, marketFactors: EstimationResult['marketFactors']): string[] {
    const recommendations: string[] = []

    // Material recommendations
    if (request.materials.some(m => m.type.toLowerCase().includes('gold'))) {
      if (marketFactors.trend === 'up') {
        recommendations.push('Consider premium gold options for better long-term value')
      }
    }

    // Complexity recommendations
    if (request.complexity === 'expert') {
      recommendations.push('Expert-level work requires additional time for quality assurance')
    }

    // Rush order recommendations
    if (request.rushOrder) {
      recommendations.push('Rush orders may have limited customization options')
    }

    // Market-based recommendations
    if (marketFactors.demand > 0.8) {
      recommendations.push('High market demand - consider premium pricing')
    }

    if (marketFactors.supply < 0.8) {
      recommendations.push('Limited supply - secure materials early')
    }

    return recommendations
  }

  private calculateConfidence(request: EstimationRequest, marketFactors: EstimationResult['marketFactors']): number {
    let confidence = 0.8 // Base confidence

    // Adjust based on material availability
    if (request.materials.length > 0) {
      confidence += 0.1
    }

    // Adjust based on market stability
    if (marketFactors.trend === 'stable') {
      confidence += 0.05
    } else {
      confidence -= 0.05
    }

    // Adjust based on complexity
    if (request.complexity === 'simple') {
      confidence += 0.05
    } else if (request.complexity === 'expert') {
      confidence -= 0.1
    }

    return Math.min(Math.max(confidence, 0.5), 0.95)
  }

  private estimateCompletionTime(complexity: string, itemType: string): string {
    const baseTimes: Record<string, number> = {
      'simple': 3,
      'moderate': 7,
      'complex': 14,
      'expert': 21
    }

    let days = baseTimes[complexity] || 7

    // Adjust for item type complexity
    if (itemType.toLowerCase().includes('ring') || itemType.toLowerCase().includes('necklace')) {
      days += 2
    } else if (itemType.toLowerCase().includes('bracelet') || itemType.toLowerCase().includes('earrings')) {
      days += 1
    }

    if (days === 1) return '1 day'
    if (days < 7) return `${days} days`
    if (days < 14) return `${Math.ceil(days / 7)} weeks`
    return `${Math.ceil(days / 30)} months`
  }

  private async saveEstimation(estimation: EstimationResult): Promise<void> {
    const supabase = await this.getSupabase()
    
    await supabase
      .from('ai_estimations')
      .insert({
        id: estimation.id,
        item_type: estimation.itemType,
        materials: estimation.materials,
        complexity: estimation.complexity,
        base_price: estimation.basePrice,
        labor_cost: estimation.laborCost,
        material_cost: estimation.materialCost,
        customization_cost: estimation.customizationCost,
        rush_fee: estimation.rushFee,
        total_price: estimation.totalPrice,
        estimated_time: estimation.estimatedTime,
        confidence: estimation.confidence,
        breakdown: estimation.breakdown,
        market_factors: estimation.marketFactors,
        recommendations: estimation.recommendations,
        ai_insights: estimation.aiInsights // Add ai_insights to the database
      })
  }

  async getEstimationHistory(filters?: {
    itemType?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }): Promise<{ data: EstimationResult[], pagination: any }> {
    const supabase = await this.getSupabase()
    
    let query = supabase
      .from('ai_estimations')
      .select('*', { count: 'exact' })

    if (filters?.itemType) {
      query = query.eq('item_type', filters.itemType)
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const offset = (page - 1) * limit

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Failed to fetch estimation history: ${error.message}`)
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  async getEstimationById(id: string): Promise<EstimationResult | null> {
    const supabase = await this.getSupabase()
    
    const { data, error } = await supabase
      .from('ai_estimations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch estimation: ${error.message}`)
    }

    return data
  }
} 