import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CommunityService } from '@/lib/services/CommunityService';

// GET /api/social/moderation/reports - Get content reports (for moderators)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a moderator (has admin/moderator role in any community)
    const { data: moderatorCheck } = await supabase
      .from('social_community_members')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'moderator'])
      .limit(1);

    if (!moderatorCheck || moderatorCheck.length === 0) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const communityService = new CommunityService();
    const reports = await communityService.getContentReports(status, page, limit);

    return NextResponse.json({
      reports,
      total: reports.length,
      page,
      limit,
      has_more: reports.length === limit
    });
  } catch (error) {
    console.error('Error fetching content reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content reports' },
      { status: 500 }
    );
  }
}

// POST /api/social/moderation/reports - Create a content report
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
    const report = await communityService.createContentReport(body, user.id);

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    console.error('Error creating content report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create content report' },
      { status: 400 }
    );
  }
} 