"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { MeetingBrief } from '@/types/database'
import { copyToClipboard } from "@/components/ui/utils";

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: any
  selectedDate?: Date
}

// Mock user list for attendee selection
const mockUsers = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
  { id: '3', name: 'Carol Lee', email: 'carol@example.com' },
];

export function EventDialog({ open, onOpenChange, event, selectedDate }: EventDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(selectedDate)
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [meetingLinkMode, setMeetingLinkMode] = useState<'manual' | 'auto'>('manual')
  const [manualMeetingLink, setManualMeetingLink] = useState('')
  const [meetingPlatform, setMeetingPlatform] = useState('zoom')
  const [generatedMeetingLink, setGeneratedMeetingLink] = useState('')
  const [attendees, setAttendees] = useState<any[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [addToCalendars, setAddToCalendars] = useState(true)
  const [sendInvites, setSendInvites] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const meetingLinkInputRef = useRef<HTMLInputElement>(null)
  const [meetingLinkLoading, setMeetingLinkLoading] = useState(false)
  const [meetingLinkError, setMeetingLinkError] = useState<string | null>(null)
  const [briefModalOpen, setBriefModalOpen] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [transcriptInput, setTranscriptInput] = useState('')
  const [briefLoading, setBriefLoading] = useState(false)
  const [briefError, setBriefError] = useState<string | null>(null)
  const [briefResult, setBriefResult] = useState<MeetingBrief | null>(null)
  const [briefEdit, setBriefEdit] = useState<Partial<MeetingBrief>>({})
  const [briefSource, setBriefSource] = useState<'audio' | 'manual'>('manual')
  const [allBriefs, setAllBriefs] = useState<MeetingBrief[]>([])

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || "")
      setStartDate(new Date(event.start))
      setStartTime(format(new Date(event.start), "HH:mm"))
      setEndTime(format(new Date(event.end), "HH:mm"))
      setManualMeetingLink(event.meetingLink || '')
      setAttendees(event.attendees || [])
    } else {
      setTitle("")
      setDescription("")
      setStartDate(selectedDate)
      setStartTime("09:00")
      setEndTime("10:00")
      setManualMeetingLink('')
      setAttendees([])
    }
  }, [event, selectedDate])

  // Enhanced meeting link generation for Zoom
  const handleGenerateMeetingLink = async () => {
    setMeetingLinkError(null)
    setMeetingLinkLoading(true)
    try {
      if (meetingPlatform === 'zoom') {
        // Call backend to create Zoom meeting
        const res = await fetch('/api/meetings/zoom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: title || 'Meeting',
            start_time: startDate ? `${startDate.toISOString().split('T')[0]}T${startTime}:00Z` : undefined,
            duration: 60, // Default 60 min, or calculate from start/end
            timezone: 'UTC',
          })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to create Zoom meeting')
        setGeneratedMeetingLink(data.join_url)
      } else if (meetingPlatform === 'google') {
        // Call backend to create Google Meet
        const res = await fetch('/api/meetings/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: title || 'Meeting',
            start_time: startDate ? `${startDate.toISOString().split('T')[0]}T${startTime}:00Z` : undefined,
            duration: 60, // Default 60 min, or calculate from start/end
            attendees: attendees.map(u => u.email),
          })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to create Google Meet')
        setGeneratedMeetingLink(data.join_url)
      } else {
        // Mock for other platforms
        let link = ''
        switch (meetingPlatform) {
          case 'teams':
            link = 'https://teams.microsoft.com/l/meetup-join/1234567890'; break;
          default:
            link = 'https://meetings.example.com/room/xyz';
        }
        setGeneratedMeetingLink(link)
      }
    } catch (e: any) {
      setMeetingLinkError(e.message || 'Error generating meeting link')
    } finally {
      setMeetingLinkLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!title || !startDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const [startHours, startMinutes] = startTime.split(":").map(Number)
      const [endHours, endMinutes] = endTime.split(":").map(Number)

      const start = new Date(startDate)
      start.setHours(startHours, startMinutes)

      const end = new Date(startDate)
      end.setHours(endHours, endMinutes)

      const eventData = {
        title,
        description,
        start: start.toISOString(),
        end: end.toISOString(),
        meetingLink: meetingLinkMode === 'manual' ? manualMeetingLink : generatedMeetingLink,
        attendees: attendees.map(u => u.id),
        addToCalendars,
        sendInvites,
      }

      const response = await fetch("/api/calendar/events" + (event ? `/${event.id}` : ""), {
        method: event ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        throw new Error("Failed to save event")
      }

      toast({
        title: "Success",
        description: `Event ${event ? "updated" : "created"} successfully`,
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!event) return

    setLoading(true)
    try {
      const response = await fetch(`/api/calendar/events/${event.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete event")
      }

      toast({
        title: "Success",
        description: "Event deleted successfully",
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter users for search
  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  // Helper: check if event is over
  const isEventOver = useMemo(() => {
    if (!event || !event.end) return false
    return new Date(event.end) < new Date()
  }, [event])

  // Fetch briefs on open/event change
  useEffect(() => {
    if (event?.id && briefModalOpen) {
      fetch(`/api/briefs?eventId=${event.id}`)
        .then(res => res.json())
        .then(data => {
          setAllBriefs(data.meetingBriefs || [])
          if (data.meetingBriefs && data.meetingBriefs.length > 0) {
            setBriefResult(data.meetingBriefs[0])
            setBriefEdit({
              summary: data.meetingBriefs[0].summary,
              key_points: data.meetingBriefs[0].key_points,
              decisions: data.meetingBriefs[0].decisions,
              action_items: data.meetingBriefs[0].action_items,
              follow_ups: data.meetingBriefs[0].follow_ups,
              attendee_insights: data.meetingBriefs[0].attendee_insights,
            })
          } else {
            setBriefResult(null)
            setBriefEdit({})
          }
        })
    }
  }, [event, briefModalOpen])

  // Brief generation handler
  const handleGenerateBrief = async () => {
    setBriefLoading(true)
    setBriefError(null)
    setBriefResult(null)
    try {
      let res, data
      if (briefSource === 'audio' && audioFile) {
        const form = new FormData()
        form.append('audio', audioFile)
        form.append('eventId', event?.id || '')
        res = await fetch('/api/briefs', { method: 'POST', body: form })
      } else {
        res = await fetch('/api/briefs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: transcriptInput, eventId: event?.id })
        })
      }
      data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate brief')
      setBriefResult(data.meetingBrief)
      setBriefEdit({
        summary: data.meetingBrief.summary,
        key_points: data.meetingBrief.key_points,
        decisions: data.meetingBrief.decisions,
        action_items: data.meetingBrief.action_items,
        follow_ups: data.meetingBrief.follow_ups,
        attendee_insights: data.meetingBrief.attendee_insights,
      })
      // Refresh all briefs
      fetch(`/api/briefs?eventId=${event.id}`)
        .then(res => res.json())
        .then(data => setAllBriefs(data.meetingBriefs || []))
    } catch (e: any) {
      setBriefError(e.message || 'Error generating brief')
    } finally {
      setBriefLoading(false)
    }
  }

  // Save/Share handlers
  const handleSaveBrief = async () => {
    if (!briefResult) return
    const res = await fetch(`/api/briefs?id=${briefResult.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...briefEdit, edited_by_user: true })
    })
    const data = await res.json()
    if (res.ok) {
      setBriefResult(data.meetingBrief)
      toast({ title: 'Brief saved', description: 'Your edits have been saved.' })
      // Refresh all briefs
      fetch(`/api/briefs?eventId=${event.id}`)
        .then(res => res.json())
        .then(data => setAllBriefs(data.meetingBriefs || []))
    } else {
      toast({ title: 'Error', description: data.error || 'Failed to save brief', variant: 'destructive' })
    }
  }
  const handleShareBrief = async () => {
    if (!briefResult) return
    const res = await fetch(`/api/briefs?id=${briefResult.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shared_with_attendees: true })
    })
    const data = await res.json()
    if (res.ok) {
      setBriefResult(data.meetingBrief)
      toast({ title: 'Brief shared', description: 'Brief shared with attendees.' })
    } else {
      toast({ title: 'Error', description: data.error || 'Failed to share brief', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "New Event"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
            />
          </div>
          <div className="grid gap-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Time</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>End Time</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description"
              className="min-h-[100px]"
            />
          </div>
          <div className="grid gap-2">
            <Label>Meeting Link</Label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-1">
                <input type="radio" checked={meetingLinkMode === 'manual'} onChange={() => setMeetingLinkMode('manual')} />
                Add existing link
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" checked={meetingLinkMode === 'auto'} onChange={() => setMeetingLinkMode('auto')} />
                Create new meeting
              </label>
            </div>
            {meetingLinkMode === 'manual' ? (
              <Input
                value={manualMeetingLink}
                onChange={e => setManualMeetingLink(e.target.value)}
                placeholder="Paste meeting link (Zoom, Teams, etc.)"
              />
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <select value={meetingPlatform} onChange={e => setMeetingPlatform(e.target.value)} className="border rounded px-2 py-1">
                    <option value="zoom">Zoom</option>
                    <option value="google">Google Meet</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="generic">Create Meeting Room</option>
                  </select>
                  <Button type="button" onClick={handleGenerateMeetingLink} disabled={meetingLinkLoading}>
                    {meetingLinkLoading ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
                {generatedMeetingLink && (
                  <span className="ml-2 text-xs text-blue-600 cursor-pointer" onClick={() => {
                    copyToClipboard(generatedMeetingLink, (msg) => alert(msg));
                  }}>
                    {generatedMeetingLink} (Copy)
                  </span>
                )}
                {meetingLinkError && (
                  <span className="text-xs text-red-500">{meetingLinkError}</span>
                )}
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Invite Attendees</Label>
            <Input
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="Search users..."
            />
            <div className="max-h-24 overflow-y-auto border rounded p-2 bg-muted">
              {filteredUsers.map(u => (
                <div key={u.id} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={attendees.some(a => a.id === u.id)}
                    onChange={e => {
                      if (e.target.checked) setAttendees([...attendees, u])
                      else setAttendees(attendees.filter(a => a.id !== u.id))
                    }}
                  />
                  <span>{u.name} ({u.email})</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={addToCalendars} onChange={e => setAddToCalendars(e.target.checked)} />
                Add to attendees' calendars
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={sendInvites} onChange={e => setSendInvites(e.target.checked)} />
                Send invitation notifications
              </label>
            </div>
            {attendees.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                Invited: {attendees.map(a => a.name).join(', ')}
              </div>
            )}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdvanced(v => !v)}>
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </Button>
          {showAdvanced && (
            <div className="text-xs text-muted-foreground">(RSVP tracking and more coming soon...)</div>
          )}
        </div>
        {/* Post-meeting brief button and modal */}
        {event && isEventOver && (
          <Button className="mt-2 w-full" onClick={() => setBriefModalOpen(true)}>
            Generate Meeting Brief
          </Button>
        )}
        {/* Brief Modal */}
        {briefModalOpen && (
          <Dialog open={briefModalOpen} onOpenChange={setBriefModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>AI Meeting Brief</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Previous briefs list */}
                {allBriefs.length > 1 && (
                  <div className="mb-2">
                    <Label>Previous Briefs</Label>
                    <ul className="text-xs list-disc ml-4">
                      {allBriefs.slice(1).map(b => (
                        <li key={b.id} className="truncate">{b.summary?.slice(0, 80) || 'No summary'} ({format(new Date(b.created_at), 'PPPp')})</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex gap-4">
                  <Button variant={briefSource === 'audio' ? 'default' : 'outline'} onClick={() => setBriefSource('audio')}>Audio Upload</Button>
                  <Button variant={briefSource === 'manual' ? 'default' : 'outline'} onClick={() => setBriefSource('manual')}>Manual Transcript</Button>
                </div>
                {briefSource === 'audio' ? (
                  <div>
                    <Label>Upload Audio File (.mp3, .wav, .m4a)</Label>
                    <Input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files?.[0] || null)} />
                    {audioFile && <div className="text-xs mt-1">Selected: {audioFile.name}</div>}
                  </div>
                ) : (
                  <div>
                    <Label>Paste or Enter Transcript</Label>
                    <Textarea
                      value={transcriptInput}
                      onChange={e => setTranscriptInput(e.target.value)}
                      placeholder="Paste meeting transcript or notes here..."
                      className="min-h-[120px]"
                    />
                  </div>
                )}
                <Button onClick={handleGenerateBrief} disabled={briefLoading || (briefSource === 'audio' && !audioFile) || (briefSource === 'manual' && !transcriptInput)}>
                  {briefLoading ? 'Processing...' : 'Generate Brief'}
                </Button>
                {briefError && <div className="text-red-500 text-sm">{briefError}</div>}
                {briefResult && (
                  <div className="space-y-2 mt-4">
                    <Label>Executive Summary</Label>
                    <Textarea
                      value={briefEdit.summary || ''}
                      onChange={e => setBriefEdit({ ...briefEdit, summary: e.target.value })}
                      className="min-h-[60px]"
                    />
                    <Label>Key Discussion Points</Label>
                    <Textarea
                      value={(briefEdit.key_points || []).join('\n')}
                      onChange={e => setBriefEdit({ ...briefEdit, key_points: e.target.value.split('\n') })}
                      className="min-h-[60px]"
                    />
                    <Label>Decisions Made</Label>
                    <Textarea
                      value={(briefEdit.decisions || []).join('\n')}
                      onChange={e => setBriefEdit({ ...briefEdit, decisions: e.target.value.split('\n') })}
                      className="min-h-[60px]"
                    />
                    <Label>Action Items (task | assignee | due date)</Label>
                    <Textarea
                      value={(briefEdit.action_items || []).map(a => `${a.task} | ${a.assignee} | ${a.due_date}`).join('\n')}
                      onChange={e => setBriefEdit({ ...briefEdit, action_items: e.target.value.split('\n').map(line => { const [task, assignee, due_date] = line.split('|').map(s => s.trim()); return { task, assignee, due_date }; }) })}
                      className="min-h-[60px]"
                    />
                    <Label>Follow-up Items</Label>
                    <Textarea
                      value={(briefEdit.follow_ups || []).join('\n')}
                      onChange={e => setBriefEdit({ ...briefEdit, follow_ups: e.target.value.split('\n') })}
                      className="min-h-[60px]"
                    />
                    <Label>Attendee Insights</Label>
                    {(briefEdit.attendee_insights || []).map((insight, idx) => (
                      <div key={idx} className="flex flex-col gap-1 border rounded p-2 mb-2">
                        <Input
                          value={insight.name}
                          onChange={e => {
                            const updated = [...(briefEdit.attendee_insights || [])]
                            updated[idx] = { ...insight, name: e.target.value }
                            setBriefEdit({ ...briefEdit, attendee_insights: updated })
                          }}
                          placeholder="Attendee Name"
                          className="mb-1"
                        />
                        <Textarea
                          value={(insight.contributions || []).join('\n')}
                          onChange={e => {
                            const updated = [...(briefEdit.attendee_insights || [])]
                            updated[idx] = { ...insight, contributions: e.target.value.split('\n') }
                            setBriefEdit({ ...briefEdit, attendee_insights: updated })
                          }}
                          placeholder="Contributions (one per line)"
                          className="min-h-[40px]"
                        />
                        <Button size="sm" variant="destructive" onClick={() => {
                          const updated = [...(briefEdit.attendee_insights || [])]
                          updated.splice(idx, 1)
                          setBriefEdit({ ...briefEdit, attendee_insights: updated })
                        }}>Remove</Button>
                      </div>
                    ))}
                    <Button size="sm" variant="outline" onClick={() => {
                      setBriefEdit({
                        ...briefEdit,
                        attendee_insights: [...(briefEdit.attendee_insights || []), { name: '', contributions: [] }]
                      })
                    }}>Add Attendee Insight</Button>
                    <div className="flex gap-2 mt-2">
                      <Button variant="default" onClick={handleSaveBrief}>Save Brief</Button>
                      <Button variant="outline" onClick={handleShareBrief}>Share with Attendees</Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
        <div className="flex justify-between">
          {event && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : event ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// TODO: Integrate with real user search API for attendees
// TODO: Integrate with meeting platform APIs for real meeting link generation
// TODO: Implement backend logic for storing meeting links, attendees, and notifications
// TODO: Add RSVP tracking and attendee status display 