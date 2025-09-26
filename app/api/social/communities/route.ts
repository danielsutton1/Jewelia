import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CommunityService } from '@/lib/services/CommunityService';
import { CommunityFilters } from '@/types/community-features';

// GET /api/social/communities - List and search communities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || undefined;
    const privacy_level = searchParams.get('privacy_level') || undefined;
    const is_verified = searchParams.get('is_verified') === 'true' ? true : 
                       searchParams.get('is_verified') === 'false' ? false : undefined;
    const search = searchParams.get('search') || undefined;
    const sort_by = searchParams.get('sort_by') || undefined;
    const sort_order = searchParams.get('sort_order') || undefined;

    const filters: CommunityFilters = {
      category: category as any,
      privacy_level: privacy_level as any,
      is_verified,
      search,
      sort_by: sort_by as any,
      sort_order: sort_order as any
    };

    const communityService = new CommunityService();
    const result = await communityService.listCommunities(filters, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}

// POST /api/social/communities - Create a new community
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const communityService = new CommunityService();
    const community = await communityService.createCommunity(body, user.id);

    return NextResponse.json(community, { status: 201 });
  } catch (error: any) {
    console.error('Error creating community:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create community' },
      { status: 400 }
    );
  }
} 