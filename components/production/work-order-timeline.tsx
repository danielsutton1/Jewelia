"use client"

import { useState } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { CheckCircle2, Clock, ImageIcon, X } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface WorkOrderTimelineProps {
  workOrder: any // Using any for brevity, should be properly typed in a real application
}

export function WorkOrderTimeline({ workOrder }: WorkOrderTimelineProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [newNote, setNewNote] = useState("")

  // All possible stages in order
  const allStages = [
    "Design/CAD",
    "Wax/3D Print",
    "Casting",
    "Stone Setting",
    "Polishing",
    "Quality Control",
    "Ready for Delivery",
  ]

  // Get the current stage index
  const currentStageIndex = allStages.findIndex((stage) => stage === workOrder.currentStage)

  return (
    <div className="space-y-6">
      {/* Stage Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Production Stages</CardTitle>
          <CardDescription>Progress through manufacturing stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allStages.map((stage, index) => {
              // Check if this stage is completed
              const stageData = workOrder.timeline.find((t: any) => t.stage === stage)
              const isCompleted = stageData && stageData.endDate
              const isCurrent = stage === workOrder.currentStage
              const isPending = index > currentStageIndex

              return (
                <div
                  key={stage}
                  className={`flex items-center gap-3 rounded-md border p-3 ${isCurrent ? "border-blue-300 bg-blue-50" : ""}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : isCurrent ? (
                    <Clock className="h-5 w-5 text-blue-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2"></div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={isPending ? "text-muted-foreground" : "font-medium"}>{stage}</span>
                      {isCompleted && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Completed {stageData.endDate && format(new Date(stageData.endDate), "MMM d, yyyy")}
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          In Progress
                        </Badge>
                      )}
                    </div>
                    {stageData && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {stageData.completedBy ? `Completed by ${stageData.completedBy}` : ""}
                        {stageData.duration ? ` • ${stageData.duration} day${stageData.duration > 1 ? "s" : ""}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Details */}
      <div className="space-y-6">
        {workOrder.timeline.map((timelineItem: any, index: number) => (
          <Card key={timelineItem.stage}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{timelineItem.stage}</CardTitle>
                  <CardDescription>
                    {timelineItem.startDate && format(new Date(timelineItem.startDate), "MMM d, yyyy")}
                    {timelineItem.endDate && ` - ${format(new Date(timelineItem.endDate), "MMM d, yyyy")}`}
                    {timelineItem.duration && ` (${timelineItem.duration} day${timelineItem.duration > 1 ? "s" : ""})`}
                  </CardDescription>
                </div>
                {timelineItem.endDate ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    In Progress
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Craftsperson */}
              {timelineItem.completedBy && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Craftsperson</h3>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={`/abstract-geometric-shapes.png?height=32&width=32&query=${timelineItem.completedBy}`}
                      />
                      <AvatarFallback>{timelineItem.completedBy.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{timelineItem.completedBy}</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              {timelineItem.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                  <div className="rounded-md border p-3">
                    <p className="text-sm">{timelineItem.notes}</p>
                  </div>
                </div>
              )}

              {/* Photos */}
              {timelineItem.photos && timelineItem.photos.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Photos</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {timelineItem.photos.map((photo: string, photoIndex: number) => (
                      <div key={photoIndex} className="relative aspect-square overflow-hidden rounded-md border">
                        <Image
                          src={photo || "/placeholder.svg"}
                          alt={`${timelineItem.stage} photo ${photoIndex + 1}`}
                          fill
                          className="object-cover"
                        />
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                          onClick={() => setSelectedImage(photo)}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Check */}
              {timelineItem.qualityCheck && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Quality Check</h3>
                  <div
                    className={`rounded-md border p-3 ${timelineItem.qualityCheck.passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {timelineItem.qualityCheck.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        <span className={timelineItem.qualityCheck.passed ? "text-green-700" : "text-red-700"}>
                          {timelineItem.qualityCheck.passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {timelineItem.qualityCheck.date &&
                          format(new Date(timelineItem.qualityCheck.date), "MMM d, yyyy")}
                      </div>
                    </div>
                    {timelineItem.qualityCheck.checkedBy && (
                      <div className="mt-2 flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={`/abstract-geometric-shapes.png?height=32&width=32&query=${timelineItem.qualityCheck.checkedBy}`}
                          />
                          <AvatarFallback>{timelineItem.qualityCheck.checkedBy.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          Checked by {timelineItem.qualityCheck.checkedBy}
                        </span>
                      </div>
                    )}
                    {timelineItem.qualityCheck.notes && (
                      <div className="mt-2 text-sm">{timelineItem.qualityCheck.notes}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Add Note Form - only for current stage */}
              {timelineItem.stage === workOrder.currentStage && !timelineItem.endDate && (
                <div className="mt-4 print:hidden">
                  <Separator className="my-4" />
                  <h3 className="text-sm font-medium mb-2">Add Note or Update</h3>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add notes, updates, or observations about this stage..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm" type="button">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Add Photo
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" type="button">
                          Save Note
                        </Button>
                        <Button size="sm" type="button">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Complete Stage
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Viewer Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>View the full-size image</DialogDescription>
          </DialogHeader>
          <div className="relative aspect-square w-full overflow-hidden rounded-md">
            {selectedImage && (
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt="Full size preview"
                fill
                className="object-contain"
              />
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelectedImage(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
