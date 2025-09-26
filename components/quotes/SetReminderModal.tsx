"use client"

import { useState } from "react"
import { Calendar, Clock, Phone, Mail, User, MessageSquare, CalendarDays } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const COMMUNICATION_METHODS = [
  { value: "inbound-call", label: "Inbound Call", icon: Phone },
  { value: "outbound-call", label: "Outbound Call", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "walk-in", label: "Walk-in", icon: User },
  { value: "referral", label: "Referral", icon: User },
  { value: "social-media", label: "Social Media", icon: MessageSquare },
  { value: "other", label: "Other", icon: MessageSquare },
]

const FOLLOW_UP_TYPES = [
  { value: "quote-follow-up", label: "Quote Follow-up" },
  { value: "design-review", label: "Design Review" },
  { value: "price-discussion", label: "Price Discussion" },
  { value: "appointment", label: "Appointment" },
  { value: "delivery-update", label: "Delivery Update" },
  { value: "custom", label: "Custom" },
]

interface SetReminderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quoteNumber?: string
  clientName?: string
}

export function SetReminderModal({ open, onOpenChange, quoteNumber, clientName }: SetReminderModalProps) {
  const [reminderDate, setReminderDate] = useState("")
  const [reminderTime, setReminderTime] = useState("")
  const [communicationMethod, setCommunicationMethod] = useState("")
  const [followUpType, setFollowUpType] = useState("")
  const [notes, setNotes] = useState("")
  const [priority, setPriority] = useState("medium")

  const handleSave = () => {
    // TODO: Save reminder to database/API
    console.log("Saving reminder:", {
      quoteNumber,
      clientName,
      reminderDate,
      reminderTime,
      communicationMethod,
      followUpType,
      notes,
      priority,
    })
    
    // Reset form
    setReminderDate("")
    setReminderTime("")
    setCommunicationMethod("")
    setFollowUpType("")
    setNotes("")
    setPriority("medium")
    
    onOpenChange(false)
  }

  const handleCancel = () => {
    // Reset form
    setReminderDate("")
    setReminderTime("")
    setCommunicationMethod("")
    setFollowUpType("")
    setNotes("")
    setPriority("medium")
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <CalendarDays className="h-5 w-5 text-emerald-600" />
            Set Reminder
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Quote & Client Info */}
          {(quoteNumber || clientName) && (
            <div className="bg-emerald-50/50 p-4 rounded-lg border">
              <h3 className="font-medium text-emerald-800 mb-2">Quote Details</h3>
              {quoteNumber && (
                <p className="text-sm text-emerald-700">Quote: <span className="font-medium">{quoteNumber}</span></p>
              )}
              {clientName && (
                <p className="text-sm text-emerald-700">Client: <span className="font-medium">{clientName}</span></p>
              )}
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Reminder Date
              </label>
              <Input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Reminder Time
              </label>
              <Input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Communication Method */}
          <div className="space-y-2">
            <label className="text-sm font-medium">How did this contact start?</label>
            <Select value={communicationMethod} onValueChange={setCommunicationMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select communication method" />
              </SelectTrigger>
              <SelectContent>
                {COMMUNICATION_METHODS.map((method) => {
                  const Icon = method.icon
                  return (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {method.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Follow-up Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Follow-up Type</label>
            <Select value={followUpType} onValueChange={setFollowUpType}>
              <SelectTrigger>
                <SelectValue placeholder="Select follow-up type" />
              </SelectTrigger>
              <SelectContent>
                {FOLLOW_UP_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <div className="flex gap-2">
              {[
                { value: "low", label: "Low", color: "bg-gray-100 text-gray-700" },
                { value: "medium", label: "Medium", color: "bg-amber-100 text-amber-700" },
                { value: "high", label: "High", color: "bg-red-100 text-red-700" },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    priority === p.value ? p.color : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              placeholder="Add any additional notes about this reminder..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={!reminderDate || !reminderTime}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Set Reminder
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 