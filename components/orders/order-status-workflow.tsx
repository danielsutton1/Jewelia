import { CheckCircle2, Circle } from "lucide-react"

interface WorkflowStage {
  id: string
  name: string
  completed: boolean
  current?: boolean
}

interface Approval {
  id: string
  name: string
  status: string
  approver: string
}

interface ChecklistItem {
  id: string
  name: string
  completed: boolean
}

interface OrderStatusWorkflowProps {
  workflow: {
    stages: WorkflowStage[]
    approvals: Approval[]
    checklist: ChecklistItem[]
  }
}

export function OrderStatusWorkflow({ workflow }: OrderStatusWorkflowProps) {
  return (
    <div className="space-y-6">
      <div className="relative">
        {workflow.stages.map((stage, index) => (
          <div key={stage.id} className="flex items-start mb-4 last:mb-0">
            <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
              <div
                className={`h-full w-0.5 absolute left-1/2 -translate-x-1/2 ${
                  index === 0 ? "top-1/2" : "top-0"
                } ${index === workflow.stages.length - 1 ? "h-1/2" : ""} ${
                  stage.completed || stage.current ? "bg-primary" : "bg-muted"
                }`}
              ></div>
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  stage.completed
                    ? "bg-primary text-primary-foreground"
                    : stage.current
                      ? "border-2 border-primary bg-background"
                      : "border-2 border-muted bg-background"
                }`}
              >
                {stage.completed ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Circle className={`h-6 w-6 ${stage.current ? "text-primary" : "text-muted"}`} />
                )}
              </div>
            </div>
            <div className="ml-4 mt-1">
              <h3
                className={`font-medium ${
                  stage.completed ? "text-muted-foreground line-through" : stage.current ? "text-primary" : ""
                }`}
              >
                {stage.name}
              </h3>
              {stage.current && <p className="text-xs text-muted-foreground">Current stage</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
