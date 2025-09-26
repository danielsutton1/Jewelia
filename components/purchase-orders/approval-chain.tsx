"use client"

import { CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ApprovalStep, ApprovalStatus } from "@/types/purchase-order"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ApprovalChainProps {
  steps: ApprovalStep[]
  onApprove?: (stepId: string) => void
  onReject?: (stepId: string, reason: string) => void
  className?: string
  currentUserEmail?: string
}

export function ApprovalChain({
  steps,
  onApprove,
  onReject,
  className,
  currentUserEmail = "jane.doe@jewelia.com", // In a real app, this would come from auth
}: ApprovalChainProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const getStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "skipped":
        return <ArrowRight className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusText = (status: ApprovalStatus) => {
    switch (status) {
      case "approved":
        return "Approved"
      case "rejected":
        return "Rejected"
      case "pending":
        return "Pending"
      case "skipped":
        return "Skipped"
    }
  }

  const canApprove = (step: ApprovalStep) => {
    if (!onApprove || !onReject) return false

    // Check if this is the current user's step
    if (step.approverEmail !== currentUserEmail) return false

    // Check if this step is pending
    if (step.status !== "pending") return false

    // Check if all previous steps are approved
    const stepIndex = sortedSteps.findIndex((s) => s.id === step.id)
    if (stepIndex > 0) {
      const previousStepsApproved = sortedSteps
        .slice(0, stepIndex)
        .every((s) => s.status === "approved" || s.status === "skipped")

      return previousStepsApproved
    }

    return true
  }

  return (
    <div className={cn("space-y-4", className)}>
      {sortedSteps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            "flex items-start p-4 rounded-lg border",
            step.status === "approved"
              ? "bg-green-50 border-green-200"
              : step.status === "rejected"
                ? "bg-red-50 border-red-200"
                : step.status === "pending"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-muted/30 border-muted",
          )}
        >
          <Avatar className="h-10 w-10 mr-4">
            <AvatarFallback>{getInitials(step.approverName)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <h4 className="text-sm font-medium">{step.approverName}</h4>
              <span className="mx-2 text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{step.approverRole}</span>
            </div>

            <div className="flex items-center mt-1">
              {getStatusIcon(step.status)}
              <span className="ml-1 text-sm">{getStatusText(step.status)}</span>
              {step.approvedAt && (
                <>
                  <span className="mx-1 text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{new Date(step.approvedAt).toLocaleString()}</span>
                </>
              )}
            </div>

            {step.comments && <p className="mt-1 text-sm">{step.comments}</p>}

            {canApprove(step) && (
              <div className="mt-2 flex space-x-2">
                <Button size="sm" onClick={() => onApprove?.(step.id)}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => onReject?.(step.id, "")}>
                  Reject
                </Button>
              </div>
            )}
          </div>

          {index < sortedSteps.length - 1 && (
            <div className="absolute left-7 top-14 h-full border-l border-dashed border-muted-foreground/30" />
          )}
        </div>
      ))}
    </div>
  )
}
