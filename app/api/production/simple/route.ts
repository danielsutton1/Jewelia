import { NextRequest, NextResponse } from 'next/server'
import { productionService } from '@/lib/services/ProductionService'

// GET /api/production/simple - Simple test endpoint
export async function GET(request: NextRequest) {
  try {
    console.log('Starting simple production test...')
    
    const data = await productionService.listProductionItems({ limit: 1 })
    
    console.log('Production data retrieved:', data.length, 'items')
    
    return NextResponse.json({
      success: true,
      data,
      count: data.length
    })
  } catch (error: any) {
    console.error('Error in simple production test:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error', stack: error.stack },
      { status: 500 }
    )
  }
} 