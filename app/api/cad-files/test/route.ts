import { NextRequest, NextResponse } from 'next/server';
import { FileType, WorkflowStatus, ApprovalStatus } from '@/types/cad-files';

export async function GET(request: NextRequest) {
  try {
    // Return test data to verify the API structure
    const testData = {
      message: 'CAD Files API is working!',
      available_file_types: Object.values(FileType),
      available_workflow_statuses: Object.values(WorkflowStatus),
      available_approval_statuses: Object.values(ApprovalStatus),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: testData
    });

  } catch (error) {
    console.error('Error in CAD files test:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CAD_FILES_TEST_ERROR',
          message: error instanceof Error ? error.message : 'Failed to test CAD files API'
        }
      },
      { status: 500 }
    );
  }
} 