export type ServiceType =
  | "casting"
  | "stone-setting"
  | "engraving"
  | "polishing"
  | "plating"
  | "repair"
  | "custom-design"
  | "appraisal"
  | "cad-modeling"
  | "3d-printing"

export type MaterialProvision = "client-provided" | "provider-sourced" | "mixed"

export type RequestStatus =
  | "draft"
  | "submitted"
  | "matching"
  | "quoted"
  | "assigned"
  | "in-progress"
  | "quality-check"
  | "completed"
  | "cancelled"

export type ProviderResponse = "interested" | "not-interested" | "need-more-info" | "quoted"

export interface BudgetRange {
  min: number
  max: number
  currency: string
}

export interface ServiceRequestFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
  uploadedBy: string
}

export interface ServiceRequestSpecification {
  id: string
  name: string
  value: string
  unit?: string
}

export interface ProviderQuote {
  id: string
  providerId: string
  providerName: string
  amount: number
  currency: string
  estimatedCompletionTime: string // ISO date string
  notes: string
  createdAt: string
  expiresAt: string
  status: "pending" | "accepted" | "rejected" | "expired"
}

export interface ProgressUpdate {
  id: string
  timestamp: string
  status: RequestStatus
  message: string
  updatedBy: string
  attachments: ServiceRequestFile[]
}

export interface QualityCheckpoint {
  id: string
  name: string
  description: string
  status: "pending" | "passed" | "failed"
  checkedAt?: string
  checkedBy?: string
  notes?: string
  attachments: ServiceRequestFile[]
}

export interface ProviderMatch {
  providerId: string
  providerName: string
  providerLogo?: string
  matchScore: number // 0-100
  capabilities: string[]
  averageRating: number // 0-5
  reviewCount: number
  previousTaskCount: number
  estimatedPrice?: number
  estimatedTurnaround?: string // e.g., "3-5 days"
  response?: ProviderResponse
  quote?: ProviderQuote
}

export interface ServiceRequestFeedback {
  id: string
  requestId: string
  providerId: string
  rating: number // 1-5
  comment: string
  createdAt: string
  createdBy: string
  categories: {
    quality: number
    communication: number
    timeliness: number
    value: number
  }
  publicReview: boolean
  providerResponse?: {
    comment: string
    createdAt: string
  }
}

export interface ServiceRequest {
  id: string
  title: string
  serviceType: ServiceType
  description: string
  specifications: ServiceRequestSpecification[]
  materialProvision: MaterialProvision
  materialDetails?: string
  dueDate: string // ISO date string
  budgetRange: BudgetRange
  files: ServiceRequestFile[]
  status: RequestStatus
  createdAt: string
  createdBy: string
  updatedAt: string
  providerMatches: ProviderMatch[]
  assignedProviderId?: string
  assignedProviderName?: string
  progressUpdates: ProgressUpdate[]
  qualityCheckpoints: QualityCheckpoint[]
  feedback?: ServiceRequestFeedback
  priority: "low" | "medium" | "high" | "urgent"
  tags: string[]
}
