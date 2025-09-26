// 🐛 DEBUG AUTHENTICATION ENDPOINT
// This endpoint helps debug authentication issues

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClientWithAuth } from '@/lib/supabase/server-with-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🐛 Debug endpoint called')
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    
    // Check Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Auth header:', authHeader)
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      console.log('JWT token length:', token.length)
      console.log('JWT token preview:', token.substring(0, 50) + '...')
      
      // Try to create Supabase client
      const supabase = await createSupabaseServerClientWithAuth(request)
      console.log('Supabase client created')
      
      // Try to get user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('Auth result:', { user: !!user, error: authError })
      
      if (authError) {
        console.log('Auth error details:', authError)
        return NextResponse.json({
          success: false,
          error: 'Authentication failed',
          details: authError.message,
          debug: {
            tokenLength: token.length,
            tokenPreview: token.substring(0, 50) + '...',
            hasAuthHeader: !!authHeader,
            authHeaderStartsWithBearer: authHeader?.startsWith('Bearer ')
          }
        }, { status: 401 })
      }
      
      if (user) {
        return NextResponse.json({
          success: true,
          message: 'Authentication successful',
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          },
          debug: {
            tokenLength: token.length,
            tokenPreview: token.substring(0, 50) + '...',
            hasAuthHeader: !!authHeader,
            authHeaderStartsWithBearer: authHeader?.startsWith('Bearer ')
          }
        })
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'No valid authorization header',
      debug: {
        hasAuthHeader: !!authHeader,
        authHeaderValue: authHeader,
        allHeaders: Object.fromEntries(request.headers.entries())
      }
    }, { status: 401 })
    
  } catch (error) {
    console.error('🐛 Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
