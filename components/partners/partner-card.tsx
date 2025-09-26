"use client"

import type { Partner } from "@/types/partner-management"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Globe, Clock, Package, Star, Loader2 } from "lucide-react"
import { getCategoryLabel, getSpecialtyLabel } from "@/data/mock-partners"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface PartnerCardProps {
  partner: Partner
  connectionStatus?: "connected" | "pending" | "not_connected"
  requestId?: string
  isIncomingRequest?: boolean
  onRequest: () => void
  onMessage: () => void
  onViewProfile: () => void
  onAcceptRequest?: (requestId: string) => void
  onRejectRequest?: (requestId: string) => void
  onCancelRequest?: (requestId: string) => void
  actionLoading?: string | null
  onAssignTask?: () => void
  showAssignTask?: boolean
  connectionDate?: string
}

export function PartnerCard({ partner, connectionStatus, requestId, isIncomingRequest, onRequest, onMessage, onViewProfile, onAcceptRequest, onRejectRequest, onCancelRequest, actionLoading, onAssignTask, showAssignTask, connectionDate }: PartnerCardProps) {
  const router = useRouter()
  const followers = partner.followers || Math.floor(Math.random() * 1000) // mock

  const isRequestLoading = actionLoading === `request-${partner.id}`
  const isAcceptLoading = actionLoading === `accept-${requestId}`
  const isRejectLoading = actionLoading === `reject-${requestId}`
  const isCancelLoading = actionLoading === `cancel-${requestId}`

  return (
    <Card
      className="h-full overflow-hidden transition-all hover:border-primary/50 cursor-pointer"
      onClick={() => router.push(`/dashboard/search-network/${partner.id}`)}
    >
      <CardContent className="pt-6 flex-grow">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={partner.logo || "/placeholder.svg"}
              alt={`${partner.name} logo`}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold truncate">{partner.name}</h3>
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              {(partner.category || []).map((cat) => getCategoryLabel(cat)).join(", ")}
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1">
          {(partner.specialties || []).slice(0, 3).map((specialty) => (
            <Badge key={specialty} variant="outline" className="text-xs">
              {getSpecialtyLabel(specialty)}
            </Badge>
          ))}
          {partner.specialties && partner.specialties.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{partner.specialties.length - 3} more
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-1 text-xs sm:text-sm">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
            <span>{typeof partner.rating === "number" ? partner.rating.toFixed(1) : "N/A"}</span>
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm">
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
            <span>{typeof partner.recentOrderCount === "number" ? partner.recentOrderCount : "N/A"} orders</span>
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            <span>{typeof partner.responseTime === "number" ? `${partner.responseTime}h response` : "N/A"}</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-2 line-clamp-2">{partner.notes || partner.description}</div>
        <div className="text-xs mb-2">{followers} followers</div>
      </CardContent>

      <div className="border-t pt-4 flex justify-between items-center">
        <div className="flex gap-1 sm:gap-2">
          {connectionStatus === "connected" ? (
            <>
              <Button size="icon" variant="outline" title={`Message ${partner.contactName}`} onClick={onMessage} className="h-8 w-8 sm:h-9 sm:w-9">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              {showAssignTask && onAssignTask && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={e => { e.stopPropagation(); onAssignTask() }}
                  className="h-8 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-700 border-none ml-2 px-3 text-xs"
                >
                  Assign Task
                </Button>
              )}
              {onViewProfile && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={e => { e.stopPropagation(); onViewProfile() }}
                  className="h-8 ml-2 px-3 text-xs"
                >
                  View Profile
                </Button>
              )}
            </>
          ) : connectionStatus === "pending" ? (
            <div className="flex gap-1 sm:gap-2">
              {isIncomingRequest && onAcceptRequest && onRejectRequest && requestId ? (
                <>
                  <Button size="sm" variant="default" disabled={isAcceptLoading} onClick={e => { e.stopPropagation(); onAcceptRequest(requestId) }} className="text-xs h-8">
                    {isAcceptLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Accept"}
                  </Button>
                  <Button size="sm" variant="destructive" disabled={isRejectLoading} onClick={e => { e.stopPropagation(); onRejectRequest(requestId) }} className="text-xs h-8">
                    {isRejectLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Reject"}
                  </Button>
                </>
              ) : onCancelRequest && requestId ? (
                <Button size="sm" variant="outline" disabled={isCancelLoading} onClick={e => { e.stopPropagation(); onCancelRequest(requestId) }} className="text-xs h-8">
                  {isCancelLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cancel"}
                </Button>
              ) : (
                <Button size="icon" variant="outline" disabled title={`Pending request to ${partner.contactName}`} className="h-8 w-8 sm:h-9 sm:w-9">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          ) : (
            <Button size="icon" variant="outline" disabled={isRequestLoading} title={`Request to ${partner.contactName}`} onClick={onRequest} className="h-8 w-8 sm:h-9 sm:w-9">
              {isRequestLoading ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <Mail className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
          )}
          <Button size="icon" variant="outline" title={`Visit website`} className="h-8 w-8 sm:h-9 sm:w-9">
            <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/search-network/${partner.id}`) }} className="text-xs h-8">
            View Details
          </Button>
          {connectionStatus !== "connected" && connectionStatus !== "pending" && (
            <Button
              variant="default"
              size="sm"
              disabled={isRequestLoading}
              onClick={e => { e.stopPropagation(); onRequest() }}
              className="text-xs h-8 bg-green-600 text-white hover:bg-green-700 focus:ring-green-700 border-none"
            >
              {isRequestLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <span className="mr-1 text-white">+</span>}
              Network
            </Button>
          )}
        </div>
      </div>
      {connectionStatus === "connected" && connectionDate && (
        <div className="text-xs text-muted-foreground mt-2">Connected since {new Date(connectionDate).toLocaleDateString()}</div>
      )}
    </Card>
  )
}
