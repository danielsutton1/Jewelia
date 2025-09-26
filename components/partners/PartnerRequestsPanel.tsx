import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// TODO: Replace with Supabase data
const mockReceived = [
  { id: "r1", from: { name: "Gemstone Setters Inc." }, status: "pending" },
  { id: "r2", from: { name: "Goldsmiths United" }, status: "pending" },
]
const mockSent = [
  { id: "s1", to: { name: "Acme Polishing" }, status: "pending" },
]

export function PartnerRequestsPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"received" | "sent">("received")
  // TODO: Add accept/reject/cancel logic
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Partner Requests</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-4">
          <Button variant={tab === "received" ? "default" : "outline"} onClick={() => setTab("received")}>Received</Button>
          <Button variant={tab === "sent" ? "default" : "outline"} onClick={() => setTab("sent")}>Sent</Button>
        </div>
        {tab === "received" ? (
          <div className="space-y-3">
            {mockReceived.length === 0 && <div className="text-gray-400">No received requests.</div>}
            {mockReceived.map(req => (
              <div key={req.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-semibold">{req.from.name}</div>
                  <Badge variant="secondary">{req.status}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="default">Accept</Button>
                  <Button size="sm" variant="destructive">Reject</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {mockSent.length === 0 && <div className="text-gray-400">No sent requests.</div>}
            {mockSent.map(req => (
              <div key={req.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-semibold">{req.to.name}</div>
                  <Badge variant="secondary">{req.status}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Cancel</Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 