import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SocialContentService } from '@/lib/services/SocialContentService'

// GET /api/social/posts/[id] - Get specific post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id } = await params;
    
    // Get current user from session (optional for public posts)
    const { data: { user } } = await supabase.auth.getUser()
    
    const socialContentService = new SocialContentService()
    const post = await socialContentService.getPost(id, user?.id)

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Record view if user is authenticated
    if (user?.id) {
      await socialContentService.recordPostView(id, user.id, 'direct_link')
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error getting post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/social/posts/[id] - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id } = await params;
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user owns the post
    const { data: post, error: postError } = await supabase
      .from('social_posts')
      .select('user_id')
      .eq('id', id)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you can only edit your own posts' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Update the post
    const { data: updatedPost, error: updateError } = await supabase
      .from('social_posts')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        user:social_profiles!social_posts_user_id_fkey(*)
      `)
      .single()

    if (updateError) throw updateError

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/social/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id } = await params;
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user owns the post
    const { data: post, error: postError } = await supabase
      .from('social_posts')
      .select('user_id')
      .eq('id', id)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you can only delete your own posts' },
        { status: 403 }
      )
    }

    // Delete the post (cascade will handle related data)
    const { error: deleteError } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    // Update user's post count using a proper SQL query
    const { error: countUpdateError } = await supabase
      .rpc('update_user_post_count', { user_id: user.id })

    if (countUpdateError) {
      console.warn('Failed to update user post count:', countUpdateError)
      // Don't fail the delete operation if count update fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 