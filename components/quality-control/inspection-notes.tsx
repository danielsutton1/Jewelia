"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send } from "lucide-react"

interface InspectionNotesProps {
  inspectionId: string
}

export function InspectionNotes({ inspectionId }: InspectionNotesProps) {
  const [newNote, setNewNote] = useState("")

  // Mock notes data
  const initialNotes = [
    {
      id: "note-1",
      author: "Alex Johnson",
      avatar: "/placeholder.svg?key=gax38",
      content: "Chain clasp needs additional inspection. The spring mechanism feels slightly stiff.",
      timestamp: "2023-11-15T10:35:00",
    },
    {
      id: "note-2",
      author: "System",
      avatar: "",
      content: "Inspection started. Checklist initialized.",
      timestamp: "2023-11-15T10:30:00",
    },
    {
      id: "note-3",
      author: "Alex Johnson",
      avatar: "/placeholder.svg?key=3g5it",
      content: "Weight is within tolerance but on the lower end of the acceptable range.",
      timestamp: "2023-11-15T10:40:00",
    },
  ]

  const [notes, setNotes] = useState(initialNotes)

  // Handle add note
  const handleAddNote = () => {
    if (!newNote.trim()) return

    const newId = `note-${notes.length + 1}`
    const timestamp = new Date().toISOString()

    setNotes([
      {
        id: newId,
        author: "Alex Johnson",
        avatar: "/placeholder.svg?key=66f3k",
        content: newNote,
        timestamp,
      },
      ...notes,
    ])

    setNewNote("")
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Inspection Notes
        </CardTitle>
        <CardDescription>Add comments and observations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-full">
          <div className="flex gap-2 mb-4">
            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px] flex-1"
            />
          </div>
          <Button onClick={handleAddNote} className="self-end mb-4 gap-1">
            <Send className="h-4 w-4" />
            Add Note
          </Button>

          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
            {notes.map((note) => (
              <div key={note.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  {note.avatar ? (
                    <AvatarImage src={note.avatar || "/placeholder.svg"} alt={note.author} />
                  ) : (
                    <AvatarFallback>{note.author.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium text-sm">{note.author}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(note.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <p className="text-sm">{note.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
