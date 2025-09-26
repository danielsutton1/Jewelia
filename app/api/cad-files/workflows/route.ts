import { NextRequest, NextResponse } from 'next/server';
import { cadFilesService } from '@/lib/services/CADFilesService';
import { CreateWorkflowRequest, WorkflowFilters } from '@/types/cad-files';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: WorkflowFilters = {};
    const cadFileId = searchParams.get('cad_file_id');
    const workflowType = searchParams.get('workflow_type');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assigned_to');
    const assignedBy = searchParams.get('assigned_by');
    const dueAfter = searchParams.get('due_after');
    const dueBefore = searchParams.get('due_before');
    const completedAfter = searchParams.get('completed_after');
    const completedBefore = searchParams.get('completed_before');

    if (cadFileId) filters.cad_file_id = cadFileId;
    if (workflowType) filters.workflow_type = workflowType as any;
    if (status) filters.status = status as any;
    if (assignedTo) filters.assigned_to = assignedTo;
    if (assignedBy) filters.assigned_by = assignedBy;
    if (dueAfter) filters.due_after = dueAfter;
    if (dueBefore) filters.due_before = dueBefore;
    if (completedAfter) filters.completed_after = completedAfter;
    if (completedBefore) filters.completed_before = completedBefore;

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await cadFilesService.listWorkflows(filters, { page, limit });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      stats: result.stats,
      filters
    });

  } catch (error) {
    console.error('Error listing workflows:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'WORKFLOWS_LIST_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list workflows'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateWorkflowRequest = await request.json();

    // Validate required fields
    if (!body.cad_file_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_CAD_FILE_ID',
            message: 'CAD file ID is required'
          }
        },
        { status: 400 }
      );
    }

    if (!body.workflow_type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_WORKFLOW_TYPE',
            message: 'Workflow type is required'
          }
        },
        { status: 400 }
      );
    }

    if (!body.current_step) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_CURRENT_STEP',
            message: 'Current step is required'
          }
        },
        { status: 400 }
      );
    }

    if (!body.total_steps) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TOTAL_STEPS',
            message: 'Total steps is required'
          }
        },
        { status: 400 }
      );
    }

    // Create the workflow
    const workflow = await cadFilesService.createWorkflow(body);

    return NextResponse.json({
      success: true,
      data: workflow
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'WORKFLOW_CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create workflow'
        }
      },
      { status: 500 }
    );
  }
} 