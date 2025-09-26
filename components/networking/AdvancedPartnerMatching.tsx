'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Star, 
  Users, 
  Target, 
  TrendingUp, 
  MapPin, 
  Briefcase, 
  Award,
  Heart,
  MessageCircle,
  UserPlus,
  Filter,
  Search,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Partner {
  id: string
  name: string
  company: string
  avatar?: string
  location: string
  specialties: string[]
  rating: number
  reviewCount: number
  compatibilityScore: number
  mutualConnections: number
  sharedInterests: string[]
  recentActivity: string
  isOnline: boolean
  lastSeen?: string
}

interface AdvancedPartnerMatchingProps {
  currentUserId: string
  onConnect: (partnerId: string) => void
  onMessage: (partnerId: string) => void
  onViewProfile: (partnerId: string) => void
}

export function AdvancedPartnerMatching({
  currentUserId,
  onConnect,
  onMessage,
  onViewProfile
}: AdvancedPartnerMatchingProps) {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    minCompatibility: 70,
    location: '',
    specialties: [] as string[],
    hasMutualConnections: false,
    isOnline: false
  })
  const [sortBy, setSortBy] = useState<'compatibility' | 'rating' | 'activity' | 'connections'>('compatibility')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (currentUserId) {
      fetchRecommendations()
    }
  }, [currentUserId, filters, sortBy])

  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/network/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          filters,
          sortBy,
          limit: 20
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.recommendations) {
          setPartners(data.data.recommendations)
        } else {
          setError('Invalid response format from server')
          setPartners([])
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error?.message || 'Failed to fetch recommendations')
        setPartners([])
      }
    } catch (error) {
      setError('Network error occurred while fetching recommendations')
      setPartners([])
    } finally {
      setLoading(false)
    }
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getCompatibilityLabel = (score: number) => {
    if (score >= 90) return 'Excellent Match'
    if (score >= 80) return 'Great Match'
    if (score >= 70) return 'Good Match'
    return 'Fair Match'
  }

  const PartnerCard = ({ partner }: { partner: Partner }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              {partner.avatar ? (
                <img 
                  src={partner.avatar} 
                  alt={partner.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {partner.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {partner.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>

          {/* Partner Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 truncate">{partner.name}</h3>
                <p className="text-sm text-gray-600 truncate">{partner.company}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{partner.location}</span>
                </div>
              </div>
              
              {/* Compatibility Score */}
              <div className="text-right">
                <Badge className={cn("text-xs", getCompatibilityColor(partner.compatibilityScore))}>
                  {partner.compatibilityScore}%
                </Badge>
                <p className="text-xs text-gray-500 mt-1">
                  {getCompatibilityLabel(partner.compatibilityScore)}
                </p>
              </div>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1 mt-2">
              {partner.specialties.slice(0, 3).map((specialty) => (
                <Badge key={specialty} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {partner.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{partner.specialties.length - 3} more
                </Badge>
              )}
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs font-medium">{partner.rating}</span>
                <span className="text-xs text-gray-500">({partner.reviewCount})</span>
              </div>
              
              {partner.mutualConnections > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-gray-500">{partner.mutualConnections} mutual</span>
                </div>
              )}
            </div>

            {/* Compatibility Breakdown */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Compatibility</span>
                <span className="font-medium">{partner.compatibilityScore}%</span>
              </div>
              <Progress value={partner.compatibilityScore} className="h-1" />
            </div>

            {/* Shared Interests */}
            {partner.sharedInterests.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Shared interests:</p>
                <div className="flex flex-wrap gap-1">
                  {partner.sharedInterests.slice(0, 2).map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="mt-2 text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              {partner.recentActivity}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => onConnect(partner.id)}
                className="flex-1"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Connect
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMessage(partner.id)}
              >
                <MessageCircle className="h-3 w-3" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewProfile(partner.id)}
              >
                <Award className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">AI-Powered Partner Recommendations</h2>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-600">Powered by AI</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">AI-Powered Partner Recommendations</h2>
          <p className="text-sm text-gray-600 mt-1">
            Discover partners based on compatibility, mutual interests, and business synergies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-gray-600">Powered by AI</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchRecommendations}
                disabled={loading}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Min Compatibility</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minCompatibility}
                  onChange={(e) => setFilters(prev => ({ ...prev, minCompatibility: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">{filters.minCompatibility}%</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                placeholder="Any location"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              >
                <option value="compatibility">Compatibility</option>
                <option value="rating">Rating</option>
                <option value="activity">Recent Activity</option>
                <option value="connections">Mutual Connections</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">View Mode</label>
              <div className="flex mt-1">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  Grid
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  List
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.hasMutualConnections}
                onChange={(e) => setFilters(prev => ({ ...prev, hasMutualConnections: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Only mutual connections</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.isOnline}
                onChange={(e) => setFilters(prev => ({ ...prev, isOnline: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Online only</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {partners.length} Recommended Partners
          </h3>
          <Button variant="outline" size="sm" onClick={fetchRecommendations}>
            <Search className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {partners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        )}

        {partners.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or expanding your search criteria
              </p>
              <Button onClick={() => setFilters({ minCompatibility: 0, location: '', specialties: [], hasMutualConnections: false, isOnline: false })}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 