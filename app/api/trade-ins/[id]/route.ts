import { NextRequest, NextResponse } from 'next/server';
import { tradeInService } from '@/lib/services/TradeInService';
import { UpdateTradeInRequest } from '@/types/trade-in';

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
            code: 'MISSING_TRADE_IN_ID',
            message: 'Trade-in ID is required'
          }
        },
        { status: 400 }
      );
    }

    const tradeIn = await tradeInService.getTradeInById(id);

    if (!tradeIn) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TRADE_IN_NOT_FOUND',
            message: 'Trade-in not found'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tradeIn
    });

  } catch (error) {
    console.error('Error getting trade-in:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRADE_IN_GET_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get trade-in'
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
    const body: UpdateTradeInRequest = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TRADE_IN_ID',
            message: 'Trade-in ID is required'
          }
        },
        { status: 400 }
      );
    }

    const tradeIn = await tradeInService.updateTradeIn(id, body);

    return NextResponse.json({
      success: true,
      data: tradeIn
    });

  } catch (error) {
    console.error('Error updating trade-in:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRADE_IN_UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update trade-in'
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
            code: 'MISSING_TRADE_IN_ID',
            message: 'Trade-in ID is required'
          }
        },
        { status: 400 }
      );
    }

    await tradeInService.deleteTradeIn(id);

    return NextResponse.json({
      success: true,
      message: 'Trade-in deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting trade-in:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRADE_IN_DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete trade-in'
        }
      },
      { status: 500 }
    );
  }
} 