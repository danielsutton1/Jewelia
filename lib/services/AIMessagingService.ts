import { createClient } from '@supabase/supabase-js'

// =====================================================
// AI MESSAGING SERVICE
// =====================================================
// This service provides AI-powered features for modern messaging
// Similar to Apple's AI features in Messages app

export interface AICompletionRequest {
  conversationContext: string
  userInput: string
  messageHistory: string[]
  businessContext: string
  tone: 'professional' | 'friendly' | 'formal' | 'casual'
  language: string
  maxLength?: number
}

export interface AICompletionResponse {
  suggestions: string[]
  smartReply: string
  toneAnalysis: {
    detected: string
    confidence: number
    suggested: string
  }
  businessInsights: {
    keywords: string[]
    sentiment: 'positive' | 'negative' | 'neutral'
    urgency: 'low' | 'normal' | 'high'
    suggestedActions: string[]
  }
  grammarCheck: {
    original: string
    corrected: string
    suggestions: string[]
  }
}

export interface AITypingAssistant {
  realTimeSuggestions: string[]
  autoComplete: string
  smartFormatting: {
    emojis: string[]
    formatting: string[]
    links: string[]
  }
}

export interface AIConversationAnalysis {
  summary: string
  keyPoints: string[]
  actionItems: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
  urgency: 'low' | 'normal' | 'high'
  businessOpportunity: number // 0-100
  suggestedFollowUp: string[]
}

export class AIMessagingService {
  private supabase: any
  private openaiApiKey: string

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    this.openaiApiKey = process.env.OPENAI_API_KEY || ''
    
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
  // AI COMPLETION & SUGGESTIONS
  // =====================================================

  /**
   * Generate AI-powered message completions
   */
  async generateCompletions(request: AICompletionRequest): Promise<AICompletionResponse> {
    try {
      // If OpenAI API is available, use it for advanced completions
      if (this.openaiApiKey) {
        return await this.generateOpenAICompletions(request)
      } else {
        // Fallback to rule-based completions
        return await this.generateRuleBasedCompletions(request)
      }
    } catch (error) {
      console.error('Error generating AI completions:', error)
      // Return fallback completions
      return await this.generateRuleBasedCompletions(request)
    }
  }

  /**
   * Generate completions using OpenAI API
   */
  private async generateOpenAICompletions(request: AICompletionRequest): Promise<AICompletionResponse> {
    try {
      const prompt = this.buildOpenAIPrompt(request)
      
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
              content: 'You are an AI assistant for a jewelry business CRM system. Help users write professional, business-appropriate messages.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: request.maxLength || 150,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const completion = data.choices[0]?.message?.content || ''

      return {
        suggestions: this.parseSuggestions(completion),
        smartReply: completion,
        toneAnalysis: await this.analyzeTone(request.userInput),
        businessInsights: await this.analyzeBusinessContext(request),
        grammarCheck: await this.checkGrammar(request.userInput)
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw error
    }
  }

  /**
   * Generate rule-based completions as fallback
   */
  private async generateRuleBasedCompletions(request: AICompletionRequest): Promise<AICompletionResponse> {
    const suggestions = this.generateBasicSuggestions(request)
    const smartReply = this.generateSmartReply(request)
    
    return {
      suggestions,
      smartReply,
      toneAnalysis: await this.analyzeTone(request.userInput),
      businessInsights: await this.analyzeBusinessContext(request),
      grammarCheck: await this.checkGrammar(request.userInput)
    }
  }

  /**
   * Build OpenAI prompt for message completion
   */
  private buildOpenAIPrompt(request: AICompletionRequest): string {
    return `
Context: ${request.businessContext}
Conversation History: ${request.messageHistory.join('\n')}
User Input: ${request.userInput}
Tone: ${request.tone}
Language: ${request.language}

Please provide:
1. A professional, ${request.tone} response that continues the conversation
2. 3-5 alternative suggestions for how to phrase the message
3. Business-appropriate language for a jewelry business

Focus on being helpful, professional, and maintaining good business relationships.
    `.trim()
  }

  /**
   * Generate basic suggestions based on business context
   */
  private generateBasicSuggestions(request: AICompletionRequest): string[] {
    const suggestions: string[] = []
    
    if (request.businessContext.includes('inquiry')) {
      suggestions.push(
        'Thank you for your inquiry. I would be happy to help you with that.',
        'I appreciate you reaching out. Let me gather some information for you.',
        'Thank you for your interest. I\'ll get back to you with details shortly.'
      )
    }
    
    if (request.businessContext.includes('quote')) {
      suggestions.push(
        'I\'ll prepare a detailed quote for you right away.',
        'Let me calculate the pricing and get back to you within 24 hours.',
        'I\'ll review your requirements and provide a comprehensive quote.'
      )
    }
    
    if (request.businessContext.includes('order')) {
      suggestions.push(
        'Thank you for your order. I\'ll process it immediately.',
        'I\'ve received your order and will confirm the details shortly.',
        'Your order has been placed successfully. You\'ll receive confirmation soon.'
      )
    }
    
    // Add generic professional responses
    suggestions.push(
      'Thank you for your message. I\'ll get back to you as soon as possible.',
      'I appreciate you taking the time to contact us.',
      'Thank you for reaching out. How can I assist you today?'
    )
    
    return suggestions.slice(0, 5)
  }

  /**
   * Generate smart reply based on context
   */
  private generateSmartReply(request: AICompletionRequest): string {
    if (request.businessContext.includes('inquiry')) {
      return 'Thank you for your inquiry. I would be happy to help you with that. Could you please provide a bit more detail about your specific needs?'
    }
    
    if (request.businessContext.includes('quote')) {
      return 'I\'ll prepare a detailed quote for you right away. I should have that ready within 24 hours.'
    }
    
    if (request.businessContext.includes('order')) {
      return 'Thank you for your order. I\'ll process it immediately and send you confirmation shortly.'
    }
    
    return 'Thank you for your message. I\'ll get back to you as soon as possible.'
  }

  // =====================================================
  // TONE ANALYSIS
  // =====================================================

  /**
   * Analyze the tone of a message
   */
  async analyzeTone(message: string): Promise<{ detected: string; confidence: number; suggested: string }> {
    try {
      // Simple rule-based tone analysis
      const lowerMessage = message.toLowerCase()
      
      let detected = 'neutral'
      let confidence = 0.5
      let suggested = 'professional'
      
      // Check for urgency indicators
      if (lowerMessage.includes('urgent') || lowerMessage.includes('asap') || lowerMessage.includes('immediately')) {
        detected = 'urgent'
        confidence = 0.8
        suggested = 'professional'
      }
      
      // Check for positive sentiment
      if (lowerMessage.includes('thank') || lowerMessage.includes('appreciate') || lowerMessage.includes('excellent')) {
        detected = 'positive'
        confidence = 0.7
        suggested = 'friendly'
      }
      
      // Check for negative sentiment
      if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('concern')) {
        detected = 'negative'
        confidence = 0.6
        suggested = 'professional'
      }
      
      // Check for formal language
      if (lowerMessage.includes('regarding') || lowerMessage.includes('pertaining') || lowerMessage.includes('furthermore')) {
        detected = 'formal'
        confidence = 0.7
        suggested = 'professional'
      }
      
      return { detected, confidence, suggested }
    } catch (error) {
      console.error('Error analyzing tone:', error)
      return { detected: 'neutral', confidence: 0.5, suggested: 'professional' }
    }
  }

  // =====================================================
  // BUSINESS INSIGHTS
  // =====================================================

  /**
   * Analyze business context and provide insights
   */
  async analyzeBusinessContext(request: AICompletionRequest): Promise<{
    keywords: string[]
    sentiment: 'positive' | 'negative' | 'neutral'
    urgency: 'low' | 'normal' | 'high'
    suggestedActions: string[]
  }> {
    try {
      const text = `${request.userInput} ${request.businessContext}`.toLowerCase()
      const keywords: string[] = []
      const suggestedActions: string[] = []
      
      // Extract business keywords
      if (text.includes('gold') || text.includes('diamond') || text.includes('jewelry')) {
        keywords.push('precious metals', 'gemstones', 'jewelry')
      }
      
      if (text.includes('quote') || text.includes('pricing') || text.includes('cost')) {
        keywords.push('pricing', 'quotes', 'cost analysis')
        suggestedActions.push('Prepare detailed quote', 'Review pricing structure', 'Check competitor pricing')
      }
      
      if (text.includes('order') || text.includes('purchase') || text.includes('buy')) {
        keywords.push('orders', 'purchases', 'sales')
        suggestedActions.push('Process order', 'Update inventory', 'Send confirmation')
      }
      
      if (text.includes('inquiry') || text.includes('question') || text.includes('help')) {
        keywords.push('customer support', 'inquiries', 'assistance')
        suggestedActions.push('Provide detailed response', 'Schedule follow-up call', 'Create support ticket')
      }
      
      // Determine urgency
      let urgency: 'low' | 'normal' | 'high' = 'normal'
      if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) {
        urgency = 'high'
      } else if (text.includes('when convenient') || text.includes('no rush')) {
        urgency = 'low'
      }
      
      // Determine sentiment
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
      if (text.includes('thank') || text.includes('appreciate') || text.includes('excellent')) {
        sentiment = 'positive'
      } else if (text.includes('problem') || text.includes('issue') || text.includes('concern')) {
        sentiment = 'negative'
      }
      
      return {
        keywords: keywords.length > 0 ? keywords : ['general inquiry'],
        sentiment,
        urgency,
        suggestedActions: suggestedActions.length > 0 ? suggestedActions : ['Follow up within 24 hours']
      }
    } catch (error) {
      console.error('Error analyzing business context:', error)
      return {
        keywords: ['general inquiry'],
        sentiment: 'neutral',
        urgency: 'normal',
        suggestedActions: ['Follow up within 24 hours']
      }
    }
  }

  // =====================================================
  // GRAMMAR CHECKING
  // =====================================================

  /**
   * Basic grammar checking and suggestions
   */
  async checkGrammar(text: string): Promise<{
    original: string
    corrected: string
    suggestions: string[]
  }> {
    try {
      let corrected = text
      const suggestions: string[] = []
      
      // Basic corrections
      if (text.includes('i ')) {
        corrected = corrected.replace(/\bi\s/g, 'I ')
        suggestions.push('Capitalize "I" when referring to yourself')
      }
      
      if (text.includes(' ur ')) {
        corrected = corrected.replace(/\bur\s/g, 'your ')
        suggestions.push('Use "your" instead of "ur"')
      }
      
      if (text.includes(' u ')) {
        corrected = corrected.replace(/\bu\s/g, 'you ')
        suggestions.push('Use "you" instead of "u"')
      }
      
      if (text.includes(' r ')) {
        corrected = corrected.replace(/\br\s/g, 'are ')
        suggestions.push('Use "are" instead of "r"')
      }
      
      // Add punctuation if missing
      if (!text.endsWith('.') && !text.endsWith('!') && !text.endsWith('?')) {
        corrected += '.'
        suggestions.push('Consider adding punctuation at the end')
      }
      
      return {
        original: text,
        corrected,
        suggestions
      }
    } catch (error) {
      console.error('Error checking grammar:', error)
      return {
        original: text,
        corrected: text,
        suggestions: []
      }
    }
  }

  // =====================================================
  // REAL-TIME TYPING ASSISTANT
  // =====================================================

  /**
   * Provide real-time typing assistance
   */
  async getTypingAssistant(
    partialText: string,
    context: string
  ): Promise<AITypingAssistant> {
    try {
      const realTimeSuggestions = this.getRealTimeSuggestions(partialText, context)
      const autoComplete = this.getAutoComplete(partialText, context)
      const smartFormatting = this.getSmartFormatting(partialText, context)
      
      return {
        realTimeSuggestions,
        autoComplete,
        smartFormatting
      }
    } catch (error) {
      console.error('Error getting typing assistant:', error)
      return {
        realTimeSuggestions: [],
        autoComplete: '',
        smartFormatting: {
          emojis: [],
          formatting: [],
          links: []
        }
      }
    }
  }

  /**
   * Get real-time suggestions as user types
   */
  private getRealTimeSuggestions(partialText: string, context: string): string[] {
    const suggestions: string[] = []
    const lowerText = partialText.toLowerCase()
    
    if (lowerText.includes('thank')) {
      suggestions.push('Thank you for your inquiry', 'Thank you for reaching out', 'Thank you for your patience')
    }
    
    if (lowerText.includes('would you')) {
      suggestions.push('Would you like me to', 'Would you be interested in', 'Would you prefer')
    }
    
    if (lowerText.includes('i can')) {
      suggestions.push('I can help you with that', 'I can provide you with', 'I can arrange for')
    }
    
    if (lowerText.includes('please')) {
      suggestions.push('Please let me know', 'Please provide', 'Please confirm')
    }
    
    return suggestions.slice(0, 3)
  }

  /**
   * Get auto-complete suggestions
   */
  private getAutoComplete(partialText: string, context: string): string {
    const lowerText = partialText.toLowerCase()
    
    if (lowerText.includes('thank you for')) {
      return 'Thank you for your inquiry. I would be happy to help you with that.'
    }
    
    if (lowerText.includes('i would like to')) {
      return 'I would like to discuss your requirements in detail.'
    }
    
    if (lowerText.includes('could you please')) {
      return 'Could you please provide more details about your needs?'
    }
    
    return ''
  }

  /**
   * Get smart formatting suggestions
   */
  private getSmartFormatting(partialText: string, context: string): {
    emojis: string[]
    formatting: string[]
    links: string[]
  } {
    const emojis: string[] = []
    const formatting: string[] = []
    const links: string[] = []
    
    const lowerText = partialText.toLowerCase()
    
    // Suggest emojis based on content
    if (lowerText.includes('thank')) {
      emojis.push('🙏', '💝', '✨')
    }
    
    if (lowerText.includes('excellent') || lowerText.includes('great')) {
      emojis.push('🎉', '🌟', '💎')
    }
    
    if (lowerText.includes('jewelry') || lowerText.includes('diamond')) {
      emojis.push('💍', '💎', '✨')
    }
    
    // Suggest formatting
    if (lowerText.includes('urgent') || lowerText.includes('important')) {
      formatting.push('**bold**', '*italic*', '`highlight`')
    }
    
    // Suggest links for business terms
    if (lowerText.includes('catalog') || lowerText.includes('website')) {
      links.push('View our catalog', 'Visit our website', 'Check our portfolio')
    }
    
    return { emojis, formatting, links }
  }

  // =====================================================
  // CONVERSATION ANALYSIS
  // =====================================================

  /**
   * Analyze entire conversation for insights
   */
  async analyzeConversation(
    messages: string[],
    businessContext: string
  ): Promise<AIConversationAnalysis> {
    try {
      const fullText = messages.join(' ').toLowerCase()
      
      // Generate summary
      const summary = this.generateConversationSummary(messages, businessContext)
      
      // Extract key points
      const keyPoints = this.extractKeyPoints(fullText, businessContext)
      
      // Identify action items
      const actionItems = this.identifyActionItems(fullText, businessContext)
      
      // Analyze sentiment
      const sentiment = this.analyzeConversationSentiment(fullText)
      
      // Determine urgency
      const urgency = this.analyzeConversationUrgency(fullText)
      
      // Calculate business opportunity score
      const businessOpportunity = this.calculateBusinessOpportunity(fullText, businessContext)
      
      // Suggest follow-up actions
      const suggestedFollowUp = this.suggestFollowUpActions(fullText, businessContext)
      
      return {
        summary,
        keyPoints,
        actionItems,
        sentiment,
        urgency,
        businessOpportunity,
        suggestedFollowUp
      }
    } catch (error) {
      console.error('Error analyzing conversation:', error)
      return {
        summary: 'Unable to analyze conversation',
        keyPoints: [],
        actionItems: [],
        sentiment: 'neutral',
        urgency: 'normal',
        businessOpportunity: 50,
        suggestedFollowUp: ['Follow up within 24 hours']
      }
    }
  }

  /**
   * Generate conversation summary
   */
  private generateConversationSummary(messages: string[], businessContext: string): string {
    if (messages.length === 0) return 'No messages to analyze'
    
    const firstMessage = messages[0]
    const lastMessage = messages[messages.length - 1]
    
    if (businessContext.includes('inquiry')) {
      return `Customer inquiry conversation started with "${firstMessage.substring(0, 50)}..." and ${messages.length > 1 ? 'continued with follow-up questions' : 'awaiting response'}.`
    }
    
    if (businessContext.includes('quote')) {
      return `Quote request conversation with ${messages.length} messages exchanged. Customer is seeking pricing information.`
    }
    
    if (businessContext.includes('order')) {
      return `Order-related conversation with ${messages.length} messages. Customer is ready to proceed with purchase.`
    }
    
    return `Business conversation with ${messages.length} messages exchanged. Topic: ${businessContext}.`
  }

  /**
   * Extract key points from conversation
   */
  private extractKeyPoints(text: string, businessContext: string): string[] {
    const keyPoints: string[] = []
    
    if (text.includes('gold') || text.includes('diamond') || text.includes('jewelry')) {
      keyPoints.push('Product interest identified')
    }
    
    if (text.includes('quote') || text.includes('pricing') || text.includes('cost')) {
      keyPoints.push('Pricing inquiry made')
    }
    
    if (text.includes('order') || text.includes('purchase') || text.includes('buy')) {
      keyPoints.push('Purchase intent expressed')
    }
    
    if (text.includes('urgent') || text.includes('asap')) {
      keyPoints.push('Urgent request noted')
    }
    
    if (text.includes('budget') || text.includes('price range')) {
      keyPoints.push('Budget constraints discussed')
    }
    
    return keyPoints.length > 0 ? keyPoints : ['General business discussion']
  }

  /**
   * Identify action items from conversation
   */
  private identifyActionItems(text: string, businessContext: string): string[] {
    const actionItems: string[] = []
    
    if (text.includes('quote') || text.includes('pricing')) {
      actionItems.push('Prepare detailed quote')
    }
    
    if (text.includes('catalog') || text.includes('portfolio')) {
      actionItems.push('Send product catalog')
    }
    
    if (text.includes('call') || text.includes('meeting')) {
      actionItems.push('Schedule follow-up call')
    }
    
    if (text.includes('sample') || text.includes('demo')) {
      actionItems.push('Arrange product sample')
    }
    
    if (text.includes('urgent') || text.includes('asap')) {
      actionItems.push('Prioritize response')
    }
    
    return actionItems.length > 0 ? actionItems : ['Follow up within 24 hours']
  }

  /**
   * Analyze conversation sentiment
   */
  private analyzeConversationSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['thank', 'appreciate', 'excellent', 'great', 'good', 'happy', 'satisfied']
    const negativeWords = ['problem', 'issue', 'concern', 'disappointed', 'unhappy', 'frustrated']
    
    let positiveCount = 0
    let negativeCount = 0
    
    positiveWords.forEach(word => {
      if (text.includes(word)) positiveCount++
    })
    
    negativeWords.forEach(word => {
      if (text.includes(word)) negativeCount++
    })
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  /**
   * Analyze conversation urgency
   */
  private analyzeConversationUrgency(text: string): 'low' | 'normal' | 'high' {
    if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) {
      return 'high'
    }
    
    if (text.includes('when convenient') || text.includes('no rush') || text.includes('take your time')) {
      return 'low'
    }
    
    return 'normal'
  }

  /**
   * Calculate business opportunity score
   */
  private calculateBusinessOpportunity(text: string, businessContext: string): number {
    let score = 50 // Base score
    
    // Increase score for positive indicators
    if (text.includes('purchase') || text.includes('order') || text.includes('buy')) score += 20
    if (text.includes('quote') || text.includes('pricing')) score += 15
    if (text.includes('urgent') || text.includes('asap')) score += 10
    if (text.includes('budget') || text.includes('price range')) score += 10
    
    // Decrease score for negative indicators
    if (text.includes('problem') || text.includes('issue') || text.includes('concern')) score -= 15
    if (text.includes('expensive') || text.includes('costly')) score -= 10
    if (text.includes('not interested') || text.includes('decline')) score -= 20
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(100, score))
  }

  /**
   * Suggest follow-up actions
   */
  private suggestFollowUpActions(text: string, businessContext: string): string[] {
    const actions: string[] = []
    
    if (text.includes('quote') || text.includes('pricing')) {
      actions.push('Send detailed quote within 24 hours')
      actions.push('Follow up on quote acceptance')
    }
    
    if (text.includes('catalog') || text.includes('portfolio')) {
      actions.push('Send product catalog')
      actions.push('Schedule product demonstration')
    }
    
    if (text.includes('urgent') || text.includes('asap')) {
      actions.push('Immediate response required')
      actions.push('Escalate to senior staff if needed')
    }
    
    if (text.includes('budget') || text.includes('price range')) {
      actions.push('Provide pricing options within budget')
      actions.push('Suggest alternative products if needed')
    }
    
    // Default follow-up
    if (actions.length === 0) {
      actions.push('Follow up within 24 hours')
      actions.push('Send thank you message')
    }
    
    return actions
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Parse suggestions from AI response
   */
  private parseSuggestions(completion: string): string[] {
    // Simple parsing - split by common delimiters
    const suggestions = completion
      .split(/[1-5]\.|•|\n/)
      .map(s => s.trim())
      .filter(s => s.length > 10 && s.length < 200)
      .slice(0, 5)
    
    return suggestions.length > 0 ? suggestions : ['Thank you for your message. I\'ll get back to you soon.']
  }
}
