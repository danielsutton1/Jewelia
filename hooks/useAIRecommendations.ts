import { useState, useEffect, useCallback, useRef } from 'react'
import { RecommendationScore } from '@/lib/services/AIRecommendationService'

// =====================================================
// AI RECOMMENDATIONS HOOK
// =====================================================

export type RecommendationType = 'personalized' | 'network' | 'trending' | 'collaborative' | 'all'

interface UseAIRecommendationsOptions {
  userId: string
  type?: RecommendationType
  limit?: number
  autoFetch?: boolean
  refreshInterval?: number
}

interface UseAIRecommendationsReturn {
  recommendations: RecommendationScore[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  provideFeedback: (itemId: string, action: string, feedback?: string) => Promise<void>
  updateRecommendationType: (type: RecommendationType) => void
  updateLimit: (limit: number) => void
}

export function useAIRecommendations({
  userId,
  type = 'personalized',
  limit = 10,
  autoFetch = true,
  refreshInterval = 300000 // 5 minutes
}: UseAIRecommendationsOptions): UseAIRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentType, setCurrentType] = useState<RecommendationType>(type)
  const [currentLimit, setCurrentLimit] = useState(limit)
  const isFetchingRef = useRef(false)

  // Fetch recommendations from API
  const fetchRecommendations = useCallback(async () => {
    if (!userId || isFetchingRef.current) return

    try {
      isFetchingRef.current = true
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        type: currentType,
        limit: currentLimit.toString(),
        user_id: userId
      })

      const response = await fetch(`/api/inventory-sharing/recommendations?${params}`)
      
      if (!response) {
        throw new Error('Network error: No response received')
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setRecommendations(data.data || [])
      } else {
        throw new Error(data.error || 'Failed to fetch recommendations')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching AI recommendations:', err)
    } finally {
      isFetchingRef.current = false
      setIsLoading(false)
    }
  }, [userId, currentType, currentLimit])

  // Provide feedback on recommendations
  const provideFeedback = useCallback(async (itemId: string, action: string, feedback?: string) => {
    if (!userId) return

    try {
      const response = await fetch('/api/inventory-sharing/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          itemId,
          action,
          feedback
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to provide feedback: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to provide feedback')
      }

      // Optionally refresh recommendations after feedback
      // This could help improve future recommendations
      // await fetchRecommendations()
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Error providing feedback:', err)
      // Don't set global error for feedback failures
    }
  }, [userId])

  // Update recommendation type
  const updateRecommendationType = useCallback((type: RecommendationType) => {
    setCurrentType(type)
  }, [])

  // Update recommendation limit
  const updateLimit = useCallback((limit: number) => {
    setCurrentLimit(limit)
  }, [])

  // Refresh recommendations manually
  const refresh = useCallback(async () => {
    await fetchRecommendations()
  }, [fetchRecommendations])

  // Auto-fetch recommendations
  useEffect(() => {
    if (autoFetch && userId) {
      fetchRecommendations()
    }
  }, [autoFetch, userId, fetchRecommendations])

  // Set up refresh interval
  useEffect(() => {
    if (!autoFetch || !refreshInterval) return

    const interval = setInterval(() => {
      fetchRecommendations()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoFetch, refreshInterval, fetchRecommendations])

  // Update when type or limit changes
  useEffect(() => {
    if (autoFetch && userId) {
      fetchRecommendations()
    }
  }, [currentType, currentLimit, autoFetch, userId, fetchRecommendations])

  return {
    recommendations,
    isLoading,
    error,
    refresh,
    provideFeedback,
    updateRecommendationType,
    updateLimit
  }
}

// =====================================================
// SPECIALIZED HOOKS FOR DIFFERENT RECOMMENDATION TYPES
// =====================================================

export function usePersonalizedRecommendations(userId: string, limit: number = 10) {
  return useAIRecommendations({
    userId,
    type: 'personalized',
    limit,
    autoFetch: true
  })
}

export function useNetworkRecommendations(userId: string, limit: number = 10) {
  return useAIRecommendations({
    userId,
    type: 'network',
    limit,
    autoFetch: true
  })
}

export function useTrendingRecommendations(userId: string, limit: number = 10) {
  return useAIRecommendations({
    userId,
    type: 'trending',
    limit,
    autoFetch: true
  })
}

export function useCollaborativeRecommendations(userId: string, limit: number = 10) {
  return useAIRecommendations({
    userId,
    type: 'collaborative',
    limit,
    autoFetch: true
  })
}

export function useAllRecommendations(userId: string, limit: number = 20) {
  return useAIRecommendations({
    userId,
    type: 'all',
    limit,
    autoFetch: true
  })
}
