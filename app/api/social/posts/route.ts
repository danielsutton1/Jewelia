import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { socialNetworkService } from '@/lib/services/SocialNetworkService'
import { z } from 'zod'

const CreatePostSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  content_type: z.enum(['text', 'image', 'video', 'link', 'poll', 'showcase', 'achievement']).default('text'),
  media_urls: z.array(z.string().url()).optional(),
  visibility: z.enum(['public', 'connections', 'private']).default('public'),
  allow_comments: z.boolean().default(true),
  allow_shares: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  industry_context: z.string().optional(),
  jewelry_category: z.string().optional(),
  price_range: z.string().optional(),
  scheduled_at: z.string().optional()
})

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

    // Validate request body
    const body = await request.json()
    const validatedData = CreatePostSchema.parse(body)
    
    // Create post
    const post = await socialNetworkService.createPost(user.id, validatedData)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: post,
      message: 'Post created successfully'
    })

  } catch (error: any) {
    console.error('Error in create post API:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('id')
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Get post
    const post = await socialNetworkService.getPost(postId, user.id)
    
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

  } catch (error: any) {
    console.error('Error in get post API:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 