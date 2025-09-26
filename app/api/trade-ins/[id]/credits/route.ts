import { NextRequest, NextResponse } from 'next/server';
import { tradeInService } from '@/lib/services/TradeInService';
import { CreateCreditRequest } from '@/types/trade-in';

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

    const credits = await tradeInService.getCredits(id);

    return NextResponse.json({
      success: true,
      data: credits
    });

  } catch (error) {
    console.error('Error getting credits:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREDITS_GET_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get credits'
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
    const body: CreateCreditRequest = await request.json();

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
    if (!body.credit_amount || body.credit_amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDIT_AMOUNT',
            message: 'Valid credit amount is required'
          }
        },
        { status: 400 }
      );
    }

    // Set the trade_in_id from the URL parameter
    body.trade_in_id = id;

    const credit = await tradeInService.createCredit(body);

    return NextResponse.json({
      success: true,
      data: credit
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating credit:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREDIT_CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create credit'
        }
      },
      { status: 500 }
    );
  }
} 