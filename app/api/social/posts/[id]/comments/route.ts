import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SocialContentService } from '@/lib/services/SocialContentService'

// GET /api/social/posts/[id]/comments - Get post comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user from session (optional for public posts)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const { id } = await params;
    
    // Get comments for the post
    const { data: comments, error } = await supabase
      .from('social_comments')
      .select(`
        *,
        user:social_profiles!social_comments_user_id_fkey(*),
        likes:social_comment_likes(count)
      `)
      .eq('post_id', id)
      .is('parent_comment_id', null) // Only top-level comments
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment: any) => {
        const { data: replies } = await supabase
          .from('social_comments')
          .select(`
            *,
            user:social_profiles!social_comments_user_id_fkey(*),
            likes:social_comment_likes(count)
          `)
          .eq('parent_comment_id', comment.id)
          .order('created_at', { ascending: true })
          .limit(5) // Limit replies to prevent deep nesting

        return {
          ...comment,
          replies: replies || [],
        }
      })
    )

    return NextResponse.json({
      comments: commentsWithReplies,
      total: comments.length,
      has_more: comments.length === limit,
    })
  } catch (error) {
    console.error('Error getting post comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/social/posts/[id]/comments - Create comment on post
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
    const comment = await socialContentService.createComment(user.id, id, body)

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 