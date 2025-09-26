import { NextRequest, NextResponse } from 'next/server';
import { cadFilesService } from '@/lib/services/CADFilesService';
import { UpdateCADFileRequest } from '@/types/cad-files';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const file = await cadFilesService.getCADFileById(resolvedParams.id);

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CAD_FILE_NOT_FOUND',
            message: 'CAD file not found'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: file
    });

  } catch (error) {
    console.error('Error getting CAD file:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CAD_FILE_GET_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get CAD file'
        }
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body: UpdateCADFileRequest = await request.json();

    const file = await cadFilesService.updateCADFile(resolvedParams.id, body);

    return NextResponse.json({
      success: true,
      data: file
    });

  } catch (error) {
    console.error('Error updating CAD file:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CAD_FILE_UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update CAD file'
        }
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const success = await cadFilesService.deleteCADFile(resolvedParams.id);

    return NextResponse.json({
      success: true,
      message: 'CAD file deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting CAD file:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CAD_FILE_DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete CAD file'
        }
      },
      { status: 500 }
    );
  }
} 