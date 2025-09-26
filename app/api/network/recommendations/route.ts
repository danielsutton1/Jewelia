import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NetworkService } from '@/lib/services/NetworkService'

const networkService = new NetworkService()

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // For development, use a demo user ID if no auth
    let userId = '6d1a08f1-134c-46dd-aa1e-21f95b80bed4' // Demo user ID
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (user && !authError) {
        userId = user.id
      }
    } catch (error) {
      console.log('🔧 Using demo user for recommendations in development mode')
    }

    const { searchParams } = new URL(request.url)
    
    const filters = {
      minCompatibility: parseInt(searchParams.get('minCompatibility') || '70'),
      sortBy: (searchParams.get('sortBy') as any) || 'compatibility',
      location: searchParams.get('location') || undefined,
      specialties: searchParams.getAll('specialties'),
      isOnline: searchParams.get('isOnline') === 'true',
      limit: parseInt(searchParams.get('limit') || '20')
    }

    console.log('🤖 Fetching AI recommendations for user:', userId)
    console.log('🔍 Filters:', filters)

    const recommendations = await networkService.getRecommendations(userId, filters)

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        userId,
        filters
      }
    })

  } catch (error) {
    console.error('❌ Error fetching recommendations:', error)
    
    // Return demo data for development
    const demoRecommendations = [
      {
        id: '1',
        name: 'Emily Chen',
        company: 'Chen Luxury Designs',
        avatar_url: null,
        location: 'San Francisco, CA',
        specialties: ['Designer', 'Manufacturer'],
        rating: 4.9,
        description: 'Award-winning custom jewelry designer specializing in engagement rings',
        compatibilityScore: 92,
        mutualConnections: 3,
        sharedInterests: ['Designer', 'Luxury Market'],
        recentActivity: new Date().toISOString(),
        isOnline: true
      },
      {
        id: '2',
        name: 'David Rodriguez',
        company: 'Rodriguez Gemstones',
        avatar_url: null,
        location: 'New York, NY',
        specialties: ['Gem Dealer', 'Supplier'],
        rating: 4.7,
        description: 'Premium gemstone supplier with 20+ years experience',
        compatibilityScore: 87,
        mutualConnections: 2,
        sharedInterests: ['Supplier', 'Premium Quality'],
        recentActivity: new Date().toISOString(),
        isOnline: false
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        recommendations: demoRecommendations,
        userId: '6d1a08f1-134c-46dd-aa1e-21f95b80bed4',
        filters: {},
        demo: true
      }
    })
  }
}