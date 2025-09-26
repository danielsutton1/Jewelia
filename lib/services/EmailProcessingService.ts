import { EmailParsingService, EmailData, ParsedEmailData } from './EmailParsingService'
import { logger } from '@/lib/services/LoggingService'

// =====================================================
// EMAIL PROCESSING SERVICE
// =====================================================
// This service processes emails and creates CRM records

export interface EmailProcessingResult {
  success: boolean
  recordId?: string
  recordType?: string
  message: string
  requiresReview: boolean
  extractedData?: Record<string, any>
}

export interface EmailIntegrationSettings {
  id: string
  tenantId: string
  userId: string
  emailAddress: string
  emailType: string
  isActive: boolean
  autoProcess: boolean
  requireConfirmation: boolean
  notificationEmail?: string
}

export class EmailProcessingService {
  private supabase: any
  private emailParser: EmailParsingService

  constructor(supabase: any) {
    this.supabase = supabase
    this.emailParser = new EmailParsingService(supabase)
  }

  /**
   * Process an incoming email with pre-parsed data and settings
   */
  async processEmailWithData(
    emailData: EmailData, 
    parsedData: ParsedEmailData, 
    settings: EmailIntegrationSettings
  ): Promise<EmailProcessingResult> {
    try {
      logger.info('Processing incoming email', { 
        emailId: emailData.id, 
        from: emailData.from, 
        subject: emailData.subject 
      })

      // Log the processing attempt
      const logId = await this.logEmailProcessing(emailData, parsedData, settings)

      // Process based on email type
      let result: EmailProcessingResult

      switch (parsedData.emailType) {
        case 'quotes':
          result = await this.processQuoteEmail(emailData, parsedData, settings)
          break
        case 'orders':
          result = await this.processOrderEmail(emailData, parsedData, settings)
          break
        case 'repairs':
          result = await this.processRepairEmail(emailData, parsedData, settings)
          break
        case 'communications':
          result = await this.processCommunicationEmail(emailData, parsedData, settings)
          break
        case 'trade_in':
          result = await this.processTradeInEmail(emailData, parsedData, settings)
          break
        case 'asset_tracking':
          result = await this.processAssetTrackingEmail(emailData, parsedData, settings)
          break
        case 'inventory_assign':
          result = await this.processInventoryAssignEmail(emailData, parsedData, settings)
          break
        case 'check_in_out':
          result = await this.processCheckInOutEmail(emailData, parsedData, settings)
          break
        case 'cad_files':
          result = await this.processCadFilesEmail(emailData, parsedData, settings)
          break
        case 'rework_tracking':
          result = await this.processReworkTrackingEmail(emailData, parsedData, settings)
          break
        case 'accounts_receivable':
          result = await this.processAccountsReceivableEmail(emailData, parsedData, settings)
          break
        case 'accounts_payable':
          result = await this.processAccountsPayableEmail(emailData, parsedData, settings)
          break
        default:
          result = await this.processGeneralEmail(emailData, parsedData, settings)
      }

      // Update processing log
      await this.updateProcessingLog(logId, result)

      // Send notification if required
      if (result.success && settings.notificationEmail) {
        await this.sendNotification(settings, result, emailData)
      }

      return result
    } catch (error) {
      logger.error('Email processing failed', { 
        emailId: emailData.id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        requiresReview: true
      }
    }
  }

  /**
   * Process an incoming email
   */
  async processEmail(emailData: EmailData): Promise<EmailProcessingResult> {
    try {
      logger.info('Processing incoming email', { 
        emailId: emailData.id, 
        from: emailData.from, 
        subject: emailData.subject 
      })

      // Find email integration settings
      const integrationSettings = await this.findEmailIntegration(emailData.to)
      if (!integrationSettings) {
        return {
          success: false,
          message: 'No email integration found for this address',
          requiresReview: false
        }
      }

      // Parse the email
      const parsedData = await this.emailParser.parseEmail(emailData, integrationSettings.tenantId)

      // Log the processing attempt
      const logId = await this.logEmailProcessing(emailData, parsedData, integrationSettings)

      // Process based on email type
      let result: EmailProcessingResult

      switch (parsedData.emailType) {
        case 'quotes':
          result = await this.processQuoteEmail(emailData, parsedData, integrationSettings)
          break
        case 'orders':
          result = await this.processOrderEmail(emailData, parsedData, integrationSettings)
          break
        case 'repairs':
          result = await this.processRepairEmail(emailData, parsedData, integrationSettings)
          break
        case 'trade_in':
          result = await this.processTradeInEmail(emailData, parsedData, integrationSettings)
          break
        case 'asset_tracking':
          result = await this.processAssetTrackingEmail(emailData, parsedData, integrationSettings)
          break
        case 'inventory_assign':
          result = await this.processInventoryAssignEmail(emailData, parsedData, integrationSettings)
          break
        case 'check_in_out':
          result = await this.processCheckInOutEmail(emailData, parsedData, integrationSettings)
          break
        case 'cad_files':
          result = await this.processCadFilesEmail(emailData, parsedData, integrationSettings)
          break
        case 'rework_tracking':
          result = await this.processReworkTrackingEmail(emailData, parsedData, integrationSettings)
          break
        case 'accounts_receivable':
          result = await this.processAccountsReceivableEmail(emailData, parsedData, integrationSettings)
          break
        case 'accounts_payable':
          result = await this.processAccountsPayableEmail(emailData, parsedData, integrationSettings)
          break
        case 'communications':
          result = await this.processCommunicationEmail(emailData, parsedData, integrationSettings)
          break
        default:
          result = await this.processGeneralEmail(emailData, parsedData, integrationSettings)
      }

      // Update processing log
      await this.updateProcessingLog(logId, result)

      // Send notification if configured
      if (integrationSettings.notificationEmail) {
        await this.sendNotification(integrationSettings, result, emailData)
      }

      logger.info('Email processing completed', { 
        emailId: emailData.id, 
        success: result.success,
        recordId: result.recordId,
        recordType: result.recordType
      })

      return result

    } catch (error) {
      logger.error('Email processing failed', { emailId: emailData.id, error })
      return {
        success: false,
        message: 'Failed to process email: ' + (error as Error).message,
        requiresReview: true
      }
    }
  }

  /**
   * Process quote email
   */
  private async processQuoteEmail(
    emailData: EmailData, 
    parsedData: ParsedEmailData, 
    settings: EmailIntegrationSettings
  ): Promise<EmailProcessingResult> {
    try {
      const data = parsedData.extractedData

      // Create or find customer
      const customerId = await this.findOrCreateCustomer(data, settings.tenantId)

      // Create quote
      const quoteData = {
        customer_id: customerId,
        status: 'draft',
        total_amount: data.budget || 0,
        notes: data.description || emailData.body,
        valid_until: this.calculateValidUntil(data.timeline),
        created_by: settings.userId,
        tenant_id: settings.tenantId
      }

      const { data: quote, error: quoteError } = await this.supabase
        .from('quotes')
        .insert([quoteData])
        .select()
        .single()

      if (quoteError) {
        throw new Error(`Failed to create quote: ${quoteError.message}`)
      }

      // Create quote items if product information is available
      if (data.products || data.description) {
        await this.createQuoteItems(quote.id, data, settings.tenantId)
      }

      return {
        success: true,
        recordId: quote.id,
        recordType: 'quote',
        message: `Quote #${quote.id} created successfully`,
        requiresReview: parsedData.requiresReview,
        extractedData: data
      }

    } catch (error) {
      logger.error('Failed to process quote email', { error })
      return {
        success: false,
        message: 'Failed to create quote: ' + (error as Error).message,
        requiresReview: true
      }
    }
  }

  /**
   * Process order email - CREATE ONLY (Security: Never update existing orders)
   */
  private async processOrderEmail(
    emailData: EmailData, 
    parsedData: ParsedEmailData, 
    settings: EmailIntegrationSettings
  ): Promise<EmailProcessingResult> {
    try {
      const data = parsedData.extractedData

      // SECURITY: Check if this is a modification attempt
      if (data._security?.isModificationAttempt) {
        return this.handleSecurityAlert(emailData, parsedData, settings, 'order modification attempt')
      }

      // SECURITY: If order number is mentioned, create a communication instead of updating
      if (data.order_number || (data.mentioned_record_ids && data.mentioned_record_ids.length > 0)) {
        const orderNumber = data.order_number || data.mentioned_record_ids[0]
        logger.warn('Order number mentioned in email - creating communication instead of updating', {
          orderNumber: orderNumber,
          emailId: emailData.id
        })

        // Create a communication thread about the existing order
        const customerId = await this.findOrCreateCustomer(data, settings.tenantId)
        
        const threadData = {
          customer_id: customerId,
          type: 'email',
          status: 'open',
          subject: `Order Update Request: ${emailData.subject}`,
          priority: 'medium',
          assigned_to: settings.userId,
          tenant_id: settings.tenantId,
          notes: `Email regarding existing order #${orderNumber}. Manual review required for any updates.`
        }

        const { data: thread, error: threadError } = await this.supabase
          .from('communication_threads')
          .insert([threadData])
          .select()
          .single()

        if (threadError) {
          throw new Error(`Failed to create communication thread: ${threadError.message}`)
        }

        // Create initial message
        const messageData = {
          thread_id: thread.id,
          sender_id: settings.userId,
          content: `Order #${data.order_number} mentioned in email:\n\n${emailData.body}`,
          message_type: 'email',
          is_read: false,
          tenant_id: settings.tenantId
        }

        await this.supabase
          .from('communication_messages')
          .insert([messageData])

        return {
          success: true,
          recordId: thread.id,
          recordType: 'communication',
          message: `Communication thread created for order #${data.order_number} (no order was modified)`,
          requiresReview: true,
          extractedData: data
        }
      }

      // CREATE NEW ORDER (if no existing order number mentioned)
      const customerId = await this.findOrCreateCustomer(data, settings.tenantId)

      const orderData = {
        customer_id: customerId,
        status: 'pending',
        total_amount: data.amount || 0,
        notes: data.description || emailData.body,
        created_by: settings.userId,
        tenant_id: settings.tenantId
      }

      const { data: order, error: orderError } = await this.supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (orderError) {
        throw new Error(`Failed to create order: ${orderError.message}`)
      }

      return {
        success: true,
        recordId: order.id,
        recordType: 'order',
        message: `New order #${order.id} created successfully`,
        requiresReview: parsedData.requiresReview,
        extractedData: data
      }

    } catch (error) {
      logger.error('Failed to process order email', { error })
      return {
        success: false,
        message: 'Failed to process order: ' + (error as Error).message,
        requiresReview: true
      }
    }
  }

  /**
   * Process repair email
   */
  private async processRepairEmail(
    emailData: EmailData, 
    parsedData: ParsedEmailData, 
    settings: EmailIntegrationSettings
  ): Promise<EmailProcessingResult> {
    try {
      const data = parsedData.extractedData

      // Create or find customer
      const customerId = await this.findOrCreateCustomer(data, settings.tenantId)

      // Create repair record
      const repairData = {
        customer_id: customerId,
        status: 'received',
        description: data.description || emailData.body,
        estimated_completion: this.calculateEstimatedCompletion(data.timeline),
        notes: `Created from email: ${emailData.subject}`,
        tenant_id: settings.tenantId
      }

      const { data: repair, error: repairError } = await this.supabase
        .from('repairs')
        .insert([repairData])
        .select()
        .single()

      if (repairError) {
        throw new Error(`Failed to create repair: ${repairError.message}`)
      }

      return {
        success: true,
        recordId: repair.id,
        recordType: 'repair',
        message: `Repair #${repair.id} created successfully`,
        requiresReview: parsedData.requiresReview,
        extractedData: data
      }

    } catch (error) {
      logger.error('Failed to process repair email', { error })
      return {
        success: false,
        message: 'Failed to create repair: ' + (error as Error).message,
        requiresReview: true
      }
    }
  }

  /**
   * Process communication email
   */
  private async processCommunicationEmail(
    emailData: EmailData, 
    parsedData: ParsedEmailData, 
    settings: EmailIntegrationSettings
  ): Promise<EmailProcessingResult> {
    try {
      const data = parsedData.extractedData

      // Create or find customer
      const customerId = await this.findOrCreateCustomer(data, settings.tenantId)

      // Create communication thread
      const threadData = {
        customer_id: customerId,
        type: 'email',
        status: 'open',
        subject: emailData.subject,
        priority: this.determinePriority(emailData.subject, emailData.body),
        assigned_to: settings.userId,
        tenant_id: settings.tenantId
      }

      const { data: thread, error: threadError } = await this.supabase
        .from('communication_threads')
        .insert([threadData])
        .select()
        .single()

      if (threadError) {
        throw new Error(`Failed to create communication thread: ${threadError.message}`)
      }

      // Create initial message
      const messageData = {
        thread_id: thread.id,
        sender_id: settings.userId,
        content: emailData.body,
        message_type: 'email',
        is_read: false,
        tenant_id: settings.tenantId
      }

      const { error: messageError } = await this.supabase
        .from('communication_messages')
        .insert([messageData])

      if (messageError) {
        logger.warn('Failed to create communication message', { error: messageError })
      }

      return {
        success: true,
        recordId: thread.id,
        recordType: 'communication',
        message: `Communication thread created successfully`,
        requiresReview: parsedData.requiresReview,
        extractedData: data
      }

    } catch (error) {
      logger.error('Failed to process communication email', { error })
      return {
        success: false,
        message: 'Failed to create communication: ' + (error as Error).message,
        requiresReview: true
      }
    }
  }

  /**
   * Process trade-in email
   */
  private async processTradeInEmail(
    emailData: EmailData, 
    parsedData: ParsedEmailData, 
    settings: EmailIntegrationSettings
  ): Promise<EmailProcessingResult> {
    try {
      const data = parsedData.extractedData

      // Create or find customer
      const customerId = await this.findOrCreateCustomer(data, settings.tenantId)

      // Create trade-in record
      const tradeInData = {
        customer_id: customerId,
        status: 'pending',
        description: data.description || emailData.body,
        estimated_value: data.estimated_value || 0,
        notes: `Created from email: ${emailData.subject}`,
        tenant_id: settings.tenantId
      }

      const { data: tradeIn, error: tradeInError } = await this.supabase
        .from('trade_ins')
        .insert([tradeInData])
        .select()
        .single()

      if (tradeInError) {
        throw new Error(`Failed to create trade-in: ${tradeInError.message}`)
      }

      return {
        success: true,
        recordId: tradeIn.id,
        recordType: 'trade_in',
        message: `Trade-in #${tradeIn.id} created successfully`,
        requiresReview: parsedData.requiresReview,
        extractedData: data
      }

    } catch (error) {
      logger.error('Failed to process trade-in email', { error })
      return {
        success: false,
        message: 'Failed to create trade-in: ' + (error as Error).message,
        requiresReview: true
      }
    }
  }

  /**
   * Process asset tracking email
   */
  private async processAssetTrackingEmail(
    emailData: EmailData, 
    parsedData: ParsedEmailData, 
    settings: EmailIntegrationSettings
  ): Promise<EmailProcessingResult> {
    try {
      const data = parsedData.extractedData

      // Create asset tracking record
      const trackingData = {
        asset_id: data.asset_id || null,
        location: data.location || 'Unknown',
        status: data.status || 'tracked',
        notes: data.description || emailData.body,
        tracked_by: settings.userId,
        tenant_id: settings.tenantId
      }

      const { data: tracking, error: trackingError } = await this.supabase
        .from('asset_tracking')
        .insert([trackingData])
        .select()
        .single()

      if (trackingError) {
        throw new Error(`Failed to create asset tracking: ${trackingError.message}`)
      }

      return {
        success: true,
        recordId: tracking.id,
        recordType: 'asset_tracking',
        message: `Asset tracking record created successfully`,
        requiresReview: parsedData.requiresReview,
        extractedData: data
      }

    } catch (error) {
      logger.error('Failed to process asset tracking email', { error })
      return {
        success: false,
        message: 'Failed to create asset tracking: ' + (error as Error).message,
        requiresReview: true
      }
    }
  }

  /**
   * Process inventory assignment email
   */
  private async processInventoryAssignEmail(
    emailData: EmailData, 
    parsedData: ParsedEmailData, 
    settings: EmailIntegrationSettings
  ): Promise<EmailProcessingResult> {
    try {
      const data = parsedData.extractedData

      // Create inventory assignment record
      const assignmentData = {
        inventory_id: data.inventory_id || null,
        assigned_to: data.assigned_to || settings.userId,
        assigned_by: settings.userId,
        notes: data.description || emailData.body,
        status: 'assigned',
        tenant_id: settings.tenantId
      }

      const { data: assignment, error: assignmentError } = await this.supabase
        .from('inventory_assignments')
        .insert([assignmentData])
        .select()
        .single()

      if (assignmentError) {
        throw new Error(`Failed to create inventory assignment: ${assignmentError.message}`)
      }

      return {
        success: true,
        recordId: assignment.id,
        recordType: 'inventory_assignment',
        message: `Inventory assignment created successfully`,
        requiresReview: parsedData.requiresReview,
        extractedData: data
      }

    } catch (error) {
      logger.error('Failed to process inventory assignment email', { error })
      return {
        success: false,
        message: 'Failed to create inventory assignment: ' + (error as Error).message,
        requiresReview: true
      }
    }
  }

  /**
   * Process check-in/check-out email
   */
  private async processCheckInOutEmail(
    emailData: EmailData, 
    parsedData: ParsedEmailData, 
    settings: EmailIntegrationSettings
  ): Promise<EmailProcessingResult> {
    try {
      const data = parsedData.extractedData

      // Create check-in/out record
      const checkData = {
        inventory_id: data.inventory_id || null,
        action: data.action || 'check_in',
        location: data.location || 'Unknown',
        notes: data.description || emailData.body,
        performed_by: settings.userId,
        tenant_id: settings.tenantId
      }

      const { data: check, error: checkError } = await this.supabase
        .from('inventory_check_ins')
        .insert([checkData])
        .select()
        .single()

      if (checkError) {
        throw new Error(`Failed to create check-in/out: ${checkError.message}`)
      }

      return {
        success: true,
        recordId: check.id,
        recordType: 'check_in_out',
        message: `Check-in/out record created successfully`,
        requiresReview: parsedData.requiresReview,
        extractedData: data
      }

    } catch (error) {
      logger.error('Failed to process check-in/out email', { error })
      return {
        success: false,
        message: 'Failed to create check-in/out: ' + (error as Error).message,
        requiresReview: true
      }
    }
  }

  /**
   * Process CAD files email
   */
  private async processCadFilesEmail(
    emailData: EmailData, 
    parsedData: ParsedEmailData, 
    settings: EmailIntegrationSettings
  ): Promise<EmailProcessingResult> {
    try {
      const data = parsedData.extractedData

      // Create CAD file record
      const cadData = {
        project_id: data.project_id || null,
        filename: data.filename || 'Email Attachment',
        file_type: data.file_type || 'unknown',
        description: data.description || emailData.body,
        uploaded_by: settings.userId,
        tenant_id: settings.tenantId
      }

      const { data: cad, error: cadError } = await this.supabase
        .from('cad_files')
        .insert([cadData])
        .select()
        .single()

      if (cadError) {
        throw new Error(`Failed to create CAD file: ${cadError.message}`)
      }

      return {
        success: true,
        recordId: cad.id,
        recordType: 'cad_file',
        message: `CAD file record created successfully`,
        requiresReview: parsedData.requiresReview,
        extractedData: data
      }

    } catch (error) {
      logger.error('Failed to process CAD files email', { error })
      return {
        success: false,
        message: 'Failed to create CAD file: ' + (error as Error).message,
        requiresReview: true
      }
    }
  }

  /**
   * Process rework tracking email
   */
  private async processReworkTrackingEmail(
    emailData: EmailData, 
    parsedData: ParsedEmailData, 
    settings: EmailIntegrationSettings
  ): Promise<EmailProcessingResult> {
    try {
      const data = parsedData.extractedData

      // Create rework tracking record
      const reworkData = {
        order_id: data.order_id || null,
        reason: data.reason || 'Email request',
        description: data.description || emailData.body,
        status: 'pending',
        assigned_to: settings.userId,
        tenant_id: settings.tenantId
      }

      const { data: rework, error: reworkError } = await this.supabase
        .from('rework_tracking')
        .insert([reworkData])
        .select()
        .single()

      if (reworkError) {
        throw new Error(`Failed to create rework tracking: ${reworkError.message}`)
      }

      return {
        success: true,
        recordId: rework.id,
        recordType: 'rework_tracking',
        message: `Rework tracking record created successfully`,
        requiresReview: parsedData.requiresReview,
        extractedData: data
      }

    } catch (error) {
      logger.error('Failed to process rework tracking email', { error })
      return {
        success: false,
        message: 'Failed to create rework tracking: ' + (error as Error).message,
        requiresReview: true
      }
    }
  }

  /**
   * Process accounts receivable email
   */
  private async processAccountsReceivableEmail(
    emailData: EmailData, 
    parsedData: ParsedEmailData, 
    settings: EmailIntegrationSettings
  ): Promise<EmailProcessingResult> {
    try {
      const data = parsedData.extractedData

      // Create or find customer
      const customerId = await this.findOrCreateCustomer(data, settings.tenantId)

      // Create accounts receivable record
      const arData = {
        customer_id: customerId,
        amount: data.amount || 0,
        description: data.description || emailData.body,
        due_date: data.due_date || null,
        status: 'pending',
        tenant_id: settings.tenantId
      }

      const { data: ar, error: arError } = await this.supabase
        .from('accounts_receivable')
        .insert([arData])
        .select()
        .single()

      if (arError) {
        throw new Error(`Failed to create accounts receivable: ${arError.message}`)
      }

      return {
        success: true,
        recordId: ar.id,
        recordType: 'accounts_receivable',
        message: `Accounts receivable record created successfully`,
        requiresReview: parsedData.requiresReview,
        extractedData: data
      }

    } catch (error) {
      logger.error('Failed to process accounts receivable email', { error })
      return {
        success: false,
        message: 'Failed to create accounts receivable: ' + (error as Error).message,
        requiresReview: true
      }
    }
  }

  /**
   * Process accounts payable email
   */
  private async processAccountsPayableEmail(
    emailData: EmailData, 
    parsedData: ParsedEmailData, 
    settings: EmailIntegrationSettings
  ): Promise<EmailProcessingResult> {
    try {
      const data = parsedData.extractedData

      // Create accounts payable record
      const apData = {
        vendor: data.vendor || 'Unknown Vendor',
        amount: data.amount || 0,
        description: data.description || emailData.body,
        due_date: data.due_date || null,
        status: 'pending',
        tenant_id: settings.tenantId
      }

      const { data: ap, error: apError } = await this.supabase
        .from('accounts_payable')
        .insert([apData])
        .select()
        .single()

      if (apError) {
        throw new Error(`Failed to create accounts payable: ${apError.message}`)
      }

      return {
        success: true,
        recordId: ap.id,
        recordType: 'accounts_payable',
        message: `Accounts payable record created successfully`,
        requiresReview: parsedData.requiresReview,
        extractedData: data
      }

    } catch (error) {
      logger.error('Failed to process accounts payable email', { error })
      return {
        success: false,
        message: 'Failed to create accounts payable: ' + (error as Error).message,
        requiresReview: true
      }
    }
  }

  /**
   * Process general email
   */
  private async processGeneralEmail(
    emailData: EmailData, 
    parsedData: ParsedEmailData, 
    settings: EmailIntegrationSettings
  ): Promise<EmailProcessingResult> {
    // For general emails, create a communication thread
    return this.processCommunicationEmail(emailData, parsedData, settings)
  }

  /**
   * Find or create customer
   */
  private async findOrCreateCustomer(data: Record<string, any>, tenantId: string): Promise<string> {
    // Try to find existing customer by email or phone
    let customer = null

    if (data.email) {
      const { data: emailCustomer } = await this.supabase
        .from('customers')
        .select('id')
        .eq('email', data.email)
        .eq('tenant_id', tenantId)
        .single()
      customer = emailCustomer
    }

    if (!customer && data.phone) {
      const { data: phoneCustomer } = await this.supabase
        .from('customers')
        .select('id')
        .eq('phone', data.phone)
        .eq('tenant_id', tenantId)
        .single()
      customer = phoneCustomer
    }

    if (customer) {
      return customer.id
    }

    // Create new customer
    const customerData = {
      name: data.customer_name || 'Unknown Customer',
      email: data.email || null,
      phone: data.phone || null,
      notes: `Created from email processing`,
      tenant_id: tenantId
    }

    const { data: newCustomer, error } = await this.supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create customer: ${error.message}`)
    }

    return newCustomer.id
  }

  /**
   * Find order by order number
   */
  private async findOrder(orderNumber: string, tenantId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .eq('tenant_id', tenantId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to find order: ${error.message}`)
    }

    return data
  }

  /**
   * Create quote items
   */
  private async createQuoteItems(quoteId: string, data: Record<string, any>, tenantId: string): Promise<void> {
    // This is a simplified implementation
    // In a real scenario, you'd parse product information from the email
    const itemData = {
      quote_id: quoteId,
      product_id: null, // Would need to find or create product
      quantity: 1,
      unit_price: data.budget || 0,
      total_price: data.budget || 0,
      notes: data.description || 'Item from email',
      tenant_id: tenantId
    }

    const { error } = await this.supabase
      .from('quote_items')
      .insert([itemData])

    if (error) {
      logger.warn('Failed to create quote item', { error })
    }
  }

  /**
   * Find email integration settings
   */
  private async findEmailIntegration(emailAddress: string): Promise<EmailIntegrationSettings | null> {
    const { data, error } = await this.supabase
      .from('email_integration_settings')
      .select('*')
      .eq('email_address', emailAddress)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No integration found
      }
      throw new Error(`Failed to find email integration: ${error.message}`)
    }

    return {
      id: data.id,
      tenantId: data.tenant_id,
      userId: data.user_id,
      emailAddress: data.email_address,
      emailType: data.email_type,
      isActive: data.is_active,
      autoProcess: data.auto_process,
      requireConfirmation: data.require_confirmation,
      notificationEmail: data.notification_email
    }
  }

  /**
   * Log email processing attempt
   */
  private async logEmailProcessing(
    emailData: EmailData, 
    parsedData: ParsedEmailData, 
    settings: EmailIntegrationSettings
  ): Promise<string> {
    const logData = {
      tenant_id: settings.tenantId,
      email_integration_id: settings.id,
      original_email_id: emailData.id,
      sender_email: emailData.from,
      subject: emailData.subject,
      email_type: parsedData.emailType,
      processing_status: 'processing',
      ai_confidence_score: parsedData.confidence,
      extracted_data: parsedData.extractedData
    }

    const { data, error } = await this.supabase
      .from('email_processing_logs')
      .insert([logData])
      .select()
      .single()

    if (error) {
      logger.error('Failed to log email processing', { error })
      return ''
    }

    return data.id
  }

  /**
   * Update processing log with result
   */
  private async updateProcessingLog(logId: string, result: EmailProcessingResult): Promise<void> {
    if (!logId) return

    const updateData = {
      processing_status: result.success ? 'completed' : 'failed',
      created_record_id: result.recordId,
      created_record_type: result.recordType,
      error_message: result.success ? null : result.message,
      processing_time_ms: Date.now() // This would be calculated properly in real implementation
    }

    const { error } = await this.supabase
      .from('email_processing_logs')
      .update(updateData)
      .eq('id', logId)

    if (error) {
      logger.error('Failed to update processing log', { error })
    }
  }

  /**
   * Send notification email
   */
  private async sendNotification(
    settings: EmailIntegrationSettings, 
    result: EmailProcessingResult, 
    originalEmail: EmailData
  ): Promise<void> {
    // This would integrate with your email service (SendGrid, Resend, etc.)
    logger.info('Sending notification email', {
      to: settings.notificationEmail,
      result: result.message,
      recordType: result.recordType
    })

    // Implementation would go here
  }

  /**
   * Calculate valid until date
   */
  private calculateValidUntil(timeline?: string): string | null {
    if (!timeline) {
      // Default to 30 days
      const date = new Date()
      date.setDate(date.getDate() + 30)
      return date.toISOString()
    }

    // Parse timeline (simplified)
    const match = timeline.match(/(\d+)\s*(weeks?|days?|months?)/i)
    if (match) {
      const amount = parseInt(match[1])
      const unit = match[2].toLowerCase()
      const date = new Date()

      switch (unit) {
        case 'day':
        case 'days':
          date.setDate(date.getDate() + amount)
          break
        case 'week':
        case 'weeks':
          date.setDate(date.getDate() + (amount * 7))
          break
        case 'month':
        case 'months':
          date.setMonth(date.getMonth() + amount)
          break
      }

      return date.toISOString()
    }

    return null
  }

  /**
   * Calculate estimated completion date
   */
  private calculateEstimatedCompletion(timeline?: string): string | null {
    return this.calculateValidUntil(timeline)
  }

  /**
   * Determine priority based on email content
   */
  private determinePriority(subject: string, body: string): string {
    const urgentKeywords = ['urgent', 'asap', 'emergency', 'rush', 'immediately']
    const text = (subject + ' ' + body).toLowerCase()

    if (urgentKeywords.some(keyword => text.includes(keyword))) {
      return 'high'
    }

    return 'medium'
  }

  /**
   * Handle security alerts for modification attempts
   */
  private async handleSecurityAlert(
    emailData: EmailData,
    parsedData: ParsedEmailData,
    settings: EmailIntegrationSettings,
    alertType: string
  ): Promise<EmailProcessingResult> {
    try {
      const data = parsedData.extractedData
      const securityInfo = data._security

      // Create a high-priority communication thread for security review
      const customerId = await this.findOrCreateCustomer(data, settings.tenantId)
      
      const threadData = {
        customer_id: customerId,
        type: 'email',
        status: 'open',
        subject: `🚨 SECURITY ALERT: ${alertType} - ${emailData.subject}`,
        priority: 'high',
        assigned_to: settings.userId,
        tenant_id: settings.tenantId,
        notes: `SECURITY ALERT: ${securityInfo.riskLevel} risk detected. Detected actions: ${securityInfo.detectedActions.join(', ')}. Manual review required.`
      }

      const { data: thread, error: threadError } = await this.supabase
        .from('communication_threads')
        .insert([threadData])
        .select()
        .single()

      if (threadError) {
        throw new Error(`Failed to create security alert thread: ${threadError.message}`)
      }

      // Create detailed security alert message
      const messageData = {
        thread_id: thread.id,
        sender_id: settings.userId,
        content: `🚨 SECURITY ALERT: ${alertType}

Risk Level: ${securityInfo.riskLevel}
Detected Actions: ${securityInfo.detectedActions.join(', ')}

Original Email:
From: ${emailData.from}
Subject: ${emailData.subject}
Body: ${emailData.body}

Security Analysis:
- Total patterns detected: ${securityInfo.security_analysis.total_patterns_detected}
- High risk patterns: ${securityInfo.security_analysis.high_risk_count}
- Medium risk patterns: ${securityInfo.security_analysis.medium_risk_count}
- Low risk patterns: ${securityInfo.security_analysis.low_risk_count}

Mentioned Record IDs: ${data.mentioned_record_ids?.join(', ') || 'None'}

⚠️ This email was blocked from making modifications to existing records. Manual review required.`,
        message_type: 'email',
        is_read: false,
        tenant_id: settings.tenantId
      }

      await this.supabase
        .from('communication_messages')
        .insert([messageData])

      // Log the security incident
      logger.warn('Security alert processed', {
        emailId: emailData.id,
        alertType,
        riskLevel: securityInfo.riskLevel,
        detectedActions: securityInfo.detectedActions,
        threadId: thread.id
      })

      return {
        success: true,
        recordId: thread.id,
        recordType: 'security_alert',
        message: `🚨 Security alert created - ${alertType} blocked (${securityInfo.riskLevel} risk)`,
        requiresReview: true,
        extractedData: data
      }

    } catch (error) {
      logger.error('Failed to handle security alert', { error, alertType })
      return {
        success: false,
        message: 'Failed to process security alert: ' + (error as Error).message,
        requiresReview: true
      }
    }
  }
}
