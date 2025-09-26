"use client"

import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { type PurchaseOrderStatus } from "@/types/purchase-order"

// Helper function to get status label
const getStatusLabel = (status: PurchaseOrderStatus): string => {
  switch (status) {
    case "draft": return "Draft"
    case "pending_approval": return "Pending Approval"
    case "approved": return "Approved"
    case "sent": return "Sent"
    case "acknowledged": return "Acknowledged"
    case "in_production": return "In Production"
    case "ready_to_ship": return "Ready to Ship"
    case "shipped": return "Shipped"
    case "partially_received": return "Partially Received"
    case "received": return "Received"
    case "completed": return "Completed"
    case "cancelled": return "Cancelled"
    case "on_hold": return "On Hold"
    default: return status
  }
}

interface StatusWorkflowProps {
  currentStatus: PurchaseOrderStatus
  className?: string
}

export function StatusWorkflow({ currentStatus, className }: StatusWorkflowProps) {
  // Define the workflow steps in order
  const workflowSteps: PurchaseOrderStatus[] = [
    "draft",
    "pending_approval",
    "approved",
    "sent",
    "acknowledged",
    "in_production",
    "ready_to_ship",
    "shipped",
    "partially_received",
    "received",
    "completed",
  ]

  // Find the current step index
  const currentStepIndex = workflowSteps.indexOf(currentStatus)

  // Handle special statuses that are not part of the normal workflow
  if (currentStatus === "cancelled" || currentStatus === "on_hold") {
    return (
      <div className={cn("flex flex-col space-y-2", className)}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <span className="font-medium">{currentStatus === "cancelled" ? "Order Cancelled" : "Order On Hold"}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {currentStatus === "cancelled"
            ? "This purchase order has been cancelled and is no longer active."
            : "This purchase order is currently on hold. Processing will resume when the hold is lifted."}
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted">
          <div
            className="absolute h-full bg-primary transition-all duration-500 ease-in-out"
            style={{
              width: `${Math.max(0, Math.min(100, (currentStepIndex / (workflowSteps.length - 1)) * 100))}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {workflowSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex
            const isCurrent = index === currentStepIndex
            const isPending = index > currentStepIndex

            return (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center z-10",
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isCurrent ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1 whitespace-nowrap",
                    isCompleted ? "text-primary" : isCurrent ? "text-primary font-medium" : "text-muted-foreground",
                  )}
                >
                  {getStatusLabel(step)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
