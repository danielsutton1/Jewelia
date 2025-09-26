"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Download, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"

interface MarketplaceIntegration {
  id: string
  name: string
  description: string
  developer: string
  developerEmail: string
  category: string
  pricing: {
    model: string
    amount?: number
    currency: string
    billingCycle?: string
    freeTier?: {
      requestsPerMonth: number
      features: string[]
    }
  }
  features: string[]
  requirements: string[]
  documentation: string
  supportEmail: string
  supportUrl: string
  version: string
  isPublished: boolean
  isVerified: boolean
  rating: number
  reviewCount: number
  downloadCount: number
  tags: string[]
  screenshots?: string[]
  demoUrl?: string
}

export function IntegrationMarketplace() {
  const [integrations, setIntegrations] = useState<MarketplaceIntegration[]>([])
  const [filteredIntegrations, setFilteredIntegrations] = useState<MarketplaceIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPricingModel, setSelectedPricingModel] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("rating")
  const [sortOrder, setSortOrder] = useState<string>("desc")

  useEffect(() => {
    fetchIntegrations()
  }, [])

  useEffect(() => {
    filterAndSortIntegrations()
  }, [integrations, searchTerm, selectedCategory, selectedPricingModel, sortBy, sortOrder])

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations/marketplace')
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortIntegrations = () => {
    let filtered = [...integrations]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(integration =>
        integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(integration => integration.category === selectedCategory)
    }

    // Apply pricing model filter
    if (selectedPricingModel !== "all") {
      filtered = filtered.filter(integration => integration.pricing.model === selectedPricingModel)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof MarketplaceIntegration]
      let bValue = b[sortBy as keyof MarketplaceIntegration]

      // Handle undefined values
      if (aValue === undefined) aValue = ''
      if (bValue === undefined) bValue = ''

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredIntegrations(filtered)
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      design_tools: 'Design Tools',
      inventory_management: 'Inventory Management',
      accounting_finance: 'Accounting & Finance',
      ecommerce_sales: 'E-commerce & Sales',
      supplier_management: 'Supplier Management',
      quality_control: 'Quality Control',
      production_management: 'Production Management',
      customer_management: 'Customer Management',
      pricing_calculators: 'Pricing Calculators',
      certification_systems: 'Certification Systems',
      analytics_reporting: 'Analytics & Reporting',
      communication_tools: 'Communication Tools',
      project_management: 'Project Management',
      time_tracking: 'Time Tracking',
      other: 'Other'
    }
    return labels[category] || category
  }

  const getPricingLabel = (pricing: any) => {
    switch (pricing.model) {
      case 'free':
        return 'Free'
      case 'one_time':
        return `$${pricing.amount} (One-time)`
      case 'subscription':
        return `$${pricing.amount}/${pricing.billingCycle}`
      case 'usage_based':
        return `$${pricing.amount}/request`
      default:
        return 'Contact for pricing'
    }
  }

  const handleInstall = async (integration: MarketplaceIntegration) => {
    try {
      // In a real implementation, this would trigger the installation process
      console.log('Installing integration:', integration.name)
      // You could show a modal with installation options here
    } catch (error) {
      console.error('Error installing integration:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading integrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Integration Marketplace</h2>
          <p className="text-muted-foreground">
            Discover and install powerful integrations to extend your Jewelia CRM functionality
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="design_tools">Design Tools</SelectItem>
                <SelectItem value="inventory_management">Inventory Management</SelectItem>
                <SelectItem value="accounting_finance">Accounting & Finance</SelectItem>
                <SelectItem value="ecommerce_sales">E-commerce & Sales</SelectItem>
                <SelectItem value="supplier_management">Supplier Management</SelectItem>
                <SelectItem value="quality_control">Quality Control</SelectItem>
                <SelectItem value="production_management">Production Management</SelectItem>
                <SelectItem value="customer_management">Customer Management</SelectItem>
                <SelectItem value="pricing_calculators">Pricing Calculators</SelectItem>
                <SelectItem value="certification_systems">Certification Systems</SelectItem>
                <SelectItem value="analytics_reporting">Analytics & Reporting</SelectItem>
                <SelectItem value="communication_tools">Communication Tools</SelectItem>
                <SelectItem value="project_management">Project Management</SelectItem>
                <SelectItem value="time_tracking">Time Tracking</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPricingModel} onValueChange={setSelectedPricingModel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Pricing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pricing</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="one_time">One-time</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="usage_based">Usage-based</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="downloadCount">Downloads</SelectItem>
                <SelectItem value="version">Version</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredIntegrations.length} of {integrations.length} integrations
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription className="mt-1">
                    by {integration.developer}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-1">
                  {integration.isVerified && (
                    <div className="relative group">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Verified
                      </div>
                    </div>
                  )}
                  <Badge variant={integration.isPublished ? "default" : "secondary"}>
                    {integration.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {integration.description}
              </p>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{integration.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({integration.reviewCount})
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Download className="h-4 w-4" />
                  <span className="text-xs">{integration.downloadCount}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {getCategoryLabel(integration.category)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  v{integration.version}
                </Badge>
                {integration.pricing.model === 'free' && (
                  <Badge variant="secondary" className="text-xs">
                    Free
                  </Badge>
                )}
              </div>

              <div className="text-sm">
                <span className="font-medium">Pricing:</span> {getPricingLabel(integration.pricing)}
              </div>

              <div className="flex flex-wrap gap-1">
                {integration.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {integration.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{integration.tags.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={() => handleInstall(integration)}
                  className="flex-1"
                  size="sm"
                >
                  Install
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(integration.documentation, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                {integration.demoUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(integration.demoUrl, '_blank')}
                  >
                    Demo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No integrations found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or browse all categories
          </p>
        </div>
      )}
    </div>
  )
}
