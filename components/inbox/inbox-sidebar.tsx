"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Inbox, Send, Archive, Trash2, Star, Plus, Search, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ComposeDialog } from "./compose-dialog"
import { cn } from "@/lib/utils"

interface InboxSidebarProps {
  view: "inbox" | "sent" | "drafts"
  onViewChange: (view: "inbox" | "sent" | "drafts") => void
  onCompose: () => void
}

export function InboxSidebar({ view, onViewChange, onCompose }: InboxSidebarProps) {
  const [activeFolder, setActiveFolder] = useState("inbox")
  const [composeOpen, setComposeOpen] = useState(false)

  const folders = [
    { id: "inbox", name: "Inbox", icon: Inbox, count: 12 },
    { id: "sent", name: "Sent", icon: Send, count: 0 },
    { id: "starred", name: "Starred", icon: Star, count: 3 },
    { id: "archive", name: "Archive", icon: Archive, count: 0 },
    { id: "trash", name: "Trash", icon: Trash2, count: 0 },
  ]

  const labels = [
    { id: "customer", name: "Customer", color: "bg-blue-500" },
    { id: "important", name: "Important", color: "bg-red-500" },
    { id: "order", name: "Order", color: "bg-green-500" },
    { id: "support", name: "Support", color: "bg-amber-500" },
    { id: "inquiry", name: "Inquiry", color: "bg-purple-500" },
  ]

  return (
    <div className="w-64 border-r">
      <div className="p-4">
        <Button onClick={onCompose} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Compose
        </Button>
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search messages..." className="pl-8 border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 rounded-md" />
        </div>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              view === "inbox" && "bg-muted"
            )}
            onClick={() => onViewChange("inbox")}
          >
            <Inbox className="h-4 w-4" />
            Inbox
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              view === "sent" && "bg-muted"
            )}
            onClick={() => onViewChange("sent")}
          >
            <Send className="h-4 w-4" />
            Sent
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              view === "drafts" && "bg-muted"
            )}
            onClick={() => onViewChange("drafts")}
          >
            <FileText className="h-4 w-4" />
            Drafts
          </Button>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Labels</h3>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            {labels.map((label) => (
              <Button key={label.id} variant="ghost" className="w-full justify-start">
                <div className={`mr-2 h-2 w-2 rounded-full ${label.color}`} />
                {label.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onMessageSent={() => {
          // Optionally refresh the message list here
        }}
      />
    </div>
  )
}
