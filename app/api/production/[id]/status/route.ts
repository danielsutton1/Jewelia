import { NextRequest, NextResponse } from 'next/server'
import { productionService } from '@/lib/services/ProductionService'
import { z } from 'zod'

// Validation schema for status updates
const updateStatusSchema = z.object({
  status: z.enum(['pending', 'in-progress', 'review', 'approved', 'revise', 'completed', 'delayed', 'blocked']),
  stage: z.enum(['Design', 'Casting', 'Setting', 'Polishing', 'QC', 'Completed', 'Rework', 'Shipping']).optional(),
  notes: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  actual_completion: z.string().optional()
})

// PUT /api/production/[id]/status - Update production status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params;
    
    // Validate request body
    const validatedData = updateStatusSchema.parse(body)
    
    // Check if item exists
    const existingItem = await productionService.getProductionItemById(id)

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Production item not found' },
        { status: 404 }
      )
    }

    // Update the status
    const data = await productionService.updateStatus(id, validatedData)

    return NextResponse.json({
      success: true,
      data,
      message: `Production item status updated to ${validatedData.status}`
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 