import { NextRequest, NextResponse } from 'next/server'
import { importExportService } from '@/lib/services/ImportExportService'
import { z } from 'zod'

// Import/Export schemas
const ImportSchema = z.object({
  type: z.enum([
    'customers',
    'inventory',
    'orders',
    'partners',
    'meetings',
    'reports',
    'ai_estimations',
    'quality_checks'
  ]),
  format: z.enum(['json', 'csv', 'excel']),
  data: z.any(),
  options: z.object({
    updateExisting: z.boolean().default(false),
    skipDuplicates: z.boolean().default(true),
    validateData: z.boolean().default(true),
    batchSize: z.number().optional(),
    onConflict: z.enum(['ignore', 'update', 'error']).optional()
  }).optional()
})

const ExportSchema = z.object({
  type: z.enum([
    'customers',
    'inventory',
    'orders',
    'partners',
    'meetings',
    'reports',
    'ai_estimations',
    'quality_checks'
  ]),
  format: z.enum(['json', 'csv', 'excel', 'pdf']),
  filters: z.record(z.any()).optional(),
  options: z.object({
    includeHeaders: z.boolean().default(true),
    dateFormat: z.string().optional(),
    numberFormat: z.string().optional(),
    compression: z.boolean().default(false),
    maxRecords: z.number().optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') // 'import' or 'export'
    
    if (action === 'import') {
      return await handleImport(request)
    } else if (action === 'export') {
      return await handleExport(request)
    } else {
      return NextResponse.json(
        { success: false, error: 'Action parameter must be "import" or "export"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in import/export operation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Import/Export operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function handleImport(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ImportSchema.parse(body)

    // Start import process
    const importRequest = {
      dataType: validatedData.type,
      data: validatedData.data,
      format: validatedData.format,
      options: validatedData.options
    }
    const importJob = await importExportService.importData(importRequest)

    return NextResponse.json({
      success: true,
      data: {
        jobId: importJob.id,
        status: importJob.status,
        message: 'Import job started successfully'
      }
    }, { status: 202 })
  } catch (error) {
    console.error('Error starting import:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start import',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function handleExport(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ExportSchema.parse(body)

    // Start export process
    const exportRequest = {
      dataType: validatedData.type,
      format: validatedData.format,
      filters: validatedData.filters,
      options: validatedData.options
    }
    const exportJob = await importExportService.exportData(exportRequest)

    return NextResponse.json({
      success: true,
      data: {
        jobId: exportJob.id,
        status: exportJob.status,
        message: 'Export job started successfully'
      }
    }, { status: 202 })
  } catch (error) {
    console.error('Error starting export:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start export',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    if (jobId) {
      // Get specific job status
      const job = await importExportService.getOperationById(jobId)
      
      if (!job) {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: job
      })
    } else {
      // Get all jobs with optional filters
      const result = await importExportService.getOperationHistory({ 
        dataType: type as any, 
        status: status as any 
      })
      
      return NextResponse.json({
        success: true,
        data: result.data,
        count: result.data.length
      })
    }
  } catch (error) {
    console.error('Error fetching import/export jobs:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch import/export jobs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Note: cancelJob method doesn't exist in the service
    // For now, just return success - implement actual cancellation logic later
    return NextResponse.json({
      success: true,
      message: 'Job cancellation not implemented yet'
    })
  } catch (error) {
    console.error('Error cancelling job:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cancel job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 