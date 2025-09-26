import { supabase } from '@/lib/database'
import { z } from 'zod'
import crypto from 'crypto'

// API Key schemas
const ApiKeySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  keyHash: z.string().optional(),
  keyPrefix: z.string().optional(),
  permissions: z.record(z.array(z.string())).optional(),
  isActive: z.boolean().default(true),
  expiresAt: z.date().optional(),
  lastUsedAt: z.date().optional(),
  createdAt: z.date().optional(),
  createdBy: z.string().optional()
})

export type ApiKey = z.infer<typeof ApiKeySchema>

export class ApiKeyService {
  // Generate a new API key
  private generateApiKey(): { key: string; hash: string; prefix: string } {
    const key = `jewelia_${crypto.randomBytes(32).toString('hex')}`
    const hash = crypto.createHash('sha256').update(key).digest('hex')
    const prefix = key.substring(0, 10)
    
    return { key, hash, prefix }
  }

  // Create a new API key
  async createApiKey(data: Omit<ApiKey, 'id' | 'keyHash' | 'keyPrefix' | 'createdAt'>): Promise<{ apiKey: ApiKey; fullKey: string }> {
    try {
      const { key, hash, prefix } = this.generateApiKey()
      
      const validatedData = ApiKeySchema.parse({
        ...data,
        keyHash: hash,
        keyPrefix: prefix,
        createdAt: new Date()
      })

      const { data: apiKey, error } = await supabase
        .from('api_keys')
        .insert([validatedData])
        .select()
        .single()

      if (error) throw error

      return { apiKey, fullKey: key }
    } catch (error) {
      console.error('Error creating API key:', error)
      throw new Error('Failed to create API key')
    }
  }

  // Get all API keys
  async getApiKeys(): Promise<ApiKey[]> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching API keys:', error)
      throw new Error('Failed to fetch API keys')
    }
  }

  // Get API key by ID
  async getApiKey(id: string): Promise<ApiKey | null> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching API key:', error)
      return null
    }
  }

  // Update API key
  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating API key:', error)
      throw new Error('Failed to update API key')
    }
  }

  // Delete API key
  async deleteApiKey(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting API key:', error)
      throw new Error('Failed to delete API key')
    }
  }

  // Validate API key
  async validateApiKey(key: string): Promise<{ valid: boolean; apiKey?: ApiKey; permissions?: string[] }> {
    try {
      const hash = crypto.createHash('sha256').update(key).digest('hex')
      const prefix = key.substring(0, 10)

      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key_hash', hash)
        .eq('key_prefix', prefix)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return { valid: false }
      }

      // Check if key is expired
      if (data.expiresAt && new Date() > new Date(data.expiresAt)) {
        return { valid: false }
      }

      // Update last used timestamp
      await this.updateApiKey(data.id, { lastUsedAt: new Date() })

      return {
        valid: true,
        apiKey: data,
        permissions: this.extractPermissions(data.permissions)
      }
    } catch (error) {
      console.error('Error validating API key:', error)
      return { valid: false }
    }
  }

  // Extract permissions from API key
  private extractPermissions(permissions: any): string[] {
    if (!permissions || typeof permissions !== 'object') {
      return []
    }

    const allPermissions: string[] = []
    Object.entries(permissions).forEach(([resource, actions]) => {
      if (Array.isArray(actions)) {
        actions.forEach(action => {
          allPermissions.push(`${resource}:${action}`)
        })
      }
    })

    return allPermissions
  }

  // Check if API key has specific permission
  hasPermission(permissions: string[], requiredPermission: string): boolean {
    return permissions.includes(requiredPermission) || permissions.includes('*:*')
  }

  // Get API key usage statistics
  async getApiKeyStats(): Promise<{
    total: number
    active: number
    expired: number
    recentlyUsed: number
  }> {
    try {
      const apiKeys = await this.getApiKeys()
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const stats = {
        total: apiKeys.length,
        active: apiKeys.filter(key => key.isActive).length,
        expired: apiKeys.filter(key => key.expiresAt && new Date(key.expiresAt) < now).length,
        recentlyUsed: apiKeys.filter(key => 
          key.lastUsedAt && new Date(key.lastUsedAt) > oneWeekAgo
        ).length
      }

      return stats
    } catch (error) {
      console.error('Error getting API key stats:', error)
      throw new Error('Failed to get API key statistics')
    }
  }

  // Rotate API key (create new key and deactivate old one)
  async rotateApiKey(id: string): Promise<{ newApiKey: ApiKey; fullKey: string }> {
    try {
      const oldKey = await this.getApiKey(id)
      if (!oldKey) {
        throw new Error('API key not found')
      }

      // Deactivate old key
      await this.updateApiKey(id, { isActive: false })

      // Create new key with same permissions
      const newKeyData = {
        name: `${oldKey.name} (rotated)`,
        permissions: oldKey.permissions,
        isActive: true,
        expiresAt: oldKey.expiresAt,
        createdBy: oldKey.createdBy || undefined
      }

      const result = await this.createApiKey(newKeyData)
      return {
        newApiKey: result.apiKey,
        fullKey: result.fullKey
      }
    } catch (error) {
      console.error('Error rotating API key:', error)
      throw new Error('Failed to rotate API key')
    }
  }
}

// Export singleton instance
export const apiKeyService = new ApiKeyService() 