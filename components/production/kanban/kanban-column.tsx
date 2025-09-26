"use client"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { AlertTriangle } from "lucide-react"
import { WorkOrderCard } from "./work-order-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { WorkOrder } from "./data"

interface KanbanColumnProps {
  id: string
  title: string
  orders: WorkOrder[]
  wipLimit: number
  isBottleneck?: boolean
  sortOrder?: "oldest" | "newest"
}

export function KanbanColumn({ id, title, orders, wipLimit, isBottleneck = false, sortOrder = "oldest" }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const orderIds = orders.map((order) => order.id)
  const isAtCapacity = orders.length >= wipLimit
  const capacityPercentage = (orders.length / wipLimit) * 100

  // Sort orders by dueDate
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.dueDate)
    const dateB = new Date(b.dueDate)
    return sortOrder === "oldest" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
  })

  return (
    <Card
      className={cn(
        "flex flex-col h-[calc(100vh-280px)] min-w-[300px]",
        isOver && "ring-2 ring-primary ring-opacity-50",
        isBottleneck && "ring-2 ring-destructive",
      )}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            <Badge variant={isAtCapacity ? "destructive" : "secondary"}>
              {orders.length}/{wipLimit}
            </Badge>
            {isBottleneck && <AlertTriangle className="h-4 w-4 text-destructive" />}
          </div>
        </div>
        <Progress
          value={capacityPercentage}
          className={cn(
            "h-1 mt-2",
            capacityPercentage >= 100 ? "bg-destructive/20" : "bg-secondary/20",
            capacityPercentage >= 75 && capacityPercentage < 100 ? "bg-amber-200" : "",
          )}
          indicatorClassName={cn(
            capacityPercentage >= 100 ? "bg-destructive" : "",
            capacityPercentage >= 75 && capacityPercentage < 100 ? "bg-amber-500" : "",
          )}
        />
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3">
        <div
          ref={setNodeRef}
          className={cn(
            "space-y-2 min-h-full",
            orders.length === 0 && "flex items-center justify-center h-full border-2 border-dashed rounded-md",
            isAtCapacity && "opacity-70",
          )}
        >
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">No items</p>
          ) : (
            <SortableContext items={orderIds} strategy={verticalListSortingStrategy}>
              {sortedOrders.map((order) => (
                <WorkOrderCard key={order.id} order={order} />
              ))}
            </SortableContext>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
