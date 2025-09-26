"use client"

import { useState } from 'react'
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Heart, 
  MessageSquare, 
  ShoppingCart,
  Eye,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Star,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useAIRecommendations, RecommendationType } from '@/hooks/useAIRecommendations'
import { RecommendationScore } from '@/lib/services/AIRecommendationService'

// =====================================================
// AI RECOMMENDATIONS COMPONENT
// =====================================================

interface AIRecommendationsProps {
  userId: string
  className?: string
  showFeedback?: boolean
  showActions?: boolean
  maxItems?: number
}

export function AIRecommendations({
  userId,
  className = '',
  showFeedback = true,
  showActions = true,
  maxItems = 20
}: AIRecommendationsProps) {
  const [activeTab, setActiveTab] = useState<RecommendationType>('all')
  
  const {
    recommendations,
    isLoading,
    error,
    refresh,
    provideFeedback,
    updateRecommendationType
  } = useAIRecommendations({
    userId,
    type: activeTab,
    limit: maxItems,
    autoFetch: true
  })

  const handleTabChange = (value: string) => {
    const newType = value as RecommendationType
    setActiveTab(newType)
    updateRecommendationType(newType)
  }

  const handleFeedback = async (itemId: string, action: 'like' | 'dislike' | 'view' | 'purchase') => {
    await provideFeedback(itemId, action)
  }

  const getRecommendationIcon = (type: RecommendationType) => {
    switch (type) {
      case 'personalized':
        return <Brain className="h-4 w-4" />
      case 'network':
        return <Users className="h-4 w-4" />
      case 'trending':
        return <TrendingUp className="h-4 w-4" />
      case 'collaborative':
        return <Sparkles className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  const getRecommendationTitle = (type: RecommendationType) => {
    switch (type) {
      case 'personalized':
        return 'Personalized for You'
      case 'network':
        return 'From Your Network'
      case 'trending':
        return 'Trending Now'
      case 'collaborative':
        return 'Similar to Your Taste'
      default:
        return 'AI Recommendations'
    }
  }

  const getRecommendationDescription = (type: RecommendationType) => {
    switch (type) {
      case 'personalized':
        return 'Based on your preferences and viewing history'
      case 'network':
        return 'Items from your professional connections'
      case 'trending':
        return 'Most popular items in the network'
      case 'collaborative':
        return 'Liked by users with similar tastes'
      default:
        return 'Intelligent suggestions from multiple sources'
    }
  }

  if (error) {
    return (
      <Card className={`bg-red-50 border-red-200 ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <Brain className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Recommendations Unavailable</h3>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-purple-900">
                  AI-Powered Recommendations
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Discover inventory tailored to your preferences
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={refresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border-purple-200">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900"
              >
                <Zap className="h-4 w-4 mr-2" />
                All
              </TabsTrigger>
              <TabsTrigger 
                value="personalized" 
                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900"
              >
                <Brain className="h-4 w-4 mr-2" />
                For You
              </TabsTrigger>
              <TabsTrigger 
                value="network" 
                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900"
              >
                <Users className="h-4 w-4 mr-2" />
                Network
              </TabsTrigger>
              <TabsTrigger 
                value="trending" 
                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </TabsTrigger>
              <TabsTrigger 
                value="collaborative" 
                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Similar
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-purple-900 flex items-center">
                  {getRecommendationIcon(activeTab)}
                  <span className="ml-2">{getRecommendationTitle(activeTab)}</span>
                </h3>
                <p className="text-purple-700 text-sm">{getRecommendationDescription(activeTab)}</p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="bg-white/80">
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" data-testid="skeleton" />
                        <Skeleton className="h-3 w-1/2 mb-2" data-testid="skeleton" />
                        <Skeleton className="h-3 w-2/3 mb-3" data-testid="skeleton" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-20" data-testid="skeleton" />
                          <Skeleton className="h-8 w-20" data-testid="skeleton" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-purple-400 mb-4">
                    <Brain className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">
                    No Recommendations Yet
                  </h3>
                  <p className="text-purple-600">
                    Start browsing inventory to get personalized recommendations
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.item.id}
                      recommendation={recommendation}
                      showFeedback={showFeedback}
                      showActions={showActions}
                      onFeedback={handleFeedback}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// =====================================================
// RECOMMENDATION CARD COMPONENT
// =====================================================

interface RecommendationCardProps {
  recommendation: RecommendationScore
  showFeedback: boolean
  showActions: boolean
  onFeedback: (itemId: string, action: 'like' | 'dislike' | 'view' | 'purchase') => void
}

function RecommendationCard({
  recommendation,
  showFeedback,
  showActions,
  onFeedback
}: RecommendationCardProps) {
  const { item, score, reasons, confidence } = recommendation

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-600 bg-green-100'
    if (conf >= 0.6) return 'text-blue-600 bg-blue-100'
    if (conf >= 0.4) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getScoreColor = (scr: number) => {
    if (scr >= 80) return 'text-green-600'
    if (scr >= 60) return 'text-blue-600'
    if (scr >= 40) return 'text-yellow-600'
    return 'text-gray-600'
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all duration-200 border-purple-200 hover:border-purple-300">
      <CardContent className="p-4">
        {/* Header with score and confidence */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h4>
            <p className="text-sm text-gray-600">{item.sku}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge 
              variant="secondary" 
              className={`text-xs ${getScoreColor(score)}`}
            >
              {score} pts
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs ${getConfidenceColor(confidence)}`}
            >
              {Math.round(confidence * 100)}% match
            </Badge>
          </div>
        </div>

        {/* Item details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm">
            <span className="text-gray-700">Category:</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              {item.category}
            </Badge>
          </div>
          
          {item.metal_type && (
            <div className="flex items-center text-sm">
              <span className="text-gray-700">Metal:</span>
              <span className="ml-2 text-gray-600">{item.metal_type} {item.metal_purity}</span>
            </div>
          )}
          
          {item.gemstone_type && (
            <div className="flex items-center text-sm">
              <span className="text-gray-700">Stone:</span>
              <span className="ml-2 text-gray-600">
                {item.gemstone_type} {item.gemstone_carat}ct
              </span>
            </div>
          )}
          
          {item.can_view_pricing && (
            <div className="flex items-center text-sm">
              <span className="text-gray-700">Price:</span>
              <span className="ml-2 font-semibold text-gray-900">
                ${item.price.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* AI Reasons */}
        {reasons.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center text-xs text-purple-600 mb-1">
              <Brain className="h-3 w-3 mr-1" />
              Why we recommend this:
            </div>
            <div className="space-y-1">
              {reasons.slice(0, 2).map((reason, index) => (
                <div key={index} className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded">
                  • {reason}
                </div>
              ))}
              {reasons.length > 2 && (
                <div className="text-xs text-purple-500">
                  +{reasons.length - 2} more reasons
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {showActions && (
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => onFeedback(item.id, 'view')}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => onFeedback(item.id, 'purchase')}
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Buy
            </Button>
          </div>
        )}

        {/* Feedback buttons */}
        {showFeedback && (
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => onFeedback(item.id, 'like')}
                aria-label="Like recommendation"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onFeedback(item.id, 'dislike')}
                aria-label="Dislike recommendation"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center text-xs text-purple-600">
              <Star className="h-3 w-3 mr-1 fill-current" />
              AI Score
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
