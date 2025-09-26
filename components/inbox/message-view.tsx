"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Reply, Forward, Trash2, Archive, Star, MoreHorizontal, Paperclip } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

interface MessageViewProps {
  message: any
  onReply: () => void
}

export function MessageView({ message, onReply }: MessageViewProps) {
  const { toast } = useToast()

  if (!message) {
    return (
      <div className="flex h-[calc(100vh-220px)] min-h-[500px] items-center justify-center">
        <p className="text-muted-foreground">Select a message to view</p>
      </div>
    )
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/inbox/${message.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete message")

      toast({
        title: "Success",
        description: "Message deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[500px] flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{message.subject}</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onReply}>
              <Reply className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            From: <span className="font-medium">{message.sender_name}</span>
          </div>
          <div>{format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {message.body}
        </div>
      </div>
    </div>
  )
}
