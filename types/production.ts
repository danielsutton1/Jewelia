export type ProductionStage = 
  | "Design" 
  | "Casting" 
  | "Setting" 
  | "Polishing" 
  | "QC" 
  | "Completed"
  | "Rework"
  | "Shipping";

export interface Message {
  id: string;
  text: string;
  sender: "assignee" | "staff" | "customer" | "system";
  senderName: string;
  senderId: string;
  timestamp: string; // ISO string
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  isRead: boolean;
  messageType: "text" | "image" | "file" | "system";
}

export interface StageConversation {
  id: string;
  stage: ProductionStage;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  messages: Message[];
  stageStatus: "pending" | "active" | "completed" | "paused";
  stageNotes?: string;
  qualityScore?: number;
  timeSpent?: number; // in minutes
}

export interface ProductionConversationLog {
  orderId: string;
  conversations: StageConversation[];
  currentStage: ProductionStage;
  totalMessages: number;
  lastActivity: string;
  searchIndex?: {
    keywords: string[];
    stageFilters: ProductionStage[];
    senderFilters: string[];
  };
}

export interface ConversationSearchFilters {
  stages?: ProductionStage[];
  senders?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  keywords?: string;
  hasAttachments?: boolean;
  unreadOnly?: boolean;
}

export interface ConversationSearchResult {
  messageId: string;
  stageId: string;
  stage: ProductionStage;
  assigneeName: string;
  senderName: string;
  timestamp: string;
  text: string;
  highlight: string; // highlighted search term
}

export interface StageConfig {
  label: string;
  icon: string;
  description: string;
  color: string;
  estimatedDuration: number; // in days
  requiredApprovals: string[];
  qualityCheckpoints: string[];
}

export const PRODUCTION_STAGES: Record<ProductionStage, StageConfig> = {
  Design: {
    label: "Design",
    icon: "🎨",
    description: "Initial design and planning phase",
    color: "#3B82F6",
    estimatedDuration: 3,
    requiredApprovals: ["Customer", "Design Manager"],
    qualityCheckpoints: ["Design Review", "Customer Approval"]
  },
  Casting: {
    label: "Casting",
    icon: "🔥",
    description: "Metal casting and forming",
    color: "#EF4444",
    estimatedDuration: 5,
    requiredApprovals: ["Production Manager"],
    qualityCheckpoints: ["Metal Quality Check", "Form Verification"]
  },
  Setting: {
    label: "Setting",
    icon: "💎",
    description: "Stone setting and assembly",
    color: "#8B5CF6",
    estimatedDuration: 4,
    requiredApprovals: ["Master Setter"],
    qualityCheckpoints: ["Stone Security", "Setting Quality"]
  },
  Polishing: {
    label: "Polishing",
    icon: "✨",
    description: "Finishing and polishing",
    color: "#F59E0B",
    estimatedDuration: 2,
    requiredApprovals: ["Quality Manager"],
    qualityCheckpoints: ["Surface Finish", "Final Polish"]
  },
  QC: {
    label: "Quality Control",
    icon: "🔍",
    description: "Final quality inspection",
    color: "#10B981",
    estimatedDuration: 1,
    requiredApprovals: ["QC Manager", "Production Manager"],
    qualityCheckpoints: ["Final Inspection", "Documentation Review"]
  },
  Completed: {
    label: "Completed",
    icon: "✅",
    description: "Order completed and ready",
    color: "#059669",
    estimatedDuration: 0,
    requiredApprovals: ["Customer"],
    qualityCheckpoints: ["Customer Satisfaction", "Final Documentation"]
  },
  Rework: {
    label: "Rework",
    icon: "🔄",
    description: "Rework and corrections",
    color: "#DC2626",
    estimatedDuration: 3,
    requiredApprovals: ["Production Manager"],
    qualityCheckpoints: ["Issue Resolution", "Quality Verification"]
  },
  Shipping: {
    label: "Shipping",
    icon: "📦",
    description: "Packaging and shipping",
    color: "#6366F1",
    estimatedDuration: 1,
    requiredApprovals: ["Shipping Manager"],
    qualityCheckpoints: ["Packaging Quality", "Shipping Documentation"]
  }
}; 
 