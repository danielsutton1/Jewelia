"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Clock, MessageSquare, Upload } from "lucide-react"
import { format, parseISO } from "date-fns"
import type { ProgressUpdate, QualityCheckpoint, ServiceRequestFile } from "@/types/service-request"

interface RequestTrackingProps {
  progressUpdates: ProgressUpdate[]
  qualityCheckpoints: QualityCheckpoint[]
  onAddUpdate?: (message: string, files: File[]) => void
}

export function RequestTracking({ progressUpdates, qualityCheckpoints, onAddUpdate }: RequestTrackingProps) {
  const [activeTab, setActiveTab] = useState("progress")
  const [updateMessage, setUpdateMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])

  const handleAddUpdate = () => {
    if (updateMessage.trim() === "") return
    if (onAddUpdate) {
      onAddUpdate(updateMessage, files)
      setUpdateMessage("")
      setFiles([])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const renderAttachment = (attachment: ServiceRequestFile) => {
    return (
      <div key={attachment.id} className="flex items-center p-2 rounded bg-muted mb-2">
        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="text-sm truncate flex-grow">{attachment.name}</span>
        <span className="text-xs text-muted-foreground mx-2">{(attachment.size / 1024).toFixed(0)} KB</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
          <a href={attachment.url} download target="_blank" rel="noopener noreferrer">
            <span className="sr-only">Download</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </a>
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="progress" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="progress">Progress Updates</TabsTrigger>
          <TabsTrigger value="quality">Quality Checkpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          {onAddUpdate && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Add Update</CardTitle>
                <CardDescription>Add a progress update or message about this service request</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter your update message..."
                    value={updateMessage}
                    onChange={(e) => setUpdateMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex items-center space-x-2">
                    <Button type="button" variant="outline" className="relative" asChild>
                      <label>
                        <Upload className="h-4 w-4 mr-2" />
                        Attach Files
                        <input type="file" className="sr-only" multiple onChange={handleFileChange} />
                      </label>
                    </Button>
                    <span className="text-sm text-muted-foreground">{files.length} file(s) selected</span>
                  </div>
                  <Button onClick={handleAddUpdate} disabled={updateMessage.trim() === ""}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Post Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {progressUpdates.length > 0 ? (
              [...progressUpdates]
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((update) => (
                  <Card key={update.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{update.message}</CardTitle>
                          <CardDescription>
                            {format(parseISO(update.timestamp), "MMMM d, yyyy 'at' h:mm a")} by {update.updatedBy}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(update.status)}>
                          {update.status.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      </div>
                    </CardHeader>
                    {update.attachments.length > 0 && (
                      <CardContent>
                        <h4 className="text-sm font-medium mb-2">Attachments</h4>
                        <div className="space-y-1">{update.attachments.map(renderAttachment)}</div>
                      </CardContent>
                    )}
                  </Card>
                ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No progress updates yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="space-y-4">
            {qualityCheckpoints.length > 0 ? (
              qualityCheckpoints.map((checkpoint) => (
                <Card key={checkpoint.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{checkpoint.name}</CardTitle>
                        <CardDescription>{checkpoint.description}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(checkpoint.status)}>
                        {checkpoint.status.charAt(0).toUpperCase() + checkpoint.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {checkpoint.status !== "pending" && (
                      <div className="mb-3">
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>
                            {checkpoint.checkedAt
                              ? format(parseISO(checkpoint.checkedAt), "MMMM d, yyyy 'at' h:mm a")
                              : "Not checked yet"}
                          </span>
                        </div>
                        {checkpoint.checkedBy && (
                          <div className="text-sm mt-1">
                            <span className="font-medium">Checked by:</span> <span>{checkpoint.checkedBy}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {checkpoint.notes && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-1">Notes</h4>
                        <p className="text-sm">{checkpoint.notes}</p>
                      </div>
                    )}

                    {checkpoint.attachments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Attachments</h4>
                        <div className="space-y-1">{checkpoint.attachments.map(renderAttachment)}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No quality checkpoints defined</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
