"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { InboxSidebar } from "@/components/inbox/inbox-sidebar"
import { MessageList } from "@/components/inbox/message-list"
import { MessageView } from "@/components/inbox/message-view"
import { ComposeDialog } from "@/components/inbox/compose-dialog"

export default function InboxPage() {
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [view, setView] = useState<"inbox" | "sent" | "drafts">("inbox")

  const handleMessageSelect = (message: any) => {
    setSelectedMessage(message)
  }

  const handleCompose = () => {
    setComposeOpen(true)
  }

  const handleMessageSent = () => {
    setComposeOpen(false)
    // Refresh message list
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight inbox-heading">Inbox</h1>
        <p className="text-sm sm:text-base text-muted-foreground inbox-subtext">Manage your internal messages and communications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 sm:gap-6">
        <InboxSidebar
          view={view}
          onViewChange={setView}
          onCompose={handleCompose}
        />
        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-0">
              <MessageList
                view={view}
                selectedMessage={selectedMessage}
                onMessageSelect={handleMessageSelect}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <MessageView
                message={selectedMessage}
                onReply={() => setComposeOpen(true)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onMessageSent={handleMessageSent}
      />
    </div>
  )
}
