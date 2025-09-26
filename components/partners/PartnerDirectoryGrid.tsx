import { Partner } from "@/types/partner-management"
import { PartnerCard } from "./partner-card"

interface PartnerWithStatus extends Partner {
  connectionStatus?: "connected" | "pending" | "not_connected"
  requestId?: string
  isIncomingRequest?: boolean
  connectionDate?: string
}

interface PartnerDirectoryGridProps {
  partners: PartnerWithStatus[]
  onRequest: (partner: PartnerWithStatus) => void
  onMessage: (partner: PartnerWithStatus) => void
  onViewProfile: (partner: PartnerWithStatus) => void
  onAcceptRequest?: (requestId: string) => void
  onRejectRequest?: (requestId: string) => void
  onCancelRequest?: (requestId: string) => void
  actionLoading?: string | null
  onAssignTask?: (partner: PartnerWithStatus) => void
  showAssignTask?: boolean
}

export function PartnerDirectoryGrid({ partners, onRequest, onMessage, onViewProfile, onAcceptRequest, onRejectRequest, onCancelRequest, actionLoading, onAssignTask, showAssignTask }: PartnerDirectoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {partners.map((partner) => (
        <PartnerCard
          key={partner.id}
          partner={partner}
          connectionStatus={partner.connectionStatus}
          requestId={partner.requestId}
          isIncomingRequest={partner.isIncomingRequest}
          onRequest={() => onRequest(partner)}
          onMessage={() => onMessage(partner)}
          onViewProfile={onViewProfile ? () => onViewProfile(partner) : () => {}}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          onCancelRequest={onCancelRequest}
          actionLoading={actionLoading}
          onAssignTask={onAssignTask ? () => onAssignTask(partner) : undefined}
          showAssignTask={showAssignTask}
          connectionDate={partner.connectionDate}
        />
      ))}
    </div>
  )
} 