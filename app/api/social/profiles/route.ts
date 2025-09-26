import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SocialProfileService } from '@/lib/services/SocialProfileService'
import { z } from 'zod'

// Don't instantiate the service at module level
// const socialProfileService = new SocialProfileService()

// GET /api/social/profiles - Search profiles
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const industry = searchParams.get('industry')
    const location = searchParams.get('location')
    const verified = searchParams.get('verified')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const filters = {
      industry: industry || undefined,
      location: location || undefined,
      is_verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
    }

    const socialProfileService = new SocialProfileService()
    const profiles = await socialProfileService.searchProfiles(query, filters)
    
    // Simple pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProfiles = profiles.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedProfiles,
      pagination: {
        page,
        limit,
        total: profiles.length,
        total_pages: Math.ceil(profiles.length / limit),
        has_next: endIndex < profiles.length,
        has_prev: page > 1,
      }
    })

  } catch (error: any) {
    console.error('Error searching profiles:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/social/profiles - Create profile
export async function POST(request: NextRequest) {
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
    
    const socialProfileService = new SocialProfileService()
    
    // Check if profile already exists
    const existingProfile = await socialProfileService.getProfile(user.id)
    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists. Use PUT to update.' },
        { status: 409 }
      )
    }

    const profile = await socialProfileService.createProfile(user.id, body)

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'Profile created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating profile:', error)
    
    if (error.message === 'Username already taken') {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/social/profiles - Update profile
export async function PUT(request: NextRequest) {
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
    
    const socialProfileService = new SocialProfileService()
    
    // Check if profile exists
    const existingProfile = await socialProfileService.getProfile(user.id)
    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found. Use POST to create.' },
        { status: 404 }
      )
    }

    const profile = await socialProfileService.updateProfile(user.id, body)

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'Profile updated successfully'
    })

  } catch (error: any) {
    console.error('Error updating profile:', error)
    
    if (error.message === 'Username already taken') {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 