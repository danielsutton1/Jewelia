import { z } from 'zod'

// Message Schema
export const MessageSchema = z.object({
  type: z.enum(['internal', 'external', 'system', 'notification']),
  recipient_id: z.string().uuid().optional(),
  partner_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  subject: z.string().max(255).optional(),
  content: z.string().min(1).max(10000),
  content_type: z.enum(['text', 'html', 'markdown']).default('text'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  category: z.string().max(100).default('general'),
  thread_id: z.string().uuid().optional(),
  reply_to_id: z.string().uuid().optional(),
  related_order_id: z.string().uuid().optional(),
  related_task_id: z.string().uuid().optional(),
  related_project_id: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({})
})

// Thread Schema
export const ThreadSchema = z.object({
  type: z.enum(['internal', 'external', 'system', 'notification']),
  subject: z.string().min(1).max(255),
  category: z.string().max(100).default('general'),
  participants: z.array(z.string().uuid()).default([]),
  partner_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  related_order_id: z.string().uuid().optional(),
  related_project_id: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({})
})

// Thread Query Schema
export const ThreadQuerySchema = z.object({
  type: z.enum(['internal', 'external', 'system', 'notification']).optional(),
  participant_id: z.string().uuid().optional(),
  partner_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  unread_only: z.boolean().default(false),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional()
})

// Message Query Schema
export const MessageQuerySchema = z.object({
  type: z.enum(['internal', 'external', 'system', 'notification']).optional(),
  thread_id: z.string().uuid().optional(),
  partner_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  unread_only: z.boolean().default(false),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional()
})

// Message Update Schema
export const MessageUpdateSchema = z.object({
  is_read: z.boolean().optional(),
  status: z.enum(['sent', 'delivered', 'read', 'failed']).optional(),
  read_at: z.string().optional(),
  delivered_at: z.string().optional()
})

// Thread Update Schema
export const ThreadUpdateSchema = z.object({
  subject: z.string().min(1).max(255).optional(),
  category: z.string().max(100).optional(),
  participants: z.array(z.string().uuid()).optional(),
  is_active: z.boolean().optional(),
  is_archived: z.boolean().optional(),
  is_pinned: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
})

// Reaction Schema
export const ReactionSchema = z.object({
  reaction_type: z.string().min(1).max(50),
  reaction_data: z.record(z.any()).default({})
})

// Attachment Schema
export const AttachmentSchema = z.object({
  file_name: z.string().min(1).max(255),
  file_type: z.string().min(1).max(100),
  file_size: z.number().positive(),
  file_url: z.string().url(),
  storage_path: z.string().optional(),
  mime_type: z.string().optional()
})

// Notification Schema
export const NotificationSchema = z.object({
  notification_type: z.string().min(1).max(50),
  title: z.string().min(1).max(255),
  body: z.string().optional(),
  data: z.record(z.any()).default({}),
  is_sent: z.boolean().default(false),
  is_delivered: z.boolean().default(false),
  is_read: z.boolean().default(false),
  email_sent: z.boolean().default(false),
  push_sent: z.boolean().default(false),
  sms_sent: z.boolean().default(false)
})

// Export types
export type Message = z.infer<typeof MessageSchema>
export type Thread = z.infer<typeof ThreadSchema>
export type ThreadQuery = z.infer<typeof ThreadQuerySchema>
export type MessageQuery = z.infer<typeof MessageQuerySchema>
export type MessageUpdate = z.infer<typeof MessageUpdateSchema>
export type ThreadUpdate = z.infer<typeof ThreadUpdateSchema>
export type Reaction = z.infer<typeof ReactionSchema>
export type Attachment = z.infer<typeof AttachmentSchema>
export type Notification = z.infer<typeof NotificationSchema> 