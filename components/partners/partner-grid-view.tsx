import type { Partner } from "@/types/partner-management"
import { PartnerCard } from "./partner-card"

interface PartnerGridViewProps {
  partners: Partner[]
  onRequest?: (partner: Partner) => void
  onMessage?: (partner: Partner) => void
  onViewProfile?: (partner: Partner) => void
}

export function PartnerGridView({ partners, onRequest, onMessage, onViewProfile }: PartnerGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {partners.map((partner) => (
        <PartnerCard 
          key={partner.id} 
          partner={partner}
          onRequest={onRequest ? () => onRequest(partner) : () => {}}
          onMessage={onMessage ? () => onMessage(partner) : () => {}}
          onViewProfile={onViewProfile ? () => onViewProfile(partner) : () => {}}
        />
      ))}
    </div>
  )
}
