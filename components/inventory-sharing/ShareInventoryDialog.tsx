"use client"

import { useState, useEffect } from 'react'
import { 
  Share2, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Users, 
  Lock, 
  Globe, 
  Settings,
  Plus,
  X,
  Check,
  Building,
  Package,
  Tag,
  Search,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Types
interface NetworkConnection {
  id: string
  name: string
  company: string
  title: string
  specialties: string[]
  location: string
  trusted: boolean
  email?: string
}

interface InventoryItem {
  id: string
  sku: string
  name: string
  description?: string
  category?: string
  price: number
  status: string
  images?: string[]
}

interface SharingSettings {
  visibility_level: 'public' | 'connections_only' | 'specific_connections'
  show_pricing: boolean
  show_quantity: boolean
  allow_quote_requests: boolean
  allow_order_requests: boolean
  b2b_enabled: boolean
  b2b_minimum_order_amount?: number
  b2b_payment_terms?: string
  b2b_shipping_terms?: string
  selected_connections: string[]
}

interface ShareInventoryDialogProps {
  open?: boolean
  onOpenChange: ((open: boolean) => void) | null
  selectedItems?: InventoryItem[]
  onSuccess?: (() => void) | null
}

export function ShareInventoryDialog({ 
  open = false, 
  onOpenChange, 
  selectedItems = [], 
  onSuccess 
}: ShareInventoryDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form state
  const [itemsToShare, setItemsToShare] = useState<InventoryItem[]>(selectedItems || [])
  const [sharingSettings, setSharingSettings] = useState<SharingSettings>({
    visibility_level: 'connections_only',
    show_pricing: true,
    show_quantity: true,
    allow_quote_requests: true,
    allow_order_requests: false,
    b2b_enabled: false,
    b2b_minimum_order_amount: 0,
    b2b_payment_terms: 'net_30',
    b2b_shipping_terms: 'fob_origin',
    selected_connections: []
  })
  
  // Data state
  const [availableInventory, setAvailableInventory] = useState<InventoryItem[]>([])
  const [networkConnections, setNetworkConnections] = useState<NetworkConnection[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Fetch available inventory and network connections
  useEffect(() => {
    if (open || false) {
      fetchAvailableInventory()
      fetchNetworkConnections()
    }
      }, [open || false])

  // Filter inventory based on search and category
  useEffect(() => {
                  let filtered = availableInventory || []

                    if (searchQuery) {
                  filtered = filtered.filter(item => 
                    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
                  )
                }

                    if (selectedCategory !== 'all') {
                  filtered = filtered.filter(item => (item.category || '') === selectedCategory)
                }

    setFilteredInventory && setFilteredInventory(filtered)
      }, [searchQuery || '', selectedCategory || 'all', availableInventory || []])

  const fetchAvailableInventory = async () => {
    try {
      const response = await fetch('/api/inventory')
      if (response.ok) {
                          const data = await response.json()
                  setAvailableInventory && setAvailableInventory((data && data.data) || [])
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
      toast && toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive"
      })
    }
  }

  const fetchNetworkConnections = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockConnections: NetworkConnection[] = [
        {
          id: "1",
          name: "Ava Thompson",
          company: "Thompson Fine Jewelry",
          title: "Owner & Designer",
          specialties: ["Designer", "Manufacturer"],
          location: "New York, NY",
          trusted: true,
          email: "ava@thompsonjewelry.com"
        },
        {
          id: "2",
          name: "Miguel Santos",
          company: "Santos Gems Intl.",
          title: "Gem Dealer",
          specialties: ["Gem Dealer", "Supplier"],
          location: "Miami, FL",
          trusted: false,
          email: "miguel@santosgems.com"
        },
        {
          id: "3",
          name: "Priya Patel",
          company: "Patel Jewelers",
          title: "Retail Manager",
          specialties: ["Retailer"],
          location: "San Francisco, CA",
          trusted: true,
          email: "priya@pateljewelers.com"
        }
      ]
                        setNetworkConnections && setNetworkConnections(mockConnections)
    } catch (error) {
      console.error('Failed to fetch network connections:', error)
    }
  }

  const handleItemSelection = (itemId: string, selected: boolean) => {
    if (selected) {
      const item = (availableInventory || []).find(i => (i.id || 'unknown') === itemId)
      if (item) {
        setItemsToShare && setItemsToShare(prev => [...(prev || []), item])
      }
    } else {
              setItemsToShare && setItemsToShare(prev => (prev || []).filter(i => (i.id || 'unknown') !== itemId))
    }
  }

  const handleConnectionSelection = (connectionId: string, selected: boolean) => {
    if (selected) {
      setSharingSettings && setSharingSettings(prev => ({
        ...prev,
        selected_connections: [...(prev.selected_connections || []), connectionId]
      }))
    } else {
      setSharingSettings && setSharingSettings(prev => ({
        ...prev,
        selected_connections: (prev.selected_connections || []).filter(id => (id || 'unknown') !== connectionId)
      }))
    }
  }

  const handleNextStep = () => {
    if (currentStep === 1 && (itemsToShare || []).length === 0) {
      toast && toast({
        title: "No Items Selected",
        description: "Please select at least one inventory item to share",
        variant: "destructive"
      })
      return
    }
    if (currentStep === 2 && sharingSettings.visibility_level === 'specific_connections' && (sharingSettings.selected_connections || []).length === 0) {
      toast({
        title: "No Connections Selected",
        description: "Please select at least one connection to share with",
        variant: "destructive"
      })
      return
    }
    setCurrentStep && setCurrentStep(prev => Math.min((prev || 1) + 1, 3))
  }

  const handlePreviousStep = () => {
    setCurrentStep && setCurrentStep(prev => Math.max((prev || 1) - 1, 1))
  }

  const handleSubmit = async () => {
    if ((itemsToShare || []).length === 0) {
      toast && toast({
        title: "No Items Selected",
        description: "Please select at least one inventory item to share",
        variant: "destructive"
      })
      return
    }

    setIsLoading && setIsLoading(true)
    try {
      const response = await fetch('/api/inventory-sharing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: itemsToShare.map(item => ({
            inventory_id: item.id,
            sku: item.sku || 'N/A',
            name: item.name || 'Unnamed Item',
            category: item.category || 'Uncategorized',
            price: item.price || 0
          })),
          settings: sharingSettings
        }),
      })

      if (response.ok) {
        toast && toast({
          title: "Success",
          description: `Successfully shared ${(itemsToShare || []).length} item(s)`,
        })
        onSuccess && onSuccess()
        onOpenChange && onOpenChange(false)
        // Reset form
        setItemsToShare && setItemsToShare([])
        setCurrentStep && setCurrentStep(1)
        setSharingSettings && setSharingSettings({
          visibility_level: 'connections_only',
          show_pricing: true,
          show_quantity: true,
          allow_quote_requests: true,
          allow_order_requests: false,
          b2b_enabled: false,
          b2b_minimum_order_amount: 0,
          b2b_payment_terms: 'net_30',
          b2b_shipping_terms: 'fob_origin',
          selected_connections: []
        })
      } else {
        const error = await response.json()
        throw new Error((error && error.error) || 'Failed to share inventory')
      }
    } catch (error: any) {
      toast && toast({
        title: "Error",
        description: (error && error.message) || 'Failed to share inventory',
        variant: "destructive"
      })
    } finally {
      setIsLoading && setIsLoading(false)
    }
  }

  const onCancel = () => {
    onOpenChange && onOpenChange(false)
    setItemsToShare && setItemsToShare([])
    setCurrentStep && setCurrentStep(1)
  }

  return (
                    <Dialog open={open || false} onOpenChange={onOpenChange || undefined}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">
            Share Your Inventory
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                              (currentStep || 1) >= step 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                                                {(currentStep || 1) > step ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                            (currentStep || 1) > step ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Select Items */}
          {(currentStep || 1) === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Select Inventory Items to Share
                </h3>
                <p className="text-slate-600">
                  Choose which items you want to make available to your network
                </p>
              </div>

              {/* Search and Filters */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search inventory by name or SKU..."
                    value={searchQuery || ''}
                                                    onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory || 'all'} onValueChange={(value) => setSelectedCategory && setSelectedCategory(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Rings">Rings</SelectItem>
                    <SelectItem value="Necklaces">Necklaces</SelectItem>
                    <SelectItem value="Bracelets">Bracelets</SelectItem>
                    <SelectItem value="Earrings">Earrings</SelectItem>
                    <SelectItem value="Watches">Watches</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Inventory Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {(filteredInventory || []).map((item) => {
                  const isSelected = (itemsToShare || []).some(i => (i.id || 'unknown') === (item.id || 'unknown'))
                  return (
                    <Card 
                      key={item.id || 'unknown'} 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        (isSelected || false) ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
                      }`}
                      onClick={() => handleItemSelection(item.id || 'unknown', !(isSelected || false))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Checkbox
                                checked={isSelected || false}
                                onChange={() => handleItemSelection(item.id || 'unknown', !(isSelected || false))}
                                aria-label={`Select ${item.name || 'item'}`}
                                id={`checkbox-${item.id || 'unknown'}`}
                              />
                              <h4 className="font-semibold text-slate-800 line-clamp-2">{item.name || 'Unnamed Item'}</h4>
                            </div>
                            <div className="space-y-1 text-sm text-slate-600">
                              <p><span className="font-medium">SKU:</span> {item.sku || 'N/A'}</p>
                              <p><span className="font-medium">Category:</span> {item.category || 'Uncategorized'}</p>
                              <p><span className="font-medium">Price:</span> ${(item.price || 0).toLocaleString()}</p>
                              <p><span className="font-medium">Status:</span> {item.status || 'Unknown'}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {(filteredInventory || []).length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No inventory items found matching your search criteria.
                </div>
              )}
            </div>
          )}

          {/* Step 2: Configure Sharing Settings */}
          {(currentStep || 1) === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Configure Sharing Settings
                </h3>
                <p className="text-slate-600">
                  Set visibility, pricing, and permissions for your shared inventory
                </p>
              </div>

              {/* Visibility Level */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Visibility Level</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'public', label: 'Public', icon: Globe, description: 'Visible to everyone' },
                    { value: 'connections_only', label: 'Connections Only', icon: Users, description: 'Visible to your network' },
                    { value: 'specific_connections', label: 'Specific Connections', icon: Lock, description: 'Choose who can see' }
                  ].map((option) => (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        sharingSettings.visibility_level === option.value
                          ? 'ring-2 ring-emerald-500 bg-emerald-50'
                          : ''
                      }`}
                                                        onClick={() => setSharingSettings && setSharingSettings(prev => ({ ...prev, visibility_level: option.value as any }))}
                    >
                      <CardContent className="p-4 text-center">
                        <option.icon className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                        <h4 className="font-semibold text-slate-800 mb-1">{option.label}</h4>
                        <p className="text-sm text-slate-600">{option.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Specific Connections Selection */}
              {sharingSettings.visibility_level === 'specific_connections' && (
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Select Connections</Label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-48 overflow-y-auto">
                                {(networkConnections || []).map((connection) => (
                                          <Card
                      key={connection.id || 'unknown'}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                                                      (sharingSettings.selected_connections || []).includes(connection.id || 'unknown')
                            ? 'ring-2 ring-emerald-500 bg-emerald-50'
                            : ''
                        }`}
                        onClick={() => handleConnectionSelection(
                          connection.id || 'unknown', 
                          !(sharingSettings.selected_connections || []).includes(connection.id || 'unknown')
                        )}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={(sharingSettings.selected_connections || []).includes(connection.id || 'unknown')}
                              onChange={() => handleConnectionSelection(
                                connection.id || 'unknown', 
                                !(sharingSettings.selected_connections || []).includes(connection.id || 'unknown')
                              )}
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800">{connection.name || 'Unknown Name'}</h4>
                              <p className="text-sm text-slate-600">{connection.company || 'Unknown Company'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {(connection.specialties || []).map((specialty) => (
                                                                      <Badge key={specialty || 'unknown'} variant="secondary" className="text-xs">
                                      {specialty || 'Unknown'}
                                    </Badge>
                                ))}
                                {(connection.trusted || false) && (
                                  <Badge variant="default" className="text-xs bg-emerald-500">
                                    Trusted
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Display Options */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Display Options</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-pricing"
                      checked={sharingSettings.show_pricing || false}
                      onCheckedChange={(checked) => 
                        setSharingSettings && setSharingSettings(prev => ({ ...prev, show_pricing: checked as boolean }))
                      }
                    />
                    <Label htmlFor="show-pricing" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Show pricing to viewers
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-quantity"
                      checked={sharingSettings.show_quantity || false}
                      onCheckedChange={(checked) => 
                        setSharingSettings && setSharingSettings(prev => ({ ...prev, show_quantity: checked as boolean }))
                      }
                    />
                    <Label htmlFor="show-quantity" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Show quantity to viewers
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allow-quotes"
                      checked={sharingSettings.allow_quote_requests || false}
                      onCheckedChange={(checked) => 
                        setSharingSettings && setSharingSettings(prev => ({ ...prev, allow_quote_requests: checked as boolean }))
                      }
                    />
                    <Label htmlFor="allow-quotes" className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Allow quote requests
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allow-orders"
                      checked={sharingSettings.allow_order_requests || false}
                      onCheckedChange={(checked) => 
                        setSharingSettings && setSharingSettings(prev => ({ ...prev, allow_order_requests: checked as boolean }))
                      }
                    />
                    <Label htmlFor="allow-orders" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Allow order requests
                    </Label>
                  </div>
                </div>
              </div>

              {/* B2B Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="b2b-enabled"
                    checked={sharingSettings.b2b_enabled || false}
                    onCheckedChange={(checked) => 
                      setSharingSettings && setSharingSettings(prev => ({ ...prev, b2b_enabled: checked as boolean }))
                    }
                  />
                  <Label htmlFor="b2b-enabled" className="text-base font-semibold">
                    Enable B2B Features
                  </Label>
                </div>

                {sharingSettings.b2b_enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="min-order">Minimum Order Amount ($)</Label>
                      <Input
                        id="min-order"
                        type="number"
                        min="0"
                        value={sharingSettings.b2b_minimum_order_amount || 0}
                                                            onChange={(e) => setSharingSettings && setSharingSettings(prev => ({ 
                                      ...prev, 
                                      b2b_minimum_order_amount: parseFloat(e.target.value) || 0 
                                    }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment-terms">Payment Terms</Label>
                      <Select 
                        value={sharingSettings.b2b_payment_terms || 'net_30'} 
                                                            onValueChange={(value) => setSharingSettings && setSharingSettings(prev => ({ ...prev, b2b_payment_terms: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="net_30">Net 30</SelectItem>
                          <SelectItem value="net_60">Net 60</SelectItem>
                          <SelectItem value="net_90">Net 90</SelectItem>
                          <SelectItem value="cod">Cash on Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping-terms">Shipping Terms</Label>
                      <Select 
                        value={sharingSettings.b2b_shipping_terms || 'fob_origin'} 
                                                            onValueChange={(value) => setSharingSettings && setSharingSettings(prev => ({ ...prev, b2b_shipping_terms: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fob_origin">FOB Origin</SelectItem>
                          <SelectItem value="fob_destination">FOB Destination</SelectItem>
                          <SelectItem value="ex_works">Ex Works</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review and Share */}
          {(currentStep || 1) === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Review and Share
                </h3>
                <p className="text-slate-600">
                  Review your selections and sharing settings before sharing
                </p>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Items to Share</CardTitle>
                  </CardHeader>
                  <CardContent>
                                          <div className="space-y-2">
                        {(itemsToShare || []).map((item) => (
                                                            <div key={item.id || 'unknown'} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                      <div>
                                        <p className="font-medium">{item.name || 'Unnamed Item'}</p>
                                        <p className="text-sm text-slate-600">{item.sku || 'N/A'}</p>
                                      </div>
                                      <p className="font-semibold text-emerald-600">${(item.price || 0).toLocaleString()}</p>
                                    </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-slate-600">
                        Total Items: <span className="font-semibold">{(itemsToShare || []).length}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sharing Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Visibility:</span>
                        <span className="ml-2 capitalize">{(sharingSettings.visibility_level || 'connections_only').replace('_', ' ')}</span>
                      </div>
                      {(sharingSettings.visibility_level || 'connections_only') === 'specific_connections' && (
                        <div>
                          <span className="font-medium">Selected Connections:</span>
                          <div className="mt-1 space-y-1">
                            {(networkConnections || [])
                              .filter(c => (sharingSettings.selected_connections || []).includes(c.id || 'unknown'))
                              .map(c => (
                                <Badge key={c.id || 'unknown'} variant="secondary" className="mr-1">
                                  {c.name || 'Unknown'}
                                </Badge>
                              ))
                            }
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Display Options:</span>
                        <div className="mt-1 space-y-1 text-sm">
                          <p>• Pricing: {(sharingSettings.show_pricing || false) ? 'Visible' : 'Hidden'}</p>
                          <p>• Quantity: {(sharingSettings.show_quantity || false) ? 'Visible' : 'Hidden'}</p>
                          <p>• Quote Requests: {(sharingSettings.allow_quote_requests || false) ? 'Allowed' : 'Not Allowed'}</p>
                          <p>• Order Requests: {(sharingSettings.allow_order_requests || false) ? 'Allowed' : 'Not Allowed'}</p>
                        </div>
                      </div>
                      {(sharingSettings.b2b_enabled || false) && (
                        <div>
                          <span className="font-medium">B2B Settings:</span>
                          <div className="mt-1 space-y-1 text-sm">
                                                    <p>• Min Order: ${(sharingSettings.b2b_minimum_order_amount || 0).toLocaleString()}</p>
                        <p>• Payment: {(sharingSettings.b2b_payment_terms || 'net_30').replace('_', ' ').toUpperCase()}</p>
                        <p>• Shipping: {(sharingSettings.b2b_shipping_terms || 'fob_origin').replace('_', ' ').toUpperCase()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <DialogFooter className="flex justify-between">
                      <Button
              variant="outline"
              onClick={(currentStep || 1) === 1 ? onCancel : handlePreviousStep}
              disabled={isLoading || false}
            >
                                    {(currentStep || 1) === 1 ? 'Cancel' : 'Previous'}
          </Button>
          
          <div className="flex gap-2">
            {(currentStep || 1) < 3 && (
                                        <Button
                            onClick={handleNextStep}
                            disabled={isLoading || false}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                Next
              </Button>
            )}
            
            {(currentStep || 1) === 3 && (
              <Button
                onClick={handleSubmit}
                disabled={isLoading || (itemsToShare || []).length === 0}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Inventory
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
