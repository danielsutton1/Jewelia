import { NextRequest, NextResponse } from 'next/server'
import { productionService } from '@/lib/services/ProductionService'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Validation schemas
const updateProductionItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  stage: z.enum(['Design', 'Casting', 'Setting', 'Polishing', 'QC', 'Completed', 'Rework', 'Shipping']).optional(),
  status: z.enum(['pending', 'in-progress', 'review', 'approved', 'revise', 'completed', 'delayed', 'blocked']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigned_employee: z.string().optional(),
  estimated_completion: z.string().optional(),
  actual_completion: z.string().optional(),
  notes: z.string().optional()
})

// GET /api/production/[id] - Get specific production item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await productionService.getProductionItemById(id)
    
    if (!item) {
      return NextResponse.json(
        { error: 'Production item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: item
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/production/[id] - Update production item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params;
    
    // Validate request body
    const validatedData = updateProductionItemSchema.parse(body)
    
    // Check if item exists
    const existingItem = await productionService.getProductionItemById(id)

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Production item not found' },
        { status: 404 }
      )
    }

    // Update the item
    const updateFields: any = {}
    Object.keys(validatedData).forEach(key => {
      if (validatedData[key as keyof typeof validatedData] !== undefined) {
        updateFields[key] = validatedData[key as keyof typeof validatedData]
      }
    })

    const data = await productionService.updateStatus(id, updateFields)

    return NextResponse.json({
      success: true,
      data
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

// DELETE /api/production/[id] - Delete production item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if item exists
    const existingItem = await productionService.getProductionItemById(id)

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Production item not found' },
        { status: 404 }
      )
    }

    // Delete the item
    const { error } = await supabase
      .from('products_in_production_pipeline')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Production item deleted successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 