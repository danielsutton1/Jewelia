import { renderHook, act, waitFor } from '@testing-library/react'
import { useAIRecommendations } from '@/hooks/useAIRecommendations'
import { getMockApiResponses, mockFetchResponse, mockFetchError } from '../utils/test-utils'

// Mock fetch globally
global.fetch = jest.fn()

describe('useAIRecommendations', () => {
  const defaultOptions = {
    userId: 'test-user-id',
    type: 'personalized' as const,
    limit: 10,
    autoFetch: true,
    refreshInterval: 300000,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('initialization', () => {
    it('initializes with default values', async () => {
      // Mock fetch to prevent actual API calls
      mockFetchResponse(getMockApiResponses().aiRecommendations)
      
      const { result } = renderHook(() => useAIRecommendations(defaultOptions))

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // The hook auto-fetches, so recommendations should contain the mocked data
      expect(result.current.recommendations).toEqual(getMockApiResponses().aiRecommendations.data)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(typeof result.current.refresh).toBe('function')
      expect(typeof result.current.provideFeedback).toBe('function')
      expect(typeof result.current.updateRecommendationType).toBe('function')
      expect(typeof result.current.updateLimit).toBe('function')
    })

    it('auto-fetches recommendations when autoFetch is true', async () => {
      mockFetchResponse(getMockApiResponses().aiRecommendations)

      renderHook(() => useAIRecommendations(defaultOptions))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/inventory-sharing/recommendations?type=personalized&limit=10&user_id=test-user-id')
        )
      })
    })

    it('does not auto-fetch when autoFetch is false', async () => {
      const { result } = renderHook(() => useAIRecommendations({ ...defaultOptions, autoFetch: false }))

      // Wait a bit to ensure no fetch is called
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(global.fetch).not.toHaveBeenCalled()
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('fetching recommendations', () => {
    it('fetches recommendations successfully', async () => {
      mockFetchResponse(getMockApiResponses().aiRecommendations)

      const { result } = renderHook(() => useAIRecommendations(defaultOptions))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.recommendations).toEqual(getMockApiResponses().aiRecommendations.data)
        expect(result.current.error).toBe(null)
      })
    })

    it('handles fetch errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useAIRecommendations(defaultOptions))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBe('Network error')
        expect(result.current.recommendations).toEqual([])
      })
    })

    it('handles API error responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ success: false, error: 'Failed to fetch recommendations' })
      })

      const { result } = renderHook(() => useAIRecommendations(defaultOptions))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toContain('Failed to fetch recommendations')
        expect(result.current.recommendations).toEqual([])
      })
    })

    it('handles malformed API responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, error: 'Invalid response' }),
      })

      const { result } = renderHook(() => useAIRecommendations(defaultOptions))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBe('Invalid response')
        expect(result.current.recommendations).toEqual([])
      })
    })
  })

  describe('refresh functionality', () => {
    it('refreshes recommendations when refresh is called', async () => {
      mockFetchResponse(getMockApiResponses().aiRecommendations)

      const { result } = renderHook(() => useAIRecommendations(defaultOptions))

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Mock new response for refresh
      mockFetchResponse({
        ...getMockApiResponses().aiRecommendations,
        data: [{ ...getMockApiResponses().aiRecommendations.data[0], id: 'refreshed-item' }],
      })

      // Call refresh
      act(() => {
        result.current.refresh()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.recommendations[0].id).toBe('refreshed-item')
      })
    })

    it('resets error state when refresh is called', async () => {
      // First call fails
      mockFetchError('Network error')
      const { result } = renderHook(() => useAIRecommendations(defaultOptions))

      await waitFor(() => {
        expect(result.current.error).toBe('Network error')
      })

      // Second call succeeds
      mockFetchResponse(getMockApiResponses().aiRecommendations)

      act(() => {
        result.current.refresh()
      })

      await waitFor(() => {
        expect(result.current.error).toBe(null)
        expect(result.current.recommendations).toEqual(getMockApiResponses().aiRecommendations.data)
      })
    })
  })

  describe('recommendation type switching', () => {
    it('updates recommendation type and refetches', async () => {
      mockFetchResponse(getMockApiResponses().aiRecommendations)

      const { result } = renderHook(() => useAIRecommendations(defaultOptions))

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Mock response for new type
      mockFetchResponse({
        ...getMockApiResponses().aiRecommendations,
        type: 'network',
        data: [{ ...getMockApiResponses().aiRecommendations.data[0], id: 'network-item' }],
      })

      // Update type
      act(() => {
        result.current.updateRecommendationType('network')
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('type=network')
        )
      })
    })

    it('updates limit and refetches', async () => {
      mockFetchResponse(getMockApiResponses().aiRecommendations)

      const { result } = renderHook(() => useAIRecommendations(defaultOptions))

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Mock response for new limit
      mockFetchResponse({
        ...getMockApiResponses().aiRecommendations,
        data: Array.from({ length: 5 }, (_, i) => ({
          ...getMockApiResponses().aiRecommendations.data[0],
          id: `item-${i}`,
        })),
      })

      // Update limit
      act(() => {
        result.current.updateLimit(5)
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('limit=5')
        )
      })
    })
  })

  describe('feedback functionality', () => {
    it('provides feedback successfully', async () => {
      mockFetchResponse(getMockApiResponses().aiRecommendations)

      const { result } = renderHook(() => useAIRecommendations(defaultOptions))

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Mock successful feedback response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Feedback recorded' }),
      })

      // Provide feedback
      act(() => {
        result.current.provideFeedback('test-item-id', 'like', 'Great recommendation!')
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/inventory-sharing/recommendations',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              userId: 'test-user-id',
              itemId: 'test-item-id',
              action: 'like',
              feedback: 'Great recommendation!',
            }),
          })
        )
      })
    })

    it('handles feedback errors gracefully', async () => {
      mockFetchResponse(getMockApiResponses().aiRecommendations)

      const { result } = renderHook(() => useAIRecommendations(defaultOptions))

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Mock failed feedback response
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Feedback failed'))

      // Provide feedback
      act(() => {
        result.current.provideFeedback('test-item-id', 'dislike')
      })

      // Should not throw error, just log it
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  describe('refresh interval', () => {
    it('automatically refreshes at specified interval', async () => {
      jest.useFakeTimers()

      mockFetchResponse(getMockApiResponses().aiRecommendations)

      const { result } = renderHook(() => useAIRecommendations({ ...defaultOptions, refreshInterval: 1000, autoFetch: true }))

      // Wait for initial fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      // Should have called fetch again
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2)
      })

      jest.useRealTimers()
    })

    it('cleans up interval on unmount', async () => {
      jest.useFakeTimers()

      mockFetchResponse(getMockApiResponses().aiRecommendations)

      const { result, unmount } = renderHook(() => useAIRecommendations({ ...defaultOptions, refreshInterval: 1000, autoFetch: false }))

      // Manually trigger initial fetch
      act(() => {
        result.current.refresh()
      })

      // Wait for initial fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      // Unmount
      unmount()

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      // Should not call fetch again
      expect(global.fetch).toHaveBeenCalledTimes(1)

      jest.useRealTimers()
    })
  })

  describe('edge cases', () => {
    it('handles empty userId gracefully', () => {
      const { result } = renderHook(() => useAIRecommendations({ ...defaultOptions, userId: '' }))

      expect(result.current.recommendations).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('handles undefined userId gracefully', () => {
      const { result } = renderHook(() => useAIRecommendations({ ...defaultOptions, userId: undefined as any }))

      expect(result.current.recommendations).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('prevents multiple simultaneous fetches', async () => {
      // Mock a slow response
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useAIRecommendations({ ...defaultOptions, autoFetch: false }))

      // Try to refresh multiple times quickly
      act(() => {
        result.current.refresh()
        result.current.refresh()
        result.current.refresh()
      })

      // Should only have one fetch call
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('handles component unmount during fetch', async () => {
      // Mock a slow response
      let resolveFetch: (value: any) => void
      ;(global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => { resolveFetch = resolve })
      )

      const { unmount } = renderHook(() => useAIRecommendations(defaultOptions))

      // Unmount before fetch completes
      unmount()

      // Resolve the fetch
      resolveFetch!({ ok: true, json: async () => getMockApiResponses().aiRecommendations })

      // Should not cause any errors
      await waitFor(() => {
        // Component is unmounted, so no assertions needed
      })
    })
  })

  describe('URL parameter handling', () => {
    it('correctly encodes URL parameters', async () => {
      mockFetchResponse(getMockApiResponses().aiRecommendations)

      renderHook(() => useAIRecommendations({
        ...defaultOptions,
        type: 'trending',
        limit: 25,
      }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('type=trending&limit=25&user_id=test-user-id')
        )
      })
    })

    it('handles special characters in userId', async () => {
      mockFetchResponse(getMockApiResponses().aiRecommendations)

      renderHook(() => useAIRecommendations({
        ...defaultOptions,
        userId: 'user@example.com',
      }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('user_id=user%40example.com')
        )
      })
    })
  })
})
