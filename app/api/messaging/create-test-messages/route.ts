import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { withErrorHandling, handleApiError, AuthenticationError } from '@/lib/middleware/errorHandler'

export const POST = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // For testing purposes, use a demo user if no authentication
  const userId = user?.id || 'fdb2a122-d6ae-4e78-b277-3317e1a09132'

  // Create sample unread messages for testing the NewMessageBox component
  const testMessages = [
    {
      type: 'external' as const,
      sender_id: userId,
      recipient_id: userId,
      subject: 'Urgent: New Partnership Opportunity',
      content: 'We have received an exciting partnership proposal from a luxury jewelry distributor in Europe. They are interested in carrying our exclusive diamond collection and are offering excellent terms. Please review the attached proposal and let me know your thoughts by end of week.',
      content_type: 'text' as const,
      priority: 'high' as const,
      category: 'partnership',
      status: 'sent' as const,
      is_read: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
      type: 'internal' as const,
      sender_id: userId,
      recipient_id: userId,
      subject: 'Production Update: Custom Ring Order',
      content: 'The custom engagement ring for the Johnson wedding is ready for final inspection. The 2-carat diamond has been set perfectly and the platinum band is polished to perfection. Please schedule a time to review before delivery.',
      content_type: 'text' as const,
      priority: 'normal' as const,
      category: 'production',
      status: 'sent' as const,
      is_read: false,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
    },
    {
      type: 'system' as const,
      sender_id: userId,
      recipient_id: userId,
      subject: 'Inventory Alert: Low Stock Items',
      content: 'Your inventory system has detected that several popular items are running low on stock. The following items need to be reordered: Diamond Stud Earrings (14k Gold), Pearl Necklace (16 inches), and Sapphire Ring (Size 7).',
      content_type: 'text' as const,
      priority: 'normal' as const,
      category: 'inventory',
      status: 'sent' as const,
      is_read: false,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
    },
    {
      type: 'internal' as const,
      sender_id: userId,
      recipient_id: userId,
      subject: 'URGENT: Client Meeting Rescheduled',
      content: 'The VIP client meeting scheduled for tomorrow at 2 PM has been moved to 4 PM due to their flight delay. Please update your calendar and prepare the presentation materials. This is a high-value potential customer.',
      content_type: 'text' as const,
      priority: 'urgent' as const,
      category: 'meeting',
      status: 'sent' as const,
      is_read: false,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
    },
    {
      type: 'external' as const,
      sender_id: userId,
      recipient_id: userId,
      subject: 'New Order Inquiry from Partner',
      content: 'Hello! We have a customer interested in your custom jewelry services. They are looking for a vintage-style emerald necklace with matching earrings. Budget is $15,000-$20,000. Can you provide a quote and timeline?',
      content_type: 'text' as const,
      priority: 'normal' as const,
      category: 'inquiry',
      status: 'sent' as const,
      is_read: false,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
    }
  ]

  try {
    // Insert the test messages
    const { data: messages, error } = await supabase
      .from('messages')
      .insert(testMessages)
      .select()

    if (error) {
      console.error('Error creating test messages:', error)
      throw new Error('Failed to create test messages')
    }

    return NextResponse.json({
      success: true,
      data: messages,
      message: `Created ${messages?.length || 0} test messages successfully`
    })

  } catch (error) {
    console.error('Error in create-test-messages:', error)
    throw error
  }
})
