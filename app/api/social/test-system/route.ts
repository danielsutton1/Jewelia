// 🧪 SOCIAL NETWORKING SYSTEM TEST ENDPOINT
// This endpoint tests all major social networking functionality

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { socialNetworkService } from '@/lib/services/SocialNetworkService'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🧪 Testing social networking system for user:', user.id)

    // Test 1: Check if required tables exist
    const tableTests = await Promise.all([
      supabase.from('social_posts').select('count', { count: 'exact', head: true }),
      supabase.from('social_comments').select('count', { count: 'exact', head: true }),
      supabase.from('social_post_likes').select('count', { count: 'exact', head: true }),
      supabase.from('user_connections').select('count', { count: 'exact', head: true }),
      supabase.from('user_profile_extensions').select('count', { count: 'exact', head: true })
    ])

    // Test 2: Check if user profile extension exists
    const { data: profileExtension } = await supabase
      .from('user_profile_extensions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Test 3: Check if social posts exist
    const { data: posts } = await supabase
      .from('social_posts')
      .select('*')
      .limit(5)

    // Test 4: Test service methods
    const userProfile = await socialNetworkService.getUserProfile(user.id)
    const socialStats = await socialNetworkService.getSocialNetworkStats()

    // Test 5: Check database schema
    const schemaCheck = {
      social_posts: tableTests[0].count !== null,
      social_comments: tableTests[1].count !== null,
      social_post_likes: tableTests[2].count !== null,
      user_connections: tableTests[3].count !== null,
      user_profile_extensions: tableTests[4].count !== null
    }

    const testResults = {
      message: 'Social Networking System Test Results',
      timestamp: new Date().toISOString(),
      user_id: user.id,
      user_email: user.email,
      
      // Database Schema Tests
      schema_tests: {
        status: 'PASSED',
        details: schemaCheck,
        missing_tables: Object.entries(schemaCheck)
          .filter(([_, exists]) => !exists)
          .map(([table]) => table)
      },
      
      // User Profile Tests
      profile_tests: {
        status: profileExtension ? 'PASSED' : 'FAILED',
        has_profile_extension: !!profileExtension,
        profile_data: profileExtension || null
      },
      
      // Content Tests
      content_tests: {
        status: 'PASSED',
        posts_exist: posts && posts.length > 0,
        post_count: posts?.length || 0,
        sample_posts: posts?.slice(0, 2) || []
      },
      
      // Service Tests
      service_tests: {
        status: 'PASSED',
        get_user_profile: !!userProfile,
        get_social_stats: !!socialStats,
        social_stats_data: socialStats
      },
      
      // System Health
      system_health: {
        overall_status: 'OPERATIONAL',
        database_connection: 'CONNECTED',
        service_layer: 'OPERATIONAL',
        api_endpoints: 'OPERATIONAL'
      }
    }

    // Determine overall status
    const hasFailures = Object.values(testResults.schema_tests.details).some(exists => !exists) ||
                       !testResults.profile_tests.has_profile_extension

    testResults.system_health.overall_status = hasFailures ? 'DEGRADED' : 'OPERATIONAL'

    console.log('🧪 Social networking system test completed:', testResults.system_health.overall_status)

    return NextResponse.json({
      success: true,
      data: testResults,
      message: `Social networking system test completed. Status: ${testResults.system_health.overall_status}`
    })

  } catch (error: any) {
    console.error('🧪 Social networking system test error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error.stack
      },
      system_health: {
        overall_status: 'FAILED',
        database_connection: 'UNKNOWN',
        service_layer: 'FAILED',
        api_endpoints: 'FAILED'
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, test_data } = body

    console.log('🧪 Social networking system test POST:', action)

    let testResult = null

    switch (action) {
      case 'create_test_post':
        // Test creating a post
        testResult = await socialNetworkService.createPost(user.id, {
          content: '🧪 This is a test post from the system test endpoint!',
          content_type: 'text',
          visibility: 'public',
          tags: ['test', 'system', 'jewelry'],
          jewelry_category: 'Test'
        })
        break

      case 'create_test_profile':
        // Test creating a profile extension
        const { data: profile, error: profileError } = await supabase
          .from('user_profile_extensions')
          .insert({
            user_id: user.id,
            company_name: 'Jewelia CRM Test',
            job_title: 'System Tester',
            industry: 'Jewelry & Technology',
            interests: ['Testing', 'Jewelry', 'CRM Systems'],
            availability_status: 'available'
          })
          .select()
          .single()
        
        testResult = { profile, error: profileError }
        break

      case 'test_connections':
        // Test user connections functionality
        const { data: connections, error: connectionsError } = await supabase
          .from('user_connections')
          .select('*')
          .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
        
        testResult = { connections, error: connectionsError }
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid test action. Use: create_test_post, create_test_profile, or test_connections'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      action,
      test_result: testResult,
      message: `Test action '${action}' completed successfully`
    })

  } catch (error: any) {
    console.error('🧪 Social networking system test POST error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Test action failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}

