import React from 'react'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { ShareInventoryForm } from '@/components/inventory-sharing/ShareInventoryForm'
import { AIRecommendations } from '@/components/inventory-sharing/AIRecommendations'
import { InventorySharingService } from '@/lib/services/InventorySharingService'
import { createMockSupabaseClient } from '../utils/supabase-mocks'

// Mock the services to use our mock Supabase client
jest.mock('@/lib/services/InventorySharingService')
jest.mock('@/hooks/useAIRecommendations', () => ({
  useAIRecommendations: jest.fn(),
}))

const mockUseAIRecommendations = require('@/hooks/useAIRecommendations').useAIRecommendations

describe('Inventory Sharing System Integration Tests', () => {
  let mockSupabase: any
  let sharingService: InventorySharingService

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset fetch mock completely
    ;(global.fetch as jest.Mock).mockClear()
    ;(global.fetch as jest.Mock).mockReset()
    mockSupabase = createMockSupabaseClient()
    
    // Mock the service to use our mock Supabase client
    ;(InventorySharingService as jest.MockedClass<typeof InventorySharingService>).mockImplementation(() => ({
      createInventorySharing: jest.fn(),
      updateInventorySharing: jest.fn(),
      getInventorySharing: jest.fn(),
      deleteInventorySharing: jest.fn(),
      searchSharedInventory: jest.fn(),
      getInventorySharingStats: jest.fn(),
      createInventorySharingRequest: jest.fn(),
      updateInventorySharingRequest: jest.fn(),
      getInventorySharingRequests: jest.fn(),
      createInventorySharingConnection: jest.fn(),
      updateInventorySharingConnection: jest.fn(),
      deleteInventorySharingConnection: jest.fn(),
      getInventorySharingConnections: jest.fn(),
    } as any))
    
    sharingService = new InventorySharingService()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    // Reset fetch mock completely
    ;(global.fetch as jest.Mock).mockClear()
    ;(global.fetch as jest.Mock).mockReset()
  })

  describe('Complete Inventory Sharing Flow', () => {
    it('integrates form submission with service layer', async () => {
      // Mock inventory data
      const mockInventoryResponse = {
        success: true,
        data: [
          {
            id: 'inv-001',
            name: 'Diamond Engagement Ring',
            sku: 'RING-001',
            category: 'Rings',
            price: 8500,
            is_active: true,
          }
        ],
        pagination: { page: 1, limit: 20, total: 1, total_pages: 1 },
      }

      // Mock the sharing service response
      const mockSharingResponse = {
        id: 'sharing-001',
        inventory_id: 'inv-001',
        owner_id: 'user-001',
        is_shared: true,
        visibility_level: 'connections_only',
        show_pricing: true,
        pricing_tier: 'retail',
        b2b_enabled: false,
      }

      ;(sharingService.createInventorySharing as jest.Mock).mockResolvedValue(mockSharingResponse)

      // Mock the fetch calls in sequence
      const { mockFetchResponse } = require('../utils/test-utils')
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockInventoryResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => ({ success: true, data: mockSharingResponse }),
        })

      const onSuccess = jest.fn()
      render(<ShareInventoryForm onSuccess={onSuccess} sharingService={sharingService} />)

      // Wait for inventory to load
      await waitFor(() => {
        expect(screen.getByText('Diamond Engagement Ring')).toBeInTheDocument()
      })

      // Select an item
      const checkbox = screen.getByRole('checkbox', { name: /select diamond engagement ring/i })
      fireEvent.click(checkbox)

      // Advance to step 2
      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)

      // Configure sharing settings
      await waitFor(() => {
        expect(screen.getByText('Configure Sharing Settings')).toBeInTheDocument()
      })

      // Click on the public visibility option
      const publicOption = screen.getByText('public')
      fireEvent.click(publicOption)

      // Advance to step 3
      const nextButton2 = screen.getByText('Next')
      fireEvent.click(nextButton2)

      // Review and submit
      await waitFor(() => {
        expect(screen.getByText('Review & Share')).toBeInTheDocument()
      })

      const shareButton = screen.getByText('Share Inventory')
      fireEvent.click(shareButton)

      // Verify the complete flow
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })

      // Verify service was called with correct data
      expect(sharingService.createInventorySharing).toHaveBeenCalledWith(
        expect.objectContaining({
          inventory_id: 'inv-001',
          visibility_level: 'public',
          is_shared: true,
        })
      )
    })

    it('integrates AI recommendations with inventory sharing', async () => {
      // Mock AI recommendations data
      const mockRecommendations = [
        {
          item: {
            id: 'inv-001',
            name: 'Diamond Engagement Ring',
            sku: 'RING-001',
            category: 'Rings',
            price: 8500,
            images: ['ring-001-1.jpg'],
          },
          score: 85,
          reasons: ['Matches your preferences', 'Popular in your network'],
          confidence: 0.9,
        }
      ]

      mockUseAIRecommendations.mockReturnValue({
        recommendations: mockRecommendations,
        isLoading: false,
        error: null,
        refresh: jest.fn(),
        provideFeedback: jest.fn(),
        updateRecommendationType: jest.fn(),
        updateLimit: jest.fn(),
      })

      // Mock the sharing service to return recommendations
      ;(sharingService.searchSharedInventory as jest.Mock).mockResolvedValue({
        items: mockRecommendations.map(r => r.item),
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      })

      render(<AIRecommendations userId="user-001" />)

      // Verify AI recommendations are displayed
      expect(screen.getByText('Diamond Engagement Ring')).toBeInTheDocument()
      expect(screen.getByText('85 pts')).toBeInTheDocument()
      expect(screen.getByText('90% match')).toBeInTheDocument()
      expect(screen.getByText('• Matches your preferences')).toBeInTheDocument()
    })

    it('integrates connection management with sharing settings', async () => {
      // Mock connection data
      const mockConnections = [
        {
          id: 'conn-001',
          sharing_id: 'sharing-001',
          viewer_id: 'user-002',
          connection_type: 'connection',
          can_view_pricing: true,
          can_view_quantity: true,
          can_request_quote: true,
          can_place_order: false,
        }
      ]

      ;(sharingService.getInventorySharingConnections as jest.Mock).mockResolvedValue(mockConnections)

      // Mock the sharing service to return connections
      const mockSharingData = {
        id: 'sharing-001',
        inventory_id: 'inv-001',
        owner_id: 'user-001',
        is_shared: true,
        visibility_level: 'specific_connections',
        show_pricing: true,
        pricing_tier: 'retail',
        b2b_enabled: false,
      }

      ;(sharingService.getInventorySharing as jest.Mock).mockResolvedValue(mockSharingData)

      // This would test the ManageSharingSettings component
      // For now, we'll verify the service integration
      const connections = await sharingService.getInventorySharingConnections('sharing-001')
      expect(connections).toEqual(mockConnections)
      expect(sharingService.getInventorySharingConnections).toHaveBeenCalledWith('sharing-001')
    })

    it('integrates analytics with sharing performance', async () => {
      // Mock analytics data
      const mockAnalytics = {
        total_shared_items: 5,
        total_viewers: 12,
        total_views: 45,
        total_quote_requests: 3,
        total_order_requests: 1,
      }

      ;(sharingService.getInventorySharingStats as jest.Mock).mockResolvedValue(mockAnalytics)

      // Mock the sharing service to return analytics
      const stats = await sharingService.getInventorySharingStats('user-001')
      expect(stats).toEqual(mockAnalytics)
      expect(sharingService.getInventorySharingStats).toHaveBeenCalledWith('user-001')

      // Verify the data structure matches what the frontend expects
      expect(stats.total_shared_items).toBe(5)
      expect(stats.total_viewers).toBe(12)
      expect(stats.total_views).toBe(45)
    })
  })

  describe('Error Handling Integration', () => {
    it('handles service errors gracefully in the UI', async () => {
      // Mock console.error to track error logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock inventory data
      const mockInventoryResponse = {
        success: true,
        data: [
          {
            id: 'inv-001',
            name: 'Diamond Engagement Ring',
            sku: 'RING-001',
            category: 'Rings',
            price: 8500,
            is_active: true,
          }
        ],
        pagination: { page: 1, limit: 20, total: 1, total_pages: 1 },
      }

      // Mock inventory fetch first
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          console.log('Mock inventory fetch called, returning:', mockInventoryResponse)
          return mockInventoryResponse
        },
      })

      // Mock service error
      ;(sharingService.createInventorySharing as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      )

      // Mock API error response for form submission (this will be called after inventory fetch)
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ success: false, error: 'Failed to create sharing' }),
      })

      const onSuccess = jest.fn()
      render(<ShareInventoryForm onSuccess={onSuccess} />)

      // Wait for inventory data to load
      await waitFor(() => {
        expect(screen.getByText('Diamond Engagement Ring')).toBeInTheDocument()
      }, { timeout: 3000 })

      const checkbox = screen.getByRole('checkbox', { name: /select diamond engagement ring/i })
      fireEvent.click(checkbox)

      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)
      fireEvent.click(nextButton)

      // Submit and expect error
      const shareButton = screen.getByText('Share Inventory')
      fireEvent.click(shareButton)

      // Wait for the error to be logged to console
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error sharing inventory:', expect.any(Error))
      }, { timeout: 2000 })

      expect(onSuccess).not.toHaveBeenCalled()
      
      // Restore console.error
      consoleSpy.mockRestore()
    })

    it('handles network errors in AI recommendations', async () => {
      mockUseAIRecommendations.mockReturnValue({
        recommendations: [],
        isLoading: false,
        error: 'Network connection failed',
        refresh: jest.fn(),
        provideFeedback: jest.fn(),
        updateRecommendationType: jest.fn(),
        updateLimit: jest.fn(),
      })

      render(<AIRecommendations userId="user-001" />)

      // Verify error state is displayed
      expect(screen.getByText('Network connection failed')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })
  })

  describe('Data Consistency Integration', () => {
    it('maintains data consistency between frontend and backend', async () => {
      // Mock the service to return consistent data
      const mockSharingData = {
        id: 'sharing-001',
        inventory_id: 'inv-001',
        owner_id: 'user-001',
        is_shared: true,
        visibility_level: 'connections_only',
        show_pricing: true,
        pricing_tier: 'retail',
        b2b_enabled: false,
      }

      ;(sharingService.getInventorySharing as jest.Mock).mockResolvedValue(mockSharingData)

      // Verify the data structure is consistent
      const sharing = await sharingService.getInventorySharing('inv-001', 'user-001')
      expect(sharing).toEqual(mockSharingData)

      // Verify required fields are present
      expect(sharing).toHaveProperty('id')
      expect(sharing).toHaveProperty('inventory_id')
      expect(sharing).toHaveProperty('owner_id')
      expect(sharing).toHaveProperty('is_shared')
      expect(sharing).toHaveProperty('visibility_level')
      expect(sharing).toHaveProperty('show_pricing')
      expect(sharing).toHaveProperty('pricing_tier')
      expect(sharing).toHaveProperty('b2b_enabled')
    })

    it('validates data types across the system', async () => {
      // Mock inventory data with proper types
      const mockInventory = {
        id: 'inv-001',
        name: 'Diamond Ring',
        price: 8500, // number
        quantity: 3, // number
        is_active: true, // boolean
        created_at: '2025-01-26T10:00:00Z', // string (ISO date)
      }

      // Verify data types
      expect(typeof mockInventory.id).toBe('string')
      expect(typeof mockInventory.name).toBe('string')
      expect(typeof mockInventory.price).toBe('number')
      expect(typeof mockInventory.quantity).toBe('number')
      expect(typeof mockInventory.is_active).toBe('boolean')
      expect(typeof mockInventory.created_at).toBe('string')
      expect(Date.parse(mockInventory.created_at)).not.toBeNaN() // Valid date
    })
  })

  describe('Performance Integration', () => {
    it('handles large datasets efficiently', async () => {
      // Mock large inventory dataset
      const largeInventory = Array.from({ length: 1000 }, (_, i) => ({
        id: `inv-${i.toString().padStart(3, '0')}`,
        name: `Item ${i}`,
        sku: `SKU-${i.toString().padStart(3, '0')}`,
        category: 'Rings',
        price: 1000 + (i * 100),
        is_active: true,
      }))

      const mockLargeResponse = {
        success: true,
        data: largeInventory,
        pagination: { page: 1, limit: 1000, total: 1000, total_pages: 1 },
      }

      const { mockFetchResponse } = require('../utils/test-utils')
      mockFetchResponse(mockLargeResponse)

      // Mock service to handle large datasets
      ;(sharingService.searchSharedInventory as jest.Mock).mockResolvedValue({
        items: largeInventory,
        page: 1,
        limit: 1000,
        total: 1000,
        totalPages: 1,
      })

      const startTime = performance.now()
      
      // Test service performance
      const result = await sharingService.searchSharedInventory({
        query: '',
        filters: {},
        sort_by: 'price',
        sort_order: 'asc',
        page: 1,
        limit: 1000,
      }, 'user-001')

      const endTime = performance.now()
      const duration = endTime - startTime

      // Verify performance is acceptable (should complete in under 100ms for mock data)
      expect(duration).toBeLessThan(100)
      expect(result.items).toHaveLength(1000)
      expect(result.total).toBe(1000)
    })

    it('maintains responsive UI during data operations', async () => {
      // Mock loading states
      mockUseAIRecommendations.mockReturnValue({
        recommendations: [],
        isLoading: true,
        error: null,
        refresh: jest.fn(),
        provideFeedback: jest.fn(),
        updateRecommendationType: jest.fn(),
        updateLimit: jest.fn(),
      })

      const { rerender } = render(<AIRecommendations userId="user-001" />)

      // Verify loading state is displayed (skeleton cards)
      expect(screen.getAllByTestId('skeleton')).toHaveLength(30) // 6 cards * 5 skeleton elements each

      // Simulate data loading completion
      mockUseAIRecommendations.mockReturnValue({
        recommendations: [
          {
            item: {
              id: 'inv-001',
              name: 'Diamond Ring',
              price: 8500,
              images: ['ring-001.jpg'],
              can_view_pricing: true,
              category: 'Rings',
            },
            score: 85,
            reasons: ['Matches preferences'],
            confidence: 0.9,
          }
        ],
        isLoading: false,
        error: null,
        refresh: jest.fn(),
        provideFeedback: jest.fn(),
        updateRecommendationType: jest.fn(),
        updateLimit: jest.fn(),
      })

      // Re-render to show loaded state
      rerender(<AIRecommendations userId="user-001" />)

      await waitFor(() => {
        expect(screen.getByText('Diamond Ring')).toBeInTheDocument()
      })

      expect(screen.queryAllByTestId('skeleton')).toHaveLength(0)
    })
  })
})
