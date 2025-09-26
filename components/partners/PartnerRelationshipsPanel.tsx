import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// TODO: Replace with Supabase data
const mockRelationships = [
  { id: "rel1", partner: { name: "Gemstone Setters Inc." }, status: "active" },
  { id: "rel2", partner: { name: "Goldsmiths United" }, status: "active" },
  { id: "rel3", partner: { name: "Acme Polishing" }, status: "inactive" },
]

export function PartnerRelationshipsPanel({ onClose }: { onClose: () => void }) {
  // TODO: Add message, assign task, remove logic
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Partner Relationships</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mb-4">
          {mockRelationships.length === 0 && <div className="text-gray-400">No partner relationships.</div>}
          {mockRelationships.map(rel => (
            <div key={rel.id} className="flex items-center justify-between border rounded p-2">
              <div>
                <div className="font-semibold">{rel.partner.name}</div>
                <Badge variant={rel.status === "active" ? "success" : "outline"}>{rel.status}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="default">Message</Button>
                <Button size="sm" variant="secondary">Assign Task</Button>
                <Button size="sm" variant="destructive">Remove</Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 