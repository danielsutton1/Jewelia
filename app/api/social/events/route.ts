import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CommunityService } from '@/lib/services/CommunityService';

// GET /api/social/events - List and search events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const event_type = searchParams.get('event_type') as any || undefined;
    const location_type = searchParams.get('location_type') as any || undefined;
    const start_date_from = searchParams.get('start_date_from') || undefined;
    const start_date_to = searchParams.get('start_date_to') || undefined;
    const is_free = searchParams.get('is_free') === 'true' ? true : 
                   searchParams.get('is_free') === 'false' ? false : undefined;
    const community_id = searchParams.get('community_id') || undefined;
    const organizer_id = searchParams.get('organizer_id') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort_by = searchParams.get('sort_by') as any || undefined;
    const sort_order = searchParams.get('sort_order') as any || undefined;

    const filters = {
      event_type,
      location_type,
      start_date_from,
      start_date_to,
      is_free,
      community_id,
      organizer_id,
      search,
      sort_by,
      sort_order
    };

    const communityService = new CommunityService();
    const result = await communityService.listEvents(filters, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/social/events - Create a new event
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
    const event = await communityService.createEvent(body, user.id);

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 400 }
    );
  }
} 