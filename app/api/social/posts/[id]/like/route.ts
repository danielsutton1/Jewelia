import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SocialContentService } from '@/lib/services/SocialContentService'

// POST /api/social/posts/[id]/like - Toggle post like
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id } = await params;
    
    const socialContentService = new SocialContentService()
    const isLiked = await socialContentService.togglePostLike(user.id, id, body)

    return NextResponse.json({ 
      is_liked: isLiked,
      message: isLiked ? 'Post liked successfully' : 'Post unliked successfully'
    })
  } catch (error) {
    console.error('Error toggling post like:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 