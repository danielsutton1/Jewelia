"use client"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { format } from "date-fns"
import { Clock, GripVertical } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { WorkOrder } from "./data"

interface UnassignedWorkOrdersProps {
  workOrders: WorkOrder[]
}

export function UnassignedWorkOrders({ workOrders }: UnassignedWorkOrdersProps) {
  // Sort work orders by priority (high to low)
  const sortedWorkOrders = [...workOrders].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return (
      priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
    )
  })

  return (
    <ScrollArea className="h-[calc(100vh-300px)] pr-4">
      <div className="space-y-3">
        {sortedWorkOrders.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed p-4 text-center">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <p className="mt-2 text-sm text-muted-foreground">No unassigned work orders.</p>
            </div>
          </div>
        ) : (
          sortedWorkOrders.map((order) => <DraggableWorkOrder key={order.id} order={order} />)
        )}
      </div>
    </ScrollArea>
  )
}

interface DraggableWorkOrderProps {
  order: WorkOrder
}

function DraggableWorkOrder({ order }: DraggableWorkOrderProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: "transform 0.2s",
  }

  // Priority color
  const priorityColor = {
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-emerald-100 text-emerald-800",
  }[order.priority]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "relative cursor-grab rounded-lg border bg-card p-4 text-card-foreground shadow-sm active:cursor-grabbing",
        isDragging && "z-50 opacity-50",
      )}
    >
      <div className="absolute right-2 top-2 opacity-40 hover:opacity-100" {...listeners}>
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex justify-between">
        <div>
          <h3 className="font-medium">{order.id}</h3>
          <p className="text-sm text-muted-foreground">{order.itemDescription}</p>
        </div>
        <Badge className={priorityColor}>{order.priority}</Badge>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge variant="outline">{order.requiredSkill}</Badge>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline">
                <Clock className="mr-1 h-3 w-3" />
                {order.estimatedHours}h
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Estimated hours</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Badge variant="outline" className="bg-blue-50 text-blue-800">
          Due: {format(new Date(order.dueDate), "MMM d")}
        </Badge>
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        <span>Drag to assign to a craftsperson</span>
      </div>
    </div>
  )
}
