import { Partner } from "@/types/partner-management"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface PartnerProfileDialogProps {
  partner: Partner
  onClose: () => void
  onSendTask: () => void
  onMessage: () => void
  onRequest: () => void
}

export function PartnerProfileDialog({ partner, onClose, onSendTask, onMessage, onRequest }: PartnerProfileDialogProps) {
  // TODO: Replace with Supabase relationship/request state
  const isConnected = false
  const isPendingRequest = false
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Partner Profile</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 items-center mb-4">
          <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted">
            <Image src={partner.logo || "/placeholder.svg"} alt={partner.name} fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">{partner.name}</h2>
            <div className="flex flex-wrap gap-1 mb-1">
              {partner.category.map(cat => (
                <Badge key={cat} variant="secondary">{cat}</Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {partner.specialties.map(spec => (
                <Badge key={spec} variant="outline">{spec}</Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-2 text-sm text-muted-foreground">{partner.notes}</div>
        <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
          <div><span className="font-semibold">Contact:</span> {partner.contactName}</div>
          <div><span className="font-semibold">Email:</span> {partner.email}</div>
          <div><span className="font-semibold">Phone:</span> {partner.phone}</div>
          <div><span className="font-semibold">Website:</span> <a href={partner.website} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{partner.website}</a></div>
          <div><span className="font-semibold">Address:</span> {partner.address}</div>
          <div><span className="font-semibold">Rating:</span> {partner.rating.toFixed(1)}</div>
        </div>
        <div className="flex gap-2 mt-4">
          {isConnected ? (
            <>
              <Button onClick={onMessage}>Message</Button>
              <Button onClick={onSendTask}>Send Task</Button>
            </>
          ) : isPendingRequest ? (
            <>
              <Button variant="outline" disabled>Request Pending</Button>
              <Button variant="destructive">Reject</Button>
              <Button variant="default">Accept</Button>
            </>
          ) : (
            <Button onClick={onRequest}>Connect / Request Partnership</Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
        {/* TODO: Show task history, analytics, etc. */}
      </DialogContent>
    </Dialog>
  )
} 