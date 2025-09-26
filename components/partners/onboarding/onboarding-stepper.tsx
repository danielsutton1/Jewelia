"use client"

import type { OnboardingStep, OnboardingProgress } from "@/types/partner-onboarding"
import { CheckCircle2, Circle, CircleDashed } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingStepperProps {
  progress: OnboardingProgress
  onStepClick?: (step: OnboardingStep) => void
  className?: string
}

export function OnboardingStepper({ progress, onStepClick, className }: OnboardingStepperProps) {
  const steps: { id: OnboardingStep; label: string }[] = [
    { id: "basic-information", label: "Basic Information" },
    { id: "capabilities-assessment", label: "Capabilities Assessment" },
    { id: "agreement-setup", label: "Agreement Setup" },
    { id: "system-access", label: "System Access" },
    { id: "review", label: "Review & Submit" },
  ]

  const getStepStatus = (step: OnboardingStep) => {
    if (progress.completedSteps.includes(step)) {
      return "completed"
    }
    if (progress.currentStep === step) {
      return "current"
    }
    return "pending"
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center relative w-full">
            {/* Connector line */}
            {index > 0 && (
              <div
                className={cn(
                  "absolute h-[2px] top-4 -left-1/2 w-full",
                  progress.completedSteps.includes(step.id) ? "bg-primary" : "bg-border",
                )}
              />
            )}

            {/* Step circle */}
            <button
              onClick={() => onStepClick?.(step.id)}
              disabled={!onStepClick}
              className={cn(
                "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                getStepStatus(step.id) === "completed"
                  ? "bg-primary border-primary text-primary-foreground"
                  : getStepStatus(step.id) === "current"
                    ? "bg-background border-primary text-primary"
                    : "bg-background border-muted-foreground text-muted-foreground",
              )}
            >
              {getStepStatus(step.id) === "completed" ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : getStepStatus(step.id) === "current" ? (
                <Circle className="w-6 h-6" />
              ) : (
                <CircleDashed className="w-6 h-6" />
              )}
            </button>

            {/* Step label */}
            <span
              className={cn(
                "mt-2 text-sm font-medium",
                getStepStatus(step.id) === "completed"
                  ? "text-primary"
                  : getStepStatus(step.id) === "current"
                    ? "text-foreground"
                    : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">
            Step {steps.findIndex((s) => s.id === progress.currentStep) + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium">{steps.find((s) => s.id === progress.currentStep)?.label}</span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{
              width: `${((steps.findIndex((s) => s.id === progress.currentStep) + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
