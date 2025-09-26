"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { 
  UserPlus, 
  Check, 
  X, 
  Clock, 
  Building2, 
  MapPin, 
  Star,
  MessageSquare,
  Loader2
} from "lucide-react"

interface ConnectionRequest {
  id: string
  partner_id: string
  user_id: string
  status: string
  message?: string
  created_at: string
  updated_at: string
  partner: {
    id: string
    name: string
    company: string
    avatar_url?: string
    location: string
    specialties: string[]
    rating: number
    description?: string
  }
  isIncoming: boolean
}

export function ConnectionRequestsPanel() {
  const [requests, setRequests] = useState<ConnectionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchConnectionRequests()
  }, [])

  const fetchConnectionRequests = async () => {
    try {
      const response = await fetch('/api/network/connection-requests')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching connection requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectionAction = async (requestId: string, action: 'accept' | 'reject') => {
    setActionLoading(requestId)
    try {
      const response = await fetch(`/api/network/connections/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        toast({
          title: `Connection ${action === 'accept' ? 'Accepted' : 'Rejected'}`,
          description: `You have ${action === 'accept' ? 'accepted' : 'rejected'} the connection request.`,
          variant: "default"
        })
        // Refresh the requests list
        fetchConnectionRequests()
      } else {
        throw new Error('Failed to process connection request')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process connection request. Please try again.",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const incomingRequests = requests.filter(req => req.isIncoming)
  const outgoingRequests = requests.filter(req => !req.isIncoming)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            Connection Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            Connection Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-gray-500">
          <UserPlus className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-lg font-medium">No pending requests</p>
          <p className="text-sm">When you send or receive connection requests, they'll appear here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-emerald-600" />
          Connection Requests
          <Badge variant="secondary" className="ml-2">
            {requests.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming" className="flex items-center gap-2">
              Incoming
              {incomingRequests.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {incomingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex items-center gap-2">
              Outgoing
              {outgoingRequests.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {outgoingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-3 mt-4">
            {incomingRequests.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <UserPlus className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No incoming connection requests</p>
              </div>
            ) : (
              incomingRequests.map((request) => (
                <ConnectionRequestCard
                  key={request.id}
                  request={request}
                  onAction={handleConnectionAction}
                  actionLoading={actionLoading === request.id}
                  showActions={true}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="outgoing" className="space-y-3 mt-4">
            {outgoingRequests.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Clock className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No outgoing connection requests</p>
              </div>
            ) : (
              outgoingRequests.map((request) => (
                <ConnectionRequestCard
                  key={request.id}
                  request={request}
                  onAction={handleConnectionAction}
                  actionLoading={actionLoading === request.id}
                  showActions={false}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface ConnectionRequestCardProps {
  request: ConnectionRequest
  onAction: (requestId: string, action: 'accept' | 'reject') => void
  actionLoading: boolean
  showActions: boolean
}

function ConnectionRequestCard({ request, onAction, actionLoading, showActions }: ConnectionRequestCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={request.partner.avatar_url} />
          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
            {request.partner.name[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{request.partner.name}</h3>
            {request.partner.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{request.partner.rating}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Building2 className="h-4 w-4" />
            <span className="truncate">{request.partner.company}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span>{request.partner.location}</span>
          </div>

          {request.partner.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {request.partner.specialties.slice(0, 2).map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          )}

          {request.message && (
            <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded-r-md mb-3">
              <p className="text-sm text-blue-800">{request.message}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{new Date(request.created_at).toLocaleDateString()}</span>
            </div>

            {showActions && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAction(request.id, 'reject')}
                  disabled={actionLoading}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  {actionLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAction(request.id, 'accept')}
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {actionLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  Accept
                </Button>
              </div>
            )}

            {!showActions && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
