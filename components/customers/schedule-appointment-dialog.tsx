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
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, Mic, Calendar as CalendarIcon, Send } from "lucide-react"

export function ScheduleAppointmentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [appointmentDetails, setAppointmentDetails] = useState({
    customer: "",
    date: "",
    time: "",
    type: "",
    location: "",
    staff: "",
    notes: "",
    reminders: {
      customerEmail: true,
      customerSMS: false,
      staffEmail: true,
      staffSMS: false
    }
  })
  const [recording, setRecording] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<any>(null)
  const [error, setError] = useState("")
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [aiNotes, setAiNotes] = useState("")
  const [aiTime, setAiTime] = useState("")
  const [aiType, setAiType] = useState("")
  const [showSummary, setShowSummary] = useState(false)

  useState(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false)
    }
  })

  function startVoiceToText() {
    setError("")
    setPermissionDenied(false)
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false)
      setError("Voice recognition not supported in this browser.")
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript
      }
      setAppointmentDetails(prev => ({ ...prev, notes: prev.notes + transcript }))
    }
    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'denied') {
        setPermissionDenied(true)
        setError("Microphone access denied. Please allow mic access, use HTTPS, and reload the page.")
      } else {
        setError("Voice recognition error: " + event.error)
      }
      setRecording(false)
    }
    recognition.onend = () => {
      setRecording(false)
    }
    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
  }

  function stopVoiceToText() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setRecording(false)
    }
  }

  function handleAISuggestNotes() {
    setAiNotes("AI: Customer is interested in a custom engagement ring. Recommend in-store consultation and bring previous designs for inspiration.")
    setAppointmentDetails(prev => ({ ...prev, notes: "AI: Customer is interested in a custom engagement ring. Recommend in-store consultation and bring previous designs for inspiration." }))
  }
  function handleAISuggestTime() {
    setAiTime("AI: Based on staff and customer history, suggest 2:00 PM on Friday for best availability.")
    setAppointmentDetails(prev => ({ ...prev, time: "14:00" }))
  }
  function handleAISuggestType() {
    setAiType("AI: Customer recently purchased a ring. Suggest 'Sizing' or 'Custom Design' appointment.")
    setAppointmentDetails(prev => ({ ...prev, type: "sizing" }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Appointment scheduled successfully!")
    setAppointmentDetails({
      customer: "",
      date: "",
      time: "",
      type: "",
      location: "",
      staff: "",
      notes: "",
      reminders: {
        customerEmail: true,
        customerSMS: false,
        staffEmail: true,
        staffSMS: false
      }
    })
    setShowSummary(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
          <DialogDescription>
            Book an in-store, virtual, or home visit appointment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <Input 
              placeholder="Customer Name or ID" 
              value={appointmentDetails.customer} 
              onChange={(e) => setAppointmentDetails({...appointmentDetails, customer: e.target.value})}
              required
              aria-label="Customer Name or ID"
            />
            <div className="grid grid-cols-2 gap-4 items-end">
              <Input 
                type="date"
                value={appointmentDetails.date} 
                onChange={(e) => setAppointmentDetails({...appointmentDetails, date: e.target.value})}
                required
                aria-label="Date"
              />
              <div className="flex gap-2 items-center">
                <Input 
                  type="time"
                  value={appointmentDetails.time} 
                  onChange={(e) => setAppointmentDetails({...appointmentDetails, time: e.target.value})}
                  required
                  aria-label="Time"
                />
                <Button type="button" size="sm" variant="outline" onClick={handleAISuggestTime} title="AI Suggest Time"><Sparkles className="h-4 w-4 text-primary" /></Button>
              </div>
            </div>
            {aiTime && <div className="text-xs text-muted-foreground mb-2">{aiTime}</div>}
            <div className="flex gap-2 items-center">
              <Select onValueChange={(value) => setAppointmentDetails({...appointmentDetails, type: value})} value={appointmentDetails.type} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="sizing">Sizing</SelectItem>
                  <SelectItem value="repair-drop-off">Repair Drop-off</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="custom-design">Custom Design</SelectItem>
                  <SelectItem value="virtual">Virtual Meeting</SelectItem>
                  <SelectItem value="home-visit">Home Visit</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" size="sm" variant="outline" onClick={handleAISuggestType} title="AI Suggest Type"><Sparkles className="h-4 w-4 text-primary" /></Button>
            </div>
            {aiType && <div className="text-xs text-muted-foreground mb-2">{aiType}</div>}
            <Input 
              placeholder="Location (address or virtual link)" 
              value={appointmentDetails.location} 
              onChange={(e) => setAppointmentDetails({...appointmentDetails, location: e.target.value})}
              aria-label="Location"
            />
            <Input 
              placeholder="Staff Member" 
              value={appointmentDetails.staff} 
              onChange={(e) => setAppointmentDetails({...appointmentDetails, staff: e.target.value})}
              aria-label="Staff Member"
            />
            <div>
              <div className="flex gap-2 items-center mb-2">
                <label className="text-sm font-medium">Notes</label>
                <Button type="button" size="sm" variant="outline" onClick={handleAISuggestNotes} title="AI Suggest Notes"><Sparkles className="h-4 w-4 text-primary" /></Button>
                <Button type="button" size="sm" variant={recording ? "default" : "outline"} onClick={recording ? stopVoiceToText : startVoiceToText} disabled={!supported} title="Voice-to-Text"><Mic className="h-4 w-4" />{recording ? "Recording..." : "Voice-to-Text"}</Button>
              </div>
              <Textarea 
                placeholder="Notes for the appointment..."
                value={appointmentDetails.notes} 
                onChange={(e) => setAppointmentDetails({...appointmentDetails, notes: e.target.value})}
                aria-label="Notes"
              />
              {recording && <span className="text-xs text-red-600 animate-pulse ml-2">● Recording...</span>}
              {error && (
                <div className="text-xs text-red-600 mt-1">
                  {error}
                  {permissionDenied && (
                    <>
                      <br />
                      <span>
                        <strong>How to fix:</strong> <br />
                        1. Click the microphone icon in your browser's address bar and allow access.<br />
                        2. Make sure you are using HTTPS.<br />
                        3. Reload the page and try again.<br />
                      </span>
                      <Button size="sm" variant="outline" className="mt-2" type="button" onClick={startVoiceToText}>Try Again</Button>
                    </>
                  )}
                </div>
              )}
              {!error && !supported && (
                <div className="text-xs text-red-600 mt-1">Voice recognition is not supported in this browser.</div>
              )}
              {aiNotes && <div className="text-xs text-muted-foreground mb-2">{aiNotes}</div>}
            </div>
            <div className="space-y-2">
              <div className="font-medium text-sm">Reminders <span title="Choose how reminders are sent to customer and staff." className="ml-1 text-muted-foreground">?</span></div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={appointmentDetails.reminders.customerEmail} onCheckedChange={v => setAppointmentDetails(a => ({...a, reminders: {...a.reminders, customerEmail: !!v}}))} />
                  Email to Customer
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={appointmentDetails.reminders.customerSMS} onCheckedChange={v => setAppointmentDetails(a => ({...a, reminders: {...a.reminders, customerSMS: !!v}}))} />
                  SMS to Customer
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={appointmentDetails.reminders.staffEmail} onCheckedChange={v => setAppointmentDetails(a => ({...a, reminders: {...a.reminders, staffEmail: !!v}}))} />
                  Email to Staff
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={appointmentDetails.reminders.staffSMS} onCheckedChange={v => setAppointmentDetails(a => ({...a, reminders: {...a.reminders, staffSMS: !!v}}))} />
                  SMS to Staff
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="button" variant="outline" size="sm" title="Send calendar invite (mocked)"><CalendarIcon className="h-4 w-4 mr-1" />Send Calendar Invite</Button>
              <Button type="button" variant="outline" size="sm" title="Send confirmation (mocked)"><Send className="h-4 w-4 mr-1" />Send Confirmation</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowSummary(s => !s)}>{showSummary ? "Hide" : "Show"} Summary</Button>
            </div>
            {showSummary && (
              <div className="bg-muted p-4 rounded mt-2">
                <div className="font-semibold mb-2">Appointment Summary</div>
                <div className="text-sm"><strong>Customer:</strong> {appointmentDetails.customer}</div>
                <div className="text-sm"><strong>Date:</strong> {appointmentDetails.date} <strong>Time:</strong> {appointmentDetails.time}</div>
                <div className="text-sm"><strong>Type:</strong> {appointmentDetails.type}</div>
                <div className="text-sm"><strong>Location:</strong> {appointmentDetails.location}</div>
                <div className="text-sm"><strong>Staff:</strong> {appointmentDetails.staff}</div>
                <div className="text-sm"><strong>Notes:</strong> {appointmentDetails.notes}</div>
                <div className="text-sm"><strong>Reminders:</strong> {Object.entries(appointmentDetails.reminders).filter(([k, v]) => v).map(([k]) => k.replace(/([A-Z])/g, ' $1')).join(", ")}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Schedule</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
 