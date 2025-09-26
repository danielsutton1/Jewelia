"use client"

import { useState, useEffect } from 'react'
import { 
  Users, 
  Eye, 
  MessageSquare, 
  ShoppingCart, 
  Check, 
  X, 
  Clock,
  AlertCircle,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PartnerInventoryAccess {
  id: string
  partner_id: string
  requester_id: string
  inventory_id: string
  access_type: 'view' | 'quote' | 'order' | 'full'
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  message?: string
  response_message?: string
  permissions: {
    can_view_pricing: boolean
    can_view_quantity: boolean
    can_request_quote: boolean
    can_place_order: boolean
    custom_price?: number
    custom_discount_percent?: number
  }
  created_at: string
  partner?: {
    name: string
    company: string
    avatar_url?: string
  }
  requester?: {
    full_name: string
    email: string
    company?: string
  }
  inventory?: {
    name: string
    sku: string
    category: string
    price: number
  }
}

export function PartnerInventoryAccessPanel() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('pending')
  const [pendingRequests, setPendingRequests] = useState<PartnerInventoryAccess[]>([])
  const [myRequests, setMyRequests] = useState<PartnerInventoryAccess[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<PartnerInventoryAccess | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalPermissions, setApprovalPermissions] = useState({
    can_view_pricing: false,
    can_view_quantity: false,
    can_request_quote: false,
    can_place_order: false,
    custom_price: '',
    custom_discount_percent: ''
  })
  const [responseMessage, setResponseMessage] = useState('')

  useEffect(() => {
    fetchAccessRequests()
  }, [])

  const fetchAccessRequests = async () => {
    try {
      setIsLoading(true)
      
      // Fetch pending requests (as a partner)
      const pendingResponse = await fetch('/api/partner-inventory/access?type=pending')
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        setPendingRequests(pendingData.data || [])
      }

      // Fetch my requests (as a requester)
      const myResponse = await fetch('/api/partner-inventory/access?type=my_requests')
      if (myResponse.ok) {
        const myData = await myResponse.json()
        setMyRequests(myData.data || [])
      }
    } catch (error) {
      console.error('Error fetching access requests:', error)
      toast({
        title: "Error",
        description: "Failed to load access requests",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveRequest = async () => {
    if (!selectedRequest) return

    try {
      const permissions = {
        can_view_pricing: approvalPermissions.can_view_pricing,
        can_view_quantity: approvalPermissions.can_view_quantity,
        can_request_quote: approvalPermissions.can_request_quote,
        can_place_order: approvalPermissions.can_place_order,
        custom_price: approvalPermissions.custom_price ? parseFloat(approvalPermissions.custom_price) : undefined,
        custom_discount_percent: approvalPermissions.custom_discount_percent ? parseFloat(approvalPermissions.custom_discount_percent) : undefined
      }

      const response = await fetch(`/api/partner-inventory/access/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'approve',
          permissions,
          response_message: responseMessage
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Inventory access request approved successfully"
        })
        setShowApprovalModal(false)
        setSelectedRequest(null)
        fetchAccessRequests()
      } else {
        throw new Error('Failed to approve request')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      toast({
        title: "Error",
        description: "Failed to approve access request",
        variant: "destructive"
      })
    }
  }

  const handleRejectRequest = async () => {
    if (!selectedRequest) return

    try {
      const response = await fetch(`/api/partner-inventory/access/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'reject',
          response_message: responseMessage
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Inventory access request rejected"
        })
        setShowApprovalModal(false)
        setSelectedRequest(null)
        fetchAccessRequests()
      } else {
        throw new Error('Failed to reject request')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast({
        title: "Error",
        description: "Failed to reject access request",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'expired':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><AlertCircle className="h-3 w-3 mr-1" />Expired</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getAccessTypeIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="h-4 w-4" />
      case 'quote':
        return <MessageSquare className="h-4 w-4" />
      case 'order':
        return <ShoppingCart className="h-4 w-4" />
      case 'full':
        return <Settings className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-600">Loading access requests...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="pending" className="data-[state=active]:bg-emerald-100">
            <Users className="h-4 w-4 mr-2" />
            Pending Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="my_requests" className="data-[state=active]:bg-emerald-100">
            <MessageSquare className="h-4 w-4 mr-2" />
            My Requests ({myRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Users className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-emerald-900 mb-2">No Pending Requests</h3>
                <p className="text-emerald-600">You don't have any pending inventory access requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getAccessTypeIcon(request.access_type)}
                          <h3 className="font-semibold text-emerald-900">
                            {request.inventory?.name || 'Unknown Inventory'}
                          </h3>
                          <Badge variant="outline">{request.access_type}</Badge>
                        </div>
                        <p className="text-sm text-emerald-600 mb-1">
                          Requested by: {request.requester?.full_name} ({request.requester?.company})
                        </p>
                        <p className="text-sm text-emerald-600">
                          SKU: {request.inventory?.sku} • Category: {request.inventory?.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowApprovalModal(true)
                          }}
                        >
                          Review
                        </Button>
                      </div>
                    </div>

                    {request.message && (
                      <div className="bg-emerald-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-emerald-800">
                          <strong>Message:</strong> {request.message}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-emerald-500">
                      Requested on {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my_requests" className="space-y-4">
          {myRequests.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-emerald-900 mb-2">No Access Requests</h3>
                <p className="text-emerald-600">You haven't requested access to any partner inventory yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <Card key={request.id} className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getAccessTypeIcon(request.access_type)}
                          <h3 className="font-semibold text-emerald-900">
                            {request.inventory?.name || 'Unknown Inventory'}
                          </h3>
                          <Badge variant="outline">{request.access_type}</Badge>
                        </div>
                        <p className="text-sm text-emerald-600 mb-1">
                          From: {request.partner?.name} ({request.partner?.company})
                        </p>
                        <p className="text-sm text-emerald-600">
                          SKU: {request.inventory?.sku} • Category: {request.inventory?.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    {request.message && (
                      <div className="bg-emerald-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-emerald-800">
                          <strong>Your Message:</strong> {request.message}
                        </p>
                      </div>
                    )}

                    {request.response_message && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-blue-800">
                          <strong>Response:</strong> {request.response_message}
                        </p>
                      </div>
                    )}

                    {request.status === 'approved' && (
                      <div className="bg-green-50 rounded-lg p-3 mb-3">
                        <h4 className="text-sm font-semibold text-green-800 mb-2">Your Permissions:</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                          <div>View Pricing: {request.permissions.can_view_pricing ? 'Yes' : 'No'}</div>
                          <div>View Quantity: {request.permissions.can_view_quantity ? 'Yes' : 'No'}</div>
                          <div>Request Quotes: {request.permissions.can_request_quote ? 'Yes' : 'No'}</div>
                          <div>Place Orders: {request.permissions.can_place_order ? 'Yes' : 'No'}</div>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-emerald-500">
                      Requested on {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-emerald-900 mb-4">
              Review Inventory Access Request
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-semibold text-emerald-800">Request Details</h3>
                <p className="text-sm text-emerald-600">
                  {selectedRequest.requester?.full_name} is requesting {selectedRequest.access_type} access to {selectedRequest.inventory?.name}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-emerald-700 mb-2 block">Permissions</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="can_view_pricing"
                      checked={approvalPermissions.can_view_pricing}
                      onCheckedChange={(checked) => 
                        setApprovalPermissions(prev => ({ ...prev, can_view_pricing: !!checked }))
                      }
                    />
                    <label htmlFor="can_view_pricing" className="text-sm text-emerald-700">Can view pricing</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="can_view_quantity"
                      checked={approvalPermissions.can_view_quantity}
                      onCheckedChange={(checked) => 
                        setApprovalPermissions(prev => ({ ...prev, can_view_quantity: !!checked }))
                      }
                    />
                    <label htmlFor="can_view_quantity" className="text-sm text-emerald-700">Can view quantity</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="can_request_quote"
                      checked={approvalPermissions.can_request_quote}
                      onCheckedChange={(checked) => 
                        setApprovalPermissions(prev => ({ ...prev, can_request_quote: !!checked }))
                      }
                    />
                    <label htmlFor="can_request_quote" className="text-sm text-emerald-700">Can request quotes</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="can_place_order"
                      checked={approvalPermissions.can_place_order}
                      onCheckedChange={(checked) => 
                        setApprovalPermissions(prev => ({ ...prev, can_place_order: !!checked }))
                      }
                    />
                    <label htmlFor="can_place_order" className="text-sm text-emerald-700">Can place orders</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-emerald-700 mb-2 block">Response Message (Optional)</label>
                <Textarea
                  placeholder="Add a message to the requester..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApprovalModal(false)
                  setSelectedRequest(null)
                  setResponseMessage('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectRequest}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApproveRequest}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
