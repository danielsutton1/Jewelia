import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AIRecommendationService } from '@/lib/services/AIRecommendationService'

// =====================================================
// AI RECOMMENDATIONS API ENDPOINT
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get recommendation parameters
    const type = searchParams.get('type') || 'personalized'
    const limit = parseInt(searchParams.get('limit') || '10')
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get current user from auth
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is requesting their own recommendations or has permission
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'You can only request recommendations for yourself' },
        { status: 403 }
      )
    }

    const recommendationService = new AIRecommendationService()
    let recommendations

    // Get recommendations based on type
    switch (type) {
      case 'personalized':
        recommendations = await recommendationService.getPersonalizedRecommendations(userId, limit)
        break
      
      case 'network':
        recommendations = await recommendationService.getNetworkBasedRecommendations(userId, limit)
        break
      
      case 'trending':
        recommendations = await recommendationService.getTrendingRecommendations(limit)
        break
      
      case 'collaborative':
        recommendations = await recommendationService.getCollaborativeRecommendations(userId, limit)
        break
      
      case 'all':
        // Get all types of recommendations
        const [personalized, network, trending, collaborative] = await Promise.all([
          recommendationService.getPersonalizedRecommendations(userId, Math.ceil(limit / 4)),
          recommendationService.getNetworkBasedRecommendations(userId, Math.ceil(limit / 4)),
          recommendationService.getTrendingRecommendations(Math.ceil(limit / 4)),
          recommendationService.getCollaborativeRecommendations(userId, Math.ceil(limit / 4))
        ])
        
        // Combine and deduplicate
        const allRecommendations = [...personalized, ...network, ...trending, ...collaborative]
        const uniqueItems = new Map()
        
        allRecommendations.forEach(rec => {
          if (!uniqueItems.has(rec.item.id)) {
            uniqueItems.set(rec.item.id, rec)
          }
        })
        
        recommendations = Array.from(uniqueItems.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid recommendation type. Use: personalized, network, trending, collaborative, or all' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
      type,
      total: recommendations.length,
      user_id: userId
    })

  } catch (error: any) {
    console.error('Get recommendations error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // This endpoint could be used for feedback on recommendations
    // to improve the AI algorithm over time
    const { userId, itemId, action, feedback } = body

    if (!userId || !itemId || !action) {
      return NextResponse.json(
        { error: 'User ID, item ID, and action are required' },
        { status: 400 }
      )
    }

    // Get current user from auth
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is providing feedback for themselves
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'You can only provide feedback for yourself' },
        { status: 403 }
      )
    }

    // Store feedback for recommendation improvement
    // This could be stored in a separate table for ML training
    const { error: feedbackError } = await supabase
      .from('inventory_sharing_analytics')
      .upsert({
        sharing_id: itemId,
        viewer_id: userId,
        // Add feedback fields as needed
        metadata: {
          recommendation_feedback: {
            action,
            feedback,
            timestamp: new Date().toISOString()
          }
        }
      })

    if (feedbackError) {
      console.error('Error storing feedback:', feedbackError)
      // Don't fail the request for feedback storage errors
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback received successfully',
      data: { userId, itemId, action, feedback }
    })

  } catch (error: any) {
    console.error('Post recommendation feedback error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
