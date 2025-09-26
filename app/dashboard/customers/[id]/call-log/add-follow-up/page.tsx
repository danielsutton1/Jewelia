"use client"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar, Sparkles, Upload } from "lucide-react"

// Mock data for context
const mockCallLogs = [
  {
    id: "1",
    contact: "Client 1",
    product: "Diamond Ring",
    value: "$25,000",
    date: "2024-02-24",
    notes: "Send over background sheet"
  },
  {
    id: "3",
    contact: "Client 3",
    product: "Loose Diamond",
    value: "$5,800",
    date: "2024-02-28",
    notes: "Assign Ben to client account"
  }
]
const mockUsers = ["Ben", "Admin", "Olivia", "Jackson"]

export default function AddFollowUpPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = params?.id as string;
  const logId = searchParams.get("logId") || "3";
  const log = mockCallLogs.find(l => l.id === logId) || mockCallLogs[0];

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [method, setMethod] = useState("Call");
  const [assignedTo, setAssignedTo] = useState(mockUsers[0]);
  const [priority, setPriority] = useState("Medium");
  const [notes, setNotes] = useState("");
  const [reminder, setReminder] = useState(true);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState("Follow up with a personalized offer and confirm client preferences for loose diamond.");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push(`/dashboard/customers/${customerId}/call-log`);
      }, 1200);
    }, 1200);
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push(`/dashboard/customers/${customerId}/call-log`)}>
          &larr; Back to Call Log
        </Button>
        <h1 className="text-3xl font-bold">Add Follow-up</h1>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Customer & Call Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div><span className="font-medium">Customer:</span> {log.contact}</div>
            <div><span className="font-medium">Product/Service:</span> {log.product}</div>
            <div><span className="font-medium">Value:</span> {log.value}</div>
            <div><span className="font-medium">Last Interaction:</span> {log.date}</div>
          </div>
          <div className="text-xs text-muted-foreground">Notes: {log.notes}</div>
        </CardContent>
      </Card>
      <form onSubmit={handleSave} className="space-y-6 bg-muted rounded-lg p-8 border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="font-medium flex items-center gap-2"><Calendar className="h-4 w-4" />Follow-up Date</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="font-medium">Time</label>
            <Input type="time" value={time} onChange={e => setTime(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="font-medium">Method</label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Call">Call</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="In-person">In-person</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="font-medium">Assigned To</label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger><SelectValue placeholder="Assigned To" /></SelectTrigger>
              <SelectContent>
                {mockUsers.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="font-medium">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex items-center gap-2">
            <label className="font-medium">Reminder</label>
            <Switch checked={reminder} onCheckedChange={setReminder} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="font-medium flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />AI Suggestion</label>
          <div className="bg-white border rounded p-3 text-sm text-muted-foreground">{aiSuggestion}</div>
        </div>
        <div className="space-y-2">
          <label className="font-medium">Notes</label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Add details for the follow-up..." required />
        </div>
        <div className="space-y-2">
          <label className="font-medium flex items-center gap-2"><Upload className="h-4 w-4" />Attachments (optional)</label>
          <Input type="file" onChange={handleFileChange} />
          {attachment && <div className="text-xs text-muted-foreground">Selected: {attachment.name}</div>}
        </div>
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" type="button" onClick={() => router.push(`/dashboard/customers/${customerId}/call-log`)}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Follow-up"}</Button>
        </div>
        {success && <div className="text-green-600 text-sm mt-2">Follow-up added successfully!</div>}
      </form>
    </div>
  )
} 