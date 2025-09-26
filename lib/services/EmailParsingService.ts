import { logger } from '@/lib/services/LoggingService'

interface ProcessingLog {
  id: string
  sender_email: string
  subject: string
  email_type: string
  processing_status: string
  ai_confidence_score: number
  created_record_type?: string
  created_record_id?: string
  error_message?: string
  extracted_data?: any
  created_at: string
  email_integration: {
    email_address: string
    email_type: string
  }
}

// =====================================================
// EMAIL PARSING SERVICE
// =====================================================
// This service uses AI to parse emails and extract structured data

export interface EmailData {
  id: string
  from: string
  to: string
  subject: string
  body: string
  htmlBody?: string
  attachments?: Array<{
    filename: string
    contentType: string
    content: string
  }>
  timestamp: string
}

export interface ParsedEmailData {
  emailType: 'quotes' | 'orders' | 'repairs' | 'communications' | 'trade_in' | 'asset_tracking' | 'inventory_assign' | 'check_in_out' | 'cad_files' | 'rework_tracking' | 'accounts_receivable' | 'accounts_payable' | 'general'
  confidence: number
  extractedData: Record<string, any>
  validationErrors: string[]
  suggestions: string[]
  requiresReview: boolean
}

export interface EmailTemplate {
  id: string
  templateName: string
  emailType: string
  sampleEmails: string[]
  extractionRules: Record<string, any>
  validationRules: Record<string, any>
}

export class EmailParsingService {
  private supabase: any
  private templates: Map<string, EmailTemplate> = new Map()

  constructor(supabase: any) {
    this.supabase = supabase
  }

  /**
   * Parse an email and extract structured data
   */
  async parseEmail(emailData: EmailData, tenantId: string): Promise<ParsedEmailData> {
    try {
      logger.info('Starting email parsing', { emailId: emailData.id, tenantId })

      // SECURITY CHECK: Detect modification attempts
      const securityCheck = await this.performSecurityCheck(emailData)
      if (securityCheck.isModificationAttempt) {
        logger.warn('Modification attempt detected', { 
          emailId: emailData.id, 
          detectedActions: securityCheck.detectedActions,
          riskLevel: securityCheck.riskLevel
        })
        
        // Return a special result for modification attempts
        return {
          emailType: 'communications', // Route to communications for manual review
          confidence: 0.1, // Low confidence due to security concerns
          extractedData: {
            ...securityCheck.extractedData,
            _security: {
              isModificationAttempt: true,
              detectedActions: securityCheck.detectedActions,
              riskLevel: securityCheck.riskLevel,
              originalEmail: {
                from: emailData.from,
                subject: emailData.subject,
                timestamp: emailData.timestamp
              }
            }
          },
          validationErrors: [`Security Alert: ${securityCheck.riskLevel} risk - Modification attempt detected`],
          suggestions: ['This email appears to request modifications to existing records. Manual review required.'],
          requiresReview: true
        }
      }

      // Load templates for this tenant
      await this.loadTemplates(tenantId)

      // Determine email type
      const emailType = await this.determineEmailType(emailData)
      
      // Extract data based on email type
      const extractedData = await this.extractData(emailData, emailType)
      
      // Validate extracted data
      const validation = await this.validateData(extractedData, emailType)
      
      // Calculate confidence score
      const confidence = this.calculateConfidence(extractedData, validation.errors)
      
      // Generate suggestions
      const suggestions = this.generateSuggestions(extractedData, validation.errors)

      const result: ParsedEmailData = {
        emailType,
        confidence,
        extractedData,
        validationErrors: validation.errors,
        suggestions,
        requiresReview: confidence < 0.7 || validation.errors.length > 0
      }

      logger.info('Email parsing completed', { 
        emailId: emailData.id, 
        emailType, 
        confidence,
        requiresReview: result.requiresReview
      })

      return result

    } catch (error) {
      logger.error('Email parsing failed', { emailId: emailData.id, error })
      throw error
    }
  }

  /**
   * Determine the type of email and route to appropriate system
   */
  private async determineEmailType(emailData: EmailData): Promise<ParsedEmailData['emailType']> {
    const subject = emailData.subject.toLowerCase()
    const body = emailData.body.toLowerCase()
    const text = subject + ' ' + body

    // Check for trade-in keywords (moved before quotes to avoid "ring" matching "engagement ring")
    if (this.containsKeywords(text, [
      'trade in', 'trade-in', 'exchange', 'trade', 'old jewelry',
      'upgrade', 'trade up', 'part exchange', 'sell', 'selling'
    ])) {
      return 'trade_in'
    }

    // Check for quote-related keywords
    if (this.containsKeywords(text, [
      'quote', 'quotation', 'estimate', 'pricing', 'cost', 'budget',
      'wedding ring', 'custom jewelry', 'engagement ring', 'price'
    ])) {
      return 'quotes'
    }

    // Check for order-related keywords
    if (this.containsKeywords(text, [
      'order', 'purchase', 'buy', 'ship', 'shipped', 'delivered',
      'tracking', 'order number', 'order #', 'sale', 'sold'
    ])) {
      return 'orders'
    }

    // Check for repair-related keywords
    if (this.containsKeywords(text, [
      'repair', 'fix', 'broken', 'damaged', 'resize', 'polish',
      'restoration', 'maintenance', 'broken chain', 'clasp'
    ])) {
      return 'repairs'
    }

    // Check for asset tracking keywords
    if (this.containsKeywords(text, [
      'asset', 'tracking', 'location', 'where is', 'find', 'missing',
      'inventory location', 'asset location'
    ])) {
      return 'asset_tracking'
    }

    // Check for inventory assignment keywords
    if (this.containsKeywords(text, [
      'assign', 'assignment', 'allocate', 'assign inventory',
      'give to', 'assign to', 'allocation'
    ])) {
      return 'inventory_assign'
    }

    // Check for check-in/check-out keywords
    if (this.containsKeywords(text, [
      'check in', 'check out', 'check-in', 'check-out', 'return',
      'pickup', 'delivery', 'received', 'returned'
    ])) {
      return 'check_in_out'
    }

    // Check for CAD files keywords
    if (this.containsKeywords(text, [
      'cad', 'design', 'drawing', 'blueprint', '3d model',
      'design file', 'cad file', 'technical drawing'
    ])) {
      return 'cad_files'
    }

    // Check for rework tracking keywords
    if (this.containsKeywords(text, [
      'rework', 'redo', 'fix again', 'correction', 'modification',
      'adjustment', 'change', 'alteration'
    ])) {
      return 'rework_tracking'
    }

    // Check for accounts receivable keywords
    if (this.containsKeywords(text, [
      'payment', 'invoice', 'bill', 'money owed', 'outstanding',
      'receivable', 'payment due', 'billing'
    ])) {
      return 'accounts_receivable'
    }

    // Check for accounts payable keywords
    if (this.containsKeywords(text, [
      'payable', 'vendor', 'supplier', 'payment to', 'owe',
      'expense', 'cost', 'supplier payment'
    ])) {
      return 'accounts_payable'
    }

    // Check for communication-related keywords
    if (this.containsKeywords(text, [
      'question', 'inquiry', 'help', 'support', 'contact',
      'follow up', 'meeting', 'appointment', 'call'
    ])) {
      return 'communications'
    }

    return 'general'
  }

  /**
   * Extract structured data from email based on type
   */
  private async extractData(emailData: EmailData, emailType: string): Promise<Record<string, any>> {
    const template = this.templates.get(emailType)
    if (!template) {
      return this.extractGenericData(emailData)
    }

    const extractedData: Record<string, any> = {}
    const text = emailData.subject + ' ' + emailData.body

    // Apply extraction rules from template
    for (const [field, rules] of Object.entries(template.extractionRules)) {
      try {
        const value = this.extractField(text, rules)
        if (value) {
          extractedData[field] = this.cleanValue(value, field)
        }
      } catch (error) {
        logger.warn('Failed to extract field', { field, error })
      }
    }

    // Add metadata
    extractedData._metadata = {
      originalEmail: {
        from: emailData.from,
        subject: emailData.subject,
        timestamp: emailData.timestamp
      },
      extractionTimestamp: new Date().toISOString()
    }

    return extractedData
  }

  /**
   * Extract a specific field using regex patterns
   */
  private extractField(text: string, rules: any): string | null {
    if (!rules.pattern) return null

    const regex = new RegExp(rules.pattern, 'gi')
    const match = text.match(regex)
    
    if (match && match[1]) {
      return match[1].trim()
    }

    return null
  }

  /**
   * Clean and normalize extracted values
   */
  private cleanValue(value: string, field: string): any {
    switch (field) {
      case 'budget':
      case 'price':
      case 'cost':
        // Remove currency symbols and convert to number
        return parseFloat(value.replace(/[^0-9.]/g, '')) || 0

      case 'phone':
        // Normalize phone number
        return value.replace(/[^0-9]/g, '')

      case 'email':
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value) ? value : null

      case 'date':
        // Parse date
        const date = new Date(value)
        return isNaN(date.getTime()) ? null : date.toISOString()

      default:
        return value.trim()
    }
  }

  /**
   * Extract generic data when no template is available
   */
  private extractGenericData(emailData: EmailData): Record<string, any> {
    const text = emailData.subject + ' ' + emailData.body

    const result = {
      customer_name: this.extractCustomerName(text),
      phone: this.extractPhone(text),
      email: this.extractEmail(text) || emailData.from, // Use from field if no email found in text
      description: this.extractDescription(text),
      amount: this.extractMonetaryAmount(text),
      budget: this.extractMonetaryAmount(text),
      mentioned_record_ids: this.extractRecordIds(text),
      _metadata: {
        originalEmail: {
          from: emailData.from,
          subject: emailData.subject,
          timestamp: emailData.timestamp
        },
        extractionTimestamp: new Date().toISOString()
      }
    }

    return result
  }

  /**
   * Extract customer name from text
   */
  private extractCustomerName(text: string): string | null {
    const patterns = [
      /customer[:\s]+([A-Za-z\s]+?)(?:\s|$)/i,
      /name[:\s]+([A-Za-z\s]+?)(?:\s|$)/i,
      /from[:\s]+([A-Za-z\s]+?)(?:\s|$)/i,
      /contact[:\s]+([A-Za-z\s]+?)(?:\s|$)/i,
      /my name is ([A-Za-z\s]+?)(?:\s|and|$)/i,
      /i am ([A-Za-z\s]+?)(?:\s|and|$)/i,
      /i'm ([A-Za-z\s]+?)(?:\s|and|$)/i
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const name = match[1].trim()
        if (name.length > 2 && name.length < 50) {
          return name
        }
      }
    }

    return null
  }

  /**
   * Extract phone number from text
   */
  private extractPhone(text: string): string | null {
    const patterns = [
      /phone[:\s]+([0-9\-\(\)\s\+]+)/i,
      /tel[:\s]+([0-9\-\(\)\s\+]+)/i,
      /call[:\s]+([0-9\-\(\)\s\+]+)/i,
      /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const phone = match[1].replace(/[^0-9]/g, '')
        if (phone.length >= 10) {
          return phone
        }
      }
    }

    return null
  }

  /**
   * Extract email address from text
   */
  private extractEmail(text: string): string | null {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const matches = text.match(emailRegex)
    return matches ? matches[0] : null
  }

  /**
   * Extract description from text
   */
  private extractDescription(text: string): string | null {
    // Look for common description patterns
    const patterns = [
      /description[:\s]+([^\n]+)/i,
      /details[:\s]+([^\n]+)/i,
      /request[:\s]+([^\n]+)/i,
      /need[:\s]+([^\n]+)/i
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    // If no specific pattern, take first sentence
    const sentences = text.split(/[.!?]/)
    if (sentences.length > 0 && sentences[0].length > 10) {
      return sentences[0].trim()
    }

    return null
  }

  /**
   * Extract monetary amounts from text
   */
  private extractMonetaryAmount(text: string): number | null {
    const patterns = [
      /\$([0-9,]+(?:\.[0-9]{2})?)/g,
      /([0-9,]+(?:\.[0-9]{2})?)\s*dollars?/gi,
      /budget[:\s]*\$?([0-9,]+(?:\.[0-9]{2})?)/gi,
      /amount[:\s]*\$?([0-9,]+(?:\.[0-9]{2})?)/gi,
      /price[:\s]*\$?([0-9,]+(?:\.[0-9]{2})?)/gi,
      /cost[:\s]*\$?([0-9,]+(?:\.[0-9]{2})?)/gi
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        // Get the first match and extract the number
        const amountMatch = match[0].match(/([0-9,]+(?:\.[0-9]{2})?)/)
        if (amountMatch) {
          const amount = parseFloat(amountMatch[1].replace(/,/g, ''))
          if (!isNaN(amount) && amount > 0) {
            return amount
          }
        }
      }
    }

    return null
  }

  /**
   * Extract record IDs from text
   */
  private extractRecordIds(text: string): string[] {
    const patterns = [
      /#(\d+)/g,
      /order\s*#?(\d+)/gi,
      /quote\s*#?(\d+)/gi,
      /job\s*#?(\d+)/gi,
      /work\s*#?(\d+)/gi,
      /project\s*#?(\d+)/gi
    ]

    const recordIds: string[] = []
    
    for (const pattern of patterns) {
      const matches = text.match(pattern)
      if (matches) {
        for (const match of matches) {
          const idMatch = match.match(/(\d+)/)
          if (idMatch && idMatch[1]) {
            const id = idMatch[1]
            if (!recordIds.includes(id)) {
              recordIds.push(id)
            }
          }
        }
      }
    }

    return recordIds
  }

  /**
   * Validate extracted data
   */
  private async validateData(data: Record<string, any>, emailType: string): Promise<{ errors: string[] }> {
    const errors: string[] = []
    const template = this.templates.get(emailType)

    if (!template) {
      return { errors }
    }

    // Apply validation rules
    for (const [field, rules] of Object.entries(template.validationRules)) {
      const value = data[field]
      
      if (rules.required && (!value || value === '')) {
        errors.push(`${field} is required but not found`)
        continue
      }

      if (value) {
        // Check min/max length
        if (rules.min_length && value.length < rules.min_length) {
          errors.push(`${field} is too short (minimum ${rules.min_length} characters)`)
        }
        if (rules.max_length && value.length > rules.max_length) {
          errors.push(`${field} is too long (maximum ${rules.max_length} characters)`)
        }

        // Check min/max values for numbers
        if (rules.min && typeof value === 'number' && value < rules.min) {
          errors.push(`${field} is too small (minimum ${rules.min})`)
        }
        if (rules.max && typeof value === 'number' && value > rules.max) {
          errors.push(`${field} is too large (maximum ${rules.max})`)
        }

        // Check enum values
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rules.enum.join(', ')}`)
        }

        // Check pattern
        if (rules.pattern) {
          const regex = new RegExp(rules.pattern)
          if (!regex.test(value)) {
            errors.push(`${field} format is invalid`)
          }
        }
      }
    }

    return { errors }
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(data: Record<string, any>, errors: string[]): number {
    let score = 0.5 // Base score

    // Increase score for each extracted field
    const fieldCount = Object.keys(data).filter(key => key !== '_metadata').length
    score += Math.min(fieldCount * 0.1, 0.3)

    // Decrease score for validation errors
    score -= errors.length * 0.1

    // Increase score if we have key fields
    if (data.customer_name) score += 0.1
    if (data.phone || data.email) score += 0.1
    if (data.description) score += 0.1

    return Math.max(0, Math.min(1, score))
  }

  /**
   * Generate suggestions for improvement
   */
  private generateSuggestions(data: Record<string, any>, errors: string[]): string[] {
    const suggestions: string[] = []

    if (!data.customer_name) {
      suggestions.push('Customer name not found - please include customer information')
    }

    if (!data.phone && !data.email) {
      suggestions.push('Contact information missing - please include phone or email')
    }

    if (!data.description) {
      suggestions.push('Request description unclear - please provide more details')
    }

    if (errors.length > 0) {
      suggestions.push('Some information needs correction - please review the validation errors')
    }

    return suggestions
  }

  /**
   * Check if text contains any of the keywords
   */
  private containsKeywords(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase()
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))
  }

  /**
   * SECURITY CHECK: Detect modification attempts
   */
  private async performSecurityCheck(emailData: EmailData): Promise<{
    isModificationAttempt: boolean
    detectedActions: string[]
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    extractedData: Record<string, any>
  }> {
    const text = (emailData.subject + ' ' + emailData.body).toLowerCase()
    const detectedActions: string[] = []
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW'

    // HIGH RISK: Direct modification commands
    const highRiskPatterns = [
      'delete', 'remove', 'cancel', 'void', 'terminate',
      'change price', 'update price', 'modify price',
      'change status', 'update status', 'modify status',
      'edit order', 'modify order', 'change order',
      'edit quote', 'modify quote', 'change quote'
    ]

    // MEDIUM RISK: Update/modify requests (but exclude repair context)
    const mediumRiskPatterns = [
      'update', 'modify', 'change', 'edit', 'alter',
      'correct', 'adjust', 'revise', 'amend',
      'change customer', 'update customer', 'modify customer'
    ]
    
    // Check for "fix" only if not in repair context
    if (text.includes('fix') && !this.isRepairContext(text)) {
      mediumRiskPatterns.push('fix')
    }

    // LOW RISK: Reference to existing records (but not modification)
    const lowRiskPatterns = [
      'order #', 'quote #', 'repair #', 'invoice #',
      'reference', 'regarding', 'about order', 'about quote'
    ]

    // Check for high-risk patterns
    highRiskPatterns.forEach(pattern => {
      if (text.includes(pattern)) {
        detectedActions.push(`HIGH_RISK: ${pattern}`)
        riskLevel = 'HIGH'
      }
    })

    // Check for medium-risk patterns
    mediumRiskPatterns.forEach(pattern => {
      if (text.includes(pattern)) {
        detectedActions.push(`MEDIUM_RISK: ${pattern}`)
        if (riskLevel === 'LOW') riskLevel = 'MEDIUM'
      }
    })

    // Special case: "change price" pattern (words can be separated)
    if (text.includes('change') && text.includes('price')) {
      detectedActions.push('HIGH_RISK: change price')
      riskLevel = 'HIGH'
    }

    // Check for low-risk patterns (references to existing records)
    lowRiskPatterns.forEach(pattern => {
      if (text.includes(pattern)) {
        detectedActions.push(`LOW_RISK: ${pattern}`)
      }
    })

    // CRITICAL RISK: Multiple high-risk patterns or specific dangerous combinations
    if (detectedActions.filter(action => action.includes('HIGH_RISK')).length > 1) {
      riskLevel = 'CRITICAL'
    }

    // Check for specific dangerous combinations
    if (text.includes('delete') && (text.includes('order') || text.includes('quote') || text.includes('customer'))) {
      riskLevel = 'CRITICAL'
      detectedActions.push('CRITICAL: Delete operation on business record')
    }

    // Extract any record IDs mentioned (for logging purposes)
    const recordIds = this.extractRecordIds(text)
    
    const isModificationAttempt = detectedActions.length > 0 && riskLevel !== 'LOW'

    return {
      isModificationAttempt,
      detectedActions,
      riskLevel,
      extractedData: {
        customer_name: this.extractCustomerName(text),
        phone: this.extractPhone(text),
        email: this.extractEmail(text),
        description: this.extractDescription(text),
        mentioned_record_ids: recordIds,
        security_analysis: {
          total_patterns_detected: detectedActions.length,
          high_risk_count: detectedActions.filter(a => a.includes('HIGH_RISK')).length,
          medium_risk_count: detectedActions.filter(a => a.includes('MEDIUM_RISK')).length,
          low_risk_count: detectedActions.filter(a => a.includes('LOW_RISK')).length
        }
      }
    }
  }

  /**
   * Check if text is in repair context (not modification context)
   */
  private isRepairContext(text: string): boolean {
    const repairKeywords = [
      'repair', 'broken', 'damaged', 'resize', 'polish',
      'restoration', 'maintenance', 'broken chain', 'clasp',
      'necklace', 'ring', 'bracelet', 'earring', 'jewelry',
      'snapped', 'cracked', 'chipped', 'tarnished'
    ]
    
    return repairKeywords.some(keyword => text.includes(keyword))
  }


  /**
   * Load email templates for tenant
   */
  private async loadTemplates(tenantId: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('email_templates')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)

      if (error) {
        logger.error('Failed to load email templates', { error, tenantId })
        return
      }

      this.templates.clear()
      data?.forEach((template: any) => {
        this.templates.set(template.email_type, {
          id: template.id,
          templateName: template.template_name,
          emailType: template.email_type,
          sampleEmails: template.sample_emails,
          extractionRules: template.extraction_rules,
          validationRules: template.validation_rules
        })
      })

      logger.info('Loaded email templates', { 
        tenantId, 
        templateCount: this.templates.size 
      })

    } catch (error) {
      logger.error('Error loading email templates', { error, tenantId })
    }
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(tenantId: string): Promise<{
    totalProcessed: number
    successRate: number
    averageConfidence: number
    commonErrors: Array<{ error: string; count: number }>
  }> {
    try {
      const { data, error } = await this.supabase
        .from('email_processing_logs')
        .select('processing_status, ai_confidence_score, error_message')
        .eq('tenant_id', tenantId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

      if (error) {
        logger.error('Failed to get processing stats', { error })
        return {
          totalProcessed: 0,
          successRate: 0,
          averageConfidence: 0,
          commonErrors: []
        }
      }

      const totalProcessed = data?.length || 0
      const successful = data?.filter((log: ProcessingLog) => log.processing_status === 'completed').length || 0
      const successRate = totalProcessed > 0 ? successful / totalProcessed : 0
      
      const avgConfidence = data?.reduce((sum: number, log: ProcessingLog) => sum + (log.ai_confidence_score || 0), 0) / totalProcessed || 0

      // Count common errors
      const errorCounts: Record<string, number> = {}
      data?.forEach((log: ProcessingLog) => {
        if (log.error_message) {
          errorCounts[log.error_message] = (errorCounts[log.error_message] || 0) + 1
        }
      })

      const commonErrors = Object.entries(errorCounts)
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      return {
        totalProcessed,
        successRate,
        averageConfidence: avgConfidence,
        commonErrors
      }

    } catch (error) {
      logger.error('Error getting processing stats', { error })
      return {
        totalProcessed: 0,
        successRate: 0,
        averageConfidence: 0,
        commonErrors: []
      }
    }
  }
}
