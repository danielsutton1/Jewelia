export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer'
export type OrderStatus = 'pending' | 'confirmed' | 'in_production' | 'ready' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'overdue'
export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order'
export type RepairStatus = 'received' | 'in_progress' | 'completed' | 'delivered'
export type CommunicationStatus = 'active' | 'resolved' | 'pending' | 'closed'
export type CommunicationPriority = 'low' | 'medium' | 'high' | 'urgent'
export type CommunicationType = 'message' | 'email' | 'call' | 'meeting' | 'document' | 'task' | 'issue'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  email: string | null
  phone: string | null
  full_name: string
  company: string | null
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Inventory {
  id: string
  sku: string
  name: string
  description: string | null
  category: string | null
  price: number
  cost: number | null
  quantity: number
  status: InventoryStatus
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id: string
  order_number: string
  status: OrderStatus
  total_amount: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  payment_status: PaymentStatus
  notes: string | null
  expected_delivery_date: string | null
  actual_delivery_date: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  notes: string | null
  created_at: string
}

export interface Repair {
  id: string
  customer_id: string
  status: RepairStatus
  description: string
  estimated_completion: string | null
  actual_completion: string | null
  cost: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  table_name: string
  record_id: string
  changes: any
  created_at: string
}

export interface CommunicationThread {
  id: string
  partner_id: string
  subject: string
  type: CommunicationType
  status: CommunicationStatus
  priority: CommunicationPriority
  created_at: string
  updated_at: string
  last_message_at: string
  related_order_id?: string
  related_issue_id?: string
  assigned_to?: string
  tags: string[]
}

export interface CommunicationMessage {
  id: string
  thread_id: string
  sender_id: string
  content: string
  timestamp: string
  is_read: boolean
  created_at: string
}

export interface CommunicationAttachment {
  id: string
  message_id: string
  name: string
  type: string
  size: number
  url: string
  uploaded_at: string
}

export interface NotificationPreference {
  id: string
  user_id: string
  type: CommunicationType
  email: boolean
  push: boolean
  sms: boolean
  in_app: boolean
  created_at: string
  updated_at: string
}

export interface MessageRead {
  id: string
  message_id: string
  user_id: string
  read_at: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  all_day: boolean
  category?: string
  location?: string
  created_by?: string
  attendees: string[]
  recurrence_rule?: string
  created_at: string
  updated_at: string
}

export interface MeetingBrief {
  id: string
  event_id: string
  transcript_source: 'audio' | 'manual' | 'platform'
  original_transcript: string
  summary: string
  key_points: string[]
  decisions: string[]
  action_items: { task: string; assignee: string; due_date: string }[]
  follow_ups: string[]
  attendee_insights: { name: string; contributions: string[] }[]
  ai_processing_time: number
  edited_by_user: boolean
  shared_with_attendees: boolean
  created_at: string
  updated_at: string
} 