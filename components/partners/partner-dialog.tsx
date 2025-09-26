"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface PartnerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  partner?: any
  onSave?: () => void
}

const typeOptions = ["Supplier", "Service Provider", "Contractor", "Shipping Partner"]
const statusOptions = ["Active", "Inactive", "Pending"]

export function PartnerDialog({ open, onOpenChange, partner, onSave }: PartnerDialogProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState(typeOptions[0])
  const [status, setStatus] = useState(statusOptions[0])
  const [contactInfo, setContactInfo] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (partner) {
      setName(partner.name || "")
      setType(partner.type || typeOptions[0])
      setStatus(partner.status || statusOptions[0])
      setContactInfo(partner.contact_info || "")
      setTags(partner.tags || [])
    } else {
      setName("")
      setType(typeOptions[0])
      setStatus(statusOptions[0])
      setContactInfo("")
      setTags([])
    }
    setTagInput("")
  }, [partner, open])

  const handleSubmit = async () => {
    if (!name) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const method = partner ? "PUT" : "POST"
      const url = partner ? `/api/partners/${partner.id}` : "/api/partners"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          status,
          contact_info: contactInfo,
          tags,
        }),
      })
      if (!response.ok) throw new Error("Failed to save partner")
      toast({ title: "Success", description: `Partner ${partner ? "updated" : "created"} successfully` })
      onOpenChange(false)
      onSave?.()
    } catch (error) {
      toast({ title: "Error", description: "Failed to save partner. Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{partner ? "Edit Partner" : "Add Partner"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Partner name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded border px-3 py-2"
            >
              {typeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded border px-3 py-2"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact">Contact Info</Label>
            <Textarea
              id="contact"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Contact details, phone, email, etc."
            />
          </div>
          <div className="grid gap-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag() } }}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center rounded bg-muted px-2 py-1 text-xs">
                  {tag}
                  <Button type="button" size="icon" variant="ghost" className="ml-1 h-4 w-4 p-0" onClick={() => handleRemoveTag(tag)}>
                    ×
                  </Button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (partner ? "Saving..." : "Creating...") : partner ? "Save" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 