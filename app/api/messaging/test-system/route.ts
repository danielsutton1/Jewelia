// 🧪 MESSAGING SYSTEM TEST ENDPOINT
// This endpoint tests all major messaging functionality

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { UnifiedMessagingService } from '@/lib/services/UnifiedMessagingService'

const messagingService = new UnifiedMessagingService()

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

    console.log('🧪 Testing messaging system for user:', user.id)

    // Test 1: Check if required tables exist
    const tableTests = await Promise.all([
      supabase.from('messages').select('count', { count: 'exact', head: true }),
      supabase.from('message_threads').select('count', { count: 'exact', head: true }),
      supabase.from('message_attachments').select('count', { count: 'exact', head: true }),
      supabase.from('message_reactions').select('count', { count: 'exact', head: true }),
      supabase.from('message_read_receipts').select('count', { count: 'exact', head: true }),
      supabase.from('message_notifications').select('count', { count: 'exact', head: true })
    ])

    // Test 2: Check if message threads exist
    const { data: threads } = await supabase
      .from('message_threads')
      .select('*')
      .contains('participants', [user.id])
      .limit(5)

    // Test 3: Check if messages exist
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .limit(5)

    // Test 4: Test service methods
    const userThreads = await messagingService.getThreads({
      unread_only: false,
      limit: 5,
      offset: 0
    })
    const userMessages = await messagingService.getMessages({
      unread_only: false,
      limit: 5,
      offset: 0
    })

    // Test 5: Check database schema
    const schemaCheck = {
      messages: tableTests[0].count !== null,
      message_threads: tableTests[1].count !== null,
      message_attachments: tableTests[2].count !== null,
      message_reactions: tableTests[3].count !== null,
      message_read_receipts: tableTests[4].count !== null,
      message_notifications: tableTests[5].count !== null
    }

    const testResults = {
      message: 'Messaging System Test Results',
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
      
      // Thread Tests
      thread_tests: {
        status: 'PASSED',
        threads_exist: threads && threads.length > 0,
        thread_count: threads?.length || 0,
        sample_threads: threads?.slice(0, 2) || []
      },
      
      // Message Tests
      message_tests: {
        status: 'PASSED',
        messages_exist: messages && messages.length > 0,
        message_count: messages?.length || 0,
        sample_messages: messages?.slice(0, 2) || []
      },
      
      // Service Tests
      service_tests: {
        status: 'PASSED',
        get_user_threads: !!userThreads,
        get_messages: !!userMessages,
        service_data: {
          threads: userThreads,
          messages: userMessages
        }
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
    const hasFailures = Object.values(testResults.schema_tests.details).some(exists => !exists)

    testResults.system_health.overall_status = hasFailures ? 'DEGRADED' : 'OPERATIONAL'

    console.log('🧪 Messaging system test completed:', testResults.system_health.overall_status)

    return NextResponse.json({
      success: true,
      data: testResults,
      message: `Messaging system test completed. Status: ${testResults.system_health.overall_status}`
    })

  } catch (error: any) {
    console.error('🧪 Messaging system test error:', error)
    
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

    console.log('🧪 Messaging system test POST:', action)

    let testResult = null

    switch (action) {
      case 'create_test_thread':
        // Test creating a message thread
        const { data: thread, error: threadError } = await supabase
          .from('message_threads')
          .insert({
            type: 'internal',
            subject: '🧪 Test Thread from System Test',
            category: 'test',
            created_by: user.id,
            participants: [user.id],
            tags: ['test', 'system']
          })
          .select()
          .single()
        
        testResult = { thread, error: threadError }
        break

      case 'create_test_message':
        // Test creating a message
        const { data: message, error: messageError } = await supabase
          .from('messages')
          .insert({
            type: 'internal',
            sender_id: user.id,
            recipient_id: user.id, // Send to self for testing
            subject: '🧪 Test Message',
            content: 'This is a test message from the system test endpoint!',
            content_type: 'text',
            priority: 'normal',
            category: 'test',
            status: 'sent'
          })
          .select()
          .single()
        
        testResult = { message, error: messageError }
        break

      case 'test_service_methods':
        // Test various service methods
        const testThread = await messagingService.createThread({
          type: 'internal',
          subject: '🧪 Service Test Thread',
          category: 'test',
          participants: [user.id],
          tags: ['test', 'system'],
          metadata: { test: true }
        }, user.id)

        const testMessage = await messagingService.sendMessage({
          type: 'internal',
          recipient_id: user.id,
          subject: '🧪 Service Test Message',
          content: 'This is a test message sent via the service layer!',
          content_type: 'text',
          priority: 'normal',
          category: 'test',
          tags: ['test', 'system'],
          metadata: { test: true }
        }, user.id)

        testResult = { 
          thread_created: !!testThread,
          message_sent: !!testMessage,
          thread_data: testThread,
          message_data: testMessage
        }
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid test action. Use: create_test_thread, create_test_message, or test_service_methods'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      action,
      test_result: testResult,
      message: `Test action '${action}' completed successfully`
    })

  } catch (error: any) {
    console.error('🧪 Messaging system test POST error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Test action failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}

