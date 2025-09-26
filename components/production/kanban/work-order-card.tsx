"use client"

import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { format, differenceInDays } from "date-fns"
import { AlertCircle, Clock, ArrowRight, GripVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { WorkOrder } from "./data"
import { useRouter } from "next/navigation"

interface WorkOrderCardProps {
  order: WorkOrder
}

export function WorkOrderCard({ order }: WorkOrderCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: order.id })
  const router = useRouter()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  // Calculate due date urgency
  const dueDate = new Date(order.dueDate)
  const today = new Date()
  const daysUntilDue = differenceInDays(dueDate, today)

  let dueDateColor = "bg-emerald-50 text-emerald-700"
  if (daysUntilDue < 0) {
    dueDateColor = "bg-red-50 text-red-700"
  } else if (daysUntilDue <= 3) {
    dueDateColor = "bg-amber-50 text-amber-700"
  } else if (daysUntilDue <= 7) {
    dueDateColor = "bg-blue-50 text-blue-700"
  }

  // Format time in stage
  const formatTimeInStage = (hours: number) => {
    if (hours < 24) {
      return `${hours}h`
    }
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name?.split(" ")?.map((part) => part?.[0])
      .join("")
      .toUpperCase()
  }

  // Priority color
  const priorityColor = {
    high: "bg-red-50 text-red-700",
    medium: "bg-amber-50 text-amber-700",
    low: "bg-emerald-50 text-emerald-700",
  }[order.priority] || "bg-gray-100 text-gray-800"

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Card
            ref={setNodeRef}
            style={style}
            className={cn("relative cursor-pointer active:cursor-grabbing", isDragging && "opacity-50 z-10")}
            {...attributes}
            onClick={() => setIsDialogOpen(true)}
          >
            <CardContent className="p-3">
              <div className="absolute top-2 right-2 opacity-40 hover:opacity-100">
                <div {...listeners}>
                  <GripVertical className="h-4 w-4" />
                </div>
              </div>

              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium">
                    <span
                      className="text-blue-600 underline cursor-pointer hover:text-blue-800"
                      onClick={e => {
                        e.stopPropagation();
                        router.push(`/dashboard/orders/${order.id}`)
                      }}
                    >
                      {order.orderNumber}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground truncate max-w-[180px]">{order.itemDescription}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-2">
                <Badge variant="outline" className={priorityColor}>
                  {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                </Badge>

                <Badge variant="outline" className={dueDateColor}>
                  {format(dueDate, "MMM d")}
                </Badge>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-slate-50 text-slate-700">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeInStage(order.timeInStage)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Time in current stage</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={`/abstract-geometric-shapes.png?height=32&width=32&query=${order.assignedTo}`} />
                    <AvatarFallback>{getInitials(order.assignedTo)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs truncate max-w-[100px]">{order.assignedTo}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Work Order Details</DialogTitle>
            <DialogDescription>
              Order {order.orderNumber} for {order.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Item Description</h4>
              <p className="text-sm">{order.itemDescription}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Current Stage</h4>
              <Badge>{order.currentStage}</Badge>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{order.progress}%</span>
                </div>
                <Progress value={order.progress} className="h-2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Assigned To</h4>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={`/abstract-geometric-shapes.png?height=32&width=32&query=${order.assignedTo}`}
                    />
                    <AvatarFallback>{getInitials(order.assignedTo)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{order.assignedTo}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Due Date</h4>
                <Badge variant="outline" className={dueDateColor}>
                  {format(dueDate, "MMM d, yyyy")}
                  {daysUntilDue < 0 && (
                    <span className="ml-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Overdue
                    </span>
                  )}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Time in Current Stage</h4>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {formatTimeInStage(order.timeInStage)}
              </Badge>
            </div>

            {order.notes && (
              <div>
                <h4 className="text-sm font-medium mb-1">Notes</h4>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}

            {order.stageHistory && order.stageHistory.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Stage History</h4>
                <div className="space-y-2">
                  {order.stageHistory.map((history, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold capitalize">{history.stage}</span>
                      <span>({format(new Date(history.enteredAt), "MMM d, HH:mm")})</span>
                      {history.exitedAt && (
                        <>
                          <ArrowRight className="h-3 w-3" />
                          <span>({format(new Date(history.exitedAt), "MMM d, HH:mm")})</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
