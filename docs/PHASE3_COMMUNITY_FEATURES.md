# 🏘️ PHASE 3: COMMUNITY FEATURES

## Overview

Phase 3 introduces comprehensive community features that transform your jewelry CRM into a vibrant professional network. This phase includes communities, events, enhanced messaging, and content moderation systems.

## 🎯 Features Implemented

### 1. Groups & Communities
- **Industry-specific communities** (Diamond Experts, Vintage Collectors, etc.)
- **Privacy levels** (Public, Private, Secret)
- **Member management** with roles (Owner, Admin, Moderator, Member)
- **Community posts** and discussions
- **Verification system** for official communities

### 2. Events & Calendar
- **Multiple event types** (Workshops, Webinars, Meetups, Conferences)
- **Location support** (Online, In-Person, Hybrid)
- **RSVP system** with participant management
- **Event categorization** and filtering
- **Calendar integration** ready

### 3. Enhanced Messaging
- **Direct messaging** between users
- **Group chats** for communities
- **Message threading** and organization
- **Media support** (Images, Files, Voice)
- **Real-time messaging** infrastructure

### 4. Content Moderation
- **Community guidelines** system
- **Content reporting** with multiple reasons
- **Moderation actions** (Warnings, Bans, Content Removal)
- **Moderator tools** and permissions
- **Audit trail** for all actions

## 🗄️ Database Schema

### Core Tables

#### Communities
```sql
social_communities
├── id (UUID, Primary Key)
├── name (VARCHAR)
├── slug (VARCHAR, Unique)
├── description (TEXT)
├── category (ENUM: jewelry_design, gemology, business, etc.)
├── privacy_level (ENUM: public, private, secret)
├── member_count (INTEGER)
├── post_count (INTEGER)
├── is_verified (BOOLEAN)
├── created_by (TEXT)
└── timestamps
```

#### Events
```sql
social_events
├── id (UUID, Primary Key)
├── title (VARCHAR)
├── description (TEXT)
├── event_type (ENUM: meetup, workshop, webinar, etc.)
├── start_date (TIMESTAMP)
├── end_date (TIMESTAMP)
├── location_type (ENUM: online, in_person, hybrid)
├── max_participants (INTEGER)
├── current_participants (INTEGER)
├── is_free (BOOLEAN)
├── price (DECIMAL)
└── organizer_id (TEXT)
```

#### Messaging
```sql
social_direct_messages
├── id (UUID, Primary Key)
├── sender_id (TEXT)
├── recipient_id (TEXT)
├── content (TEXT)
├── message_type (ENUM: text, image, file, voice)
├── is_read (BOOLEAN)
└── timestamps

social_group_messages
├── id (UUID, Primary Key)
├── group_id (UUID)
├── sender_id (TEXT)
├── content (TEXT)
├── reply_to_message_id (UUID, Optional)
└── timestamps
```

#### Moderation
```sql
social_content_reports
├── id (UUID, Primary Key)
├── reporter_id (TEXT)
├── reported_content_type (ENUM: post, comment, user, etc.)
├── reported_content_id (TEXT)
├── report_reason (ENUM: spam, inappropriate, harassment, etc.)
├── report_status (ENUM: pending, investigating, resolved, dismissed)
└── moderation_notes (TEXT)
```

## 🚀 Setup Instructions

### 1. Database Migration

Run the Phase 3 SQL script in your Supabase Dashboard:

```bash
# Copy the content from scripts/phase3-community-features-setup.sql
# Execute in Supabase SQL Editor
```

### 2. Environment Configuration

Ensure your `.env.local` has the required Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Testing the Setup

Run the Phase 3 testing script:

```bash
node scripts/test-phase3-features.js
```

## 📱 User Interface

### New Pages Added

1. **`/dashboard/communities`** - Community discovery and management
2. **`/dashboard/events`** - Event browsing and creation
3. **`/dashboard/messaging`** - Enhanced messaging interface

### Navigation Updates

The sidebar now includes:
- Communities
- Events  
- Messaging

## 🔧 API Endpoints

### Communities
- `GET /api/social/communities` - List communities with filters
- `POST /api/social/communities` - Create new community
- `PUT /api/social/communities/[id]` - Update community
- `DELETE /api/social/communities/[id]` - Delete community

### Events
- `GET /api/social/events` - List events with filters
- `POST /api/social/events` - Create new event
- `PUT /api/social/events/[id]` - Update event
- `DELETE /api/social/events/[id]` - Delete event

### Messaging
- `GET /api/social/messages` - Get conversation messages
- `POST /api/social/messages` - Send new message

### Moderation
- `GET /api/social/moderation/reports` - Get content reports (moderators)
- `POST /api/social/moderation/reports` - Create content report

## 💡 Usage Examples

### Creating a Community

```typescript
import { CommunityService } from '@/lib/services/CommunityService';

const communityService = new CommunityService();

const newCommunity = await communityService.createCommunity({
  name: "Diamond Experts Network",
  slug: "diamond-experts",
  description: "Professional network for certified diamond experts",
  category: "diamond_experts",
  privacy_level: "public"
}, userId);
```

### Creating an Event

```typescript
const newEvent = await communityService.createEvent({
  title: "Advanced Diamond Grading Workshop",
  description: "Hands-on workshop for experienced professionals",
  event_type: "workshop",
  start_date: "2024-02-15T10:00:00Z",
  end_date: "2024-02-15T16:00:00Z",
  location_type: "in_person",
  location_address: "Jewelry Institute, NYC",
  max_participants: 25,
  is_free: false,
  price: 299
}, userId);
```

### Sending a Message

```typescript
const message = await communityService.sendDirectMessage({
  recipient_id: "user123",
  content: "Hi! I'd love to discuss diamond grading techniques.",
  message_type: "text"
}, senderId);
```

## 🧪 Testing

### Manual Testing Checklist

#### Communities
- [ ] Create a new community
- [ ] Join/leave communities
- [ ] Post in communities
- [ ] Test privacy levels
- [ ] Verify member counts update

#### Events
- [ ] Create an event
- [ ] RSVP to events
- [ ] Test different event types
- [ ] Verify participant counts
- [ ] Test date filtering

#### Messaging
- [ ] Send direct messages
- [ ] Create group chats
- [ ] Test message threading
- [ ] Verify read receipts

#### Moderation
- [ ] Report inappropriate content
- [ ] Test moderator permissions
- [ ] Verify report workflow

### Automated Testing

```bash
# Run Phase 3 tests
node scripts/test-phase3-features.js

# Expected output:
# ✅ All community tables exist and accessible
# ✅ All event tables exist and accessible
# ✅ All messaging tables exist and accessible
# ✅ All moderation tables exist and accessible
# ✅ RLS policies are active
# ✅ Triggers and functions are working
```

## 🔒 Security Features

### Row Level Security (RLS)
- **Communities**: Public viewing, member-only posting
- **Events**: Public viewing, organizer-only editing
- **Messages**: Participant-only access
- **Reports**: User can only see their own reports

### Permission System
- **Community Owners**: Full control over communities
- **Community Admins**: Manage members and content
- **Community Moderators**: Handle reports and moderation
- **Regular Members**: Post and participate

## 📊 Analytics & Insights

### Community Metrics
- Total communities and members
- Active communities count
- Top community categories
- Growth trends

### Event Analytics
- Total events and participants
- Event type distribution
- Attendance rates
- Popular event categories

### Messaging Statistics
- Total conversations
- Message volume
- Response times
- Active users

## 🚀 Next Steps (Phase 4)

Phase 4 will include:
- **Analytics & Insights**: Advanced social engagement analytics
- **Monetization**: Creator tools and revenue sharing
- **Mobile App**: PWA or native mobile application
- **Integration**: Connect with existing CRM functionality

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Verify Supabase client configuration
```

#### RLS Policy Errors
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'social_%';

-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename LIKE 'social_%';
```

#### Missing Tables
```sql
-- List all social tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'social_%';
```

### Support

If you encounter issues:
1. Check the testing script output
2. Verify database schema matches documentation
3. Ensure environment variables are correct
4. Check Supabase logs for errors

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Hook Form](https://react-hook-form.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🎉 Conclusion

Phase 3 successfully transforms your jewelry CRM into a comprehensive professional networking platform. Users can now:

- **Connect** through industry-specific communities
- **Learn** through educational events and workshops
- **Communicate** via enhanced messaging systems
- **Collaborate** in moderated, professional environments

The foundation is now set for advanced social features and mobile applications in future phases. 