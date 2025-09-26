import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ImportExportService } from '@/lib/services/ImportExportService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Operation ID is required' },
        { status: 400 }
      )
    }

    // Create import/export service instance
    const importExportService = new ImportExportService()

    // Get operation by ID
    const operation = await importExportService.getOperationById(id)

    if (!operation) {
      return NextResponse.json(
        { error: 'Operation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: operation
    })

  } catch (error: any) {
    console.error('Get operation error:', error)
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
        { error: 'Operation ID is required' },
        { status: 400 }
      )
    }

    // Delete operation record
    const { error } = await supabase
      .from('import_export_operations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting operation:', error)
      return NextResponse.json(
        { error: 'Failed to delete operation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Operation deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete operation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 