import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { socialNetworkService } from '@/lib/services/SocialNetworkService'
import { z } from 'zod'
import { ContentType } from '@/types/social-network'

const FeedQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  sort_by: z.enum(['latest', 'trending', 'most_liked', 'most_commented', 'most_shared']).default('latest'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  content_types: z.string().optional(),
  jewelry_categories: z.string().optional(),
  tags: z.string().optional(),
  location: z.string().optional(),
  price_range: z.string().optional(),
  following_only: z.string().transform(val => val === 'true').default('false'),
  user_id: z.string().optional()
})

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
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validatedParams = FeedQuerySchema.parse(queryParams)
    
    // Transform string arrays back to arrays with proper type casting
    const filters = {
      content_types: validatedParams.content_types?.split(',').filter(Boolean) as ContentType[] | undefined,
      jewelry_categories: validatedParams.jewelry_categories?.split(',').filter(Boolean),
      tags: validatedParams.tags?.split(',').filter(Boolean),
      location: validatedParams.location,
      price_range: validatedParams.price_range,
      following_only: validatedParams.following_only,
      user_id: validatedParams.user_id
    }

    const sortOptions = {
      sort_by: validatedParams.sort_by,
      sort_order: validatedParams.sort_order
    }

    // Get social feed
    const feed = await socialNetworkService.getSocialFeed(
      user.id,
      filters,
      sortOptions,
      validatedParams.page,
      validatedParams.limit
    )

    return NextResponse.json({
      success: true,
      data: feed,
      message: 'Feed retrieved successfully'
    })

  } catch (error: any) {
    console.error('Error in social feed API:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 