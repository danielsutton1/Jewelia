import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NetworkService } from '@/lib/services/NetworkService'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    const filters = {
      userId: user.id,
      search: searchParams.get('search') || undefined,
      specialties: searchParams.getAll('specialties'),
      location: searchParams.get('location') || undefined,
      type: searchParams.get('type') || undefined,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
      verified: searchParams.get('verified') ? searchParams.get('verified') === 'true' : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    }

    const networkService = new NetworkService()
    const result = await networkService.searchPartners(filters)

    return NextResponse.json({
      success: true,
      data: result.partners || [],
      total: result.total || 0,
      filters
    })

  } catch (error: any) {
    console.error('Partner discovery error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 