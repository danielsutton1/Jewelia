import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NetworkService } from '@/lib/services/NetworkService'

const networkService = new NetworkService()

export async function GET(request: NextRequest) {
  try {
    // DEVELOPMENT MODE: Skip authentication for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    let user;
    if (isDevelopment) {
      // Create a mock user for development
      user = {
        id: 'c5e33bb2-4811-4042-bd4e-97b1ffec7c38', // Use existing UUID from test data
        email: 'dev@example.com',
        user_metadata: { role: 'admin' }
      };
    } else {
      const supabase = await createSupabaseServerClient()
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      user = authUser;
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const location = searchParams.get('location') || ''
    const industry = searchParams.get('industry') || ''
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const hasMutualConnections = searchParams.get('hasMutualConnections') === 'true'
    const isOnline = searchParams.get('isOnline') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query && !category && !location && !industry) {
      return NextResponse.json(
        { error: 'At least one search parameter is required' },
        { status: 400 }
      )
    }

    // Search for partners
    const searchResults = await networkService.searchPartners({
      query,
      category,
      location,
      industry,
      minRating,
      hasMutualConnections,
      isOnline,
      page,
      limit,
      userId: user.id
    })

    return NextResponse.json({
      success: true,
      data: searchResults
    })

  } catch (error) {
    console.error('Error searching network:', error)
    return NextResponse.json(
      { error: 'Failed to search network' },
      { status: 500 }
    )
  }
}
