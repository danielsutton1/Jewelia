import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Database health check
    const supabase = await createSupabaseServerClient()
    const { data: userCount, error: dbError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (dbError) throw dbError
    
    // Check social features
    const { data: postCount, error: postError } = await supabase
      .from('social_posts')
      .select('count', { count: 'exact', head: true })
    
    if (postError) throw postError
    
    // Check messaging system
    const { data: messageCount, error: messageError } = await supabase
      .from('messages')
      .select('count', { count: 'exact', head: true })
    
    if (messageError) throw messageError
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      response_time: responseTime,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: 'connected',
          user_count: userCount?.[0]?.count || 0,
          post_count: postCount?.[0]?.count || 0,
          message_count: messageCount?.[0]?.count || 0
        },
        storage: {
          status: 'available',
          bucket: process.env.SUPABASE_STORAGE_BUCKET || 'jewelia-storage'
        },
        authentication: {
          status: 'active',
          provider: 'supabase'
        }
      },
      system: {
        memory: process.memoryUsage(),
        platform: process.platform,
        node_version: process.version
      }
    })
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      response_time: responseTime,
      environment: process.env.NODE_ENV || 'development',
      error: error.message,
      services: {
        database: {
          status: 'error',
          error: error.message
        }
      }
    }, { status: 503 })
  }
}

export async function HEAD() {
  // Lightweight health check for load balancers
  return new NextResponse(null, { status: 200 })
} 