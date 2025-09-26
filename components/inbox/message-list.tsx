"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { getCommunicationThreads } from "@/lib/database"
import type { CommunicationThread as DbCommunicationThread, CommunicationMessage, User } from "@/types/database"

export interface Partner {
  id: string;
  name: string;
  role: string;
  // Add other partner fields if needed
}

export type EnrichedCommunicationThread = DbCommunicationThread & {
  partner: Partner | null;
  messages: CommunicationMessage[];
}

interface MessageListProps {
  view: "inbox" | "sent" | "drafts"
  selectedMessage: any
  onMessageSelect: (message: any) => void
}

const viewToStatusMap = {
  inbox: ["active", "pending"],
  sent: [],
  drafts: [],
}

export function MessageList({ view, selectedMessage, onMessageSelect }: MessageListProps) {
  const [messages, setMessages] = useState<EnrichedCommunicationThread[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [view])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const filters = {
        status: viewToStatusMap[view].length > 0 ? viewToStatusMap[view] as any : undefined,
      }
      const data = await getCommunicationThreads(filters) as EnrichedCommunicationThread[]
      setMessages(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMessages = messages.filter((message) =>
    message.subject.toLowerCase().includes(search.toLowerCase()) ||
    (message.partner?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[500px] flex-col">
      <div className="border-b p-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 rounded-md"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No messages found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredMessages.map((message) => (
              <button
                key={message.id}
                className={cn(
                  "w-full p-4 text-left hover:bg-muted/50",
                  selectedMessage?.id === message.id && "bg-muted"
                )}
                onClick={() => onMessageSelect(message)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-medium leading-none">
                      {message.partner?.name || "Unknown Sender"}
                    </p>
                    <p className="text-sm text-muted-foreground">{message.subject}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {format(new Date(message.last_message_at), "MMM d")}
                  </div>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {message.messages?.[0]?.content || "No content"}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
