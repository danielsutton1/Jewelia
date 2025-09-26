export type ProductionStage = {
  id: string;
  name: string;
  start: string;
  end: string;
  status: 'completed' | 'in-progress' | 'pending' | 'delayed' | 'blocked';
  partner: string;
  progress: number;
  color?: string;
};

export type ProductionProject = {
  id: string;
  title: string;
  start: string;
  end: string;
  stages: ProductionStage[];
  priority: 'high' | 'medium' | 'low';
  status: 'on-track' | 'at-risk' | 'delayed';
};

export const stageColors = {
  Design: "#8B5CF6",
  CAD: "#3B82F6",
  Casting: "#F59E0B",
  "Stone Setting": "#10B981",
  Polishing: "#F97316",
  "Quality Check": "#6366F1",
  "Ready for Delivery": "#059669"
} as const;

export const stageStatusStyles = {
  completed: {
    opacity: 1,
    icon: '✓',
    className: 'completed-stage'
  },
  'in-progress': {
    opacity: 1,
    icon: '⟳',
    className: 'in-progress-stage'
  },
  pending: {
    opacity: 0.6,
    icon: '○',
    className: 'pending-stage'
  },
  delayed: {
    opacity: 1,
    icon: '⚠',
    className: 'delayed-stage'
  },
  blocked: {
    opacity: 0.8,
    icon: '⛔',
    className: 'blocked-stage'
  }
} as const;

export interface ProjectTimeline {
  id: string;
  name: string;
  client: string;
  startDate: string; // "2024-06-01"
  endDate: string;   // "2024-06-08"
  color: string;     // "#3B82F6"
  currentStage: string;
  assignedPartner: string;
} 