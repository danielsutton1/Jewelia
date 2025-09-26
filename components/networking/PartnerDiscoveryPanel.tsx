"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ConnectionRequestModal } from "./ConnectionRequestModal"
import { 
  Sparkles, 
  Users, 
  TrendingUp,
  MapPin, 
  Building2, 
  Star,
  Clock,
  UserPlus,
  Filter,
  Heart,
  Zap,
  Award,
  Loader2
} from "lucide-react"

interface Partner {
  id: string
  name: string
  company: string
  avatar_url?: string
  location: string
  specialties: string[]
  rating: number
  description?: string
  compatibilityScore: number
  mutualConnections: number
  sharedInterests: string[]
  recentActivity?: string
  isOnline?: boolean
}

interface RecommendationFilters {
  minCompatibility: number
  sortBy: 'compatibility' | 'rating' | 'activity' | 'connections'
  location?: string
  specialties: string[]
  isOnline?: boolean
  limit: number
}

export function PartnerDiscoveryPanel() {
  const [recommendations, setRecommendations] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [showConnectionRequest, setShowConnectionRequest] = useState<Partner | null>(null)
  const [filters, setFilters] = useState<RecommendationFilters>({
    minCompatibility: 70,
    sortBy: 'compatibility',
    specialties: [],
    limit: 10
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchRecommendations()
  }, [filters])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        minCompatibility: filters.minCompatibility.toString(),
        sortBy: filters.sortBy,
        limit: filters.limit.toString()
      })

      if (filters.location) params.append('location', filters.location)
      if (filters.isOnline) params.append('isOnline', 'true')
      filters.specialties.forEach(s => params.append('specialties', s))

      const response = await fetch(`/api/network/recommendations?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.data.recommendations || [])
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      toast({
        title: "Error",
        description: "Failed to load recommendations. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getCompatibilityColor = (score: number): string => {
    if (score >= 90) return "text-green-600 bg-green-50"
    if (score >= 80) return "text-blue-600 bg-blue-50"
    if (score >= 70) return "text-yellow-600 bg-yellow-50"
    return "text-gray-600 bg-gray-50"
  }

  const getCompatibilityIcon = (score: number) => {
    if (score >= 90) return <Heart className="h-3 w-3" />
    if (score >= 80) return <Zap className="h-3 w-3" />
    if (score >= 70) return <Star className="h-3 w-3" />
    return <Users className="h-3 w-3" />
  }

  const specialtyOptions = [
    "Manufacturer", "Retailer", "Designer", "Supplier", "Gem Dealer", "Polisher", "Setter", "Appraiser"
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Partner Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-3" />
            <p className="text-gray-500">Finding perfect matches...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI-Powered Recommendations
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {recommendations.length} matches
          </Badge>
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <Select 
            value={filters.sortBy} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compatibility">Best Match</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="connections">Most Connected</SelectItem>
              <SelectItem value="activity">Recently Active</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.minCompatibility.toString()} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, minCompatibility: parseInt(value) }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50%+ Match</SelectItem>
              <SelectItem value="70">70%+ Match</SelectItem>
              <SelectItem value="80">80%+ Match</SelectItem>
              <SelectItem value="90">90%+ Match</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecommendations}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-lg font-medium text-gray-500">No recommendations found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters or expanding your criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((partner) => (
              <RecommendationCard
                key={partner.id}
                partner={partner}
                onConnect={() => setShowConnectionRequest(partner)}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Connection Request Modal */}
      {showConnectionRequest && (
        <ConnectionRequestModal
          isOpen={!!showConnectionRequest}
          onClose={() => setShowConnectionRequest(null)}
          partner={showConnectionRequest}
          onRequestSent={() => {
            toast({
              title: "Connection Request Sent!",
              description: `Your request to ${showConnectionRequest.name} has been sent.`,
              variant: "default"
            })
          }}
        />
      )}
    </Card>
  )
}

interface RecommendationCardProps {
  partner: Partner
  onConnect: () => void
}

function RecommendationCard({ partner, onConnect }: RecommendationCardProps) {
  const getCompatibilityColor = (score: number): string => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200"
    if (score >= 80) return "text-blue-600 bg-blue-50 border-blue-200"
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-gray-600 bg-gray-50 border-gray-200"
  }

  const getCompatibilityIcon = (score: number) => {
    if (score >= 90) return <Heart className="h-3 w-3" />
    if (score >= 80) return <Zap className="h-3 w-3" />
    if (score >= 70) return <Star className="h-3 w-3" />
    return <Users className="h-3 w-3" />
  }

  const getCompatibilityLabel = (score: number): string => {
    if (score >= 90) return "Perfect Match"
    if (score >= 80) return "Great Match"
    if (score >= 70) return "Good Match"
    return "Potential Match"
  }

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors relative">
      {/* Compatibility Badge */}
      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getCompatibilityColor(partner.compatibilityScore)}`}>
        {getCompatibilityIcon(partner.compatibilityScore)}
        {partner.compatibilityScore}%
      </div>

      <div className="flex items-start gap-3 pr-16">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={partner.avatar_url} />
          <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
            {partner.name[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{partner.name}</h3>
            {partner.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{partner.rating}</span>
              </div>
            )}
            {partner.isOnline && (
              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">{partner.company}</span>
            <span className="text-gray-400">•</span>
            <MapPin className="h-4 w-4" />
            <span>{partner.location}</span>
          </div>

          {/* Why this recommendation */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">
              {getCompatibilityLabel(partner.compatibilityScore)}
            </p>
            <div className="flex flex-wrap gap-1">
              {partner.sharedInterests.slice(0, 3).map((interest, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {interest}
                </Badge>
              ))}
              {partner.mutualConnections > 0 && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {partner.mutualConnections} mutual
                </Badge>
              )}
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1 mb-3">
            {partner.specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {partner.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{partner.specialties.length - 3} more
              </Badge>
            )}
          </div>

          {/* Action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>
                {partner.recentActivity 
                  ? `Active ${new Date(partner.recentActivity).toLocaleDateString()}`
                  : 'Recent activity unknown'
                }
              </span>
            </div>

            <Button
              size="sm"
              onClick={onConnect}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Connect
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
