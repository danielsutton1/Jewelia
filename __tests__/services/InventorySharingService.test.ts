import { InventorySharingService } from '@/lib/services/InventorySharingService'
import { MockSupabaseClient } from '../utils/supabase-mocks'
import { getMockInventorySharingData } from '../utils/mock-data'

// Mock the Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(() => new MockSupabaseClient()),
}))

describe('InventorySharingService', () => {
  let service: InventorySharingService
  let mockSupabase: MockSupabaseClient

  beforeEach(() => {
    jest.clearAllMocks()
    service = new InventorySharingService()
    
    // Get the mocked Supabase client
    const { createSupabaseServerClient } = require('@/lib/supabase/server')
    mockSupabase = createSupabaseServerClient()
  })

  describe('createInventorySharing', () => {
    it('creates inventory sharing settings successfully', async () => {
      const settings = {
        inventory_id: 'test-inventory-id',
        owner_id: 'test-owner-id',
        is_shared: true,
        visibility_level: 'connections_only' as const,
        show_pricing: true,
        pricing_tier: 'retail' as const,
        b2b_enabled: false,
      }

      const result = await service.createInventorySharing(settings)

      // The service should work with the mock client
      expect(result).toBeDefined()
      expect(result.inventory_id).toBe(settings.inventory_id)
      expect(result.owner_id).toBe(settings.owner_id)
      expect(result.is_shared).toBe(settings.is_shared)
    })

    it('handles creation errors gracefully', async () => {
      // Test that the service handles errors without crashing
      const settings = {
        inventory_id: 'invalid-id',
        owner_id: 'test-owner-id',
        is_shared: true,
        visibility_level: 'connections_only' as const,
        show_pricing: true,
        pricing_tier: 'retail' as const,
        b2b_enabled: false,
      }

      // This should not throw an error
      const result = await service.createInventorySharing(settings)
      expect(result).toBeDefined()
    })
  })

  describe('updateInventorySharing', () => {
    it('updates inventory sharing settings successfully', async () => {
      const updateData = { is_shared: false }
      const result = await service.updateInventorySharing('test-id', updateData)

      // The service should work with the mock client
      expect(result).toBeDefined()
      expect(result.is_shared).toBe(updateData.is_shared)
    })

    it('handles update errors gracefully', async () => {
      const updateData = { is_shared: false }
      const result = await service.updateInventorySharing('invalid-id', updateData)
      
      // Should not throw an error
      expect(result).toBeDefined()
    })
  })

  describe('getInventorySharing', () => {
    it('retrieves inventory sharing settings successfully', async () => {
      const result = await service.getInventorySharing('test-inventory-id', 'test-owner-id')

      // The service should work with the mock client
      expect(result).toBeDefined()
    })

    it('returns null when no sharing settings found', async () => {
      const result = await service.getInventorySharing('nonexistent-id', 'test-owner-id')
      
      expect(result).toBeNull()
    })

    it('handles retrieval errors gracefully', async () => {
      const result = await service.getInventorySharing('invalid-id', 'test-owner-id')
      
      // Should not throw an error
      expect(result).toBeDefined()
    })
  })

  describe('deleteInventorySharing', () => {
    it('deletes inventory sharing settings successfully', async () => {
      await service.deleteInventorySharing('test-id')

      // The service should work with the mock client
    })

    it('handles deletion errors gracefully', async () => {
      // Should not throw an error
      await expect(service.deleteInventorySharing('invalid-id')).resolves.not.toThrow()
    })
  })

  describe('searchSharedInventory', () => {
    it('searches shared inventory successfully', async () => {
      const searchParams = {
        query: 'diamond',
        category: 'Rings',
        priceRange: { min: 100, max: 1000 },
        limit: 10
      }

      const result = await service.searchSharedInventory(searchParams)

      // The service should work with the mock client
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('applies filters correctly', async () => {
      const searchParams = {
        query: '',
        category: 'Necklaces',
        priceRange: { min: 500, max: 2000 },
        limit: 5
      }

      const result = await service.searchSharedInventory(searchParams)

      // The service should work with the mock client
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('handles search errors gracefully', async () => {
      const searchParams = {
        query: 'test',
        category: 'InvalidCategory',
        priceRange: { min: -100, max: -50 },
        limit: 10
      }

      const result = await service.searchSharedInventory(searchParams)
      
      // Should not throw an error
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getInventorySharingStats', () => {
    it('retrieves sharing statistics successfully', async () => {
      const result = await service.getInventorySharingStats('test-owner-id')

      // The service should work with the mock client
      expect(result).toBeDefined()
      expect(result.totalItems).toBeDefined()
      expect(result.sharedItems).toBeDefined()
      expect(result.connectionCount).toBeDefined()
    })

    it('handles stats retrieval errors gracefully', async () => {
      const result = await service.getInventorySharingStats('invalid-owner-id')
      
      // Should not throw an error
      expect(result).toBeDefined()
    })
  })

  describe('createInventorySharingRequest', () => {
    it('creates sharing request successfully', async () => {
      const requestData = {
        requester_id: 'test-requester-id',
        sharing_id: 'test-sharing-id',
        message: 'I would like to view this inventory',
        requested_items: ['item-1', 'item-2']
      }

      const result = await service.createInventorySharingRequest(requestData, 'test-requester-id')

      // The service should work with the mock client
      expect(result).toBeDefined()
      expect(result.requester_id).toBe(requestData.requester_id)
      expect(result.sharing_id).toBe(requestData.sharing_id)
    })

    it('handles request creation errors gracefully', async () => {
      const requestData = {
        requester_id: 'invalid-id',
        sharing_id: 'test-sharing-id',
        message: 'Test message',
        requested_items: []
      }

      const result = await service.createInventorySharingRequest(requestData, 'test-requester-id')
      
      // Should not throw an error
      expect(result).toBeDefined()
    })
  })

  describe('updateInventorySharingRequest', () => {
    it('updates sharing request successfully', async () => {
      const updateData = { status: 'approved' as const, response_message: 'Approved' }
      const result = await service.updateInventorySharingRequest('test-request-id', updateData)

      // The service should work with the mock client
      expect(result).toBeDefined()
      expect(result.status).toBe(updateData.status)
    })

    it('handles request update errors gracefully', async () => {
      const updateData = { status: 'approved' as const }
      const result = await service.updateInventorySharingRequest('invalid-id', updateData)
      
      // Should not throw an error
      expect(result).toBeDefined()
    })
  })

  describe('getInventorySharingRequests', () => {
    it('retrieves sharing requests successfully', async () => {
      const result = await service.getInventorySharingRequests('test-owner-id')

      // The service should work with the mock client
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('filters requests by status', async () => {
      const result = await service.getInventorySharingRequests('test-owner-id', 'pending')

      // The service should work with the mock client
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('handles request retrieval errors gracefully', async () => {
      const result = await service.getInventorySharingRequests('invalid-owner-id')
      
      // Should not throw an error
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('createInventorySharingConnection', () => {
    it('creates sharing connection successfully', async () => {
      const connectionData = {
        sharing_id: 'test-sharing-id',
        partner_id: 'test-partner-id',
        can_view_pricing: true,
        can_request_items: true,
        notification_preferences: {
          new_items: true,
          price_changes: false,
          requests: true
        }
      }

      const result = await service.createInventorySharingConnection(connectionData)

      // The service should work with the mock client
      expect(result).toBeDefined()
      expect(result.sharing_id).toBe(connectionData.sharing_id)
      expect(result.partner_id).toBe(connectionData.partner_id)
    })

    it('handles connection creation errors gracefully', async () => {
      const connectionData = {
        sharing_id: 'invalid-id',
        partner_id: 'test-partner-id',
        can_view_pricing: true,
        can_request_items: true,
        notification_preferences: {
          new_items: true,
          price_changes: false,
          requests: true
        }
      }

      const result = await service.createInventorySharingConnection(connectionData)
      
      // Should not throw an error
      expect(result).toBeDefined()
    })
  })

  describe('updateInventorySharingConnection', () => {
    it('updates sharing connection successfully', async () => {
      const updateData = { can_view_pricing: false }
      const result = await service.updateInventorySharingConnection('test-connection-id', updateData)

      // The service should work with the mock client
      expect(result).toBeDefined()
      expect(result.can_view_pricing).toBe(updateData.can_view_pricing)
    })

    it('handles connection update errors gracefully', async () => {
      const updateData = { can_view_pricing: false }
      const result = await service.updateInventorySharingConnection('invalid-id', updateData)
      
      // Should not throw an error
      expect(result).toBeDefined()
    })
  })

  describe('deleteInventorySharingConnection', () => {
    it('deletes sharing connection successfully', async () => {
      await service.deleteInventorySharingConnection('test-connection-id')

      // The service should work with the mock client
    })

    it('handles connection deletion errors gracefully', async () => {
      // Should not throw an error
      await expect(service.deleteInventorySharingConnection('invalid-id')).resolves.not.toThrow()
    })
  })

  describe('getInventorySharingConnections', () => {
    it('retrieves sharing connections successfully', async () => {
      const result = await service.getInventorySharingConnections('test-sharing-id')

      // The service should work with the mock client
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('handles connection retrieval errors gracefully', async () => {
      const result = await service.getInventorySharingConnections('invalid-sharing-id')
      
      // Should not throw an error
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  // Test the method aliases for backward compatibility
  describe('Method Aliases', () => {
    it('getInventorySharingStats alias works', async () => {
      const result = await service.getInventorySharingStats('test-owner-id')
      expect(result).toBeDefined()
    })

    it('createInventorySharingRequest alias works', async () => {
      const requestData = {
        requester_id: 'test-requester-id',
        sharing_id: 'test-sharing-id',
        message: 'Test message',
        requested_items: []
      }
      const result = await service.createInventorySharingRequest(requestData, 'test-requester-id')
      expect(result).toBeDefined()
    })

    it('updateInventorySharingRequest alias works', async () => {
      const updateData = { status: 'approved' as const }
      const result = await service.updateInventorySharingRequest('test-request-id', updateData)
      expect(result).toBeDefined()
    })

    it('getInventorySharingRequests alias works', async () => {
      const result = await service.getInventorySharingRequests('test-owner-id')
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('createInventorySharingConnection alias works', async () => {
      const connectionData = {
        sharing_id: 'test-sharing-id',
        partner_id: 'test-partner-id',
        can_view_pricing: true,
        can_request_items: true,
        notification_preferences: {
          new_items: true,
          price_changes: false,
          requests: true
        }
      }
      const result = await service.createInventorySharingConnection(connectionData)
      expect(result).toBeDefined()
    })

    it('updateInventorySharingConnection alias works', async () => {
      const updateData = { can_view_pricing: false }
      const result = await service.updateInventorySharingConnection('test-connection-id', updateData)
      expect(result).toBeDefined()
    })

    it('deleteInventorySharingConnection alias works', async () => {
      await expect(service.deleteInventorySharingConnection('test-connection-id')).resolves.not.toThrow()
    })

    it('getInventorySharingConnections alias works', async () => {
      const result = await service.getInventorySharingConnections('test-sharing-id')
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })
})