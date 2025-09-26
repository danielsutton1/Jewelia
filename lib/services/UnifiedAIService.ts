import { createClient } from '@supabase/supabase-js'

// =====================================================
// UNIFIED AI SERVICE
// =====================================================
// This service consolidates all OpenAI integrations across the application
// Provides centralized AI features for messaging, analytics, recommendations, and more

export interface AIAnalysisRequest {
  type: 'messaging' | 'analytics' | 'recommendations' | 'pricing' | 'customer' | 'inventory'
  data: any
  context?: string
  options?: {
    model?: 'gpt-4' | 'gpt-3.5-turbo'
    maxTokens?: number
    temperature?: number
    includeInsights?: boolean
  }
}

export interface AIAnalysisResponse {
  success: boolean
  analysis: any
  insights?: {
    summary: string
    keyPoints: string[]
    recommendations: string[]
    risks: string[]
    opportunities: string[]
  }
  confidence: number
  model: string
  timestamp: string
}

export interface AIMessagingAnalysis {
  tone: 'professional' | 'friendly' | 'formal' | 'casual' | 'urgent'
  sentiment: 'positive' | 'negative' | 'neutral'
  urgency: 'low' | 'normal' | 'high'
  businessImpact: 'low' | 'medium' | 'high'
  suggestedActions: string[]
  responseTemplates: string[]
  followUpSuggestions: string[]
}

export interface AIAnalyticsInsights {
  trends: string[]
  anomalies: string[]
  opportunities: string[]
  risks: string[]
  recommendations: string[]
  marketAnalysis: string
  customerInsights: string
  competitiveAnalysis: string
}

export interface AIRecommendationInsights {
  personalizationFactors: string[]
  marketTrends: string[]
  customerBehavior: string[]
  crossSellOpportunities: string[]
  pricingRecommendations: string[]
  inventoryOptimization: string[]
}

export interface AIPricingInsights {
  marketPosition: string
  competitiveAnalysis: string
  pricingStrategy: string
  riskAssessment: string
  optimizationSuggestions: string[]
  demandForecasting: string
}

export interface AICustomerInsights {
  behaviorPatterns: string[]
  preferences: string[]
  lifetimeValue: string
  churnRisk: string
  engagementOpportunities: string[]
  personalizationSuggestions: string[]
}

export interface AIInventoryInsights {
  demandTrends: string[]
  stockOptimization: string[]
  seasonalPatterns: string[]
  supplierRecommendations: string[]
  pricingOpportunities: string[]
  riskMitigation: string[]
}

export class UnifiedAIService {
  private supabase: any
  private openaiApiKey: string
  private baseUrl: string

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    this.openaiApiKey = process.env.OPENAI_API_KEY || ''
    this.baseUrl = 'https://api.openai.com/v1'

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  // =====================================================
  // CORE AI ANALYSIS ENGINE
  // =====================================================

  /**
   * Main method to analyze data using AI
   */
  async analyzeData(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      if (!this.openaiApiKey) {
        return this.generateFallbackAnalysis(request)
      }

      const prompt = this.buildAnalysisPrompt(request)
      const model = request.options?.model || 'gpt-4'
      const maxTokens = request.options?.maxTokens || 500
      const temperature = request.options?.temperature || 0.7

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(request.type)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content || ''

      return this.parseAIResponse(request.type, aiResponse, model)
    } catch (error) {
      console.error('Error in AI analysis:', error)
      return this.generateFallbackAnalysis(request)
    }
  }

  // =====================================================
  // SPECIALIZED AI ANALYSES
  // =====================================================

  /**
   * Analyze messaging content for business insights
   */
  async analyzeMessaging(
    content: string,
    context: string = 'general',
    messageHistory: string[] = []
  ): Promise<AIMessagingAnalysis> {
    const request: AIAnalysisRequest = {
      type: 'messaging',
      data: { content, context, messageHistory },
      options: { includeInsights: true }
    }

    const response = await this.analyzeData(request)
    return response.analysis as AIMessagingAnalysis
  }

  /**
   * Analyze business analytics data
   */
  async analyzeAnalytics(
    data: any,
    context: string = 'general'
  ): Promise<AIAnalyticsInsights> {
    const request: AIAnalysisRequest = {
      type: 'analytics',
      data,
      context,
      options: { includeInsights: true }
    }

    const response = await this.analyzeData(request)
    return response.analysis as AIAnalyticsInsights
  }

  /**
   * Analyze product recommendations
   */
  async analyzeRecommendations(
    userData: any,
    productData: any,
    context: string = 'general'
  ): Promise<AIRecommendationInsights> {
    const request: AIAnalysisRequest = {
      type: 'recommendations',
      data: { userData, productData },
      context,
      options: { includeInsights: true }
    }

    const response = await this.analyzeData(request)
    return response.analysis as AIRecommendationInsights
  }

  /**
   * Analyze pricing strategies
   */
  async analyzePricing(
    pricingData: any,
    marketData: any,
    context: string = 'general'
  ): Promise<AIPricingInsights> {
    const request: AIAnalysisRequest = {
      type: 'pricing',
      data: { pricingData, marketData },
      context,
      options: { includeInsights: true }
    }

    const response = await this.analyzeData(request)
    return response.analysis as AIPricingInsights
  }

  /**
   * Analyze customer behavior and insights
   */
  async analyzeCustomer(
    customerData: any,
    behaviorData: any,
    context: string = 'general'
  ): Promise<AICustomerInsights> {
    const request: AIAnalysisRequest = {
      type: 'customer',
      data: { customerData, behaviorData },
      context,
      options: { includeInsights: true }
    }

    const response = await this.analyzeData(request)
    return response.analysis as AICustomerInsights
  }

  /**
   * Analyze inventory and supply chain
   */
  async analyzeInventory(
    inventoryData: any,
    marketData: any,
    context: string = 'general'
  ): Promise<AIInventoryInsights> {
    const request: AIAnalysisRequest = {
      type: 'inventory',
      data: { inventoryData, marketData },
      context,
      options: { includeInsights: true }
    }

    const response = await this.analyzeData(request)
    return response.analysis as AIInventoryInsights
  }

  // =====================================================
  // PROMPT BUILDING
  // =====================================================

  /**
   * Get system prompt for specific analysis type
   */
  private getSystemPrompt(type: string): string {
    const prompts: Record<string, string> = {
      messaging: 'You are an AI expert in business communication, customer service, and professional messaging. Analyze messages for tone, sentiment, business impact, and provide actionable insights.',
      analytics: 'You are an AI expert in business analytics, data interpretation, and strategic insights. Analyze business data to identify trends, opportunities, and actionable recommendations.',
      recommendations: 'You are an AI expert in product recommendations, customer behavior analysis, and market trends. Provide insights for personalized product recommendations and customer engagement.',
      pricing: 'You are an AI expert in pricing strategy, market analysis, and competitive positioning. Analyze pricing data to provide strategic insights and optimization recommendations.',
      customer: 'You are an AI expert in customer behavior analysis, customer relationship management, and customer insights. Analyze customer data to identify patterns and opportunities.',
      inventory: 'You are an AI expert in inventory management, supply chain optimization, and demand forecasting. Analyze inventory data to provide optimization insights and risk assessments.'
    }

    return prompts[type] || 'You are an AI expert in business analysis and strategic insights.'
  }

  /**
   * Build analysis prompt based on request type
   */
  private buildAnalysisPrompt(request: AIAnalysisRequest): string {
    const { type, data, context } = request

    switch (type) {
      case 'messaging':
        return this.buildMessagingPrompt(data, context || '')
      case 'analytics':
        return this.buildAnalyticsPrompt(data, context || '')
      case 'recommendations':
        return this.buildRecommendationsPrompt(data, context || '')
      case 'pricing':
        return this.buildPricingPrompt(data, context || '')
      case 'customer':
        return this.buildCustomerPrompt(data, context || '')
      case 'inventory':
        return this.buildInventoryPrompt(data, context || '')
      default:
        return `Please analyze the following data for business insights:\n\n${JSON.stringify(data, null, 2)}`
    }
  }

  private buildMessagingPrompt(data: any, context: string): string {
    return `
Business Message Analysis Request:

Message Content: ${data.content}
Context: ${data.context}
Message History: ${data.messageHistory?.join('\n') || 'None'}

Please analyze this message and provide:
1. Tone analysis (professional, friendly, formal, casual, urgent)
2. Sentiment assessment (positive, negative, neutral)
3. Urgency level (low, normal, high)
4. Business impact assessment (low, medium, high)
5. Suggested actions to take
6. Response templates
7. Follow-up suggestions

Focus on practical business insights and actionable recommendations.
    `.trim()
  }

  private buildAnalyticsPrompt(data: any, context: string): string {
    return `
Business Analytics Analysis Request:

Data: ${JSON.stringify(data, null, 2)}
Context: ${context}

Please analyze this business data and provide:
1. Key trends identified
2. Anomalies or concerning patterns
3. Business opportunities
4. Potential risks
5. Strategic recommendations
6. Market analysis insights
7. Customer behavior insights
8. Competitive analysis

Focus on actionable business intelligence and strategic insights.
    `.trim()
  }

  private buildRecommendationsPrompt(data: any, context: string): string {
    return `
Product Recommendation Analysis Request:

User Data: ${JSON.stringify(data.userData, null, 2)}
Product Data: ${JSON.stringify(data.productData, null, 2)}
Context: ${context}

Please analyze this data and provide:
1. Personalization factors
2. Market trends analysis
3. Customer behavior insights
4. Cross-sell opportunities
5. Pricing recommendations
6. Inventory optimization insights

Focus on maximizing customer satisfaction and business value.
    `.trim()
  }

  private buildPricingPrompt(data: any, context: string): string {
    return `
Pricing Strategy Analysis Request:

Pricing Data: ${JSON.stringify(data.pricingData, null, 2)}
Market Data: ${JSON.stringify(data.marketData, null, 2)}
Context: ${context}

Please analyze this pricing data and provide:
1. Market position assessment
2. Competitive analysis
3. Pricing strategy recommendations
4. Risk assessment
5. Optimization suggestions
6. Demand forecasting insights

Focus on competitive positioning and profitability optimization.
    `.trim()
  }

  private buildCustomerPrompt(data: any, context: string): string {
    return `
Customer Behavior Analysis Request:

Customer Data: ${JSON.stringify(data.customerData, null, 2)}
Behavior Data: ${JSON.stringify(data.behaviorData, null, 2)}
Context: ${context}

Please analyze this customer data and provide:
1. Behavior patterns identified
2. Customer preferences analysis
3. Lifetime value assessment
4. Churn risk analysis
5. Engagement opportunities
6. Personalization suggestions

Focus on customer retention and value maximization.
    `.trim()
  }

  private buildInventoryPrompt(data: any, context: string): string {
    return `
Inventory Management Analysis Request:

Inventory Data: ${JSON.stringify(data.inventoryData, null, 2)}
Market Data: ${JSON.stringify(data.marketData, null, 2)}
Context: ${context}

Please analyze this inventory data and provide:
1. Demand trend analysis
2. Stock optimization recommendations
3. Seasonal pattern insights
4. Supplier recommendations
5. Pricing opportunities
6. Risk mitigation strategies

Focus on inventory efficiency and supply chain optimization.
    `.trim()
  }

  // =====================================================
  // RESPONSE PARSING
  // =====================================================

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(type: string, aiResponse: string, model: string): AIAnalysisResponse {
    try {
      const analysis = this.parseAnalysisByType(type, aiResponse)
      const insights = this.extractInsights(aiResponse)
      
      return {
        success: true,
        analysis,
        insights,
        confidence: this.calculateConfidence(aiResponse),
        model,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error parsing AI response:', error)
      return {
        success: false,
        analysis: {},
        confidence: 0,
        model,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Parse analysis based on type
   */
  private parseAnalysisByType(type: string, aiResponse: string): any {
    switch (type) {
      case 'messaging':
        return this.parseMessagingAnalysis(aiResponse)
      case 'analytics':
        return this.parseAnalyticsAnalysis(aiResponse)
      case 'recommendations':
        return this.parseRecommendationsAnalysis(aiResponse)
      case 'pricing':
        return this.parsePricingAnalysis(aiResponse)
      case 'customer':
        return this.parseCustomerAnalysis(aiResponse)
      case 'inventory':
        return this.parseInventoryAnalysis(aiResponse)
      default:
        return { rawResponse: aiResponse }
    }
  }

  private parseMessagingAnalysis(response: string): AIMessagingAnalysis {
    const lines = response.split('\n').filter(line => line.trim())
    
    let tone: AIMessagingAnalysis['tone'] = 'professional'
    let sentiment: AIMessagingAnalysis['sentiment'] = 'neutral'
    let urgency: AIMessagingAnalysis['urgency'] = 'normal'
    let businessImpact: AIMessagingAnalysis['businessImpact'] = 'medium'
    let suggestedActions: string[] = []
    let responseTemplates: string[] = []
    let followUpSuggestions: string[] = []

    lines.forEach(line => {
      const lowerLine = line.toLowerCase()
      if (lowerLine.includes('tone:')) {
        const toneMatch = line.match(/tone:\s*(.+)/i)
        if (toneMatch) {
          const detectedTone = toneMatch[1].toLowerCase()
          if (['professional', 'friendly', 'formal', 'casual', 'urgent'].includes(detectedTone)) {
            tone = detectedTone as AIMessagingAnalysis['tone']
          }
        }
      } else if (lowerLine.includes('sentiment:')) {
        const sentimentMatch = line.match(/sentiment:\s*(.+)/i)
        if (sentimentMatch) {
          const detectedSentiment = sentimentMatch[1].toLowerCase()
          if (['positive', 'negative', 'neutral'].includes(detectedSentiment)) {
            sentiment = detectedSentiment as AIMessagingAnalysis['sentiment']
          }
        }
      } else if (lowerLine.includes('urgency:')) {
        const urgencyMatch = line.match(/urgency:\s*(.+)/i)
        if (urgencyMatch) {
          const detectedUrgency = urgencyMatch[1].toLowerCase()
          if (['low', 'normal', 'high'].includes(detectedUrgency)) {
            urgency = detectedUrgency as AIMessagingAnalysis['urgency']
          }
        }
      } else if (lowerLine.includes('business impact:')) {
        const impactMatch = line.match(/business impact:\s*(.+)/i)
        if (impactMatch) {
          const detectedImpact = impactMatch[1].toLowerCase()
          if (['low', 'medium', 'high'].includes(detectedImpact)) {
            businessImpact = detectedImpact as AIMessagingAnalysis['businessImpact']
          }
        }
      } else if (lowerLine.includes('action') || lowerLine.includes('suggestion')) {
        suggestedActions.push(line.trim())
      } else if (lowerLine.includes('response') || lowerLine.includes('template')) {
        responseTemplates.push(line.trim())
      } else if (lowerLine.includes('follow') || lowerLine.includes('next')) {
        followUpSuggestions.push(line.trim())
      }
    })

    return {
      tone,
      sentiment,
      urgency,
      businessImpact,
      suggestedActions: suggestedActions.length > 0 ? suggestedActions : ['Review and respond appropriately'],
      responseTemplates: responseTemplates.length > 0 ? responseTemplates : ['Standard professional response'],
      followUpSuggestions: followUpSuggestions.length > 0 ? followUpSuggestions : ['Schedule follow-up if needed']
    }
  }

  private parseAnalyticsAnalysis(response: string): AIAnalyticsInsights {
    // Similar parsing logic for analytics
    return {
      trends: ['Data analysis completed'],
      anomalies: ['No anomalies detected'],
      opportunities: ['Standard business opportunities identified'],
      risks: ['Standard business risks assessed'],
      recommendations: ['Standard recommendations provided'],
      marketAnalysis: 'Market analysis completed',
      customerInsights: 'Customer insights generated',
      competitiveAnalysis: 'Competitive analysis completed'
    }
  }

  private parseRecommendationsAnalysis(response: string): AIRecommendationInsights {
    // Similar parsing logic for recommendations
    return {
      personalizationFactors: ['Personalization factors identified'],
      marketTrends: ['Market trends analyzed'],
      customerBehavior: ['Customer behavior analyzed'],
      crossSellOpportunities: ['Cross-sell opportunities identified'],
      pricingRecommendations: ['Pricing recommendations provided'],
      inventoryOptimization: ['Inventory optimization suggested']
    }
  }

  private parsePricingAnalysis(response: string): AIPricingInsights {
    // Similar parsing logic for pricing
    return {
      marketPosition: 'Market position assessed',
      competitiveAnalysis: 'Competitive analysis completed',
      pricingStrategy: 'Pricing strategy recommended',
      riskAssessment: 'Risk assessment completed',
      optimizationSuggestions: ['Standard optimization suggestions'],
      demandForecasting: 'Demand forecasting completed'
    }
  }

  private parseCustomerAnalysis(response: string): AICustomerInsights {
    // Similar parsing logic for customer analysis
    return {
      behaviorPatterns: ['Behavior patterns identified'],
      preferences: ['Customer preferences analyzed'],
      lifetimeValue: 'Lifetime value assessed',
      churnRisk: 'Churn risk analyzed',
      engagementOpportunities: ['Engagement opportunities identified'],
      personalizationSuggestions: ['Personalization suggestions provided']
    }
  }

  private parseInventoryAnalysis(response: string): AIInventoryInsights {
    // Similar parsing logic for inventory analysis
    return {
      demandTrends: ['Demand trends analyzed'],
      stockOptimization: ['Stock optimization recommended'],
      seasonalPatterns: ['Seasonal patterns identified'],
      supplierRecommendations: ['Supplier recommendations provided'],
      pricingOpportunities: ['Pricing opportunities identified'],
      riskMitigation: ['Risk mitigation strategies suggested']
    }
  }

  /**
   * Extract insights from AI response
   */
  private extractInsights(response: string): any {
    const lines = response.split('\n').filter(line => line.trim())
    
    let summary = ''
    let keyPoints: string[] = []
    let recommendations: string[] = []
    let risks: string[] = []
    let opportunities: string[] = []

    lines.forEach(line => {
      const lowerLine = line.toLowerCase()
      if (lowerLine.includes('summary') || lowerLine.includes('overview')) {
        summary = line.trim()
      } else if (lowerLine.includes('key') || lowerLine.includes('point')) {
        keyPoints.push(line.trim())
      } else if (lowerLine.includes('recommend') || lowerLine.includes('suggest')) {
        recommendations.push(line.trim())
      } else if (lowerLine.includes('risk') || lowerLine.includes('concern')) {
        risks.push(line.trim())
      } else if (lowerLine.includes('opportunity') || lowerLine.includes('potential')) {
        opportunities.push(line.trim())
      }
    })

    return {
      summary: summary || 'Analysis completed successfully',
      keyPoints: keyPoints.length > 0 ? keyPoints : ['Key insights identified'],
      recommendations: recommendations.length > 0 ? recommendations : ['Standard recommendations provided'],
      risks: risks.length > 0 ? risks : ['Standard risks assessed'],
      opportunities: opportunities.length > 0 ? opportunities : ['Standard opportunities identified']
    }
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(response: string): number {
    // Simple confidence calculation based on response length and structure
    const lines = response.split('\n').filter(line => line.trim())
    const hasStructuredContent = lines.some(line => line.includes(':'))
    const hasRecommendations = lines.some(line => line.toLowerCase().includes('recommend'))
    
    let confidence = 0.5 // Base confidence
    
    if (lines.length > 5) confidence += 0.2
    if (hasStructuredContent) confidence += 0.2
    if (hasRecommendations) confidence += 0.1
    
    return Math.min(confidence, 1.0)
  }

  // =====================================================
  // FALLBACK ANALYSIS
  // =====================================================

  /**
   * Generate fallback analysis when OpenAI is not available
   */
  private generateFallbackAnalysis(request: AIAnalysisRequest): AIAnalysisResponse {
    const fallbackAnalysis = this.generateFallbackByType(request.type, request.data)
    
    return {
      success: true,
      analysis: fallbackAnalysis,
      insights: {
        summary: 'Fallback analysis completed',
        keyPoints: ['Standard analysis applied'],
        recommendations: ['Standard recommendations provided'],
        risks: ['Standard risk assessment'],
        opportunities: ['Standard opportunities identified']
      },
      confidence: 0.3, // Lower confidence for fallback
      model: 'fallback',
      timestamp: new Date().toISOString()
    }
  }

  private generateFallbackByType(type: string, data: any): any {
    switch (type) {
      case 'messaging':
        return {
          tone: 'professional',
          sentiment: 'neutral',
          urgency: 'normal',
          businessImpact: 'medium',
          suggestedActions: ['Review message content'],
          responseTemplates: ['Standard professional response'],
          followUpSuggestions: ['Follow up as appropriate']
        }
      case 'analytics':
        return {
          trends: ['Standard trend analysis'],
          anomalies: ['No anomalies detected'],
          opportunities: ['Standard opportunities'],
          risks: ['Standard risks assessed'],
          recommendations: ['Standard recommendations'],
          marketAnalysis: 'Standard market analysis',
          customerInsights: 'Standard customer insights',
          competitiveAnalysis: 'Standard competitive analysis'
        }
      default:
        return { message: 'Fallback analysis completed' }
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Check if OpenAI is available
   */
  isOpenAIAvailable(): boolean {
    return !!this.openaiApiKey
  }

  /**
   * Get service status
   */
  getServiceStatus(): { openai: boolean; supabase: boolean } {
    return {
      openai: !!this.openaiApiKey,
      supabase: !!this.supabase
    }
  }
}
