import { NextRequest, NextResponse } from 'next/server';
import { cadFilesService } from '@/lib/services/CADFilesService';
import { CreateCADFileRequest } from '@/types/cad-files';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const versions = await cadFilesService.getFileVersionHistory(resolvedParams.id);

    return NextResponse.json({
      success: true,
      data: versions
    });

  } catch (error) {
    console.error('Error getting file versions:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VERSIONS_GET_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get file versions'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
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

    // Create new version
    const newVersion = await cadFilesService.createNewVersion(resolvedParams.id, body);

    return NextResponse.json({
      success: true,
      data: newVersion
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating new version:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VERSION_CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create new version'
        }
      },
      { status: 500 }
    );
  }
} 