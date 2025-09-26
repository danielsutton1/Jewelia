// Calendar component types

export interface ProductionProject {
  id: string
  name: string
  title?: string
  status: 'on-track' | 'delayed' | 'at-risk' | 'completed'
  startDate: string
  endDate: string
  start: Date
  end: Date
  progress: number
  dependencies: string[]
  assignedTeam: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  stages: ProductionStage[]
}

export interface ProductionStage {
  id: string
  name: string
  order: number
  estimatedDuration: number
  actualDuration?: number
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'delayed'
  assignedTo: string[]
  dependencies: string[]
  startDate?: string
  endDate?: string
  notes?: string
  partner: string
  start: string
  end: string
  actualEnd?: string
  cost?: number
  quality?: number
  progress?: number
}

export interface Dependency {
  id: string
  fromStageId: string
  toStageId: string
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish'
  lag?: number
}

export interface TeamMember {
  id: string
  name: string
  role: string
  availability: number // percentage
  currentTasks: string[]
  skills: string[]
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'production' | 'maintenance' | 'meeting' | 'deadline'
  projectId?: string
  stageId?: string
  assignedTo?: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
}

export interface ProductionSchedule {
  id: string
  name: string
  startDate: string
  endDate: string
  projects: ProductionProject[]
  stages: ProductionStage[]
  dependencies: Dependency[]
  teamMembers: TeamMember[]
  events: CalendarEvent[]
}

export interface BottleneckAnalysis {
  stageId: string
  stageName: string
  delay: number // days
  impact: 'low' | 'medium' | 'high' | 'critical'
  causes: string[]
  recommendations: string[]
}

export interface DeliveryConfidence {
  projectId: string
  projectName: string
  confidence: number // percentage
  factors: {
    positive: string[]
    negative: string[]
  }
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface HistoricalData {
  date: string
  completedStages: number
  delayedStages: number
  averageDelay: number
  teamUtilization: number
  qualityScore: number
} 