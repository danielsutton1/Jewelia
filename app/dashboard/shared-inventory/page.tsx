"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Eye, 
  MessageSquare, 
  ShoppingCart, 
  Package,
  DollarSign,
  EyeOff,
  Star,
  MapPin,
  Building,
  Heart,
  Share2,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { SharedInventoryItem, SharedInventoryFilters } from '@/types/inventory-sharing'
import { AIRecommendations } from '@/components/inventory-sharing/AIRecommendations'
import { QuoteRequestModal } from '@/components/inventory-sharing/QuoteRequestModal'

// =====================================================
// SHARED INVENTORY BROWSER PAGE
// =====================================================

export default function SharedInventoryBrowserPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SharedInventoryFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [connectedPartners, setConnectedPartners] = useState<any[]>([])
  const [selectedPartner, setSelectedPartner] = useState<string>('all')
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState<SharedInventoryItem | null>(null)
  
  // Data state
  const [sharedInventory, setSharedInventory] = useState<SharedInventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<SharedInventoryItem[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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

  // Fetch shared inventory when user ID is available
  useEffect(() => {
    if (currentUserId) {
      fetchSharedInventory()
      fetchConnectedPartners()
    }
  }, [currentUserId, currentPage, filters])

  // Apply filters when search or filters change
  useEffect(() => {
    applyFilters()
  }, [searchQuery, filters, sharedInventory])

  const fetchSharedInventory = async () => {
    try {
      setIsLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })

      if (searchQuery) params.append('query', searchQuery)
      if (filters.category) params.append('category', filters.category)
      if (filters.subcategory) params.append('subcategory', filters.subcategory)
      if (filters.metal_type) params.append('metal_type', filters.metal_type)
      if (filters.gemstone_type) params.append('gemstone_type', filters.gemstone_type)
      if (filters.price_min !== undefined) params.append('price_min', filters.price_min.toString())
      if (filters.price_max !== undefined) params.append('price_max', filters.price_max.toString())
      if (filters.weight_min !== undefined) params.append('weight_min', filters.weight_min.toString())
      if (filters.weight_max !== undefined) params.append('weight_max', filters.weight_max.toString())
      if (filters.brand) params.append('brand', filters.brand)
      if (filters.b2b_enabled !== undefined) params.append('b2b_enabled', filters.b2b_enabled.toString())
      if (filters.show_pricing !== undefined) params.append('show_pricing', filters.show_pricing.toString())
      if (selectedPartner !== 'all') params.append('partner_id', selectedPartner)

      // Fetch from inventory sharing search API
      const response = await fetch(`/api/inventory-sharing/search?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setSharedInventory(data.data || [])
        setTotalResults(data.total || 0)
        setTotalPages(Math.ceil((data.total || 0) / 20))
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

  const fetchConnectedPartners = async () => {
    try {
      const response = await fetch('/api/network/connections')
      if (response.ok) {
        const data = await response.json()
        setConnectedPartners(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching connected partners:', error)
    }
  }

  const applyFilters = () => {
    let filtered = sharedInventory

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category)
    }

    // Apply subcategory filter
    if (filters.subcategory && filters.subcategory !== 'all') {
      filtered = filtered.filter(item => item.subcategory === filters.subcategory)
    }

    // Apply metal type filter
    if (filters.metal_type && filters.metal_type !== 'all') {
      filtered = filtered.filter(item => item.metal_type === filters.metal_type)
    }

    // Apply gemstone type filter
    if (filters.gemstone_type && filters.gemstone_type !== 'all') {
      filtered = filtered.filter(item => item.gemstone_type === filters.gemstone_type)
    }

    // Apply price filters
    if (filters.price_min !== undefined) {
      filtered = filtered.filter(item => item.can_view_pricing && item.price >= filters.price_min!)
    }
    if (filters.price_max !== undefined) {
      filtered = filtered.filter(item => item.can_view_pricing && item.price <= filters.price_max!)
    }

    // Apply weight filters
    if (filters.weight_min !== undefined) {
      filtered = filtered.filter(item => item.weight_grams && item.weight_grams >= filters.weight_min!)
    }
    if (filters.weight_max !== undefined) {
      filtered = filtered.filter(item => item.weight_grams && item.weight_grams <= filters.weight_max!)
    }

    // Apply brand filter
    if (filters.brand && filters.brand !== 'all') {
      filtered = filtered.filter(item => item.brand === filters.brand)
    }

    // Apply B2B filter
    if (filters.b2b_enabled !== undefined) {
      // This would check if the item has B2B enabled
      // For now, we'll skip this filter
    }

    // Apply pricing visibility filter
    if (filters.show_pricing !== undefined) {
      filtered = filtered.filter(item => item.can_view_pricing === filters.show_pricing)
    }

    setFilteredInventory(filtered)
  }

  const handleRequestOrder = (item: SharedInventoryItem) => {
    router.push(`/dashboard/shared-inventory/request-order/${item.id}`)
  }

  const handleViewDetails = (item: SharedInventoryItem) => {
    router.push(`/dashboard/shared-inventory/details/${item.id}`)
  }

  const handleContactOwner = (item: SharedInventoryItem) => {
    router.push(`/dashboard/messaging?recipient=${item.sharing?.owner?.id || ''}`)
  }

  const handleRequestAccess = async (item: SharedInventoryItem) => {
    try {
      const response = await fetch('/api/partner-inventory/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          partner_id: item.sharing?.owner?.id,
          inventory_id: item.id,
          access_type: 'view',
          message: 'I would like to request access to view this inventory item.'
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Access request sent successfully"
        })
      } else {
        throw new Error('Failed to send access request')
      }
    } catch (error) {
      console.error('Error requesting access:', error)
      toast({
        title: "Error",
        description: "Failed to send access request",
        variant: "destructive"
      })
    }
  }

  const handleRequestQuote = (item: SharedInventoryItem) => {
    setSelectedInventory(item)
    setShowQuoteModal(true)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4">
        <div className="w-full">
          <div className="text-center py-12">
            <div className="p-6 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full mb-6 inline-block">
              <Search className="h-16 w-16 text-emerald-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">Loading Shared Inventory</h3>
            <p className="text-emerald-600">Discovering inventory from your network...</p>
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
              <h1 className="text-3xl font-bold text-emerald-900">Shared Inventory</h1>
              <p className="text-emerald-600">Discover inventory from your professional network</p>
            </div>
            <div className="flex items-center gap-2">
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

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-600" />
              <Input
                placeholder="Search shared inventory by name, description, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-20"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Partner Filter */}
                    <div>
                      <label className="text-sm font-medium text-emerald-700 mb-2 block">Partner</label>
                      <Select 
                        value={selectedPartner} 
                        onValueChange={setSelectedPartner}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Partners" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Partners</SelectItem>
                          {connectedPartners.map((partner) => (
                            <SelectItem key={partner.id} value={partner.id}>
                              {partner.name} ({partner.company})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-sm font-medium text-emerald-700 mb-2 block">Category</label>
                      <Select 
                        value={filters.category || 'all'} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? undefined : value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="Rings">Rings</SelectItem>
                          <SelectItem value="Necklaces">Necklaces</SelectItem>
                          <SelectItem value="Earrings">Earrings</SelectItem>
                          <SelectItem value="Bracelets">Bracelets</SelectItem>
                          <SelectItem value="Watches">Watches</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Metal Type */}
                    <div>
                      <label className="text-sm font-medium text-emerald-700 mb-2 block">Metal Type</label>
                      <Select 
                        value={filters.metal_type || 'all'} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, metal_type: value === 'all' ? undefined : value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Metals" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Metals</SelectItem>
                          <SelectItem value="White Gold">White Gold</SelectItem>
                          <SelectItem value="Yellow Gold">Yellow Gold</SelectItem>
                          <SelectItem value="Rose Gold">Rose Gold</SelectItem>
                          <SelectItem value="Platinum">Platinum</SelectItem>
                          <SelectItem value="Silver">Silver</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-medium text-emerald-700 mb-2 block">Price Range</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min"
                          type="number"
                          value={filters.price_min || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, price_min: e.target.value ? parseFloat(e.target.value) : undefined }))}
                          className="w-20"
                        />
                        <span className="text-emerald-600 self-center">-</span>
                        <Input
                          placeholder="Max"
                          type="number"
                          value={filters.price_max || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, price_max: e.target.value ? parseFloat(e.target.value) : undefined }))}
                          className="w-20"
                        />
                      </div>
                    </div>

                    {/* Show Pricing */}
                    <div>
                      <label className="text-sm font-medium text-emerald-700 mb-2 block">Pricing</label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-pricing"
                            checked={filters.show_pricing === true}
                            onCheckedChange={(checked) => setFilters(prev => ({ ...prev, show_pricing: checked ? true : undefined }))}
                          />
                          <label htmlFor="show-pricing" className="text-sm text-emerald-700">Show pricing</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="b2b-enabled"
                            checked={filters.b2b_enabled === true}
                            onCheckedChange={(checked) => setFilters(prev => ({ ...prev, b2b_enabled: checked ? true : undefined }))}
                          />
                          <label htmlFor="b2b-enabled" className="text-sm text-emerald-700">B2B enabled</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-emerald-600">
              Showing {filteredInventory.length} of {totalResults} items
            </p>
            {Object.keys(filters).length > 0 && (
              <Badge variant="secondary" className="cursor-pointer" onClick={clearFilters}>
                {Object.keys(filters).length} filters active
              </Badge>
            )}
          </div>
        </div>

        {/* Inventory Grid/List */}
        {filteredInventory.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Search className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-emerald-900 mb-2">No Items Found</h3>
              <p className="text-emerald-600 mb-4">
                {searchQuery || Object.keys(filters).length > 0 
                  ? 'Try adjusting your search or filters'
                  : 'No inventory is currently shared with you'
                }
              </p>
              {(searchQuery || Object.keys(filters).length > 0) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredInventory.map((item) => (
              <Card key={item.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {/* Item Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-emerald-900">{item.name}</h3>
                      <p className="text-sm text-emerald-600">{item.sku}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Heart className="h-4 w-4 text-emerald-600" />
                      </Button>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-emerald-700 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center text-sm">
                      <Package className="h-4 w-4 mr-2 text-emerald-600" />
                      <span className="text-emerald-700">
                        Qty: {item.can_view_quantity ? item.quantity : '***'}
                      </span>
                    </div>
                    
                    {item.can_view_pricing ? (
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-2 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">
                          ${item.price.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-sm">
                        <EyeOff className="h-4 w-4 mr-2 text-emerald-600" />
                        <span className="text-emerald-700">Price available on request</span>
                      </div>
                    )}

                    {/* Specifications */}
                    <div className="text-xs text-emerald-600 space-y-1">
                      {item.metal_type && (
                        <div>Metal: {item.metal_type} {item.metal_purity}</div>
                      )}
                      {item.gemstone_type && (
                        <div>Stone: {item.gemstone_type} {item.gemstone_carat}ct</div>
                      )}
                      {item.weight_grams && (
                        <div>Weight: {item.weight_grams}g</div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewDetails(item)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleContactOwner(item)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>

                  {/* Access Request Button */}
                  {!item.is_visible_to_viewer && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleRequestAccess(item)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Request Access
                    </Button>
                  )}

                  {/* Request Buttons */}
                  <div className="flex gap-2">
                    {item.can_request_quote && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleRequestQuote(item)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request Quote
                      </Button>
                    )}
                    {item.can_place_order && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleRequestOrder(item)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Request Order
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="text-emerald-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {currentUserId && (
          <div className="mt-12">
            <AIRecommendations 
              userId={currentUserId}
              showFeedback={true}
              showActions={false}
              maxItems={9}
            />
          </div>
        )}

        {/* Quote Request Modal */}
        {showQuoteModal && selectedInventory && (
          <QuoteRequestModal
            isOpen={showQuoteModal}
            onClose={() => {
              setShowQuoteModal(false)
              setSelectedInventory(null)
            }}
            inventory={{
              id: selectedInventory.id,
              name: selectedInventory.name,
              sku: selectedInventory.sku,
              price: selectedInventory.price,
              partner: {
                id: selectedInventory.sharing?.owner?.id || '',
                name: selectedInventory.sharing?.owner?.full_name || 'Unknown',
                company: selectedInventory.sharing?.owner?.company || 'Unknown'
              }
            }}
          />
        )}
      </div>
    </div>
  )
}
