import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AIEstimationService } from '@/lib/services/AIEstimationService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Estimation ID is required' },
        { status: 400 }
      )
    }

    // Create AI estimation service instance
    const aiService = new AIEstimationService()

    // Get estimation by ID
    const estimation = await aiService.getEstimationById(id)

    if (!estimation) {
      return NextResponse.json(
        { error: 'Estimation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: estimation
    })

  } catch (error: any) {
    console.error('Get estimation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Estimation ID is required' },
        { status: 400 }
      )
    }

    // Delete estimation
    const { error } = await supabase
      .from('ai_estimations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting estimation:', error)
      return NextResponse.json(
        { error: 'Failed to delete estimation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Estimation deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete estimation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 