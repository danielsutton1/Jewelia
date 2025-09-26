// 🧪 PUBLIC TEST ENDPOINT - No Authentication Required
// This allows testing the social networking system without being logged in

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Simple test data
    const testData = {
      message: 'Social Networking System Test (Public)',
      timestamp: new Date().toISOString(),
      status: 'operational',
      endpoint: '/api/social/test-public',
      method: 'GET',
      note: 'This endpoint doesn\'t require authentication for testing purposes'
    }

    console.log('🧪 Public test endpoint GET called successfully')

    return NextResponse.json({
      success: true,
      data: testData,
      message: 'Public test endpoint working correctly'
    })

  } catch (error) {
    console.error('🧪 Public test endpoint GET error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}

