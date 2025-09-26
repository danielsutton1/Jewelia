import { z } from 'zod'

export const resourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  status: z.string().optional(),
  description: z.string().optional(),
  capacity: z.number().int().optional(),
  current_load: z.number().int().optional(),
  location_id: z.string().uuid().optional().nullable(),
  metadata: z.record(z.any()).optional(),
})

export const resourceUpdateSchema = resourceSchema.partial() 