"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Share2, 
  Eye, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  EyeOff,
  DollarSign,
  Package,
  TrendingUp,
  MessageSquare,
  ShoppingCart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { InventorySharingSettings, SharedInventoryItem, InventorySharingStats } from '@/types/inventory-sharing'
import { AIRecommendations } from '@/components/inventory-sharing/AIRecommendations'
import { MarketplaceBreadcrumb } from '@/components/inventory-sharing/MarketplaceBreadcrumb'
import { PartnerInventoryAccessPanel } from '@/components/inventory-sharing/PartnerInventoryAccessPanel'

// =====================================================
// INVENTORY SHARING DASHBOARD PAGE
// =====================================================

export default function InventorySharingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVisibility, setSelectedVisibility] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  
  // State for data
  const [sharedInventory, setSharedInventory] = useState<SharedInventoryItem[]>([])
  const [sharingStats, setSharingStats] = useState<InventorySharingStats | null>(null)
  const [pendingRequests, setPendingRequests] = useState<any[]>([])

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const user = await response.json()
          setCurrentUserId(user.id)
        }
      } catch (error) {
        console.error('Error fetching current user:', error)
      }
    }
    fetchCurrentUser()
  }, [])

  // Fetch data when user ID is available
  useEffect(() => {
    if (currentUserId) {
      fetchSharedInventory()
      fetchSharingStats()
      fetchPendingRequests()
    }
  }, [currentUserId])

  const fetchSharedInventory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/inventory-sharing')
      if (response.ok) {
        const data = await response.json()
        setSharedInventory(data.data || [])
      } else {
        console.error('Failed to fetch shared inventory')
        toast({
          title: "Error",
          description: "Failed to load shared inventory",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching shared inventory:', error)
      toast({
        title: "Error",
        description: "Failed to load shared inventory",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSharingStats = async () => {
    try {
      const response = await fetch('/api/inventory-sharing/analytics')
      if (response.ok) {
        const data = await response.json()
        setSharingStats(data.data || {
          total_shared_items: 0,
          total_viewers: 0,
          total_views: 0,
          total_quote_requests: 0,
          total_order_requests: 0,
          total_partnership_requests: 0,
          average_engagement_rate: 0,
          top_performing_items: [],
          recent_activity: []
        })
      } else {
        console.error('Failed to fetch sharing stats')
      }
    } catch (error) {
      console.error('Error fetching sharing stats:', error)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/inventory-sharing/requests?status=pending')
      if (response.ok) {
        const data = await response.json()
        setPendingRequests(data.data || [])
      } else {
        console.error('Failed to fetch pending requests')
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error)
    }
  }

  const handleShareInventory = () => {
    router.push('/dashboard/inventory-sharing/share')
  }

  const handleManageSharing = (itemId: string) => {
    router.push(`/dashboard/inventory-sharing/manage/${itemId}`)
  }

  const handleViewAnalytics = (itemId: string) => {
    router.push(`/dashboard/inventory-sharing/analytics/${itemId}`)
  }

  const filteredInventory = sharedInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesVisibility = selectedVisibility === 'all' || item.is_visible_to_viewer === (selectedVisibility === 'visible')
    
    return matchesSearch && matchesCategory && matchesVisibility
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4">
        <div className="w-full">
          <div className="text-center py-12">
            <div className="p-6 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full mb-6 inline-block">
              <Share2 className="h-16 w-16 text-emerald-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">Loading Inventory Sharing</h3>
            <p className="text-emerald-600">Setting up your sharing dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="w-full p-1">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-emerald-900">Inventory Sharing</h1>
              <p className="text-emerald-600">Share your inventory with your professional network</p>
            </div>
            <Button onClick={handleShareInventory} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Share Inventory
            </Button>
          </div>
          
          {/* Breadcrumb Navigation */}
          <MarketplaceBreadcrumb />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-emerald-600">Shared Items</p>
                    <p className="text-2xl font-bold text-emerald-900">{sharingStats?.total_shared_items || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Total Viewers</p>
                    <p className="text-2xl font-bold text-blue-900">{sharingStats?.total_viewers || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600">Total Views</p>
                    <p className="text-2xl font-bold text-purple-900">{sharingStats?.total_views || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-orange-900">{pendingRequests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-100">
              <Eye className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="shared" className="data-[state=active]:bg-emerald-100">
              <Share2 className="h-4 w-4 mr-2" />
              Shared Items
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-emerald-100">
              <MessageSquare className="h-4 w-4 mr-2" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="partner_access" className="data-[state=active]:bg-emerald-100">
              <Users className="h-4 w-4 mr-2" />
              Partner Access
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-emerald-100">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                        <div>
                          <p className="font-medium text-emerald-900">{request.requester_name}</p>
                          <p className="text-sm text-emerald-600">{request.company}</p>
                        </div>
                        <Badge variant="secondary">{request.request_type}</Badge>
                      </div>
                    ))}
                    {pendingRequests.length === 0 && (
                      <p className="text-emerald-600 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-emerald-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleShareInventory}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Share New Item
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push('/dashboard/inventory-sharing/connections')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Connections
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push('/dashboard/inventory-sharing/settings')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Sharing Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            {currentUserId && (
              <div className="mt-6">
                <AIRecommendations 
                  userId={currentUserId}
                  showFeedback={true}
                  showActions={true}
                  maxItems={6}
                />
              </div>
            )}
          </TabsContent>

          {/* Shared Items Tab */}
          <TabsContent value="shared" className="space-y-6">
            {/* Filters and Search */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-600" />
                      <Input
                        placeholder="Search shared inventory..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Rings">Rings</SelectItem>
                      <SelectItem value="Necklaces">Necklaces</SelectItem>
                      <SelectItem value="Earrings">Earrings</SelectItem>
                      <SelectItem value="Bracelets">Bracelets</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="visible">Visible</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Grid/List */}
            {filteredInventory.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Share2 className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-emerald-900 mb-2">No Shared Inventory</h3>
                  <p className="text-emerald-600 mb-4">Start sharing your inventory to connect with other professionals</p>
                  <Button onClick={handleShareInventory} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Share Your First Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredInventory.map((item) => (
                  <Card key={item.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-emerald-900">{item.name}</h3>
                          <p className="text-sm text-emerald-600">{item.sku}</p>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {item.category}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <Package className="h-4 w-4 mr-2 text-emerald-600" />
                          <span className="text-emerald-700">Qty: {item.can_view_quantity ? item.quantity : '***'}</span>
                        </div>
                        
                        {item.can_view_pricing ? (
                          <div className="flex items-center text-sm">
                            <DollarSign className="h-4 w-4 mr-2 text-emerald-600" />
                            <span className="text-emerald-700">${item.price.toLocaleString()}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-sm">
                            <EyeOff className="h-4 w-4 mr-2 text-emerald-600" />
                            <span className="text-emerald-700">Price Hidden</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleManageSharing(item.id)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewAnalytics(item.id)}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-emerald-600" />
                  Pending Requests
                </CardTitle>
                <CardDescription>
                  Manage requests from other professionals for your shared inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                    <p className="text-emerald-600">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-emerald-900">{request.requester_name}</h4>
                          <p className="text-sm text-emerald-600">{request.company}</p>
                          <p className="text-sm text-emerald-700">Requesting: {request.inventory_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{request.request_type}</Badge>
                          <Button size="sm" variant="outline">Review</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partner Access Tab */}
          <TabsContent value="partner_access" className="space-y-6">
            <PartnerInventoryAccessPanel />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Metrics */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                    Engagement Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700">Total Views</span>
                      <span className="font-semibold text-emerald-900">{sharingStats?.total_views || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700">Quote Requests</span>
                      <span className="font-semibold text-emerald-900">{sharingStats?.total_quote_requests || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700">Order Requests</span>
                      <span className="font-semibold text-emerald-900">{sharingStats?.total_order_requests || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700">Engagement Rate</span>
                      <span className="font-semibold text-emerald-900">
                        {((sharingStats?.average_engagement_rate || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-emerald-600" />
                    Top Performing Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sharingStats?.top_performing_items?.slice(0, 5).map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-emerald-50 rounded">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-emerald-900 mr-2">#{index + 1}</span>
                          <span className="text-sm text-emerald-700">{item.name}</span>
                        </div>
                        <span className="text-sm text-emerald-600">{item.total_views} views</span>
                      </div>
                    ))}
                    {(!sharingStats?.top_performing_items || sharingStats.top_performing_items.length === 0) && (
                      <p className="text-emerald-600 text-center py-4">No performance data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
