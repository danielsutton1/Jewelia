'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Users, 
  Search, 
  Plus, 
  Send, 
  MoreHorizontal,
  Phone,
  Video,
  Image as ImageIcon,
  File,
  Mic,
  Smile,
  AlertCircle
} from 'lucide-react';
import { DirectMessage, GroupMessage, MessageThread, ThreadType } from '@/types/community-features';

export default function MessagingPage() {
  // State for real data
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('direct');
  const [selectedThread, setSelectedThread] = useState<string | null>('1');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock users for display purposes
  const mockUsers = {
    'user1': { name: 'You', avatar: '/api/avatar/user1' },
    'user2': { name: 'Sarah Johnson', avatar: '/api/avatar/user2' },
    'user3': { name: 'Michael Chen', avatar: '/api/avatar/user3' },
    'user4': { name: 'Emily Rodriguez', avatar: '/api/avatar/user4' },
    'user5': { name: 'David Thompson', avatar: '/api/avatar/user5' },
    'user6': { name: 'Lisa Wang', avatar: '/api/avatar/user6' },
    'user7': { name: 'James Wilson', avatar: '/api/avatar/user7' },
    'user8': { name: 'Maria Garcia', avatar: '/api/avatar/user8' }
  };

  // Fetch real data from API
  useEffect(() => {
    fetchMessagingData();
  }, []);

  const fetchMessagingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch messages
      const messagesResponse = await fetch('/api/messaging?limit=50');
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        if (messagesData.success) {
          // Transform messages to match our interface
          const transformedMessages = messagesData.data.map((msg: any) => ({
            id: msg.id,
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id,
            content: msg.content,
            message_type: msg.content_type || 'text',
            is_read: msg.is_read,
            read_at: msg.read_at,
            created_at: msg.created_at
          }));
          setDirectMessages(transformedMessages);
        }
      }

      // Fetch threads
      const threadsResponse = await fetch('/api/messaging/threads');
      if (threadsResponse.ok) {
        const threadsData = await threadsResponse.json();
        if (threadsData.success) {
          setThreads(threadsData.data);
        }
      }

      // For now, we'll keep group messages empty until we implement group functionality
      setGroupMessages([]);

    } catch (error) {
      console.error('Error fetching messaging data:', error);
      setError('Failed to load messaging data');
    } finally {
      setLoading(false);
    }
  };

  const getThreadName = (thread: MessageThread) => {
    if (thread.name) return thread.name;
    
    if (thread.thread_type === 'direct') {
      const otherParticipant = thread.participants.find(p => p !== 'user1');
      return mockUsers[otherParticipant as keyof typeof mockUsers]?.name || 'Unknown User';
    }
    
    return `${thread.thread_type.charAt(0).toUpperCase() + thread.thread_type.slice(1)} Chat`;
  };

  const getThreadIcon = (thread: MessageThread) => {
    switch (thread.thread_type) {
      case 'direct': return <Users className="h-4 w-4" />;
      case 'group': return <Users className="h-4 w-4" />;
      case 'community': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedThread) return;
    
    // In a real app, this would send the message via API
    console.log('Sending message:', newMessage, 'to thread:', selectedThread);
    setNewMessage('');
  };

  const filteredThreads = threads.filter(thread =>
    getThreadName(thread).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedThreadData = threads.find(t => t.id === selectedThread);
  const isDirectMessage = selectedThreadData?.thread_type === 'direct';
  const messages = isDirectMessage ? directMessages : groupMessages;

  if (loading) {
    return (
      <div className="container mx-auto py-6 h-[calc(100vh-120px)]">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 h-[calc(100vh-120px)]">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Messages</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchMessagingData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-120px)]">
      <div className="flex h-full gap-6">
        {/* Left Sidebar - Threads */}
        <div className="w-80 flex flex-col border-r">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">Messages</h1>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Threads List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedThread === thread.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/api/avatar/default" />
                      <AvatarFallback>
                        {getThreadIcon(thread)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {getThreadName(thread)}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(thread.last_message_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {thread.thread_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {thread.participants.length} participants
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedThread ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/api/avatar/default" />
                    <AvatarFallback>
                      {selectedThreadData && getThreadIcon(selectedThreadData)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold">
                      {selectedThreadData ? getThreadName(selectedThreadData) : 'Loading...'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedThreadData?.participants.length || 0} participants
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === 'user1' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === 'user1'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                            <span>{formatTime(message.created_at)}</span>
                                                         {message.sender_id === 'user1' && 'is_read' in message && (
                               <span>
                                 {message.is_read ? '✓✓' : '✓'}
                               </span>
                             )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <File className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Mic className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  
                  <Button size="sm" variant="ghost">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleSendMessage} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p>Choose a thread from the left to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 