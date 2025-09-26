import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CommunityService } from '@/lib/services/CommunityService';

// GET /api/social/messages - Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const thread_id = searchParams.get('thread_id') || undefined;
    const sender_id = searchParams.get('sender_id') || undefined;
    const recipient_id = searchParams.get('recipient_id') || undefined;
    const message_type = searchParams.get('message_type') as any || undefined;
    const is_read = searchParams.get('is_read') === 'true' ? true : 
                   searchParams.get('is_read') === 'false' ? false : undefined;
    const search = searchParams.get('search') || undefined;
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

    const communityService = new CommunityService();
    let messages;

    if (thread_id) {
      // Get group messages
      messages = await communityService.getGroupMessages(thread_id, page, limit);
    } else if (recipient_id) {
      // Get direct messages between two users
      messages = await communityService.getDirectMessages(user.id, recipient_id, page, limit);
    } else {
      return NextResponse.json(
        { error: 'Either thread_id or recipient_id is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      messages,
      total: messages.length,
      page,
      limit,
      has_more: messages.length === limit
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/social/messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const communityService = new CommunityService();
    let message;

    if (body.group_id) {
      // Send group message
      message = await communityService.sendGroupMessage(body, user.id);
    } else if (body.recipient_id) {
      // Send direct message
      message = await communityService.sendDirectMessage(body, user.id);
    } else {
      return NextResponse.json(
        { error: 'Either group_id or recipient_id is required' },
        { status: 400 }
      );
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 400 }
    );
  }
} 