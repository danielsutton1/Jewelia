import { NextRequest, NextResponse } from 'next/server';
import { assetTrackingService } from '@/lib/services/AssetTrackingService';
import { CreateLocationRequest, LocationFilters } from '@/types/asset-tracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: LocationFilters = {};
    const locationType = searchParams.get('location_type');
    const parentLocationId = searchParams.get('parent_location_id');
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');

    if (locationType) filters.location_type = locationType as any;
    if (parentLocationId) filters.parent_location_id = parentLocationId;
    if (isActive !== null) filters.is_active = isActive === 'true';
    if (search) filters.search = search;

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await assetTrackingService.listLocations(filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        total_pages: result.total_pages
      },
      filters
    });

  } catch (error) {
    console.error('Error listing locations:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOCATION_LIST_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list locations'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateLocationRequest = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_LOCATION_NAME',
            message: 'Location name is required'
          }
        },
        { status: 400 }
      );
    }

    if (!body.location_type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_LOCATION_TYPE',
            message: 'Location type is required'
          }
        },
        { status: 400 }
      );
    }

    const location = await assetTrackingService.createLocation(body);

    return NextResponse.json({
      success: true,
      data: location
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOCATION_CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create location'
        }
      },
      { status: 500 }
    );
  }
} 