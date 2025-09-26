import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { socialNetworkService } from '@/lib/services/SocialNetworkService'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    
    if (postId) {
      // Get specific post
      const post = await socialNetworkService.getPost(postId, undefined) // No user ID required for public posts
      
      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: post,
        message: 'Post retrieved successfully'
      })
    } else {
      // Get public posts (no authentication required)
      // For now, let's get posts from a specific user to demonstrate the system
      const testUserId = 'fdb2a122-d6ae-4e78-b277-3317e1a09132' // Our test user
      const posts = await socialNetworkService.getUserPosts(testUserId)
      
      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedPosts = posts.slice(startIndex, endIndex)
      
      return NextResponse.json({
        success: true,
        data: {
          posts: paginatedPosts || [],
          total_count: posts?.length || 0,
          page,
          limit,
          total_pages: Math.ceil((posts?.length || 0) / limit)
        },
        message: 'Public posts retrieved successfully'
      })
    }

  } catch (error: any) {
    console.error('Error in public get posts API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

