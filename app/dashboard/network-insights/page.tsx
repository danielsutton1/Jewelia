"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Star, 
  Search, 
  Filter,
  MessageSquare,
  Handshake,
  Award,
  Globe,
  Building2,
  MapPin,
  CheckCircle,
  Clock,
  BarChart3,
  Network,
  Sparkles
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { NetworkService, NetworkAnalytics, Partner } from "@/lib/services/NetworkService"

interface NetworkInsightsData {
  analytics: NetworkAnalytics | null
  recommendations: any[] // Using any for now since NetworkRecommendation doesn't exist
  recentDiscoveries: Partner[]
  loading: boolean
  error: string | null
}

export default function NetworkInsightsPage() {
  const [data, setData] = useState<NetworkInsightsData>({
    analytics: null,
    recommendations: [],
    recentDiscoveries: [],
    loading: true,
    error: null
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all")
  const { toast } = useToast()

  const specialties = [
    "Manufacturer", "Retailer", "Designer", "Supplier", 
    "Gem Dealer", "Polisher", "Setter", "Appraiser"
  ]

  useEffect(() => {
    loadNetworkData()
  }, [])

  const loadNetworkData = async () => {
    setData(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // Load analytics
      const analyticsRes = await fetch("/api/network/analytics")
      const analyticsData = await analyticsRes.json()
      
      // Load recommendations
      const recommendationsRes = await fetch("/api/network/recommendations?limit=6")
      const recommendationsData = await recommendationsRes.json()
      
      // Load recent discoveries
      const discoveriesRes = await fetch("/api/network/discover?limit=8")
      const discoveriesData = await discoveriesRes.json()

      setData({
        analytics: analyticsData.success ? analyticsData.data : null,
        recommendations: recommendationsData.success ? recommendationsData.data : [],
        recentDiscoveries: discoveriesData.success ? discoveriesData.data : [],
        loading: false,
        error: null
      })
    } catch (error: any) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to load network data"
      }))
      toast({
        title: "Error",
        description: "Failed to load network insights",
        variant: "destructive"
      })
    }
  }

  const handleConnect = async (partnerId: string) => {
    try {
      // TODO: Implement connection request
      toast({
        title: "Connection Request",
        description: "Connection request sent successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      })
    }
  }

  const handleMessage = (partnerId: string) => {
    // TODO: Navigate to messaging
    toast({
      title: "Message",
      description: "Opening chat with partner"
    })
  }

  const filteredRecommendations = data.recommendations.filter(rec =>
    rec.partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.partner.specialties.some((s: any) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredDiscoveries = data.recentDiscoveries.filter(partner =>
    (selectedSpecialty === "all" || partner.specialties.includes(selectedSpecialty)) &&
    partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (data.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="p-6 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full mb-6 inline-block">
              <Network className="h-16 w-16 text-emerald-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">Loading Network Insights</h3>
            <p className="text-emerald-600">Analyzing your professional network...</p>
          </div>
        </div>
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="p-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mb-6 inline-block">
              <Network className="h-16 w-16 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">Network Error</h3>
            <p className="text-red-600 mb-4">{data.error}</p>
            <Button onClick={loadNetworkData} className="bg-emerald-600 hover:bg-emerald-700">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg">
              <Network className="h-6 w-6 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-900">Network Insights</h1>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
          <p className="text-emerald-600">Discover opportunities and grow your professional network</p>
        </div>

        {/* Analytics Overview */}
        {data.analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/80 backdrop-blur-xl border-emerald-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Users className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600">Total Connections</p>
                    <p className="text-2xl font-bold text-emerald-900">{data.analytics.totalConnections}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border-emerald-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Handshake className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Accepted Connections</p>
                    <p className="text-2xl font-bold text-blue-900">{data.analytics.acceptedConnections}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border-emerald-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-yellow-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-yellow-900">{data.analytics.pendingRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border-emerald-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600">Connection Growth</p>
                    <p className="text-2xl font-bold text-purple-900">{data.analytics.connectionGrowth.newConnections}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Recommendations */}
          <Card className="bg-white/80 backdrop-blur-xl border-emerald-200/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-emerald-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  AI Recommendations
                </CardTitle>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {filteredRecommendations.length} partners
                </Badge>
              </div>
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Search recommendations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredRecommendations.map((rec) => (
                  <div key={rec.partner.id} className="p-4 bg-white/50 rounded-lg border border-emerald-200/50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-emerald-900">{rec.partner.name}</h4>
                        <p className="text-sm text-emerald-600">{rec.partner.type}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 mb-1">
                          {rec.score}% match
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-emerald-600">
                          <Star className="h-3 w-3 fill-current" />
                          {rec.partner.rating}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {rec.partner.specialties.slice(0, 3).map((specialty: any) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-emerald-600">
                        {rec.reasons.slice(0, 2).join(" • ")}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleConnect(rec.partner.id)}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMessage(rec.partner.id)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Partner Discovery */}
          <Card className="bg-white/80 backdrop-blur-xl border-emerald-200/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-emerald-900 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-600" />
                  Partner Discovery
                </CardTitle>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {filteredDiscoveries.length} found
                </Badge>
              </div>
              <div className="flex gap-2 mt-4">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="flex-1 px-3 py-2 border border-emerald-200 rounded-md bg-white/50 text-emerald-900"
                >
                  <option value="all">All Specialties</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredDiscoveries.map((partner) => (
                  <div key={partner.id} className="p-4 bg-white/50 rounded-lg border border-emerald-200/50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-emerald-900">{partner.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-emerald-600">
                          <Building2 className="h-3 w-3" />
                          {partner.category}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-emerald-600">
                          <Star className="h-3 w-3 fill-current" />
                          {partner.rating}
                        </div>
                        {partner.location && (
                          <div className="flex items-center gap-1 text-xs text-emerald-500">
                            <MapPin className="h-3 w-3" />
                            {partner.location}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {partner.specialties.slice(0, 3).map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-emerald-600 line-clamp-2">
                        {partner.description}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleConnect(partner.id)}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMessage(partner.id)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Industries */}
        {data.analytics && data.analytics.topIndustries.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-xl border-emerald-200/50 mt-8">
            <CardHeader>
              <CardTitle className="text-emerald-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                Top Industries in Your Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {data.analytics.topIndustries.map((item, index) => (
                  <div key={item.industry} className="text-center p-4 bg-white/50 rounded-lg border border-emerald-200/50">
                    <div className="text-2xl font-bold text-emerald-900 mb-1">{item.count}</div>
                    <div className="text-sm text-emerald-600">{item.industry}</div>
                    <div className="text-xs text-emerald-500 mt-1">
                      #{index + 1} in network
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 