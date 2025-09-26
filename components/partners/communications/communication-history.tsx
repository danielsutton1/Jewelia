"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  Download,
  Filter,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckSquare,
  AlertTriangle,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { format, parseISO } from "date-fns"
import { mockCommunicationThreads } from "@/data/mock-communications"
import type { CommunicationThread, CommunicationType } from "@/types/partner-communication"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Badge } from "@/components/ui/badge"
import type { DateRange } from "react-day-picker"

interface CommunicationHistoryProps {
  onSelectThread: (thread: CommunicationThread) => void
  loading?: boolean
}

export default function CommunicationHistory({ onSelectThread, loading }: CommunicationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<CommunicationType[]>([])
  const [selectedPartners, setSelectedPartners] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Get unique partners from the mock data
  const partners = Array.from(new Set(mockCommunicationThreads.map((t) => t.partnerId))).map((id) => {
    const thread = mockCommunicationThreads.find((t) => t.partnerId === id)
    return { id, name: thread?.partnerName || "" }
  })

  const filteredThreads = mockCommunicationThreads.filter((thread) => {
    const matchesSearch =
      thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.messages.some((m) => m.content.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(thread.type)

    const matchesPartner = selectedPartners.length === 0 || selectedPartners.includes(thread.partnerId)

    let matchesDate = true
    if (dateRange?.from && dateRange?.to) {
      const threadDate = parseISO(thread.lastMessageAt)
      matchesDate = threadDate >= dateRange.from && threadDate <= new Date(dateRange.to.setHours(23, 59, 59, 999))
    }

    return matchesSearch && matchesType && matchesPartner && matchesDate
  })

  // Sort threads by lastMessageAt (most recent first)
  const sortedThreads = [...filteredThreads].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  )

  const getTypeIcon = (type: CommunicationType) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "call":
        return <Phone className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "task":
        return <CheckSquare className="h-4 w-4" />
      case "issue":
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const handleTypeToggle = (type: CommunicationType) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const handlePartnerToggle = (partnerId: string) => {
    setSelectedPartners((prev) =>
      prev.includes(partnerId) ? prev.filter((p) => p !== partnerId) : [...prev, partnerId],
    )
  }

  const handleExport = () => {
    // In a real app, this would generate a CSV or PDF export
    console.log("Exporting data:", sortedThreads)
    alert("Export functionality would be implemented here")
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-blue-100 text-blue-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "urgent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Communication Type</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(["message", "email", "call", "meeting", "document", "task", "issue"] as CommunicationType[]).map(
                      (type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={selectedTypes.includes(type)}
                            onCheckedChange={() => handleTypeToggle(type)}
                          />
                          <Label htmlFor={`type-${type}`} className="capitalize">
                            {type}
                          </Label>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Network</h4>
                  <div className="space-y-2">
                    {partners.map((partner) => (
                      <div key={partner.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`partner-${partner.id}`}
                          checked={selectedPartners.includes(partner.id)}
                          onCheckedChange={() => handlePartnerToggle(partner.id)}
                        />
                        <Label htmlFor={`partner-${partner.id}`}>{partner.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Date Range</h4>
                  <DatePickerWithRange dateRange={dateRange} onDateRangeChange={setDateRange} />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Loading communications...
                </TableCell>
              </TableRow>
            ) : sortedThreads.length > 0 ? (
              sortedThreads.map((thread) => (
                <TableRow
                  key={thread.id}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => onSelectThread(thread)}
                >
                  <TableCell>{format(parseISO(thread.lastMessageAt), "MMM d, yyyy")}</TableCell>
                  <TableCell>{thread.partnerName}</TableCell>
                  <TableCell>{thread.subject}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getTypeIcon(thread.type)}
                      <span className="capitalize">{thread.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(thread.priority)}>{thread.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(thread.status)}>{thread.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No communications found matching your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
