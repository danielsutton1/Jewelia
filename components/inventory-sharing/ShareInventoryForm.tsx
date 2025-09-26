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
  Tag
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
  InventorySharingSettings, 
  SharedInventoryItem,
  VisibilityLevel,
  PricingTier 
} from '@/types/inventory-sharing'
import { InventorySharingService } from '@/lib/services/InventorySharingService'

// =====================================================
// SHARE INVENTORY FORM COMPONENT
// =====================================================

interface ShareInventoryFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
  sharingService?: InventorySharingService
}

export function ShareInventoryForm({ onSuccess, onCancel, className = '', sharingService }: ShareInventoryFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingInventory, setIsLoadingInventory] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form state
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sharingSettings, setSharingSettings] = useState<Partial<InventorySharingSettings>>({
    visibility_level: 'connections_only',
    show_pricing: true,
    show_quantity: true,
    allow_quote_requests: true,
    allow_order_requests: false,
    b2b_enabled: false,
    b2b_minimum_order_amount: 0,
    b2b_payment_terms: 'net_30',
    b2b_shipping_terms: 'fob_origin'
  })
  
  // Data state
  const [availableInventory, setAvailableInventory] = useState<SharedInventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<SharedInventoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Fetch available inventory
  useEffect(() => {
    fetchAvailableInventory()
  }, [])

  // Filter inventory based on search and category
  useEffect(() => {
    let filtered = Array.isArray(availableInventory) ? availableInventory : []

    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    setFilteredInventory(filtered)
  }, [searchQuery, selectedCategory, availableInventory])

  const fetchAvailableInventory = async () => {
    try {
      setIsLoadingInventory(true)
      const response = await fetch('/api/inventory')
      if (response.ok) {
        const data = await response.json()
        setAvailableInventory(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setIsLoadingInventory(false)
    }
  }

  const handleItemSelection = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId])
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId))
    }
  }

  const handleSelectAll = () => {
    const inventory = filteredInventory || []
    if (selectedItems.length === inventory.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(inventory.map(item => item.id))
    }
  }

  const handleNextStep = () => {
    if (currentStep === 1 && selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one inventory item to share",
        variant: "destructive"
      })
      return
    }
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one inventory item to share",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)

      if (sharingService) {
        // Use the service if provided (for testing)
        const sharingPromises = selectedItems.map(itemId => 
          sharingService.createInventorySharing({
            inventory_id: itemId,
            is_shared: true,
            ...sharingSettings
          } as InventorySharingSettings)
        )

        await Promise.all(sharingPromises)
      } else {
        // Fall back to API calls for production use
        const sharingPromises = selectedItems.map(itemId => 
          fetch('/api/inventory-sharing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              inventory_id: itemId,
              ...sharingSettings
            })
          })
        )

        const responses = await Promise.all(sharingPromises)
        const allSuccessful = responses.every(response => response.ok)

        if (!allSuccessful) {
          throw new Error('Some items failed to share')
        }
      }

      toast({
        title: "Success!",
        description: `Successfully shared ${selectedItems.length} inventory item(s)`,
      })
      onSuccess?.()
    } catch (error) {
      console.error('Error sharing inventory:', error)
      toast({
        title: "Error",
        description: "Failed to share inventory. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getVisibilityIcon = (level: VisibilityLevel) => {
    switch (level) {
      case 'public':
        return <Globe className="h-4 w-4" />
      case 'connections_only':
        return <Users className="h-4 w-4" />
      case 'specific_connections':
        return <Lock className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const getVisibilityDescription = (level: VisibilityLevel) => {
    switch (level) {
      case 'public':
        return 'Visible to all professionals in the network'
      case 'connections_only':
        return 'Visible only to your professional connections'
      case 'specific_connections':
        return 'Visible only to selected connections'
      default:
        return 'Private - not visible to others'
    }
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${currentStep >= step 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {currentStep > step ? <Check className="h-4 w-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`
                  w-16 h-1 mx-2
                  ${currentStep > step ? 'bg-emerald-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Select Items</span>
          <span>Configure Settings</span>
          <span>Review & Share</span>
        </div>
      </div>

      {/* Step 1: Select Inventory Items */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Select Inventory Items to Share
            </CardTitle>
            <CardDescription>
              Choose which inventory items you want to share with your professional network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search inventory by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
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
            </div>

            {/* Select All Button */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedItems.length === (filteredInventory || []).length ? 'Deselect All' : 'Select All'}
              </Button>
              <span className="text-sm text-gray-600">
                {selectedItems.length} of {(filteredInventory || []).length} items selected
              </span>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {isLoadingInventory ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Loading inventory...
                </div>
              ) : (
                (filteredInventory || []).map((item) => (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-all ${
                    selectedItems.includes(item.id) 
                      ? 'ring-2 ring-emerald-500 bg-emerald-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleItemSelection(item.id, !selectedItems.includes(item.id))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleItemSelection(item.id, !selectedItems.includes(item.id))}
                        aria-label={`Select ${item.name}`}
                        id={`checkbox-${item.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.sku}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                          {item.metal_type && (
                            <Badge variant="outline" className="text-xs">
                              {item.metal_type}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          <div>Price: ${item.price?.toLocaleString() || 'N/A'}</div>
                          <div>Qty: {item.quantity || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>

            {!isLoadingInventory && (filteredInventory || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No inventory items found matching your criteria
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Configure Sharing Settings */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configure Sharing Settings
            </CardTitle>
            <CardDescription>
              Set how your inventory will be visible and what actions others can take
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visibility Settings */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Visibility Level</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['public', 'connections_only', 'specific_connections'] as VisibilityLevel[]).map((level) => (
                  <Card 
                    key={level}
                    className={`cursor-pointer transition-all ${
                      sharingSettings.visibility_level === level 
                        ? 'ring-2 ring-emerald-500 bg-emerald-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSharingSettings(prev => ({ ...prev, visibility_level: level }))}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        {getVisibilityIcon(level)}
                      </div>
                      <h4 className="font-semibold capitalize">
                        {level.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {getVisibilityDescription(level)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pricing Visibility */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Pricing & Quantity</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show_pricing"
                      checked={sharingSettings.show_pricing}
                      onCheckedChange={(checked) => 
                        setSharingSettings(prev => ({ ...prev, show_pricing: !!checked }))
                      }
                    />
                    <Label htmlFor="show_pricing">Show pricing to viewers</Label>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    Allow others to see your item prices
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show_quantity"
                      checked={sharingSettings.show_quantity}
                      onCheckedChange={(checked) => 
                        setSharingSettings(prev => ({ ...prev, show_quantity: !!checked }))
                      }
                    />
                    <Label htmlFor="show_quantity">Show quantity to viewers</Label>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    Allow others to see your available quantities
                  </p>
                </div>
              </div>
            </div>

            {/* Request Permissions */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Request Permissions</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allow_quote_requests"
                      checked={sharingSettings.allow_quote_requests}
                      onCheckedChange={(checked) => 
                        setSharingSettings(prev => ({ ...prev, allow_quote_requests: !!checked }))
                      }
                    />
                    <Label htmlFor="allow_quote_requests">Allow quote requests</Label>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    Others can request custom quotes
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allow_order_requests"
                      checked={sharingSettings.allow_order_requests}
                      onCheckedChange={(checked) => 
                        setSharingSettings(prev => ({ ...prev, allow_order_requests: !!checked }))
                      }
                    />
                    <Label htmlFor="allow_order_requests">Allow order requests</Label>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    Others can request to place orders
                  </p>
                </div>
              </div>
            </div>

            {/* B2B Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="b2b_enabled"
                  checked={sharingSettings.b2b_enabled}
                  onCheckedChange={(checked) => 
                    setSharingSettings(prev => ({ ...prev, b2b_enabled: !!checked }))
                  }
                />
                <Label htmlFor="b2b_enabled" className="text-base font-semibold">
                  Enable B2B Options
                </Label>
              </div>
              
              {sharingSettings.b2b_enabled && (
                <div className="ml-6 space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minimum_order">Minimum Order Amount ($)</Label>
                      <Input
                        id="minimum_order"
                        type="number"
                        value={sharingSettings.b2b_minimum_order_amount || 0}
                        onChange={(e) => setSharingSettings(prev => ({ 
                          ...prev, 
                          b2b_minimum_order_amount: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="payment_terms">Payment Terms</Label>
                      <Select 
                        value={sharingSettings.b2b_payment_terms} 
                        onValueChange={(value) => setSharingSettings(prev => ({ ...prev, b2b_payment_terms: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select terms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="net_15">Net 15</SelectItem>
                          <SelectItem value="net_30">Net 30</SelectItem>
                          <SelectItem value="net_60">Net 60</SelectItem>
                          <SelectItem value="cod">COD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shipping_terms">Shipping Terms</Label>
                    <Select 
                      value={sharingSettings.b2b_shipping_terms} 
                      onValueChange={(value) => setSharingSettings(prev => ({ ...prev, b2b_shipping_terms: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select terms" />
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
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review and Share */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="h-5 w-5 mr-2" />
              Review and Share
            </CardTitle>
            <CardDescription>
              Review your selections and sharing settings before making them public
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Items Summary */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Items to Share ({selectedItems.length})</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {selectedItems.map(itemId => {
                  const item = availableInventory.find(i => i.id === itemId)
                  return item ? (
                    <Card key={itemId} className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.sku}</p>
                          <p className="text-sm text-gray-700">{item.category}</p>
                        </div>
                      </div>
                    </Card>
                  ) : null
                })}
              </div>
            </div>

            {/* Sharing Settings Summary */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Sharing Settings</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Visibility</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {sharingSettings.visibility_level?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Pricing</p>
                  <p className="text-sm text-gray-600">
                    {sharingSettings.show_pricing ? 'Visible' : 'Hidden'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Quantity</p>
                  <p className="text-sm text-gray-600">
                    {sharingSettings.show_quantity ? 'Visible' : 'Hidden'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Quote Requests</p>
                  <p className="text-sm text-gray-600">
                    {sharingSettings.allow_quote_requests ? 'Allowed' : 'Not Allowed'}
                  </p>
                </div>
                {sharingSettings.b2b_enabled && (
                  <>
                    <div>
                      <p className="text-sm font-medium">B2B Enabled</p>
                      <p className="text-sm text-gray-600">Yes</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Min Order</p>
                      <p className="text-sm text-gray-600">
                        ${sharingSettings.b2b_minimum_order_amount?.toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePreviousStep}
          disabled={isLoading}
        >
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>
        
        <div className="flex gap-3">
          {currentStep < 3 && (
            <Button onClick={handleNextStep}>
              Next
            </Button>
          )}
          
          {currentStep === 3 && (
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || selectedItems.length === 0}
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
      </div>
    </div>
  )
}
