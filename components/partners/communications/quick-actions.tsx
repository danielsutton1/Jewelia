"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, Phone, Calendar, FileText, CheckSquare } from "lucide-react"
import NewCommunicationDialog from "./new-communication-dialog"
import ScheduleCallDialog from "./schedule-call-dialog"
import DocumentSharingDialog from "./document-sharing-dialog"
import CreateTaskDialog from "./create-task-dialog"
import type { CommunicationType } from "@/types/partner-communication"

interface QuickActionsProps {
  onActionComplete: () => void
}

export default function QuickActions({ onActionComplete }: QuickActionsProps) {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [callDialogOpen, setCallDialogOpen] = useState(false)
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<CommunicationType>("message")

  const handleActionClick = (type: CommunicationType) => {
    setActionType(type)

    switch (type) {
      case "message":
        setMessageDialogOpen(true)
        break
      case "call":
        setCallDialogOpen(true)
        break
      case "document":
        setDocumentDialogOpen(true)
        break
      case "task":
        setTaskDialogOpen(true)
        break
      case "meeting":
        setInteractionDialogOpen(true)
        break
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        <Button variant="outline" className="flex flex-col h-auto py-3" onClick={() => handleActionClick("message")}>
          <MessageSquare className="h-5 w-5 mb-1" />
          <span className="text-xs">Send Message</span>
        </Button>

        <Button variant="outline" className="flex flex-col h-auto py-3" onClick={() => handleActionClick("call")}>
          <Phone className="h-5 w-5 mb-1" />
          <span className="text-xs">Schedule Call</span>
        </Button>

        <Button variant="outline" className="flex flex-col h-auto py-3" onClick={() => handleActionClick("document")}>
          <FileText className="h-5 w-5 mb-1" />
          <span className="text-xs">Share Files</span>
        </Button>

        <Button variant="outline" className="flex flex-col h-auto py-3" onClick={() => handleActionClick("task")}>
          <CheckSquare className="h-5 w-5 mb-1" />
          <span className="text-xs">Create Task</span>
        </Button>

        <Button variant="outline" className="flex flex-col h-auto py-3" onClick={() => handleActionClick("meeting")}>
          <Calendar className="h-5 w-5 mb-1" />
          <span className="text-xs">Log Interaction</span>
        </Button>
      </div>

      <NewCommunicationDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        initialType="message"
        onComplete={() => {
          setMessageDialogOpen(false)
          onActionComplete()
        }}
      />

      <ScheduleCallDialog
        open={callDialogOpen}
        onOpenChange={setCallDialogOpen}
        onComplete={() => {
          setCallDialogOpen(false)
          onActionComplete()
        }}
      />

      <DocumentSharingDialog
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        onComplete={() => {
          setDocumentDialogOpen(false)
          onActionComplete()
        }}
      />

      <CreateTaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onComplete={() => {
          setTaskDialogOpen(false)
          onActionComplete()
        }}
      />

      <NewCommunicationDialog
        open={interactionDialogOpen}
        onOpenChange={setInteractionDialogOpen}
        initialType="meeting"
        onComplete={() => {
          setInteractionDialogOpen(false)
          onActionComplete()
        }}
      />
    </div>
  )
}
