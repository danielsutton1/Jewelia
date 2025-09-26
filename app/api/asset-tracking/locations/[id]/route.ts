import { NextRequest, NextResponse } from 'next/server';
import { assetTrackingService } from '@/lib/services/AssetTrackingService';
import { UpdateLocationRequest } from '@/types/asset-tracking';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_LOCATION_ID',
            message: 'Location ID is required'
          }
        },
        { status: 400 }
      );
    }

    const location = await assetTrackingService.getLocationById(id);

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LOCATION_NOT_FOUND',
            message: 'Location not found'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: location
    });

  } catch (error) {
    console.error('Error getting location:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOCATION_GET_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get location'
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
    const { id } = await params;
    const body: UpdateLocationRequest = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_LOCATION_ID',
            message: 'Location ID is required'
          }
        },
        { status: 400 }
      );
    }

    const location = await assetTrackingService.updateLocation(id, body);

    return NextResponse.json({
      success: true,
      data: location
    });

  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOCATION_UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update location'
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
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_LOCATION_ID',
            message: 'Location ID is required'
          }
        },
        { status: 400 }
      );
    }

    await assetTrackingService.deleteLocation(id);

    return NextResponse.json({
      success: true,
      message: 'Location deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOCATION_DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete location'
        }
      },
      { status: 500 }
    );
  }
} 