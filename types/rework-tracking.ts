export interface ReworkRecord {
  id: string
  originalWorkOrderId: string
  dateCreated: Date
  dateResolved?: Date
  status: "open" | "in-progress" | "resolved" | "closed"
  issueDescription: string
  rootCause: RootCause
  correctiveActions: CorrectiveAction[]
  timeImpact: number // in hours
  costImpact: number // in currency
  assignedTo?: string
  priority: "low" | "medium" | "high" | "critical"
  customerNotified: boolean
  customerNotificationDate?: Date
  customerFeedback?: string
  qualityCheckRequired: boolean
  qualityCheckPassed?: boolean
  qualityCheckDate?: Date
  qualityCheckedBy?: string
  attachments?: string[]
}

export interface RootCause {
  id: string
  category: string
  description: string
  systemicIssue: boolean
}

export interface CorrectiveAction {
  id: string
  description: string
  implementedBy?: string
  implementationDate?: Date
  effectivenessRating?: number // 1-5
  notes?: string
}

export interface ReworkStats {
  totalReworks: number
  openReworks: number
  resolvedReworks: number
  averageResolutionTime: number
  totalCostImpact: number
  reworksByCategory: {
    category: string
    count: number
    percentage: number
  }[]
  reworksByMonth: {
    month: string
    count: number
  }[]
  commonRootCauses: {
    cause: string
    count: number
    percentage: number
  }[]
  topAffectedProducts: {
    product: string
    count: number
    percentage: number
  }[]
}

export interface TrainingNeed {
  id: string
  skillArea: string
  description: string
  affectedEmployees: string[]
  priority: "low" | "medium" | "high"
  suggestedTraining: string
  estimatedCost: number
  estimatedTimeRequired: number // in hours
}

export interface PreventionStrategy {
  id: string
  title: string
  description: string
  targetRootCauses: string[]
  implementationSteps: string[]
  estimatedEffectiveness: number // percentage
  resourcesRequired: string
  estimatedCost: number
  implementationTimeframe: string
  status: "proposed" | "approved" | "in-progress" | "implemented" | "evaluated"
}

export interface CustomerNotificationTemplate {
  id: string
  name: string
  subject: string
  body: string
  delayNotification: boolean
  delayDuration?: number // in hours
  requireApproval: boolean
  approvalRole?: string
}
