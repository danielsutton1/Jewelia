"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, MessageSquare, Users, Bell, QrCode, Settings, Search } from "lucide-react"
import { PartnerDialog } from "@/components/partners/partner-dialog"
import { PartnerProfileDialog } from "@/components/partners/PartnerProfileDialog"
import { PartnerRequestsPanel } from "@/components/partners/PartnerRequestsPanel"
import { PartnerRelationshipsPanel } from "@/components/partners/PartnerRelationshipsPanel"
import { PartnerMessagingPanel } from "@/components/partners/PartnerMessagingPanel"
import { useToast } from "@/components/ui/use-toast"
import { PartnerDirectoryGrid } from "@/components/partners/PartnerDirectoryGrid"
import { PartnerFiltersPanel } from "@/components/partners/PartnerFiltersPanel"
import { PartnerSpecialty } from "@/types/partner-management"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

interface PartnerFilters {
  search: string
  specialties: PartnerSpecialty[]
  location: string
  minRating: number
  connectionStatus: "all" | "connected" | "pending" | "not_connected"
}

// Get current user ID from session
const [currentUserId, setCurrentUserId] = useState<string | null>(null)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null) // Track which action is loading
  const [filters, setFilters] = useState<PartnerFilters>({
    search: "",
    specialties: [],
    location: "",
    minRating: 0,
    connectionStatus: "all"
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<any>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showMessaging, setShowMessaging] = useState(false)
  const [showRequests, setShowRequests] = useState(false)
  const [showRelationships, setShowRelationships] = useState(false)
  const { toast } = useToast()
  const [relationships, setRelationships] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        if (data.success) {
          setCurrentUserId(data.user.id)
        }
      } catch (error) {
        console.error('Error fetching current user:', error)
      }
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (filters.search) params.append("search", filters.search)
        filters.specialties.forEach(s => params.append("specialties", s))
        if (filters.location) params.append("location", filters.location)
        if (filters.minRating > 0) params.append("minRating", filters.minRating.toString())
        // TODO: Add connectionStatus param
        const response = await fetch(`/api/partners?${params.toString()}`)
        if (!response.ok) throw new Error("Failed to fetch partners")
        const data = await response.json()
        setPartners(data.data || [])
      } catch (err: any) {
        setError(err.message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchPartners()
  }, [filters])

  // Real-time subscriptions for relationships and requests
  useEffect(() => {
    // Initial fetch
    const fetchStatus = async () => {
      if (!currentUserId) return
      try {
        const relRes = await fetch(`/api/partners/relationships?partnerId=${currentUserId}`)
        const relData = await relRes.json()
        setRelationships(relData.data || [])
        const reqRes = await fetch(`/api/partners/requests?partnerId=${currentUserId}`)
        const reqData = await reqRes.json()
        setRequests(reqData.data || [])
      } catch (err) {
        console.error("Error fetching initial status:", err)
      }
    }
    fetchStatus()

    // Use real user context for filtering
    if (!currentUserId) return
    const relSub = supabase
      .channel('partner_relationships')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partner_relationships' }, () => {
        // Refetch relationships
        fetch(`/api/partners/relationships?partnerId=${currentUserId}`)
          .then(res => res.json())
          .then(data => setRelationships(data.data || []))
          .catch(err => console.error("Error refetching relationships:", err))
      })
      .subscribe()
    const reqSub = supabase
      .channel('partner_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partner_requests' }, () => {
        // Refetch requests
        fetch(`/api/partners/requests?partnerId=${currentUserId}`)
          .then(res => res.json())
          .then(data => setRequests(data.data || []))
          .catch(err => console.error("Error refetching requests:", err))
      })
      .subscribe()
    return () => {
      supabase.removeChannel(relSub)
      supabase.removeChannel(reqSub)
    }
  }, [])

  // Helper to determine status and request info for each partner
  const getPartnerStatus = (partner: any) => {
    let connectionStatus: "connected" | "pending" | "not_connected" = "not_connected"
    let requestId: string | undefined = undefined
    let isIncomingRequest = false
    if (relationships.some(r => (r.partner_a === partner.id || r.partner_b === partner.id) && r.status === "active")) {
      connectionStatus = "connected"
    } else {
      // Find a pending request involving this partner
      const req = requests.find(r => (r.to_partner === partner.id || r.from_partner === partner.id) && r.status === "pending")
      if (req) {
        connectionStatus = "pending"
        requestId = req.id
        isIncomingRequest = req.to_partner === currentUserId // If the current partner is the receiver, it's incoming
      }
    }
    return { ...partner, connectionStatus, requestId, isIncomingRequest }
  }

  const handleAdd = () => {
    setSelectedPartner(null)
    setDialogOpen(true)
  }

  const handleEdit = (partner: any) => {
    setSelectedPartner(partner)
    setDialogOpen(true)
  }

  const handleDelete = async (partner: any) => {
    if (!confirm(`Delete partner '${partner.name}'?`)) return
    try {
      const response = await fetch(`/api/partners/${partner.id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete partner")
      toast({
        title: "Success",
        description: "Partner deleted successfully"
      })
      setFilters(f => ({ ...f }))
    } catch (error) {
      console.error("Error deleting partner:", error)
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive"
      })
    }
  }

  const handleDialogSave = () => {
    setDialogOpen(false)
    setFilters(f => ({ ...f }))
    toast({
      title: "Success",
      description: "Partner saved successfully"
    })
  }

  const handleSendMessage = async (message: string) => {
    try {
      const response = await fetch("/api/partners/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_id: selectedPartner?.id,
          content: message
        })
      })
      if (!response.ok) throw new Error("Failed to send message")
      toast({
        title: "Success",
        description: "Message sent successfully"
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    }
  }

  const handleRequest = async (partner: any) => {
    setActionLoading(`request-${partner.id}`)
    try {
      const response = await fetch("/api/partners/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_partner: currentUserId, to_partner: partner.id })
      })
      if (!response.ok) throw new Error("Failed to send request")
      toast({ title: "Request sent", description: `Request sent to ${partner.name}` })
      // Refetch requests to update UI
      const reqRes = await fetch(`/api/partners/requests?partnerId=${currentUserId}`)
      const reqData = await reqRes.json()
      setRequests(reqData.data || [])
    } catch (error) {
      toast({ title: "Error", description: "Failed to send request", variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleMessage = (partner: any) => {
    setSelectedPartner(partner)
    setShowMessaging(true)
  }

  const handleViewProfile = (partner: any) => {
    setSelectedPartner(partner)
    setShowProfile(true)
  }

  // Accept a request
  const handleAcceptRequest = async (requestId: string) => {
    setActionLoading(`accept-${requestId}`)
    try {
      const response = await fetch("/api/partners/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId, status: "accepted" })
      })
      if (!response.ok) throw new Error("Failed to accept request")
      toast({ title: "Request accepted" })
      // Refetch requests
      const reqRes = await fetch(`/api/partners/requests?partnerId=${currentUserId}`)
      const reqData = await reqRes.json()
      setRequests(reqData.data || [])
    } catch (error) {
      toast({ title: "Error", description: "Failed to accept request", variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  // Reject a request
  const handleRejectRequest = async (requestId: string) => {
    setActionLoading(`reject-${requestId}`)
    try {
      const response = await fetch("/api/partners/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId, status: "rejected" })
      })
      if (!response.ok) throw new Error("Failed to reject request")
      toast({ title: "Request rejected" })
      // Refetch requests
      const reqRes = await fetch(`/api/partners/requests?partnerId=${currentUserId}`)
      const reqData = await reqRes.json()
      setRequests(reqData.data || [])
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject request", variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  // Cancel a request
  const handleCancelRequest = async (requestId: string) => {
    setActionLoading(`cancel-${requestId}`)
    try {
      const response = await fetch("/api/partners/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId, status: "cancelled" })
      })
      if (!response.ok) throw new Error("Failed to cancel request")
      toast({ title: "Request cancelled" })
      // Refetch requests
      const reqRes = await fetch(`/api/partners/requests?partnerId=${currentUserId}`)
      const reqData = await reqRes.json()
      setRequests(reqData.data || [])
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel request", variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 md:p-6 bg-white border-b gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight search-network-heading">Search Network</h1>
          <p className="text-sm sm:text-base text-muted-foreground search-network-subtext">Manage your B2B partners and contacts</p>
          <div className="flex items-center gap-2 mt-1 sm:mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-muted-foreground">Real-time updates active</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowRequests(true)} className="text-xs sm:text-sm relative min-h-[44px] min-w-[44px]">
            <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Requests</span>
            {requests && requests.filter(r => r.status === "pending" && r.to_partner === currentUserId).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] flex items-center justify-center border border-white shadow">
                {requests.filter(r => r.status === "pending" && r.to_partner === currentUserId).length}
              </span>
            )}
          </Button>
          <Button
            asChild
            variant="default"
            className="text-xs sm:text-sm bg-green-600 text-white hover:bg-green-700 focus:ring-green-700 border-none min-h-[44px] min-w-[44px]"
          >
            <Link href="/dashboard/my-network">
              <Users className="h-4 w-4 mr-1 sm:mr-2 text-white" />
              <span className="hidden sm:inline">My Network</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
        <PartnerFiltersPanel filters={filters} onChange={setFilters as (filters: PartnerFilters) => void} />
        {loading ? (
          <div className="text-center py-8 sm:py-12 text-muted-foreground">Loading partners...</div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12 text-red-500">{error}</div>
        ) : (
          <PartnerDirectoryGrid
            partners={partners.map(getPartnerStatus)}
            onRequest={handleRequest}
            onMessage={handleMessage}
            onViewProfile={handleViewProfile}
            onAcceptRequest={handleAcceptRequest}
            onRejectRequest={handleRejectRequest}
            onCancelRequest={handleCancelRequest}
            actionLoading={actionLoading}
          />
        )}
      </div>

      {/* Dialogs and Panels */}
      {showProfile && selectedPartner && (
        <PartnerProfileDialog
          partner={selectedPartner}
          onClose={() => setShowProfile(false)}
          onSendTask={() => {/* TODO: Implement task dialog */}}
          onMessage={() => setShowMessaging(true)}
          onRequest={() => setShowRequests(true)}
        />
      )}
      {showMessaging && selectedPartner && (
        <PartnerMessagingPanel 
          partner={selectedPartner} 
          onClose={() => setShowMessaging(false)} 
          onSendMessage={handleSendMessage}
        />
      )}
      {showRequests && (
        <PartnerRequestsPanel onClose={() => setShowRequests(false)} />
      )}
      {showRelationships && (
        <PartnerRelationshipsPanel onClose={() => setShowRelationships(false)} />
      )}
      
      <PartnerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        partner={selectedPartner}
        onSave={handleDialogSave}
      />
    </div>
  )
}
