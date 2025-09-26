"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import AIEnhancedMessageInput from '@/components/messaging/AIEnhancedMessageInput'
import { 
  Brain, 
  Sparkles, 
  MessageSquare, 
  Zap, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Send
} from 'lucide-react'

export default function TestAIMessagingPage() {
  const [messages, setMessages] = useState<string[]>([])
  const [conversationContext, setConversationContext] = useState('Customer inquiry about gold jewelry')
  const [businessContext, setBusinessContext] = useState<'inquiry' | 'quote' | 'order' | 'support' | 'general'>('inquiry')

  const handleSendMessage = (message: string) => {
    setMessages(prev => [...prev, message])
  }

  const clearMessages = () => {
    setMessages([])
  }

  const addSampleMessage = () => {
    const sampleMessages = [
      "Hello! I am interested in purchasing 2kg of 18k gold for our jewelry collection. Can you provide pricing and availability?",
      "We need this urgently for a new collection launch. What is your current stock situation?",
      "Thank you for the quick response. Could you also send us your latest catalog?",
      "Perfect! We'll place an order for 2kg. What are the payment terms?"
    ]
    
    const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)]
    setMessages(prev => [...prev, randomMessage])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center space-x-3">
            <Brain className="h-10 w-10 text-blue-600" />
            <span>AI-Enhanced Messaging System</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of business messaging with AI-powered features similar to Apple's Messages app.
            Get real-time suggestions, tone analysis, business insights, and smart completions.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Completions
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Lightbulb className="h-4 w-4 mr-2" />
              Real-time Assistance
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <TrendingUp className="h-4 w-4 mr-2" />
              Business Insights
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - AI Features Demo */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Messaging Input */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-6 w-6" />
                  <span>AI-Enhanced Message Input</span>
                </CardTitle>
                <p className="text-blue-100 text-sm font-normal">
                  Type your message and experience AI-powered assistance in real-time
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <AIEnhancedMessageInput
                  onSendMessage={handleSendMessage}
                  conversationContext={conversationContext}
                  businessContext={businessContext}
                  messageHistory={messages}
                  placeholder="Start typing your message to see AI features in action..."
                />
              </CardContent>
            </Card>

            {/* Conversation History */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-6 w-6" />
                  <span>Conversation History</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {messages.length} messages
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addSampleMessage}
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    Add Sample
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearMessages}
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No messages yet. Start typing above to see AI features!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-800">
                          U
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-800">{message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Message {index + 1} • {new Date().toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Features & Controls */}
          <div className="space-y-6">
            {/* Context Controls */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Context Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Context
                  </label>
                  <select
                    value={businessContext}
                    onChange={(e) => setBusinessContext(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="inquiry">Customer Inquiry</option>
                    <option value="quote">Quote Request</option>
                    <option value="order">Order Management</option>
                    <option value="support">Customer Support</option>
                    <option value="general">General Communication</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conversation Context
                  </label>
                  <textarea
                    value={conversationContext}
                    onChange={(e) => setConversationContext(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                    placeholder="Describe the conversation context..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI Features Overview */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>AI Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Real-time typing assistance</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Smart message completions</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Tone analysis & suggestions</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Business insights & keywords</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Grammar checking</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Auto-complete suggestions</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setBusinessContext('inquiry')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Inquiry
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setBusinessContext('quote')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Request Quote
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setBusinessContext('support')}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Get Support
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-600 to-slate-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Service</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Endpoints</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Clock className="h-3 w-3 mr-1" />
                    &lt;500ms
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Showcase */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6" />
              <span>AI Feature Showcase</span>
            </CardTitle>
            <p className="text-indigo-100 text-sm font-normal">
              Explore the advanced AI capabilities built into the messaging system
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="completions" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="completions">Completions</TabsTrigger>
                <TabsTrigger value="typing">Typing Assistant</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="insights">Business Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="completions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Smart Completions</h4>
                    <p className="text-sm text-blue-700">
                      Get AI-generated message completions based on context, tone, and business requirements.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Alternative Suggestions</h4>
                    <p className="text-sm text-green-700">
                      Receive multiple phrasing options to choose the perfect tone for your message.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="typing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">Real-time Assistance</h4>
                    <p className="text-sm text-purple-700">
                      AI provides suggestions as you type, helping you craft better messages instantly.
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-2">Auto-complete</h4>
                    <p className="text-sm text-orange-700">
                      Intelligent auto-completion that understands context and suggests natural continuations.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-2">Tone Analysis</h4>
                    <p className="text-sm text-red-700">
                      Analyze message tone and get suggestions for maintaining appropriate business communication.
                    </p>
                  </div>
                  <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <h4 className="font-semibold text-teal-900 mb-2">Grammar Checking</h4>
                    <p className="text-sm text-teal-700">
                      Automatic grammar suggestions and corrections to ensure professional communication.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-900 mb-2">Business Intelligence</h4>
                    <p className="text-sm text-indigo-700">
                      Extract key business insights, keywords, and suggested actions from conversations.
                    </p>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                    <h4 className="font-semibold text-pink-900 mb-2">Sentiment Analysis</h4>
                    <p className="text-sm text-pink-700">
                      Understand customer sentiment and urgency to prioritize responses appropriately.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
