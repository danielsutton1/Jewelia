"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useRef } from "react"
import { toast } from "sonner"

export function SendFollowUpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [messageDetails, setMessageDetails] = useState({
    customer: "",
    channel: "",
    template: "",
    subject: "",
    message: "",
    scheduleSend: "now",
    scheduledDate: "",
    scheduledTime: "",
    attachments: [] as File[]
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setMessageDetails(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeAttachment = (index: number) => {
    setMessageDetails(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleTemplateChange = (template: string) => {
    setMessageDetails(prev => ({ ...prev, template }))
    // Auto-fill message based on template
    const templates: Record<string, string> = {
      "quote-follow-up": "Hi {{customer_name}},\n\nThank you for your interest in our jewelry collection. I wanted to follow up on the quote I sent you for {{item_name}}. Do you have any questions or would you like to schedule an appointment to discuss further?\n\nBest regards,\n{{staff_name}}",
      "appointment-reminder": "Hi {{customer_name}},\n\nThis is a friendly reminder about your upcoming appointment on {{appointment_date}} at {{appointment_time}}. We're looking forward to seeing you!\n\nIf you need to reschedule, please let us know.\n\nBest regards,\n{{staff_name}}",
      "post-purchase-thanks": "Hi {{customer_name}},\n\nThank you for your recent purchase! We hope you love your new jewelry. If you have any questions or need any adjustments, please don't hesitate to reach out.\n\nWe'd love to see photos of you wearing your new pieces!\n\nBest regards,\n{{staff_name}}",
      "repair-update": "Hi {{customer_name}},\n\nI wanted to update you on the status of your jewelry repair. {{repair_status}}\n\nWe'll keep you informed of any progress.\n\nBest regards,\n{{staff_name}}",
      "custom-design": "Hi {{customer_name}},\n\nThank you for choosing us for your custom jewelry design. I'm excited to work with you on creating something truly special.\n\n{{next_steps}}\n\nBest regards,\n{{staff_name}}"
    }
    if (templates[template]) {
      setMessageDetails(prev => ({ ...prev, message: templates[template] }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const action = messageDetails.scheduleSend === "now" ? "sent" : "scheduled"
    toast.success(`Follow-up message ${action} successfully!`)
    setMessageDetails({
      customer: "",
      channel: "",
      template: "",
      subject: "",
      message: "",
      scheduleSend: "now",
      scheduledDate: "",
      scheduledTime: "",
      attachments: []
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Follow-up</DialogTitle>
          <DialogDescription>
            Send a follow-up email, SMS, or WhatsApp message to a customer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <Input 
              placeholder="Customer Name or ID" 
              value={messageDetails.customer} 
              onChange={(e) => setMessageDetails({...messageDetails, customer: e.target.value})}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select onValueChange={(value) => setMessageDetails({...messageDetails, channel: value})} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quote-follow-up">Quote Follow-up</SelectItem>
                  <SelectItem value="appointment-reminder">Appointment Reminder</SelectItem>
                  <SelectItem value="post-purchase-thanks">Post-purchase Thank You</SelectItem>
                  <SelectItem value="repair-update">Repair Update</SelectItem>
                  <SelectItem value="custom-design">Custom Design</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {messageDetails.channel === "email" && (
              <Input 
                placeholder="Subject Line" 
                value={messageDetails.subject} 
                onChange={(e) => setMessageDetails({...messageDetails, subject: e.target.value})}
                required
              />
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Message</label>
                <div className="text-xs text-muted-foreground">
                  Use {'{'}customer_name{'}'}, {'{'}staff_name{'}'}, {'{'}item_name{'}'} for personalization
                </div>
              </div>
              <Textarea 
                placeholder="Type your message here..."
                value={messageDetails.message} 
                onChange={(e) => setMessageDetails({...messageDetails, message: e.target.value})}
                required
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="scheduleSend"
                    value="now"
                    checked={messageDetails.scheduleSend === "now"}
                    onChange={(e) => setMessageDetails({...messageDetails, scheduleSend: e.target.value})}
                  />
                  Send Now
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="scheduleSend"
                    value="later"
                    checked={messageDetails.scheduleSend === "later"}
                    onChange={(e) => setMessageDetails({...messageDetails, scheduleSend: e.target.value})}
                  />
                  Schedule for Later
                </label>
              </div>
              {messageDetails.scheduleSend === "later" && (
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    type="date"
                    value={messageDetails.scheduledDate} 
                    onChange={(e) => setMessageDetails({...messageDetails, scheduledDate: e.target.value})}
                    required
                  />
                  <Input 
                    type="time"
                    value={messageDetails.scheduledTime} 
                    onChange={(e) => setMessageDetails({...messageDetails, scheduledTime: e.target.value})}
                    required
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Attachments</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Add Files
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {messageDetails.attachments.length > 0 && (
                <div className="space-y-2">
                  {messageDetails.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">
              {messageDetails.scheduleSend === "now" ? "Send Message" : "Schedule Message"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
 