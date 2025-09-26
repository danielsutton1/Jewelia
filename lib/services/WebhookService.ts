import { supabase } from '@/lib/database'

// Webhook service for testing and template management
export class WebhookService {
  // Test a webhook with the given configuration
  async testWebhook(config: {
    webhookUrl: string
    method: string
    headers?: Record<string, string>
    payload: any
    timeout: number
    retries: number
    retryDelay: number
  }) {
    const startTime = Date.now()
    let lastError: any = null
    let attempts = 0

    for (let i = 0; i <= config.retries; i++) {
      attempts++
      try {
        const response = await fetch(config.webhookUrl, {
          method: config.method,
          headers: {
            'Content-Type': 'application/json',
            ...config.headers
          },
          body: JSON.stringify(config.payload),
          signal: AbortSignal.timeout(config.timeout)
        })

        const responseTime = Date.now() - startTime
        const responseText = await response.text()
        
        let responseData: any
        try {
          responseData = JSON.parse(responseText)
        } catch {
          responseData = responseText
        }

        return {
          success: response.ok,
          statusCode: response.status,
          statusText: response.statusText,
          responseTime,
          responseData,
          headers: Object.fromEntries(response.headers.entries()),
          attempts,
          timestamp: new Date().toISOString()
        }
      } catch (error: any) {
        lastError = error
        if (i < config.retries) {
          await new Promise(resolve => setTimeout(resolve, config.retryDelay))
        }
      }
    }

    const totalTime = Date.now() - startTime
    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      responseTime: totalTime,
      attempts,
      timestamp: new Date().toISOString()
    }
  }

  // Get webhook templates
  async getWebhookTemplates(category?: string) {
    try {
      // For now, return mock data - in production this would query the database
      const templates = [
        {
          name: 'order_created',
          description: 'Template for order creation events',
          category: 'order_events',
          template: {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': 'sha256={signature}'
            },
            payload: {
              event: 'order.created',
              data: {
                order_id: '{{order.id}}',
                customer_id: '{{order.customer_id}}',
                total_amount: '{{order.total_amount}}',
                status: '{{order.status}}',
                created_at: '{{order.created_at}}'
              },
              timestamp: '{{timestamp}}'
            },
            variables: [
              {
                name: 'order.id',
                type: 'string',
                description: 'Order ID',
                required: true
              },
              {
                name: 'order.customer_id',
                type: 'string',
                description: 'Customer ID',
                required: true
              },
              {
                name: 'order.total_amount',
                type: 'number',
                description: 'Order total amount',
                required: true
              },
              {
                name: 'order.status',
                type: 'string',
                description: 'Order status',
                required: true
              },
              {
                name: 'order.created_at',
                type: 'date',
                description: 'Order creation timestamp',
                required: true
              },
              {
                name: 'timestamp',
                type: 'date',
                description: 'Current timestamp',
                required: true,
                defaultValue: '{{now}}'
              }
            ]
          }
        },
        {
          name: 'customer_updated',
          description: 'Template for customer update events',
          category: 'customer_events',
          template: {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': 'sha256={signature}'
            },
            payload: {
              event: 'customer.updated',
              data: {
                customer_id: '{{customer.id}}',
                email: '{{customer.email}}',
                full_name: '{{customer.full_name}}',
                company: '{{customer.company}}',
                updated_at: '{{customer.updated_at}}'
              },
              timestamp: '{{timestamp}}'
            },
            variables: [
              {
                name: 'customer.id',
                type: 'string',
                description: 'Customer ID',
                required: true
              },
              {
                name: 'customer.email',
                type: 'string',
                description: 'Customer email',
                required: false
              },
              {
                name: 'customer.full_name',
                type: 'string',
                description: 'Customer full name',
                required: true
              },
              {
                name: 'customer.company',
                type: 'string',
                description: 'Customer company',
                required: false
              },
              {
                name: 'customer.updated_at',
                type: 'date',
                description: 'Customer update timestamp',
                required: true
              },
              {
                name: 'timestamp',
                type: 'date',
                description: 'Current timestamp',
                required: true,
                defaultValue: '{{now}}'
              }
            ]
          }
        },
        {
          name: 'inventory_low_stock',
          description: 'Template for low stock alerts',
          category: 'inventory_events',
          template: {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': 'sha256={signature}'
            },
            payload: {
              event: 'inventory.low_stock',
              data: {
                product_id: '{{product.id}}',
                sku: '{{product.sku}}',
                name: '{{product.name}}',
                current_quantity: '{{product.quantity}}',
                reorder_point: '{{product.reorder_point}}',
                supplier: '{{product.supplier}}'
              },
              timestamp: '{{timestamp}}'
            },
            variables: [
              {
                name: 'product.id',
                type: 'string',
                description: 'Product ID',
                required: true
              },
              {
                name: 'product.sku',
                type: 'string',
                description: 'Product SKU',
                required: true
              },
              {
                name: 'product.name',
                type: 'string',
                description: 'Product name',
                required: true
              },
              {
                name: 'product.quantity',
                type: 'number',
                description: 'Current quantity',
                required: true
              },
              {
                name: 'product.reorder_point',
                type: 'number',
                description: 'Reorder point',
                required: true
              },
              {
                name: 'product.supplier',
                type: 'string',
                description: 'Supplier name',
                required: false
              },
              {
                name: 'timestamp',
                type: 'date',
                description: 'Current timestamp',
                required: true,
                defaultValue: '{{now}}'
              }
            ]
          }
        }
      ]

      if (category) {
        return templates.filter(template => template.category === category)
      }

      return templates
    } catch (error) {
      console.error('Error fetching webhook templates:', error)
      throw new Error('Failed to fetch webhook templates')
    }
  }

  // Get a specific webhook template
  async getWebhookTemplate(name: string) {
    try {
      const templates = await this.getWebhookTemplates()
      return templates.find(template => template.name === name) || null
    } catch (error) {
      console.error('Error fetching webhook template:', error)
      return null
    }
  }

  // Save a webhook template
  async saveWebhookTemplate(template: any) {
    try {
      // In production, this would save to the database
      const savedTemplate = {
        id: crypto.randomUUID(),
        ...template,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      return savedTemplate
    } catch (error) {
      console.error('Error saving webhook template:', error)
      throw new Error('Failed to save webhook template')
    }
  }

  // Delete a webhook template
  async deleteWebhookTemplate(name: string) {
    try {
      // In production, this would delete from the database
      return true
    } catch (error) {
      console.error('Error deleting webhook template:', error)
      throw new Error('Failed to delete webhook template')
    }
  }

  // Validate webhook payload against template
  validateWebhookPayload(template: any, payload: any) {
    try {
      const errors: string[] = []
      
      if (!template.variables) {
        return { isValid: true, errors: [] }
      }

      for (const variable of template.variables) {
        if (variable.required) {
          const value = this.getNestedValue(payload, variable.name)
          if (value === undefined || value === null || value === '') {
            errors.push(`Required variable '${variable.name}' is missing or empty`)
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    } catch (error) {
      console.error('Error validating webhook payload:', error)
      return {
        isValid: false,
        errors: ['Validation error occurred']
      }
    }
  }

  // Get nested value from object using dot notation
  private getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  // Generate webhook signature
  generateWebhookSignature(payload: string, secret: string): string {
    const crypto = require('crypto')
    return crypto.createHmac('sha256', secret).update(payload).digest('hex')
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateWebhookSignature(payload, secret)
    return signature === expectedSignature
  }
}

export const webhookService = new WebhookService()
