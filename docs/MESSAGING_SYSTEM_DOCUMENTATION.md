# Unified Messaging System Documentation

## Overview

The Unified Messaging System is a comprehensive real-time communication platform that consolidates internal and external messaging capabilities for the Jewelia CRM. It provides a seamless experience for both admin-to-user and admin-to-admin communications with advanced features including real-time updates, file attachments, notifications, and mobile support.

## Architecture

### Core Components

1. **UnifiedMessagingService** - Central service layer for all messaging operations
2. **EnhancedRealtimeMessagingService** - Real-time communication and WebSocket management
3. **MessagingCacheService** - Performance optimization through caching
4. **EmailNotificationService** - Email integration for notifications
5. **API Routes** - RESTful endpoints for messaging operations
6. **React Components** - Frontend UI components
7. **Mobile App Extension** - Mobile-optimized messaging interface

### Database Schema

The system uses a unified database schema with the following core tables:

- `messages` - All message data
- `message_threads` - Conversation threads
- `message_attachments` - File attachments
- `message_reactions` - Message reactions
- `message_read_receipts` - Read status tracking
- `message_notifications` - User notifications

## Features

### 1. Message Types

- **Internal Messages** - Admin-to-user communications for job-related tasks
- **External Messages** - Admin-to-admin communications between companies
- **System Messages** - Automated system notifications
- **Notification Messages** - User-specific notifications

### 2. Real-time Features

- **Live Message Updates** - Instant message delivery
- **Typing Indicators** - Real-time typing status
- **Online Status** - User presence tracking
- **Connection Management** - Automatic reconnection and heartbeat
- **WebSocket Integration** - Efficient real-time communication

### 3. File Management

- **File Uploads** - Support for multiple file types
- **Drag & Drop** - Intuitive file selection
- **Progress Tracking** - Upload progress indicators
- **File Validation** - Size and type restrictions
- **Secure Storage** - Supabase Storage integration

### 4. Advanced Features

- **Message Reactions** - Like, heart, and custom reactions
- **Read Receipts** - Message read status tracking
- **Thread Management** - Conversation organization
- **Search & Filtering** - Advanced message search
- **Notifications** - Push and email notifications
- **Mobile Support** - Responsive mobile interface

## API Reference

### Authentication

All API endpoints require authentication. Include the user's session token in requests.

### Message Endpoints

#### GET /api/messaging
Retrieve messages with filtering and pagination.

**Query Parameters:**
- `thread_id` - Filter by thread ID
- `type` - Filter by message type (internal, external, system, notification)
- `unread_only` - Return only unread messages
- `limit` - Number of messages to return (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Message content",
      "sender_id": "uuid",
      "recipient_id": "uuid",
      "thread_id": "uuid",
      "type": "internal",
      "created_at": "2024-01-01T00:00:00Z",
      "is_read": false,
      "sender": {
        "id": "uuid",
        "full_name": "John Doe",
        "email": "john@example.com",
        "avatar_url": "https://..."
      }
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### POST /api/messaging
Send a new message.

**Request Body:**
```json
{
  "type": "internal",
  "content": "Message content",
  "thread_id": "uuid",
  "recipient_id": "uuid",
  "priority": "normal",
  "category": "general",
  "tags": ["urgent", "follow-up"],
  "metadata": {
    "related_order_id": "uuid"
  }
}
```

#### PATCH /api/messaging/messages/[id]
Update message properties (read status, etc.).

#### DELETE /api/messaging/messages/[id]
Delete a message.

### Thread Endpoints

#### GET /api/messaging/threads
Retrieve conversation threads.

#### POST /api/messaging/threads
Create a new thread.

#### PATCH /api/messaging/threads/[id]
Update thread properties.

#### DELETE /api/messaging/threads/[id]
Archive a thread.

### File Upload Endpoints

#### POST /api/messaging/upload
Upload file attachments.

**Request:** Multipart form data
- `file` - The file to upload
- `messageId` - Associated message ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "file_name": "document.pdf",
    "file_url": "https://...",
    "file_type": "application/pdf",
    "file_size": 1024000
  }
}
```

### Statistics Endpoints

#### GET /api/messaging/stats
Get messaging statistics for a user.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_messages": 150,
    "unread_messages": 5,
    "total_threads": 25,
    "active_threads": 12,
    "messages_by_type": {
      "internal": 100,
      "external": 30,
      "system": 15,
      "notification": 5
    },
    "response_time_avg": 2.5,
    "recent_activity": [...]
  }
}
```

## Frontend Components

### Core Components

#### MessageComposer
```tsx
<MessageComposer
  threadId="uuid"
  onSendMessage={(content, attachments) => {
    // Handle message sending
  }}
  onTyping={(isTyping) => {
    // Handle typing indicator
  }}
  disabled={false}
/>
```

#### FileUpload
```tsx
<FileUpload
  onFileSelect={(files) => {
    // Handle file selection
  }}
  onFileRemove={(fileId) => {
    // Handle file removal
  }}
  selectedFiles={[]}
  maxFiles={5}
  maxSize={10 * 1024 * 1024} // 10MB
  acceptedTypes={['image/*', 'application/pdf']}
/>
```

### Real-time Hook

#### useRealtimeMessaging
```tsx
const {
  isConnected,
  connectionStatus,
  typingUsers,
  onlineUsers,
  error,
  sendTypingIndicator,
  subscribeToThread,
  unsubscribeFromThread
} = useRealtimeMessaging({
  userId: "user-id",
  threadId: "thread-id",
  onNewMessage: (message) => {
    // Handle new message
  },
  onThreadUpdate: (thread) => {
    // Handle thread update
  },
  onNewNotification: (notification) => {
    // Handle new notification
  }
})
```

## Mobile App Integration

### Mobile Messaging Page
The mobile app includes a dedicated messaging interface optimized for touch interactions:

- **Responsive Design** - Adapts to different screen sizes
- **Touch-Friendly UI** - Large touch targets and gestures
- **Offline Support** - Queues messages when offline
- **Push Notifications** - Native mobile notifications
- **File Handling** - Mobile-optimized file uploads

### Mobile-Specific Features

- **Swipe Actions** - Swipe to reply, archive, or delete
- **Voice Messages** - Audio message recording
- **Camera Integration** - Direct photo/video capture
- **Location Sharing** - Share location in messages
- **Quick Replies** - Predefined response templates

## Performance Optimization

### Caching Strategy

The system implements a multi-layer caching strategy:

1. **Memory Cache** - Fast access for frequently used data
2. **Redis Cache** - Distributed caching for scalability
3. **Database Indexing** - Optimized queries with proper indexes
4. **CDN Integration** - Fast file delivery

### Cache Configuration

```typescript
const cacheConfig: CacheConfig = {
  ttl: 300, // 5 minutes
  maxSize: 1000,
  enableMemoryCache: true,
  enableRedisCache: true,
  redisUrl: process.env.REDIS_URL
}
```

### Performance Monitoring

- **Cache Hit Rates** - Monitor cache effectiveness
- **Response Times** - Track API performance
- **Memory Usage** - Monitor resource consumption
- **Connection Status** - Track real-time connection health

## Security

### Authentication & Authorization

- **JWT Tokens** - Secure session management
- **Row Level Security** - Database-level access control
- **API Rate Limiting** - Prevent abuse
- **Input Validation** - Sanitize all inputs

### Data Protection

- **Encryption** - End-to-end message encryption
- **File Security** - Secure file storage and access
- **Audit Logging** - Track all message activities
- **Data Retention** - Configurable message retention policies

## Deployment

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...

# Redis (optional)
REDIS_URL=redis://...

# Email (optional)
SENDGRID_API_KEY=...
RESEND_API_KEY=...

# File Storage
SUPABASE_STORAGE_BUCKET=message-attachments
```

### Production Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] CDN configured for file delivery
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Rate limiting configured
- [ ] Security headers enabled

## Testing

### Integration Tests

Run the comprehensive test suite:

```bash
npm test __tests__/messaging/integration.test.ts
```

### Manual Testing Checklist

- [ ] Message sending and receiving
- [ ] File upload and download
- [ ] Real-time updates
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Thread management
- [ ] Search functionality
- [ ] Mobile responsiveness
- [ ] Notification delivery
- [ ] Error handling

## Troubleshooting

### Common Issues

#### Real-time Connection Issues
- Check WebSocket server status
- Verify network connectivity
- Review connection logs
- Check authentication tokens

#### File Upload Failures
- Verify file size limits
- Check file type restrictions
- Review storage bucket permissions
- Monitor storage quota

#### Performance Issues
- Monitor cache hit rates
- Check database query performance
- Review memory usage
- Analyze network latency

### Debug Mode

Enable debug logging:

```typescript
// In development
const debugConfig = {
  enableDebugLogs: true,
  logLevel: 'verbose'
}
```

## Future Enhancements

### Planned Features

1. **Video Calling** - Integrated video chat
2. **Message Encryption** - End-to-end encryption
3. **AI Integration** - Smart message suggestions
4. **Advanced Analytics** - Detailed usage analytics
5. **Multi-language Support** - Internationalization
6. **Voice Messages** - Audio message support
7. **Message Scheduling** - Delayed message sending
8. **Advanced Search** - Full-text search with filters

### Scalability Improvements

- **Microservices Architecture** - Service decomposition
- **Message Queuing** - Asynchronous processing
- **Load Balancing** - Distributed load handling
- **Database Sharding** - Horizontal scaling
- **CDN Optimization** - Global content delivery

## Support

### Getting Help

1. **Documentation** - Review this documentation
2. **Code Examples** - Check the test files
3. **Issue Tracking** - Report bugs and feature requests
4. **Community** - Join developer discussions

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This messaging system is part of the Jewelia CRM project and follows the same licensing terms.

---

*Last updated: July 2024*
*Version: 1.0.0* 