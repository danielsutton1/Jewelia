export type CommunicationType = "message" | "email" | "call" | "meeting" | "document" | "task" | "issue"

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
}

export interface CommunicationMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  attachments: Attachment[]
  isRead: boolean
}

export interface CommunicationThread {
  id: string
  partnerId: string
  partnerName: string
  partnerLogo?: string
  subject: string
  type: CommunicationType
  status: "active" | "resolved" | "pending" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  createdAt: string
  updatedAt: string
  lastMessageAt: string
  messages: CommunicationMessage[]
  relatedOrderId?: string
  relatedIssueId?: string
  tags: string[]
  assignedTo?: string
}

export interface NotificationPreference {
  type: CommunicationType
  email: boolean
  push: boolean
  sms: boolean
  inApp: boolean
}

export interface CommunicationFilter {
  partners: string[]
  types: CommunicationType[]
  status: ("active" | "resolved" | "pending" | "closed")[]
  priority: ("low" | "medium" | "high" | "urgent")[]
  dateRange?: {
    from: Date
    to: Date
  }
  searchTerm?: string
}
