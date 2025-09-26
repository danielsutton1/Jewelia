"use client"

import { useState } from "react"
import type { CommunicationThread, CommunicationType } from "@/types/partner-communication"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MessageSquare, Mail, Phone, Calendar, FileText, CheckSquare, AlertTriangle, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { format, parseISO, isToday, isYesterday } from "date-fns"
import NewCommunicationDialog from "./new-communication-dialog"

interface ThreadListProps {
  threads: CommunicationThread[]
  selectedThreadId?: string
  onSelectThread: (thread: CommunicationThread) => void
  loading?: boolean
  unreadCounts?: { [threadId: string]: number }
}

export default function ThreadList({ threads, selectedThreadId, onSelectThread, loading, unreadCounts }: ThreadListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<CommunicationType | "all">("all")
  const [showNewDialog, setShowNewDialog] = useState(false)

  const filteredThreads = threads.filter((thread) => {
    const matchesSearch =
      thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.partnerName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || thread.type === filterType

    return matchesSearch && matchesType
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

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString)
    if (isToday(date)) {
      return format(date, "h:mm a")
    } else if (isYesterday(date)) {
      return "Yesterday"
    } else {
      return format(date, "MMM d")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>
          <Button onClick={() => setShowNewDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            All
          </Button>
          {(["message", "email", "call", "meeting", "document", "task", "issue"] as CommunicationType[]).map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
              className="flex items-center space-x-1"
            >
              {getTypeIcon(type)}
              <span className="capitalize">{type}</span>
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-grow">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
        ) : sortedThreads.length > 0 ? (
          <div className="divide-y">
            {sortedThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                  thread.id === selectedThreadId ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    {thread.partnerLogo ? (
                      <img src={thread.partnerLogo} alt={thread.partnerName} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                        {thread.partnerName.charAt(0)}
                      </div>
                    )}
                  </Avatar>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate">{thread.partnerName}</h4>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(thread.lastMessageAt)}
                      </span>
                      {unreadCounts && unreadCounts[thread.id] > 0 && (
                        <span className="ml-2 inline-block min-w-[18px] h-5 px-1 rounded-full bg-red-500 text-white text-xs text-center align-middle" title="Unread messages">
                          {unreadCounts[thread.id]}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{thread.subject}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="flex items-center space-x-1">
                        {getTypeIcon(thread.type)}
                        <span className="capitalize">{thread.type}</span>
                      </Badge>
                      <Badge className={getPriorityColor(thread.priority)}>{thread.priority}</Badge>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">No conversations found</div>
        )}
      </ScrollArea>

      <NewCommunicationDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onComplete={() => {
          // In a real app, this would create a new thread and add it to the list
          setShowNewDialog(false)
        }}
      />
    </div>
  )
}
