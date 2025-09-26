"use client"

import { format, differenceInDays } from "date-fns"
import { AlertTriangle, Calendar, CheckCircle2 } from "lucide-react"
import React, { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { generateSampleWorkOrders } from "../kanban/data"

export function UpcomingDeadlines() {
  const [workOrders, setWorkOrders] = useState<any[]>([])

  useEffect(() => {
    const orders = generateSampleWorkOrders(20)
      .map((order) => ({
        ...order,
        dueDate: new Date(order.dueDate),
      }))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 8)
    setWorkOrders(orders)
  }, [])

  const today = new Date()

  if (workOrders.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">Loading deadlines...</div>
  }

  return (
    <div className="space-y-4">
      {workOrders.map((order) => {
        const daysUntilDue = differenceInDays(order.dueDate, today)

        const badgeVariant = "outline"
        let badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200"
        let icon = CheckCircle2

        if (daysUntilDue < 0) {
          badgeColor = "bg-red-100 text-red-800 border-red-200"
          icon = AlertTriangle
        } else if (daysUntilDue <= 3) {
          badgeColor = "bg-amber-100 text-amber-800 border-amber-200"
          icon = AlertTriangle
        }

        return (
          <div key={order.id} className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{order.itemDescription}</h3>
                <p className="text-sm text-muted-foreground">{order.customerName}</p>
              </div>
              <Badge variant={badgeVariant} className={`flex items-center gap-1 ${badgeColor}`}>
                {React.createElement(icon, { className: "h-3 w-3" })}
                {daysUntilDue < 0
                  ? `${Math.abs(daysUntilDue)} days overdue`
                  : daysUntilDue === 0
                    ? "Due today"
                    : `${daysUntilDue} days left`}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Due: {format(order.dueDate, "MMM d, yyyy")}</span>
              </div>
              <Badge variant="secondary" className="capitalize">
                {order.currentStage}
              </Badge>
            </div>
            <Separator />
          </div>
        )
      })}

      <Button variant="outline" className="w-full">
        View All Deadlines
      </Button>
    </div>
  )
}
