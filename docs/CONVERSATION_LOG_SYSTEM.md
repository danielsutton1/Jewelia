# Production Conversation Log System

## Overview

The Production Conversation Log System is a comprehensive solution for tracking and managing communications throughout the jewelry production process. It provides stage-based conversation tracking, search capabilities, analytics, and stage management features.

## Features

### 🎯 Core Features

1. **Stage-Based Conversations**
   - Track messages per production stage (Design, Casting, Setting, Polishing, QC, etc.)
   - Assign specific team members to each stage
   - Maintain conversation history per stage

2. **Real-Time Messaging**
   - Send and receive messages within active stages
   - Support for text messages and file attachments
   - Message read/unread status tracking

3. **Advanced Search & Filtering**
   - Full-text search across all conversations
   - Filter by production stage, sender type, date range
   - Search for messages with attachments
   - Filter unread messages only

4. **Stage Management**
   - Create new production stages
   - Assign team members to stages
   - Track stage transitions and completion
   - Quality score tracking per stage

5. **Analytics & Insights**
   - Message volume metrics
   - Response time analysis
   - Quality score tracking
   - Time spent per stage
   - Message trends over time

### 🔧 Technical Features

- **Real-time Updates**: Messages appear instantly across all connected clients
- **File Attachments**: Support for images, documents, and other file types
- **Search Highlighting**: Search results show highlighted matching terms
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Performance Optimized**: Efficient data loading and caching

## Architecture

### Data Models

```typescript
// Core Types
type ProductionStage = "Design" | "Casting" | "Setting" | "Polishing" | "QC" | "Completed" | "Rework" | "Shipping"

interface Message {
  id: string
  text: string
  sender: "assignee" | "staff" | "customer" | "system"
  senderName: string
  senderId: string
  timestamp: string
  attachments?: Array<{
    id: string
    name: string
    url: string
    size: number
    type: string
  }>
  isRead: boolean
  messageType: "text" | "image" | "file" | "system"
}

interface StageConversation {
  id: string
  stage: ProductionStage
  assigneeId: string
  assigneeName: string
  assigneeAvatar?: string
  startDate: string
  endDate?: string
  isActive: boolean
  messages: Message[]
  stageStatus: "pending" | "active" | "completed" | "paused"
  stageNotes?: string
  qualityScore?: number
  timeSpent?: number
}

interface ProductionConversationLog {
  orderId: string
  conversations: StageConversation[]
  currentStage: ProductionStage
  totalMessages: number
  lastActivity: string
}
```

### API Endpoints

#### GET `/api/orders/[orderId]/conversations`
- Fetch conversation log for an order
- Query parameters:
  - `action=search`: Perform search with filters
  - `keywords`: Search terms
  - `stages`: Comma-separated stage filters
  - `senders`: Comma-separated sender filters
  - `hasAttachments`: Filter messages with attachments
  - `unreadOnly`: Filter unread messages only

#### POST `/api/orders/[orderId]/conversations`
- Actions:
  - `addMessage`: Add new message to a stage
  - `createStage`: Create new production stage
  - `updateStage`: Update stage information
  - `markAsRead`: Mark messages as read

## Components

### 1. ProductionConversationLog
Main component for displaying and managing conversations.

**Features:**
- Stage-based conversation display
- Real-time messaging
- Search and filtering
- File attachment support
- Message status tracking

**Props:**
```typescript
interface ProductionConversationLogProps {
  orderId: string
  className?: string
}
```

### 2. StageManagement
Component for creating and managing production stages.

**Features:**
- Create new stages
- Assign team members
- Stage transition management
- Quality tracking

**Props:**
```typescript
interface StageManagementProps {
  orderId: string
  currentStage: ProductionStage
  onStageCreated: () => void
}
```

### 3. ConversationAnalytics
Component for displaying conversation metrics and insights.

**Features:**
- Message volume metrics
- Performance analytics
- Quality score tracking
- Time analysis
- Trend visualization

**Props:**
```typescript
interface ConversationAnalyticsProps {
  orderId: string
  className?: string
}
```

## Usage

### Basic Implementation

```tsx
import { ProductionConversationLog } from "@/components/orders/production-conversation-log"

function OrderDetailPage({ orderId }: { orderId: string }) {
  return (
    <div>
      <ProductionConversationLog orderId={orderId} />
    </div>
  )
}
```

### With Stage Management

```tsx
import { ProductionConversationLog } from "@/components/orders/production-conversation-log"
import { StageManagement } from "@/components/orders/stage-management"

function OrderDetailPage({ orderId }: { orderId: string }) {
  const [currentStage, setCurrentStage] = useState<ProductionStage>("Design")
  
  const handleStageCreated = () => {
    // Refresh conversation log
  }
  
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <ProductionConversationLog orderId={orderId} />
      </div>
      <div>
        <StageManagement 
          orderId={orderId}
          currentStage={currentStage}
          onStageCreated={handleStageCreated}
        />
      </div>
    </div>
  )
}
```

### With Analytics

```tsx
import { ProductionConversationLog } from "@/components/orders/production-conversation-log"
import { ConversationAnalytics } from "@/components/orders/conversation-analytics"

function OrderDetailPage({ orderId }: { orderId: string }) {
  const [view, setView] = useState<"conversations" | "analytics">("conversations")
  
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button 
          variant={view === "conversations" ? "default" : "outline"}
          onClick={() => setView("conversations")}
        >
          Conversations
        </Button>
        <Button 
          variant={view === "analytics" ? "default" : "outline"}
          onClick={() => setView("analytics")}
        >
          Analytics
        </Button>
      </div>
      
      {view === "conversations" ? (
        <ProductionConversationLog orderId={orderId} />
      ) : (
        <ConversationAnalytics orderId={orderId} />
      )}
    </div>
  )
}
```

## Production Stages

The system supports the following production stages:

1. **Design** 🎨
   - Initial design and planning phase
   - Estimated duration: 3 days
   - Required approvals: Customer, Design Manager

2. **Casting** 🔥
   - Metal casting and forming
   - Estimated duration: 5 days
   - Required approvals: Production Manager

3. **Setting** 💎
   - Stone setting and assembly
   - Estimated duration: 4 days
   - Required approvals: Master Setter

4. **Polishing** ✨
   - Finishing and polishing
   - Estimated duration: 2 days
   - Required approvals: Quality Manager

5. **QC** 🔍
   - Quality control and inspection
   - Estimated duration: 1 day
   - Required approvals: QC Manager, Production Manager

6. **Completed** ✅
   - Order completed and ready
   - Estimated duration: 0 days
   - Required approvals: Customer

7. **Rework** 🔄
   - Rework and corrections
   - Estimated duration: 3 days
   - Required approvals: Production Manager

8. **Shipping** 📦
   - Packaging and shipping
   - Estimated duration: 1 day
   - Required approvals: Shipping Manager

## Search & Filtering

### Search Syntax
- **Keywords**: Search for specific terms in message content
- **Stage Filter**: Filter by production stage
- **Sender Filter**: Filter by message sender type
- **Date Range**: Filter by message timestamp
- **Attachments**: Filter messages with file attachments
- **Unread Only**: Show only unread messages

### Example Search Queries
```
// Search for "diamond" in Setting stage
keywords=diamond&stages=Setting

// Search for unread messages with attachments
hasAttachments=true&unreadOnly=true

// Search for messages from assignees in the last week
senders=assignee&dateRange=2024-01-01,2024-01-07
```

## Analytics Metrics

### Key Performance Indicators
- **Total Messages**: Total number of messages across all stages
- **Average Messages per Stage**: Average message volume per production stage
- **Response Time**: Average time between messages
- **Quality Scores**: Quality assessment scores per stage
- **Time Spent**: Actual time spent on each stage
- **Unread Messages**: Number of unread messages
- **Attachments**: Number of file attachments

### Trend Analysis
- **Message Volume**: Daily message count trends
- **Stage Activity**: Most active production stages
- **Assignee Performance**: Most active team members
- **Quality Trends**: Quality score trends over time

## File Attachments

### Supported File Types
- Images: JPG, PNG, GIF, WebP
- Documents: PDF, DOC, DOCX, TXT
- CAD Files: STL, OBJ, STEP
- Other: ZIP, RAR

### File Size Limits
- Maximum file size: 10MB per file
- Maximum files per message: 5 files

### Storage
- Files are stored in cloud storage (configurable)
- Automatic file compression for images
- Secure file access with signed URLs

## Security & Permissions

### Access Control
- **Staff**: Can view and send messages in all stages
- **Assignees**: Can view and send messages in their assigned stages
- **Customers**: Can view messages in customer-facing stages
- **Managers**: Full access to all conversations and analytics

### Data Privacy
- Messages are encrypted in transit and at rest
- File attachments are stored securely
- Audit trail for all message activities
- GDPR-compliant data handling

## Performance Optimization

### Caching Strategy
- Conversation data cached in memory
- Search results cached for 5 minutes
- File attachments cached with CDN
- Real-time updates via WebSocket

### Database Optimization
- Indexed search fields for fast queries
- Pagination for large conversation logs
- Efficient message storage with compression
- Background cleanup of old data

## Troubleshooting

### Common Issues

1. **Messages not appearing**
   - Check network connectivity
   - Verify user permissions
   - Clear browser cache

2. **Search not working**
   - Ensure search terms are valid
   - Check filter combinations
   - Verify API endpoint availability

3. **File upload failures**
   - Check file size limits
   - Verify file type support
   - Ensure storage permissions

4. **Stage creation errors**
   - Verify assignee availability
   - Check stage transition rules
   - Ensure proper permissions

### Debug Mode
Enable debug mode by setting `DEBUG=true` in environment variables to get detailed error messages and API logs.

## Future Enhancements

### Planned Features
- **AI-Powered Insights**: Automated conversation analysis
- **Voice Messages**: Audio message support
- **Video Calls**: Integrated video conferencing
- **Mobile App**: Native mobile application
- **Advanced Analytics**: Machine learning insights
- **Integration APIs**: Third-party system integration

### Performance Improvements
- **Real-time Sync**: WebSocket-based real-time updates
- **Offline Support**: Offline message queuing
- **Advanced Search**: Elasticsearch integration
- **File Preview**: In-app file preview support

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Maintainer**: Development Team 
 