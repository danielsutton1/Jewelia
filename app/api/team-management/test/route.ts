// 🧪 SIMPLE TEST ENDPOINT - NO DEPENDENCIES
// This allows testing the team management system without authentication

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Simple test data
    const testData = {
      message: 'Team Management System is working!',
      timestamp: new Date().toISOString(),
      features: [
        'Team creation',
        'Member management',
        'Project management',
        'Analytics tracking',
        'Permission system'
      ],
      status: 'operational',
      endpoint: '/api/team-management/test',
      method: 'GET'
    }

    console.log('🧪 Test endpoint GET called successfully')

    return NextResponse.json({
      success: true,
      data: testData,
      message: 'Test endpoint working correctly'
    })

  } catch (error) {
    console.error('🧪 Test endpoint GET error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🧪 Test endpoint POST called successfully with:', body)
    
    // Echo back the test data
    return NextResponse.json({
      success: true,
      data: {
        received: body,
        timestamp: new Date().toISOString(),
        message: 'Test POST endpoint working correctly',
        endpoint: '/api/team-management/test',
        method: 'POST'
      }
    })

  } catch (error) {
    console.error('🧪 Test endpoint POST error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Test POST failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}
