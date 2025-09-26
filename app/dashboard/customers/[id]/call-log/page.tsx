"use client"

import React, { useState, useRef, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ClipboardList, Phone, Calendar, Sparkles, ChevronDown, ChevronUp, Search, Plus, Upload, Gem, User, FileText, ShieldCheck, List, Download, Printer } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Textarea } from "@/components/ui/textarea"
import { LogPhoneCallDialog } from "@/components/customers/log-phone-call-dialog"
import { getCustomer } from "@/lib/database"
import { Customer } from "@/types/database"

const initialMockCallLogs = [
  {
    id: "1",
    department: "Sales department A",
    contact: "Client 1",
    clientType: "VIP",
    product: "Diamond Ring",
    carat: "2.5ct",
    material: "Platinum",
    value: "$25,000",
    salesStage: "Consultation",
    contactNumber: "+1 334 555 3333",
    purpose: "Sign up",
    date: "2024-02-24",
    time: "10:00 AM",
    duration: "30 minutes",
    followUp: true,
    followUpDate: "2024-03-17",
    notes: "Send over background sheet",
    aiNextStep: "Recommend matching earrings for upsell. Schedule in-store appointment.",
    aiMessage: "Dear Client, thank you for your interest in our diamond rings. We look forward to welcoming you for a personalized consultation.",
    starred: true
  },
  {
    id: "2",
    department: "Sales department A",
    contact: "Client 2",
    clientType: "Retail",
    product: "Gold Necklace",
    carat: "18k",
    material: "Gold",
    value: "$3,200",
    salesStage: "Follow-up",
    contactNumber: "+1 334 555 3334",
    purpose: "Client query",
    date: "2024-02-25",
    time: "11:00 AM",
    duration: "45 minutes",
    followUp: true,
    followUpDate: "2024-03-16",
    notes: "Speak to IT about issue",
    aiNextStep: "Suggest matching bracelet. Offer seasonal promotion.",
    aiMessage: "Thank you for your inquiry about our gold necklaces. We have a special offer this month—let's discuss your preferences further.",
    starred: false
  },
  {
    id: "3",
    department: "Sales department B",
    contact: "Client 3",
    clientType: "Trade",
    product: "Loose Diamond",
    carat: "1.2ct",
    material: "Diamond",
    value: "$5,800",
    salesStage: "Negotiation",
    contactNumber: "+1 334 555 3335",
    purpose: "Initial Interest",
    date: "2024-02-28",
    time: "11:30 AM",
    duration: "90 minutes",
    followUp: false,
    followUpDate: "",
    notes: "Assign Ben to client account",
    aiNextStep: "Prepare trade pricing proposal. Share GIA certificate.",
    aiMessage: "We appreciate your interest in our loose diamonds. Please find attached the GIA certificate and trade pricing details.",
    starred: true
  }
]

export default function CustomerCallLogPage() {
  const { id: rawId } = useParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [callLogs, setCallLogs] = useState(initialMockCallLogs)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [followUpId, setFollowUpId] = useState<string | null>(null)
  const [followUpValue, setFollowUpValue] = useState({ date: '', notes: '' })
  const [expanded, setExpanded] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterClientType, setFilterClientType] = useState("all")
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterProduct, setFilterProduct] = useState("all")
  const [filterSalesStage, setFilterSalesStage] = useState("all")
  const [filterFollowUp, setFilterFollowUp] = useState("all")
  const [filterDateRange, setFilterDateRange] = useState<{from: string, to: string} | null>(null)
  const [showOnlyMissed, setShowOnlyMissed] = useState(false)
  const [showStarred, setShowStarred] = useState(false)
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [contactDialogSearch, setContactDialogSearch] = useState("")
  const [contactDialogShowStarred, setContactDialogShowStarred] = useState(false)
  const [contactDialogExpanded, setContactDialogExpanded] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<any>({})
  const [exporting, setExporting] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [timelineType, setTimelineType] = useState('all')

  // Fetch customer data
  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    getCustomer(id)
      .then((data) => {
        setCustomer(data);
      })
      .catch((error) => {
        console.error('Error loading customer:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Add sort order select
  const sortOptions = [
    { value: "desc", label: "Newest First" },
    { value: "asc", label: "Oldest First" }
  ]

  // Filtered logs
  const filteredLogs = callLogs
    .filter(log =>
      (filterDepartment === "all" || log.department === filterDepartment) &&
      (filterClientType === "all" || log.clientType === filterClientType) &&
      (filterProduct === "all" || log.product === filterProduct) &&
      (filterSalesStage === "all" || log.salesStage === filterSalesStage) &&
      (filterFollowUp === "all" || (filterFollowUp === "yes" ? log.followUp : !log.followUp)) &&
      (!filterDateRange || (log.date >= filterDateRange.from && log.date <= filterDateRange.to)) &&
      (!showOnlyMissed || log.purpose.toLowerCase().includes("missed")) &&
      (!showStarred || log.starred) &&
      (log.contact.toLowerCase().includes(search.toLowerCase()) ||
        log.purpose.toLowerCase().includes(search.toLowerCase()) ||
        log.notes.toLowerCase().includes(search.toLowerCase()) ||
        log.product.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date)
      }
      if (sortBy === "value") {
        const aVal = parseFloat(a.value?.replace(/[^\d.]/g, "") || "0")
        const bVal = parseFloat(b.value?.replace(/[^\d.]/g, "") || "0")
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal
      }
      return 0
    })

  // Summary bar
  const totalCalls = filteredLogs.length
  const totalFollowUps = filteredLogs.filter(l => l.followUp).length
  const totalValue = filteredLogs.reduce((sum, l) => sum + (parseFloat(l.value?.replace(/[^\d.]/g, "")) || 0), 0)

  function handleEdit(log: any) {
    setEditingId(log.id)
    setEditValues({ notes: log.notes, product: log.product, value: log.value, salesStage: log.salesStage })
  }
  function handleEditChange(field: string, value: string) {
    setEditValues((prev: any) => ({ ...prev, [field]: value }))
  }
  function handleEditSave(id: string) {
    // Mock save
    setEditingId(null)
  }
  function handleEditCancel() {
    setEditingId(null)
  }
  function handleStarToggle(id: string) {
    // Mock star toggle
  }
  function handleExport(type: 'csv' | 'pdf') {
    setExporting(true)
    setTimeout(() => setExporting(false), 1200)
  }
  function handlePrint() {
    setPrinting(true)
    setTimeout(() => setPrinting(false), 1200)
  }

  const callTypeIcon = (purpose: string) => {
    if (purpose.toLowerCase().includes('missed')) return <Phone className="h-4 w-4 text-red-500 inline" />
    if (purpose.toLowerCase().includes('follow')) return <Calendar className="h-4 w-4 text-blue-500 inline" />
    if (purpose.toLowerCase().includes('consult')) return <Gem className="h-4 w-4 text-amber-500 inline" />
    return <User className="h-4 w-4 text-muted-foreground inline" />
  }

  function groupByMonth(logs: any[]) {
    return logs.reduce((acc, log) => {
      const month = log.date.slice(0, 7)
      if (!acc[month]) acc[month] = []
      acc[month].push(log)
      return acc
    }, {} as Record<string, any[]>)
  }

  const timelineLogs = callLogs.filter(l =>
    timelineType === 'all' ? true :
      (timelineType === 'missed' ? l.purpose.toLowerCase().includes('missed') :
        timelineType === 'followup' ? l.purpose.toLowerCase().includes('follow') :
          timelineType === 'consultation' ? l.purpose.toLowerCase().includes('consult') : true)
  )
  const groupedTimeline = groupByMonth(timelineLogs)

  // Voice-to-text state and logic (move to main component scope)
  const [notes, setNotes] = React.useState("");
  const [recording, setRecording] = React.useState(false);
  const [supported, setSupported] = React.useState(true);
  const recognitionRef = useRef<any>(null);
  const [error, setError] = React.useState("");
  const [permissionDenied, setPermissionDenied] = React.useState(false);
  React.useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  function startVoiceToText() {
    setError("");
    setPermissionDenied(false);
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
      setError("Voice recognition not supported in this browser.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setNotes(prev => prev + transcript);
    };
    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'denied') {
        setPermissionDenied(true);
        setError("Microphone access denied. Please allow mic access, use HTTPS, and reload the page.");
      } else {
        setError("Voice recognition error: " + event.error);
      }
      setRecording(false);
    };
    recognition.onend = () => {
      setRecording(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  function stopVoiceToText() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
    }
  }

  React.useEffect(() => {
    if (searchParams.get("new") === "1") {
      setIsDialogOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto py-10">
      {/* AI-Powered Summary Bar */}
      <div className="flex flex-wrap gap-4 mb-4 items-center bg-muted/40 rounded-lg p-4 border">
        <div className="font-semibold text-lg">Total Calls: {totalCalls}</div>
        <div className="text-blue-600">Follow-ups: {totalFollowUps}</div>
        <div className="text-green-600">Total Value: ${totalValue.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">AI Sentiment: <span className="text-green-600 font-semibold">Positive</span></div>
        <div className="text-xs text-muted-foreground">Top Tags: <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">hot lead</span> <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">VIP</span></div>
        <div className="text-xs text-muted-foreground">AI Next Step: <span className="font-medium">Schedule follow-up for top clients</span></div>
        <div className="text-xs text-muted-foreground">Value Trend: <span className="text-green-600 font-semibold">↑ 12% this month</span></div>
        <Button size="icon" variant="outline" className="ml-auto" onClick={() => handleExport('csv')} disabled={exporting} aria-label="Export CSV" title="Export CSV">
          <Download className="h-5 w-5" />
        </Button>
        <Button size="icon" variant="outline" onClick={() => handleExport('pdf')} disabled={exporting} aria-label="Export PDF" title="Export PDF">
          <FileText className="h-5 w-5" />
        </Button>
        <Button size="icon" variant="outline" onClick={handlePrint} disabled={printing} aria-label="Print" title="Print">
          <Printer className="h-5 w-5" />
        </Button>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Sales department A">Sales department A</SelectItem>
            <SelectItem value="Sales department B">Sales department B</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterClientType} onValueChange={setFilterClientType}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Client Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="VIP">VIP</SelectItem>
            <SelectItem value="Retail">Retail</SelectItem>
            <SelectItem value="Trade">Trade</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterProduct} onValueChange={setFilterProduct}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Product/Service" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="Diamond Ring">Diamond Ring</SelectItem>
            <SelectItem value="Gold Necklace">Gold Necklace</SelectItem>
            <SelectItem value="Loose Diamond">Loose Diamond</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSalesStage} onValueChange={setFilterSalesStage}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Sales Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="Consultation">Consultation</SelectItem>
            <SelectItem value="Follow-up">Follow-up</SelectItem>
            <SelectItem value="Negotiation">Negotiation</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterFollowUp} onValueChange={setFilterFollowUp}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Follow-up" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
        {/* Date Range Picker placeholder */}
        {/* <DateRangePicker value={filterDateRange} onChange={setFilterDateRange} /> */}
        <Button size="sm" variant="outline" onClick={() => {
          setFilterDepartment("all"); setFilterClientType("all"); setFilterProduct("all"); setFilterSalesStage("all"); setFilterFollowUp("all"); setFilterDateRange(null); setShowOnlyMissed(false); setShowStarred(false);
        }}>Clear Filters</Button>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={showOnlyMissed} onChange={e => setShowOnlyMissed(e.target.checked)} /> Only Missed/Unanswered
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={showStarred} onChange={e => setShowStarred(e.target.checked)} /> Starred Only
        </label>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-primary" /> Call Log
          </h1>
          <div className="text-muted-foreground text-sm">
            All calls for customer <span className="font-semibold">
              {loading ? "Loading..." : customer?.full_name || id}
            </span>
          </div>
        </div>
        <div className="flex gap-2 items-start">
          <Input
            placeholder="Search call logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs h-10"
          />
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 h-10 text-sm font-medium whitespace-nowrap min-w-[140px]">
                <Plus className="h-4 w-4" /> New Call Log
              </Button>
              <Button size="icon" variant="outline" aria-label="Export" title="Export" className="h-10 w-10">
                <Download className="h-5 w-5" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => setAiPanelOpen(v => !v)} className="flex items-center gap-2 h-10 text-sm font-medium w-fit">
              <Sparkles className="h-4 w-4 text-primary" /> AI Assistant
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm font-medium">Sort by:</label>
        <Select value={sortOrder} onValueChange={v => setSortOrder(v as 'asc' | 'desc')}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Sort Order" /></SelectTrigger>
          <SelectContent>
            {sortOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Client Type</TableHead>
              <TableHead>Product/Service</TableHead>
              <TableHead>Carat/Material</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Sales Stage</TableHead>
              <TableHead>Contact Number</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead>Follow-up Date</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Star</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map(log => (
              <React.Fragment key={log.id}>
                <TableRow className="hover:bg-muted/50">
                  <TableCell>{log.department}</TableCell>
                  <TableCell>
                    <button
                      className="text-primary underline hover:text-primary/80 font-medium cursor-pointer"
                      onClick={() => { setSelectedContact(log.contact); setIsContactDialogOpen(true); }}
                    >
                      {log.contact}
                    </button>
                  </TableCell>
                  <TableCell>{log.clientType}</TableCell>
                  <TableCell>
                    {editingId === log.id ? (
                      <Input value={editValues.product} onChange={e => handleEditChange('product', e.target.value)} />
                    ) : (
                      log.product
                    )}
                  </TableCell>
                  <TableCell>{log.carat} {log.material}</TableCell>
                  <TableCell>
                    {editingId === log.id ? (
                      <Input value={editValues.value} onChange={e => handleEditChange('value', e.target.value)} />
                    ) : (
                      log.value
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === log.id ? (
                      <Input value={editValues.salesStage} onChange={e => handleEditChange('salesStage', e.target.value)} />
                    ) : (
                      log.salesStage
                    )}
                  </TableCell>
                  <TableCell>{log.contactNumber}</TableCell>
                  <TableCell>{log.purpose}</TableCell>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.time}</TableCell>
                  <TableCell>{log.duration}</TableCell>
                  <TableCell>{log.followUp ? "✔" : ""}</TableCell>
                  <TableCell>{log.followUpDate}</TableCell>
                  <TableCell>
                    {editingId === log.id ? (
                      <Input value={editValues.notes} onChange={e => handleEditChange('notes', e.target.value)} />
                    ) : (
                      log.notes
                    )}
                  </TableCell>
                  <TableCell>
                    <button onClick={() => setCallLogs(logs => logs.map(log => log.id === log.id ? { ...log, starred: !log.starred } : log))} className="text-xl cursor-pointer">
                      {log.starred ? "★" : "☆"}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => { setFollowUpId(log.id); setFollowUpValue({ date: '', notes: '' }); }}>Add Follow-up</Button>
                  </TableCell>
                </TableRow>
                {expanded === log.id && (
                  <TableRow>
                    <TableCell colSpan={17} className="bg-muted/30">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="font-semibold mb-1">AI Insights</div>
                          <div className="text-sm mb-2">Sentiment: <span className="text-green-600 font-medium">Positive</span> | Tags: <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">hot lead</span></div>
                          <div className="text-muted-foreground text-xs mb-2">AI Summary: Customer is interested in {log.product}, value {log.value}. {log.aiNextStep}</div>
                          <div className="text-muted-foreground text-xs mb-2">AI Message: {log.aiMessage}</div>
                        </div>
                        <div className="w-full md:w-80 bg-white border rounded p-4 flex flex-col gap-2">
                          <div className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />AI Assistant</div>
                          <div className="text-xs text-muted-foreground">Ask the AI for insights, next steps, or a personalized follow-up for this call.</div>
                          <div className="flex gap-2 mt-2 items-center">
                            <Button variant="outline" className="flex items-center gap-2" type="button" aria-label="AI Suggest" title="AI Suggest (coming soon)"><Sparkles className="h-4 w-4 text-primary" /> AI Suggest</Button>
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                              type="button"
                              onClick={recording ? stopVoiceToText : startVoiceToText}
                              aria-label="Voice to Text"
                              title={supported ? (recording ? "Stop Recording" : "Start Voice-to-Text") : "Voice recognition not supported"}
                              disabled={!supported}
                            >
                              <Upload className="h-4 w-4" />
                              {recording ? (
                                <span className="flex items-center gap-1">
                                  <svg className="animate-spin h-4 w-4 text-red-600" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
                                  Stop
                                </span>
                              ) : (
                                <span>Voice-to-Text</span>
                              )}
                            </Button>
                            {recording && <span className="text-xs text-red-600 animate-pulse ml-2">● Recording...</span>}
                          </div>
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
                                  <Button size="sm" variant="outline" className="mt-2" onClick={startVoiceToText}>Try Again</Button>
                                </>
                              )}
                            </div>
                          )}
                          {!error && !supported && (
                            <div className="text-xs text-red-600 mt-1">Voice recognition is not supported in this browser.</div>
                          )}
                          <div className="text-xs text-muted-foreground mt-2">AI-powered suggestions and voice-to-text are available. Speak to fill in notes.</div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Use shared LogPhoneCallDialog for New Call Log */}
      <LogPhoneCallDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={{ id }}
        onLog={log => {
          setCallLogs(prev => [
            {
              ...log,
              id: Date.now().toString(),
              date: new Date().toISOString().slice(0, 10),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              // Add any other default fields as needed
            },
            ...prev
          ])
        }}
      />
      {aiPanelOpen && (
        <div className="fixed top-24 right-8 w-96 bg-white border rounded shadow-lg p-6 z-50">
          <div className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />AI Assistant</div>
          <div className="text-xs text-muted-foreground mb-2">Ask the AI for call log insights, upsell/cross-sell ideas, or personalized follow-up for this customer.</div>
          <Input placeholder="Ask AI... (mocked)" />
          <Button size="sm" className="self-end mt-2">Send</Button>
        </div>
      )}
      {/* Advanced Timeline View */}
      <div className="mt-10">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            <CardTitle>Call Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button size="sm" variant={timelineType === 'all' ? 'default' : 'outline'} onClick={() => setTimelineType('all')}>All</Button>
              <Button size="sm" variant={timelineType === 'followup' ? 'default' : 'outline'} onClick={() => setTimelineType('followup')}>Follow-up</Button>
              <Button size="sm" variant={timelineType === 'missed' ? 'default' : 'outline'} onClick={() => setTimelineType('missed')}>Missed</Button>
              <Button size="sm" variant={timelineType === 'consultation' ? 'default' : 'outline'} onClick={() => setTimelineType('consultation')}>Consultation</Button>
            </div>
            <div className="flex flex-col gap-4">
              {Object.entries(groupedTimeline).sort((a, b) => b[0].localeCompare(a[0])).map(([month, logs]) => (
                <div key={month}>
                  <div className="font-semibold text-primary mb-2 text-base">{new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                  <div className="flex flex-col gap-2 pl-2 border-l-2 border-primary/30">
                    {(logs as any[]).map(l => (
                      <div key={l.id} className="flex items-center gap-2 text-sm">
                        <span>{callTypeIcon(l.purpose)}</span>
                        <span className="font-medium">{l.date}</span>
                        <span className="text-muted-foreground">{l.product} ({l.value})</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">{l.salesStage}</span>
                        <span className="text-xs text-muted-foreground">{l.notes}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Contact Call History Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Call History for {selectedContact}</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              {/* AI Summary & Insights */}
              <div className="flex flex-col md:flex-row gap-4 items-center mb-2">
                <div className="flex-1">
                  <div className="font-semibold text-lg">Total Calls: {callLogs.filter(l => l.contact === selectedContact).length}</div>
                  <div className="text-blue-600">Follow-ups: {callLogs.filter(l => l.contact === selectedContact && l.followUp).length}</div>
                  <div className="text-green-600">Total Value: ${callLogs.filter(l => l.contact === selectedContact).reduce((sum, l) => sum + (parseFloat(l.value?.replace(/[^\\d.]/g, "")) || 0), 0).toLocaleString()}</div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <div className="text-xs text-muted-foreground">AI Sentiment: <span className="text-green-600 font-semibold">Positive</span></div>
                  <div className="text-xs text-muted-foreground">Tags: <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">hot lead</span></div>
                  <div className="text-xs text-muted-foreground">AI Next Step: <span className="font-medium">Follow up with personalized offer</span></div>
                </div>
              </div>
              {/* Filters/Search */}
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <Input
                  placeholder="Search notes, product, or value..."
                  value={contactDialogSearch}
                  onChange={e => setContactDialogSearch(e.target.value)}
                  className="max-w-xs"
                />
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={contactDialogShowStarred} onChange={e => setContactDialogShowStarred(e.target.checked)} /> Starred Only
                </label>
              </div>
              {/* Table of all calls for this contact, notes first, expandable */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Notes</TableHead>
                      <TableHead>Product/Service</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Follow-up</TableHead>
                      <TableHead>Star</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {callLogs.filter(l => l.contact === selectedContact &&
                      (!contactDialogShowStarred || l.starred) &&
                      (l.notes.toLowerCase().includes(contactDialogSearch.toLowerCase()) ||
                        l.product.toLowerCase().includes(contactDialogSearch.toLowerCase()) ||
                        l.value.toLowerCase().includes(contactDialogSearch.toLowerCase()))
                    ).map(l => (
                      <React.Fragment key={l.id}>
                        <TableRow className="hover:bg-muted/50">
                          <TableCell>
                            <button className="text-left font-medium underline hover:text-primary" onClick={() => setContactDialogExpanded(l.id)}>
                              {l.notes.length > 40 ? l.notes.slice(0, 40) + "..." : l.notes}
                            </button>
                          </TableCell>
                          <TableCell>{l.product}</TableCell>
                          <TableCell>{l.value}</TableCell>
                          <TableCell>{l.date}</TableCell>
                          <TableCell>{l.duration}</TableCell>
                          <TableCell>{l.followUp ? "✔" : ""}</TableCell>
                          <TableCell>{l.starred ? "★" : "☆"}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" className="mr-1" onClick={() => router.push(`/dashboard/customers/${id}/call-log/notes`)}>View Notes</Button>
                            <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/customers/${id}/send-email`)}>Add Follow-up</Button>
                          </TableCell>
                        </TableRow>
                        {contactDialogExpanded === l.id && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/30">
                              <div className="flex flex-col gap-2">
                                <div className="font-semibold">Full Notes</div>
                                <div className="text-muted-foreground text-sm mb-2">{l.notes}</div>
                                <div className="text-xs text-muted-foreground">AI Insights: {l.aiNextStep}</div>
                                <div className="text-xs text-muted-foreground">AI Message: {l.aiMessage}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Timeline View for this contact */}
              <div className="mt-6">
                <div className="font-semibold mb-2 flex items-center gap-2"><List className="h-4 w-4 text-primary" />Call Timeline</div>
                <div className="flex flex-col gap-1 text-xs">
                  {callLogs.filter(l => l.contact === selectedContact).map(l => (
                    <div key={l.id}>
                      {l.date}: {l.product} ({l.value}) - {l.salesStage} | {l.notes}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={v => { if (!v) setDeleteId(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Call Log</DialogTitle></DialogHeader>
          <div>Are you sure you want to delete this call log? This cannot be undone.</div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              setCallLogs(logs => logs.filter(l => l.id !== deleteId));
              setDeleteId(null);
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add Follow-up Dialog */}
      <Dialog open={!!followUpId} onOpenChange={v => { if (!v) setFollowUpId(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Follow-up</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input type="date" value={followUpValue.date} onChange={e => setFollowUpValue(v => ({ ...v, date: e.target.value }))} placeholder="Follow-up Date" />
            <Input value={followUpValue.notes} onChange={e => setFollowUpValue(v => ({ ...v, notes: e.target.value }))} placeholder="Follow-up Notes" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFollowUpId(null)}>Cancel</Button>
            <Button onClick={() => {
              setCallLogs((logs: any[]) => logs.map((l: any) => l.id === followUpId ? { ...l, followUp: true, followUpDate: followUpValue.date, notes: l.notes + (followUpValue.notes ? `\nFollow-up: ${followUpValue.notes}` : "") } : l));
              setFollowUpId(null);
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 