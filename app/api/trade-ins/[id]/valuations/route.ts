import { NextRequest, NextResponse } from 'next/server';
import { tradeInService } from '@/lib/services/TradeInService';
import { CreateValuationRequest } from '@/types/trade-in';

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

    const valuations = await tradeInService.getValuations(id);

    return NextResponse.json({
      success: true,
      data: valuations
    });

  } catch (error) {
    console.error('Error getting valuations:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALUATIONS_GET_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get valuations'
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
    const { id } = await params;
    const body: CreateValuationRequest = await request.json();

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

    // Validate required fields
    if (!body.appraiser_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_APPRAISER_ID',
            message: 'Appraiser ID is required'
          }
        },
        { status: 400 }
      );
    }

    if (!body.valuation_amount || body.valuation_amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_VALUATION_AMOUNT',
            message: 'Valid valuation amount is required'
          }
        },
        { status: 400 }
      );
    }

    // Set the trade_in_id from the URL parameter
    body.trade_in_id = id;

    const valuation = await tradeInService.createValuation(body);

    return NextResponse.json({
      success: true,
      data: valuation
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating valuation:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALUATION_CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create valuation'
        }
      },
      { status: 500 }
    );
  }
} 