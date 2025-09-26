"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CommunicationType } from "@/types/partner-communication"
import { FileText, Paperclip, X } from "lucide-react"

interface NewCommunicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
  initialType?: CommunicationType
}

export default function NewCommunicationDialog({
  open,
  onOpenChange,
  onComplete,
  initialType = "message",
}: NewCommunicationDialogProps) {
  const [type, setType] = useState<CommunicationType>(initialType)
  const [partner, setPartner] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("medium")
  const [attachments, setAttachments] = useState<File[]>([])
  const [relatedOrder, setRelatedOrder] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would send the data to the API
    console.log({
      type,
      partner,
      subject,
      message,
      priority,
      attachments,
      relatedOrder,
    })

    onComplete()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files || [])])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const getTypeLabel = () => {
    switch (type) {
      case "message":
        return "Message"
      case "email":
        return "Email"
      case "call":
        return "Call"
      case "meeting":
        return "Meeting"
      case "document":
        return "Document"
      case "task":
        return "Task"
      case "issue":
        return "Issue"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New {getTypeLabel()}</DialogTitle>
            <DialogDescription>Create a new communication with a partner.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(value) => setType(value as CommunicationType)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">Message</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="issue">Issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner">Partner</Label>
                <Select value={partner} onValueChange={setPartner}>
                  <SelectTrigger id="partner">
                    <SelectValue placeholder="Select partner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partner-1">Goldsmith Supplies</SelectItem>
                    <SelectItem value="partner-2">Diamond Direct</SelectItem>
                    <SelectItem value="partner-3">Precision Casting</SelectItem>
                    <SelectItem value="partner-4">Artisan Engraving</SelectItem>
                    <SelectItem value="partner-5">Master Plating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relatedOrder">Related Order (Optional)</Label>
                <Input
                  id="relatedOrder"
                  value={relatedOrder}
                  onChange={(e) => setRelatedOrder(e.target.value)}
                  placeholder="Order ID"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Attachments</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach Files
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
              </div>

              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center p-2 rounded bg-muted">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm truncate flex-grow">{file.name}</span>
                      <span className="text-xs text-muted-foreground mx-2">{(file.size / 1024).toFixed(0)} KB</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeAttachment(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Send</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
