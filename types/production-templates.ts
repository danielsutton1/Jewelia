export interface ProcessStep {
  id: string
  name: string
  description: string
  estimatedTime: number // in minutes
  requiredSkillLevel: "beginner" | "intermediate" | "advanced" | "expert"
  dependencies?: string[] // IDs of steps that must be completed before this one
}

export interface Material {
  id: string
  name: string
  description?: string
  category: string
  unit: string
  estimatedQuantity: number
  alternativeOptions?: string[]
}

export interface QualityCheckpoint {
  id: string
  name: string
  description: string
  stage: string // at which process step this check should be performed
  criteria: string[]
  severity: "low" | "medium" | "high" | "critical"
}

export interface Tool {
  id: string
  name: string
  description?: string
  category: string
  optional: boolean
}

export interface ProductionTemplate {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  version: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  status: "draft" | "published" | "archived"
  processes: ProcessStep[]
  materials: Material[]
  qualityCheckpoints: QualityCheckpoint[]
  tools: Tool[]
  estimatedTotalTime: number // in minutes
  complexity: "simple" | "moderate" | "complex" | "very complex"
  tags: string[]
  imageUrl?: string
  usageCount: number
  averageRating?: number
  notes?: string
}

export interface TemplateVariation {
  id: string
  baseTemplateId: string
  name: string
  description: string
  createdBy: string
  createdAt: Date
  changes: {
    processes?: Partial<ProcessStep>[]
    materials?: Partial<Material>[]
    qualityCheckpoints?: Partial<QualityCheckpoint>[]
    tools?: Partial<Tool>[]
  }
}

export interface TemplateVersion {
  id: string
  templateId: string
  version: string
  createdBy: string
  createdAt: Date
  changes: string
  status: "draft" | "published" | "archived"
}

export interface TemplateApplication {
  id: string
  templateId: string
  templateVersion: string
  workOrderId: string
  appliedBy: string
  appliedAt: Date
  customizations: {
    processes?: Partial<ProcessStep>[]
    materials?: Partial<Material>[]
    qualityCheckpoints?: Partial<QualityCheckpoint>[]
    tools?: Partial<Tool>[]
  }
  status: "planned" | "in-progress" | "completed"
}
