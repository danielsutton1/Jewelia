"use client"

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Users, 
  Lock, 
  Globe, 
  DollarSign, 
  Package,
  X,
  Plus,
  UserPlus,
  UserMinus,
  MessageSquare,
  ShoppingCart,
  Building,
  Save,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { 
  InventorySharingSettings, 
  InventorySharingConnection,
  VisibilityLevel 
} from '@/types/inventory-sharing'

// =====================================================
// MANAGE SHARING SETTINGS COMPONENT
// =====================================================

interface ManageSharingSettingsProps {
  sharingId: string
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

export function ManageSharingSettings({ 
  sharingId, 
  onSuccess, 
  onCancel, 
  className = '' 
}: ManageSharingSettingsProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Data state
  const [sharingSettings, setSharingSettings] = useState<InventorySharingSettings | null>(null)
  const [connections, setConnections] = useState<InventorySharingConnection[]>([])
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  
  // Form state
  const [showAddConnection, setShowAddConnection] = useState(false)
  const [newConnectionUserId, setNewConnectionUserId] = useState('')
  const [newConnectionPermissions, setNewConnectionPermissions] = useState({
    can_view_pricing: true,
    can_view_quantity: true,
    can_request_quote: true,
    can_place_order: false,
    custom_price: 0
  })

  // Fetch sharing settings and connections
  useEffect(() => {
    if (sharingId) {
      fetchSharingSettings()
      fetchConnections()
      fetchAvailableUsers()
    }
  }, [sharingId])

  const fetchSharingSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/inventory-sharing/${sharingId}`)
      if (response.ok) {
        const data = await response.json()
        setSharingSettings(data.data)
      }
    } catch (error) {
      console.error('Error fetching sharing settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConnections = async () => {
    try {
      const response = await fetch(`/api/inventory-sharing/connections?sharing_id=${sharingId}`)
      if (response.ok) {
        const data = await response.json()
        setConnections(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch('/api/users?type=professionals')
      if (response.ok) {
        const data = await response.json()
        setAvailableUsers(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching available users:', error)
    }
  }

  const handleSaveSettings = async () => {
    if (!sharingSettings) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/inventory-sharing/${sharingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sharingSettings)
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Sharing settings updated successfully",
        })
        onSuccess?.()
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating sharing settings:', error)
      toast({
        title: "Error",
        description: "Failed to update sharing settings",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddConnection = async () => {
    if (!newConnectionUserId) return

    try {
      const response = await fetch('/api/inventory-sharing/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sharing_id: sharingId,
          viewer_id: newConnectionUserId,
          ...newConnectionPermissions
        })
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Connection added successfully",
        })
        setShowAddConnection(false)
        setNewConnectionUserId('')
        fetchConnections()
      } else {
        throw new Error('Failed to add connection')
      }
    } catch (error) {
      console.error('Error adding connection:', error)
      toast({
        title: "Error",
        description: "Failed to add connection",
        variant: "destructive"
      })
    }
  }

  const handleRemoveConnection = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/inventory-sharing/connections/${connectionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Connection removed successfully",
        })
        fetchConnections()
      } else {
        throw new Error('Failed to remove connection')
      }
    } catch (error) {
      console.error('Error removing connection:', error)
      toast({
        title: "Error",
        description: "Failed to remove connection",
        variant: "destructive"
      })
    }
  }

  const handleUpdateConnection = async (connectionId: string, updates: Partial<InventorySharingConnection>) => {
    try {
      const response = await fetch(`/api/inventory-sharing/connections/${connectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Connection updated successfully",
        })
        fetchConnections()
      } else {
        throw new Error('Failed to update connection')
      }
    } catch (error) {
      console.error('Error updating connection:', error)
      toast({
        title: "Error",
        description: "Failed to update connection",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!sharingSettings) {
    return (
      <div className="text-center p-8 text-gray-500">
        <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p>Sharing settings not found</p>
      </div>
    )
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

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Sharing Settings</h2>
          <p className="text-gray-600">Configure how your inventory is shared with others</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            General Sharing Settings
          </CardTitle>
          <CardDescription>
            Control who can see your inventory and what information they can access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visibility Level */}
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
                  onClick={() => setSharingSettings(prev => prev ? { ...prev, visibility_level: level } : null)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-2">
                      {getVisibilityIcon(level)}
                    </div>
                    <h4 className="font-semibold capitalize">
                      {level.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {level === 'public' && 'Visible to all professionals'}
                      {level === 'connections_only' && 'Visible to your connections'}
                      {level === 'specific_connections' && 'Visible to selected users only'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Pricing & Quantity Visibility */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Information Visibility</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="show_pricing"
                    checked={sharingSettings.show_pricing}
                    onCheckedChange={(checked) => 
                      setSharingSettings(prev => prev ? { ...prev, show_pricing: !!checked } : null)
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <Label htmlFor="show_pricing">Show pricing to viewers</Label>
                  </div>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  Allow others to see your item prices
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="show_quantity"
                    checked={sharingSettings.show_quantity}
                    onCheckedChange={(checked) => 
                      setSharingSettings(prev => prev ? { ...prev, show_quantity: !!checked } : null)
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-emerald-600" />
                    <Label htmlFor="show_quantity">Show quantity to viewers</Label>
                  </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="allow_quote_requests"
                    checked={sharingSettings.allow_quote_requests}
                    onCheckedChange={(checked) => 
                      setSharingSettings(prev => prev ? { ...prev, allow_quote_requests: !!checked } : null)
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    <Label htmlFor="allow_quote_requests">Allow quote requests</Label>
                  </div>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  Others can request custom quotes
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="allow_order_requests"
                    checked={sharingSettings.allow_order_requests}
                    onCheckedChange={(checked) => 
                      setSharingSettings(prev => prev ? { ...prev, allow_order_requests: !!checked } : null)
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4 text-emerald-600" />
                    <Label htmlFor="allow_order_requests">Allow order requests</Label>
                  </div>
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
                  setSharingSettings(prev => prev ? { ...prev, b2b_enabled: !!checked } : null)
                }
              />
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-emerald-600" />
                <Label htmlFor="b2b_enabled" className="text-base font-semibold">
                  Enable B2B Options
                </Label>
              </div>
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
                      onChange={(e) => setSharingSettings(prev => prev ? { 
                        ...prev, 
                        b2b_minimum_order_amount: parseFloat(e.target.value) || 0 
                      } : null)}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment_terms">Payment Terms</Label>
                    <Select 
                      value={sharingSettings.b2b_payment_terms || 'net_30'} 
                      onValueChange={(value) => setSharingSettings(prev => prev ? { ...prev, b2b_payment_terms: value } : null)}
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
                      value={sharingSettings.b2b_shipping_terms || 'fob_origin'} 
                      onValueChange={(value) => setSharingSettings(prev => prev ? { ...prev, b2b_shipping_terms: value } : null)}
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

      {/* Connection Management */}
      {sharingSettings.visibility_level === 'specific_connections' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Manage Connections
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddConnection(!showAddConnection)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Connection
              </Button>
            </CardTitle>
            <CardDescription>
              Control which specific users can see this inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Connection */}
            {showAddConnection && (
              <Card className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select User</Label>
                    <Select value={newConnectionUserId} onValueChange={setNewConnectionUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers
                          .filter(user => !connections.find(c => c.viewer_id === user.id))
                          .map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name} - {user.company_name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Custom Pricing (Optional)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newConnectionPermissions.custom_price || ''}
                      onChange={(e) => setNewConnectionPermissions(prev => ({
                        ...prev,
                        custom_price: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new_view_pricing"
                      checked={newConnectionPermissions.can_view_pricing}
                      onCheckedChange={(checked) => 
                        setNewConnectionPermissions(prev => ({ ...prev, can_view_pricing: !!checked }))
                      }
                    />
                    <Label htmlFor="new_view_pricing" className="text-sm">View Pricing</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new_view_quantity"
                      checked={newConnectionPermissions.can_view_quantity}
                      onCheckedChange={(checked) => 
                        setNewConnectionPermissions(prev => ({ ...prev, can_view_quantity: !!checked }))
                      }
                    />
                    <Label htmlFor="new_view_quantity" className="text-sm">View Quantity</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new_request_quote"
                      checked={newConnectionPermissions.can_request_quote}
                      onCheckedChange={(checked) => 
                        setNewConnectionPermissions(prev => ({ ...prev, can_request_quote: !!checked }))
                      }
                    />
                    <Label htmlFor="new_request_quote" className="text-sm">Request Quote</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new_place_order"
                      checked={newConnectionPermissions.can_place_order}
                      onCheckedChange={(checked) => 
                        setNewConnectionPermissions(prev => ({ ...prev, can_place_order: !!checked }))
                      }
                    />
                    <Label htmlFor="new_place_order" className="text-sm">Place Order</Label>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={handleAddConnection}
                    disabled={!newConnectionUserId}
                  >
                    Add Connection
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddConnection(false)
                      setNewConnectionUserId('')
                      setNewConnectionPermissions({
                        can_view_pricing: true,
                        can_view_quantity: true,
                        can_request_quote: true,
                        can_place_order: false,
                        custom_price: 0
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* Existing Connections */}
            <div className="space-y-3">
              {connections.map((connection) => {
                const user = availableUsers.find(u => u.id === connection.viewer_id)
                return (
                  <Card key={connection.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 font-semibold">
                              {user?.full_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold">{user?.full_name || 'Unknown User'}</h4>
                            <p className="text-sm text-gray-600">{user?.company_name || 'Unknown Company'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Permissions Display */}
                        <div className="flex items-center space-x-2 text-sm">
                          {connection.can_view_pricing && (
                            <Badge variant="secondary" className="text-xs">
                              <DollarSign className="h-3 w-3 mr-1" />
                              Pricing
                            </Badge>
                          )}
                          {connection.can_view_quantity && (
                            <Badge variant="secondary" className="text-xs">
                              <Package className="h-3 w-3 mr-1" />
                              Quantity
                            </Badge>
                          )}
                          {connection.can_request_quote && (
                            <Badge variant="secondary" className="text-xs">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Quote
                            </Badge>
                          )}
                          {connection.can_place_order && (
                            <Badge variant="secondary" className="text-xs">
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Order
                            </Badge>
                          )}
                        </div>
                        
                        {/* Custom Pricing */}
                        {connection.custom_price && connection.custom_price > 0 && (
                          <div className="text-sm text-emerald-600 font-medium">
                            ${connection.custom_price.toLocaleString()}
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateConnection(connection.id, {
                              can_view_pricing: !connection.can_view_pricing
                            })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveConnection(connection.id)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
              
              {connections.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No connections added yet</p>
                  <p className="text-sm">Add connections to control who can see this inventory</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
