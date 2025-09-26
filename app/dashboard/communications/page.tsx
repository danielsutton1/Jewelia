'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Smile, 
  MoreHorizontal,
  Clock,
  User,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Play,
  Pause
} from 'lucide-react'
import { ChatQuickActions } from '@/components/communications/ChatQuickActions'

// Mock data for orders
const mockOrders = [
  { id: '1', name: 'Diamond Ring - Order #1234', status: 'In Production', assignee: 'Sarah Johnson' },
  { id: '2', name: 'Gold Necklace - Order #1235', status: 'Design Review', assignee: 'Mike Chen' },
  { id: '3', name: 'Platinum Band - Order #1236', status: 'Quality Check', assignee: 'Lisa Rodriguez' },
  { id: '4', name: 'Sapphire Earrings - Order #1237', status: 'Ready for Pickup', assignee: 'David Kim' },
]

// Mock data for production stages
const productionStages = [
  { id: 'design', name: 'Design', status: 'completed', assignee: 'Sarah Johnson' },
  { id: 'casting', name: 'Casting', status: 'in-progress', assignee: 'Mike Chen' },
  { id: 'setting', name: 'Stone Setting', status: 'pending', assignee: 'Lisa Rodriguez' },
  { id: 'polishing', name: 'Polishing', status: 'pending', assignee: 'David Kim' },
  { id: 'qc', name: 'Quality Control', status: 'pending', assignee: 'Quality Team' },
]

// Mock messages for each stage
const mockMessages = {
  design: [
    { id: 1, user: 'Sarah Johnson', message: 'Design approved by client. Moving to casting stage.', timestamp: '2 hours ago', avatar: '/api/placeholder/32/32' },
    { id: 2, user: 'Mike Chen', message: 'Great! I\'ll start the casting process tomorrow morning.', timestamp: '1 hour ago', avatar: '/api/placeholder/32/32' },
  ],
  casting: [
    { id: 3, user: 'Mike Chen', message: 'Casting process started. Expected completion in 2 days.', timestamp: '30 minutes ago', avatar: '/api/placeholder/32/32' },
    { id: 4, user: 'Sarah Johnson', message: 'Perfect timing. Client is eager to see progress.', timestamp: '15 minutes ago', avatar: '/api/placeholder/32/32' },
  ],
  setting: [],
  polishing: [],
  qc: [],
}

export default function CommunicationsPage() {
  const [selectedOrder, setSelectedOrder] = useState(mockOrders[0])
  const [activeStage, setActiveStage] = useState('casting')
  const [message, setMessage] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [communications, setCommunications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch communications data
  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        const response = await fetch('/api/communications')
        const data = await response.json()
        if (data.success) {
          setCommunications(data.data)
        }
      } catch (error) {
        console.error('Error fetching communications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCommunications()
  }, [])

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, this would send to backend
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  const getStageStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in-progress':
        return <Play className="h-4 w-4 text-blue-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 p-1">
      {/* Order Selection Sidebar */}
      <div className="w-full lg:w-80 bg-white border-b lg:border-r border-gray-200 p-3 sm:p-4">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 communications-heading">Active Orders</h2>
          <div className="space-y-2">
            {mockOrders.map((order) => (
              <div
                key={order.id}
                className={`p-2 sm:p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedOrder.id === order.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-xs sm:text-sm">{order.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{order.assignee}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Communications Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Total Messages</span>
              <span className="font-medium">{communications.length}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Unread</span>
              <span className="font-medium">{communications.filter(c => c.status === 'unread').length}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span>High Priority</span>
              <span className="font-medium">{communications.filter(c => c.priority === 'high').length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Real Communications List */}
        <Card className="mt-4">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm">Recent Communications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-xs text-gray-500 mt-2">Loading communications...</p>
              </div>
            ) : communications.length > 0 ? (
              <div className="space-y-2">
                {communications.slice(0, 5).map((comm) => (
                  <div key={comm.id} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-xs">{comm.subject}</h4>
                        <p className="text-xs text-gray-500 mt-1">{comm.type} • {comm.category}</p>
                      </div>
                      <Badge variant={comm.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {comm.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-xs">No communications yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold communications-title">{selectedOrder.name}</h1>
              <p className="text-xs sm:text-sm text-gray-500 communications-subtitle">Project Communications</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px]">
                <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">View Files</span>
                <span className="sm:hidden">Files</span>
              </Button>
              <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px]">
                <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Schedule Meeting</span>
                <span className="sm:hidden">Meeting</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stage Tabs */}
        <div className="bg-white border-b border-gray-200">
          <Tabs value={activeStage} onValueChange={setActiveStage} className="w-full">
            <TabsList className="grid w-full grid-cols-5 overflow-x-auto">
              {productionStages.map((stage) => (
                <TabsTrigger
                  key={stage.id}
                  value={stage.id}
                  className="flex items-center space-x-1 sm:space-x-2 text-xs min-h-[44px] min-w-[44px]"
                >
                  {getStageStatusIcon(stage.status)}
                  <span className="hidden sm:inline">{stage.name}</span>
                  <span className="sm:hidden">{stage.name.charAt(0)}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {mockMessages[activeStage as keyof typeof mockMessages]?.map((msg) => (
                <div key={msg.id} className="flex items-start space-x-2 sm:space-x-3">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                    <AvatarImage src={msg.avatar} />
                    <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-xs sm:text-sm">{msg.user}</span>
                      <span className="text-xs text-gray-500">{msg.timestamp}</span>
                    </div>
                    <div className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
                      <p className="text-xs sm:text-sm">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {mockMessages[activeStage as keyof typeof mockMessages]?.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">No messages in this stage yet.</p>
                  <p className="text-xs sm:text-sm">Start the conversation!</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-3 sm:p-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="min-h-[44px] min-w-[44px]"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={handleSendMessage} className="min-h-[44px] min-w-[44px]">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {showQuickActions && (
              <div className="mt-3">
                <ChatQuickActions />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignee Info Sidebar */}
      <div className="w-full lg:w-64 bg-white border-t lg:border-l border-gray-200 p-3 sm:p-4">
        <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Stage Assignee</h3>
        {(() => {
          const currentStage = productionStages.find(stage => stage.id === activeStage)
          return currentStage ? (
            <Card>
              <CardContent className="pt-3 sm:pt-4">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src="/api/placeholder/40/40" />
                    <AvatarFallback>{currentStage.assignee.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-xs sm:text-sm">{currentStage.assignee}</p>
                    <p className="text-xs text-gray-500">{currentStage.name}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={currentStage.status === 'completed' ? 'default' : 'secondary'}>
                      {currentStage.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Time:</span>
                    <span>2.3h avg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Messages:</span>
                    <span>{mockMessages[activeStage as keyof typeof mockMessages]?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null
        })()}

        <div className="mt-4 sm:mt-6">
          <h4 className="font-medium text-xs sm:text-sm mb-2 sm:mb-3">Recent Activity</h4>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="h-3 w-3" />
              <span>Mike started casting process</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <User className="h-3 w-3" />
              <span>Sarah approved design</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <FileText className="h-3 w-3" />
              <span>Client uploaded reference</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 