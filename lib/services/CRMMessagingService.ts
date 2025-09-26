import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface CRMContact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  lead_source: string
  lead_status: 'cold' | 'warm' | 'hot' | 'qualified' | 'customer' | 'lost'
  last_contact: string
  next_followup?: string
  tags: string[]
  notes: CRMNote[]
  interactions: CRMInteraction[]
  value_estimate?: number
  probability?: number
  created_at: string
  updated_at: string
}

export interface CRMNote {
  id: string
  content: string
  type: 'call' | 'email' | 'meeting' | 'general'
  created_by: string
  created_at: string
  is_important: boolean
}

export interface CRMInteraction {
  id: string
  type: 'message' | 'email' | 'call' | 'meeting' | 'quote' | 'order'
  direction: 'inbound' | 'outbound'
  subject?: string
  content?: string
  message_id?: string // Link to actual message
  duration?: number // For calls/meetings
  outcome?: string
  created_at: string
  created_by: string
}

export interface MessageCRMData {
  contact_id?: string
  lead_stage?: string
  opportunity_value?: number
  follow_up_required: boolean
  follow_up_date?: string
  tags: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  priority: 'low' | 'medium' | 'high'
  category: 'inquiry' | 'quote_request' | 'support' | 'complaint' | 'order' | 'general'
}

export interface CRMPipeline {
  id: string
  name: string
  stages: CRMStage[]
  default_probability: { [stage: string]: number }
}

export interface CRMStage {
  id: string
  name: string
  order: number
  probability: number
  is_won: boolean
  is_lost: boolean
}

export interface CRMOpportunity {
  id: string
  contact_id: string
  title: string
  description: string
  value: number
  currency: string
  stage: string
  probability: number
  expected_close_date?: string
  actual_close_date?: string
  source: string
  assigned_to: string
  created_at: string
  updated_at: string
  
  // Related data
  messages: string[] // Message IDs
  quotes: string[] // Quote IDs
  activities: CRMActivity[]
}

export interface CRMActivity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'task' | 'quote' | 'proposal'
  subject: string
  description?: string
  due_date?: string
  completed_date?: string
  status: 'pending' | 'completed' | 'cancelled'
  assigned_to: string
  contact_id: string
  opportunity_id?: string
  created_at: string
}

export class CRMMessagingService {
  private supabase: any = null

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createSupabaseServerClient()
    }
    return this.supabase
  }

  // =====================================================
  // MESSAGE-CRM INTEGRATION
  // =====================================================

  async enrichMessageWithCRM(messageId: string, crmData: MessageCRMData): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      
      const { error } = await supabase
        .from('message_crm_data')
        .upsert({
          message_id: messageId,
          ...crmData,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error enriching message with CRM data:', error)
        return false
      }

      // Auto-create or update contact if needed
      if (crmData.contact_id) {
        await this.updateContactInteraction(crmData.contact_id, {
          type: 'message',
          direction: 'inbound',
          message_id: messageId,
          created_at: new Date().toISOString(),
          created_by: 'system'
        })
      }

      return true
    } catch (error) {
      console.error('Error in enrichMessageWithCRM:', error)
      return false
    }
  }

  async analyzeMessageForCRM(messageId: string, content: string, senderEmail: string): Promise<MessageCRMData> {
    try {
      // AI-powered message analysis for CRM enrichment
      const analysis = await this.analyzeMessageContent(content)
      
      // Find or create contact
      const contact = await this.findOrCreateContact(senderEmail, content)
      
      return {
        contact_id: contact?.id,
        lead_stage: this.determineLeadStage(content),
        opportunity_value: this.estimateOpportunityValue(content),
        follow_up_required: this.requiresFollowUp(content),
        follow_up_date: this.suggestFollowUpDate(content),
        tags: this.extractTags(content),
        sentiment: analysis.sentiment,
        priority: analysis.priority,
        category: analysis.category
      }
    } catch (error) {
      console.error('Error analyzing message for CRM:', error)
      return {
        follow_up_required: false,
        tags: [],
        sentiment: 'neutral',
        priority: 'medium',
        category: 'general'
      }
    }
  }

  private async analyzeMessageContent(content: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative'
    priority: 'low' | 'medium' | 'high'
    category: 'inquiry' | 'quote_request' | 'support' | 'complaint' | 'order' | 'general'
  }> {
    // Simple keyword-based analysis (in production, use AI/ML)
    const lowerContent = content.toLowerCase()
    
    // Sentiment analysis
    const positiveWords = ['love', 'amazing', 'perfect', 'excellent', 'beautiful', 'impressed']
    const negativeWords = ['disappointed', 'problem', 'issue', 'broken', 'wrong', 'unhappy']
    
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
    if (positiveWords.some(word => lowerContent.includes(word))) {
      sentiment = 'positive'
    } else if (negativeWords.some(word => lowerContent.includes(word))) {
      sentiment = 'negative'
    }

    // Priority analysis
    const urgentWords = ['urgent', 'asap', 'immediately', 'emergency', 'rush']
    const priority = urgentWords.some(word => lowerContent.includes(word)) ? 'high' : 'medium'

    // Category analysis
    let category: 'inquiry' | 'quote_request' | 'support' | 'complaint' | 'order' | 'general' = 'general'
    
    if (lowerContent.includes('quote') || lowerContent.includes('price') || lowerContent.includes('cost')) {
      category = 'quote_request'
    } else if (lowerContent.includes('order') || lowerContent.includes('purchase') || lowerContent.includes('buy')) {
      category = 'order'
    } else if (lowerContent.includes('problem') || lowerContent.includes('issue') || lowerContent.includes('complaint')) {
      category = 'complaint'
    } else if (lowerContent.includes('support') || lowerContent.includes('help')) {
      category = 'support'
    } else if (lowerContent.includes('interested') || lowerContent.includes('information')) {
      category = 'inquiry'
    }

    return { sentiment, priority, category }
  }

  // =====================================================
  // CONTACT MANAGEMENT
  // =====================================================

  async findOrCreateContact(email: string, messageContent: string): Promise<CRMContact | null> {
    try {
      const supabase = await this.getSupabase()
      
      // Try to find existing contact
      const { data: existingContact } = await supabase
        .from('crm_contacts')
        .select('*')
        .eq('email', email)
        .single()

      if (existingContact) {
        return existingContact
      }

      // Extract name from message or email
      const name = this.extractNameFromContent(messageContent) || email.split('@')[0]
      const company = this.extractCompanyFromContent(messageContent)

      // Create new contact
      const newContact = {
        name,
        email,
        company,
        lead_source: 'website_message',
        lead_status: 'cold',
        last_contact: new Date().toISOString(),
        tags: [],
        notes: [],
        interactions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: contact, error } = await supabase
        .from('crm_contacts')
        .insert(newContact)
        .select()
        .single()

      if (error) {
        console.error('Error creating contact:', error)
        return null
      }

      return contact
    } catch (error) {
      console.error('Error in findOrCreateContact:', error)
      return null
    }
  }

  async updateContactInteraction(contactId: string, interaction: Omit<CRMInteraction, 'id'>): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      
      // Add interaction
      const { error: interactionError } = await supabase
        .from('crm_interactions')
        .insert({
          contact_id: contactId,
          ...interaction
        })

      if (interactionError) {
        console.error('Error adding interaction:', interactionError)
        return false
      }

      // Update contact last_contact
      const { error: updateError } = await supabase
        .from('crm_contacts')
        .update({
          last_contact: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)

      if (updateError) {
        console.error('Error updating contact:', updateError)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateContactInteraction:', error)
      return false
    }
  }

  // =====================================================
  // OPPORTUNITY MANAGEMENT
  // =====================================================

  async createOpportunityFromMessage(
    messageId: string, 
    contactId: string, 
    value: number,
    title: string
  ): Promise<CRMOpportunity | null> {
    try {
      const supabase = await this.getSupabase()
      
      const opportunity = {
        contact_id: contactId,
        title,
        description: `Opportunity created from message interaction`,
        value,
        currency: 'USD',
        stage: 'initial_contact',
        probability: 20,
        source: 'message',
        assigned_to: 'system', // In practice, assign to a user
        messages: [messageId],
        quotes: [],
        activities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: newOpportunity, error } = await supabase
        .from('crm_opportunities')
        .insert(opportunity)
        .select()
        .single()

      if (error) {
        console.error('Error creating opportunity:', error)
        return null
      }

      return newOpportunity
    } catch (error) {
      console.error('Error in createOpportunityFromMessage:', error)
      return null
    }
  }

  // =====================================================
  // AUTOMATED FOLLOW-UP SYSTEM
  // =====================================================

  async scheduleFollowUp(
    contactId: string, 
    type: 'call' | 'email' | 'meeting' | 'task',
    dueDate: string,
    subject: string,
    description?: string
  ): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      
      const activity = {
        type,
        subject,
        description,
        due_date: dueDate,
        status: 'pending',
        assigned_to: 'system', // In practice, assign based on rules
        contact_id: contactId,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('crm_activities')
        .insert(activity)

      if (error) {
        console.error('Error scheduling follow-up:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in scheduleFollowUp:', error)
      return false
    }
  }

  async getOverdueFollowUps(userId: string): Promise<CRMActivity[]> {
    try {
      const supabase = await this.getSupabase()
      
      const { data: activities, error } = await supabase
        .from('crm_activities')
        .select(`
          *,
          contact:crm_contacts(name, email, company)
        `)
        .eq('assigned_to', userId)
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })

      if (error) {
        console.error('Error fetching overdue follow-ups:', error)
        return []
      }

      return activities || []
    } catch (error) {
      console.error('Error in getOverdueFollowUps:', error)
      return []
    }
  }

  // =====================================================
  // CRM ANALYTICS & INSIGHTS
  // =====================================================

  async getCRMInsights(userId: string): Promise<{
    totalContacts: number
    totalOpportunities: number
    pipelineValue: number
    conversionRate: number
    avgDealSize: number
    monthlyStats: {
      newContacts: number
      newOpportunities: number
      closedDeals: number
      revenue: number
    }
  }> {
    try {
      const supabase = await this.getSupabase()
      
      // Get basic counts
      const { data: contacts } = await supabase
        .from('crm_contacts')
        .select('id, created_at, lead_status')

      const { data: opportunities } = await supabase
        .from('crm_opportunities')
        .select('id, value, stage, created_at, actual_close_date')

      const totalContacts = contacts?.length || 0
      const totalOpportunities = opportunities?.length || 0
      
      const pipelineValue = opportunities
        ?.filter((o: any) => !o.actual_close_date)
        .reduce((sum: number, o: any) => sum + o.value, 0) || 0

      const closedDeals = opportunities?.filter((o: any) => o.actual_close_date) || []
      const conversionRate = totalOpportunities > 0 ? (closedDeals.length / totalOpportunities) * 100 : 0
      const avgDealSize = closedDeals.length > 0 ? 
        closedDeals.reduce((sum: number, o: any) => sum + o.value, 0) / closedDeals.length : 0

      // Monthly stats (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const monthlyStats = {
        newContacts: contacts?.filter((c: any) => new Date(c.created_at) > thirtyDaysAgo).length || 0,
        newOpportunities: opportunities?.filter((o: any) => new Date(o.created_at) > thirtyDaysAgo).length || 0,
        closedDeals: closedDeals.filter((o: any) => new Date(o.actual_close_date) > thirtyDaysAgo).length,
        revenue: closedDeals
          .filter((o: any) => new Date(o.actual_close_date) > thirtyDaysAgo)
          .reduce((sum: number, o: any) => sum + o.value, 0)
      }

      return {
        totalContacts,
        totalOpportunities,
        pipelineValue,
        conversionRate,
        avgDealSize,
        monthlyStats
      }
    } catch (error) {
      console.error('Error getting CRM insights:', error)
      return {
        totalContacts: 0,
        totalOpportunities: 0,
        pipelineValue: 0,
        conversionRate: 0,
        avgDealSize: 0,
        monthlyStats: {
          newContacts: 0,
          newOpportunities: 0,
          closedDeals: 0,
          revenue: 0
        }
      }
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private extractNameFromContent(content: string): string | null {
    // Simple name extraction (in production, use NLP)
    const namePatterns = [
      /my name is ([A-Z][a-z]+ [A-Z][a-z]+)/i,
      /i'm ([A-Z][a-z]+ [A-Z][a-z]+)/i,
      /this is ([A-Z][a-z]+ [A-Z][a-z]+)/i
    ]

    for (const pattern of namePatterns) {
      const match = content.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return null
  }

  private extractCompanyFromContent(content: string): string | null {
    // Simple company extraction
    const companyPatterns = [
      /from ([A-Z][A-Za-z\s]+(?:Inc|LLC|Corp|Ltd|Company))/i,
      /at ([A-Z][A-Za-z\s]+(?:Inc|LLC|Corp|Ltd|Company))/i,
      /work for ([A-Z][A-Za-z\s]+)/i
    ]

    for (const pattern of companyPatterns) {
      const match = content.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }

    return null
  }

  private determineLeadStage(content: string): string {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('ready to buy') || lowerContent.includes('place order')) {
      return 'qualified'
    } else if (lowerContent.includes('quote') || lowerContent.includes('price')) {
      return 'warm'
    } else if (lowerContent.includes('interested') || lowerContent.includes('more information')) {
      return 'warm'
    }
    
    return 'cold'
  }

  private estimateOpportunityValue(content: string): number | undefined {
    // Extract budget mentions
    const budgetMatch = content.match(/budget.*?(\$[\d,]+)/i)
    if (budgetMatch) {
      return parseInt(budgetMatch[1].replace(/[$,]/g, ''))
    }

    const priceMatch = content.match(/(\$[\d,]+)/i)
    if (priceMatch) {
      return parseInt(priceMatch[1].replace(/[$,]/g, ''))
    }

    return undefined
  }

  private requiresFollowUp(content: string): boolean {
    const followUpIndicators = [
      'get back to you',
      'follow up',
      'call me',
      'schedule',
      'appointment',
      'meeting',
      'quote',
      'proposal'
    ]

    const lowerContent = content.toLowerCase()
    return followUpIndicators.some(indicator => lowerContent.includes(indicator))
  }

  private suggestFollowUpDate(content: string): string | undefined {
    // If urgent, follow up in 1 day, otherwise 3 days
    const lowerContent = content.toLowerCase()
    const isUrgent = ['urgent', 'asap', 'soon', 'quickly'].some(word => lowerContent.includes(word))
    
    const followUpDate = new Date()
    followUpDate.setDate(followUpDate.getDate() + (isUrgent ? 1 : 3))
    
    return followUpDate.toISOString()
  }

  private extractTags(content: string): string[] {
    const tags: string[] = []
    const lowerContent = content.toLowerCase()

    // Service type tags
    if (lowerContent.includes('engagement') || lowerContent.includes('wedding')) {
      tags.push('engagement', 'wedding')
    }
    if (lowerContent.includes('custom') || lowerContent.includes('design')) {
      tags.push('custom-design')
    }
    if (lowerContent.includes('repair')) {
      tags.push('repair')
    }
    if (lowerContent.includes('appraisal')) {
      tags.push('appraisal')
    }

    // Material tags
    if (lowerContent.includes('diamond')) {
      tags.push('diamond')
    }
    if (lowerContent.includes('gold')) {
      tags.push('gold')
    }
    if (lowerContent.includes('silver')) {
      tags.push('silver')
    }

    return tags
  }
}
