import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Storage API called')
    
    const supabase = await createSupabaseServerClient()
    
    // Test 1: List all buckets
    console.log('🔍 Testing bucket listing...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to list buckets',
        details: bucketsError
      })
    }
    
    console.log('✅ Buckets listed successfully:', buckets?.length || 0)
    
    // Test 2: Try to access message-attachments bucket directly
    console.log('🔍 Testing direct access to message-attachments bucket...')
    const { data: testList, error: testError } = await supabase.storage
      .from('message-attachments')
      .list('', { limit: 5 })
    
    if (testError) {
      console.error('❌ Error accessing message-attachments bucket:', testError)
    } else {
      console.log('✅ Successfully accessed message-attachments bucket')
    }
    
    // Test 3: Check if we can create a bucket (this will fail if it exists, which is expected)
    console.log('🔍 Testing bucket creation (should fail if message-attachments exists)...')
    const { data: createTest, error: createError } = await supabase.storage.createBucket('test-bucket-debug', {
      public: true
    })
    
    if (createError) {
      console.log('ℹ️ Expected error creating test bucket (bucket might exist or no permission):', createError.message)
    } else {
      console.log('✅ Test bucket created successfully')
      // Clean up test bucket
      await supabase.storage.deleteBucket('test-bucket-debug')
    }
    
    return NextResponse.json({
      success: true,
      data: {
        totalBuckets: buckets?.length || 0,
        bucketIds: buckets?.map((b: any) => b.id) || [],
        bucketNames: buckets?.map((b: any) => b.name) || [],
        messageAttachmentsAccessible: !testError,
        testError: testError?.message || null,
        createTestResult: createError ? 'Failed (expected)' : 'Success'
      }
    })
    
  } catch (error) {
    console.error('❌ Error in debug storage API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error
    }, { status: 500 })
  }
}
