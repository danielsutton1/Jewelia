import { NextRequest, NextResponse } from 'next/server';
import { cadFilesService } from '@/lib/services/CADFilesService';
import { CreateCADFileRequest, CADFileFilters, SearchParameters } from '@/types/cad-files';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if this is a search request
    const query = searchParams.get('query');
    if (query) {
      // Handle search request
      const searchParameters: SearchParameters = {
        query,
        file_types: searchParams.get('file_types')?.split(',') as any,
        categories: searchParams.get('categories')?.split(','),
        tags: searchParams.get('tags')?.split(','),
        designers: searchParams.get('designers')?.split(','),
        status: searchParams.get('status')?.split(',') as any,
        date_range: searchParams.get('date_start') && searchParams.get('date_end') ? {
          start: searchParams.get('date_start')!,
          end: searchParams.get('date_end')!
        } : undefined,
        complexity_range: searchParams.get('complexity_min') && searchParams.get('complexity_max') ? {
          min: parseFloat(searchParams.get('complexity_min')!),
          max: parseFloat(searchParams.get('complexity_max')!)
        } : undefined
      };

      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');

      const files = await cadFilesService.searchCADFiles(searchParameters, { page, limit });

      return NextResponse.json({
        success: true,
        data: files,
        search: { query, params: searchParameters }
      });
    }

    // Handle regular list request
    const filters: CADFileFilters = {};
    const search = searchParams.get('search');
    const fileType = searchParams.get('file_type');
    const workflowStatus = searchParams.get('workflow_status');
    const approvalStatus = searchParams.get('approval_status');
    const designCategory = searchParams.get('design_category');
    const designerId = searchParams.get('designer_id');
    const designerName = searchParams.get('designer_name');
    const complexityMin = searchParams.get('complexity_min');
    const complexityMax = searchParams.get('complexity_max');
    const costMin = searchParams.get('cost_min');
    const costMax = searchParams.get('cost_max');
    const tags = searchParams.get('tags');
    const isLatestVersion = searchParams.get('is_latest_version');
    const parentFileId = searchParams.get('parent_file_id');
    const createdAfter = searchParams.get('created_after');
    const createdBefore = searchParams.get('created_before');
    const approvedAfter = searchParams.get('approved_after');
    const approvedBefore = searchParams.get('approved_before');

    if (search) filters.search = search;
    if (fileType) filters.file_type = fileType as any;
    if (workflowStatus) filters.workflow_status = workflowStatus as any;
    if (approvalStatus) filters.approval_status = approvalStatus as any;
    if (designCategory) filters.design_category = designCategory;
    if (designerId) filters.designer_id = designerId;
    if (designerName) filters.designer_name = designerName;
    if (complexityMin) filters.complexity_min = parseFloat(complexityMin);
    if (complexityMax) filters.complexity_max = parseFloat(complexityMax);
    if (costMin) filters.cost_min = parseFloat(costMin);
    if (costMax) filters.cost_max = parseFloat(costMax);
    if (tags) filters.tags = tags.split(',');
    if (isLatestVersion) filters.is_latest_version = isLatestVersion === 'true';
    if (parentFileId) filters.parent_file_id = parentFileId;
    if (createdAfter) filters.created_after = createdAfter;
    if (createdBefore) filters.created_before = createdBefore;
    if (approvedAfter) filters.approved_after = approvedAfter;
    if (approvedBefore) filters.approved_before = approvedBefore;

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await cadFilesService.listCADFiles(filters, { page, limit });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      categories: result.categories,
      stats: result.stats,
      filters
    });

  } catch (error) {
    console.error('Error listing CAD files:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CAD_FILES_LIST_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list CAD files'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCADFileRequest = await request.json();

    // Validate required fields
    if (!body.filename) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FILENAME',
            message: 'Filename is required'
          }
        },
        { status: 400 }
      );
    }

    if (!body.original_filename) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_ORIGINAL_FILENAME',
            message: 'Original filename is required'
          }
        },
        { status: 400 }
      );
    }

    if (!body.file_path) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FILE_PATH',
            message: 'File path is required'
          }
        },
        { status: 400 }
      );
    }

    if (!body.file_size) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FILE_SIZE',
            message: 'File size is required'
          }
        },
        { status: 400 }
      );
    }

    if (!body.file_type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FILE_TYPE',
            message: 'File type is required'
          }
        },
        { status: 400 }
      );
    }

    // Create the CAD file
    const file = await cadFilesService.createCADFile(body);

    return NextResponse.json({
      success: true,
      data: file
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating CAD file:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CAD_FILE_CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create CAD file'
        }
      },
      { status: 500 }
    );
  }
} 