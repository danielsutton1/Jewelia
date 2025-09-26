"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Sparkles, 
  Lightbulb, 
  MessageSquare, 
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Brain
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface AIEnhancedMessageInputProps {
  onSendMessage: (message: string) => void
  conversationContext?: string
  businessContext?: string
  messageHistory?: string[]
  placeholder?: string
  disabled?: boolean
  value?: string
  onMessageChange?: (message: string) => void
}

interface AICompletion {
  suggestions: string[]
  smartReply: string
  toneAnalysis: {
    detected: string
    confidence: number
    suggested: string
  }
  businessInsights: {
    keywords: string[]
    sentiment: 'positive' | 'negative' | 'neutral'
    urgency: 'low' | 'normal' | 'high'
    suggestedActions: string[]
  }
  grammarCheck: {
    original: string
    corrected: string
    suggestions: string[]
  }
}

interface AITypingAssistant {
  realTimeSuggestions: string[]
  autoComplete: string
  smartFormatting: {
    emojis: string[]
    formatting: string[]
    links: string[]
  }
}

export default function AIEnhancedMessageInput({
  onSendMessage,
  conversationContext = '',
  businessContext = 'general',
  messageHistory = [],
  placeholder = 'Type your message...',
  disabled = false,
  value = '',
  onMessageChange
}: AIEnhancedMessageInputProps) {
  const [message, setMessage] = useState(value)
  const [isTyping, setIsTyping] = useState(false)
  const [aiCompletions, setAiCompletions] = useState<AICompletion | null>(null)
  const [typingAssistant, setTypingAssistant] = useState<AITypingAssistant | null>(null)
  const [showAI, setShowAI] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null)
  const [tone, setTone] = useState<'professional' | 'friendly' | 'formal' | 'casual'>('professional')
  
  const { toast } = useToast()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sync external value changes
  useEffect(() => {
    if (value !== message) {
      setMessage(value)
    }
  }, [value])

  // Notify parent of message changes
  useEffect(() => {
    if (onMessageChange) {
      onMessageChange(message)
    }
  }, [message, onMessageChange])

  // Debounced typing detection for real-time AI assistance
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (message.length > 3) {
      setIsTyping(true)
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        getTypingAssistant()
      }, 1000)
    } else {
      setIsTyping(false)
      setTypingAssistant(null)
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [message])

  // Get real-time typing assistance
  const getTypingAssistant = async () => {
    try {
      const response = await fetch('/api/ai-messaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_typing_assistant',
          partialText: message,
          context: businessContext
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTypingAssistant(data.data)
        }
      }
    } catch (error) {
      console.error('Error getting typing assistant:', error)
    }
  }

  // Generate AI completions
  const generateAICompletions = async () => {
    if (!message.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai-messaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_completions',
          conversationContext,
          userInput: message,
          messageHistory,
          businessContext,
          tone,
          language: 'en'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAiCompletions(data.data)
          setShowAI(true)
          toast({
            title: "AI Suggestions Generated",
            description: `Generated ${data.data.suggestions.length} suggestions for your message`,
            variant: "default"
          })
        }
      }
    } catch (error) {
      console.error('Error generating AI completions:', error)
      toast({
        title: "AI Generation Failed",
        description: "Failed to generate AI suggestions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle message send
  const handleSendMessage = () => {
    if (!message.trim() || disabled) return

    const finalMessage = selectedSuggestion || message
    onSendMessage(finalMessage)
    setMessage('')
    setSelectedSuggestion(null)
    setAiCompletions(null)
    setShowAI(false)
    setTypingAssistant(null)
  }

  // Use AI suggestion
  const useSuggestion = (suggestion: string) => {
    setSelectedSuggestion(suggestion)
    setMessage(suggestion)
    setShowAI(false)
  }

  // Use smart reply
  const useSmartReply = () => {
    if (aiCompletions) {
      setSelectedSuggestion(aiCompletions.smartReply)
      setMessage(aiCompletions.smartReply)
      setShowAI(false)
    }
  }

  // Get sentiment color
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800'
      case 'negative': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">


      {/* AI Insights Panel */}
      {showAI && aiCompletions && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-blue-900 flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                AI Insights
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAI(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tone Analysis */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-blue-800">Tone Analysis</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getSentimentColor(aiCompletions.toneAnalysis.detected)}>
                    {aiCompletions.toneAnalysis.detected}
                  </Badge>
                  <span className="text-xs text-blue-600">
                    {Math.round(aiCompletions.toneAnalysis.confidence * 100)}% confidence
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  Suggested: {aiCompletions.toneAnalysis.suggested}
                </p>
              </div>

              {/* Business Insights */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-blue-800">Business Insights</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getSentimentColor(aiCompletions.businessInsights.sentiment)}>
                    {aiCompletions.businessInsights.sentiment}
                  </Badge>
                  <Badge variant="outline" className={getUrgencyColor(aiCompletions.businessInsights.urgency)}>
                    {aiCompletions.businessInsights.urgency} urgency
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {aiCompletions.businessInsights.keywords.slice(0, 3).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Smart Reply */}
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-medium text-sm text-blue-800 mb-2">Smart Reply</h4>
              <p className="text-sm text-gray-700 mb-2">{aiCompletions.smartReply}</p>
              <Button
                size="sm"
                onClick={useSmartReply}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Use Smart Reply
              </Button>
            </div>

            {/* Suggestions */}
            <div className="mt-4">
              <h4 className="font-medium text-sm text-blue-800 mb-2">Alternative Suggestions</h4>
              <div className="space-y-2">
                {aiCompletions.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 bg-white rounded border cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => useSuggestion(suggestion)}
                  >
                    <p className="text-sm text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Grammar Check */}
            {aiCompletions.grammarCheck.suggestions.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded border">
                <h4 className="font-medium text-sm text-yellow-800 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Grammar Suggestions
                </h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {aiCompletions.grammarCheck.suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Real-time Typing Assistant */}
      {typingAssistant && message.length > 3 && (
        <Card className="border border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-green-800 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Typing Assistant
              </h4>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">AI is typing...</span>
              </div>
            </div>

            {/* Real-time Suggestions */}
            {typingAssistant.realTimeSuggestions.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-green-700 mb-1">Quick suggestions:</p>
                <div className="flex flex-wrap gap-1">
                  {typingAssistant.realTimeSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => setMessage(suggestion)}
                      className="text-xs h-6 px-2 text-green-700 hover:text-green-800 hover:bg-green-100"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Auto-complete */}
            {typingAssistant.autoComplete && (
              <div className="mb-2">
                <p className="text-xs text-green-700 mb-1">Auto-complete:</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(typingAssistant.autoComplete)}
                  className="text-xs h-6 px-2 text-green-600 border-green-300 hover:bg-green-100"
                >
                  {typingAssistant.autoComplete}
                </Button>
              </div>
            )}

            {/* Smart Formatting */}
            <div className="flex items-center space-x-2">
              {typingAssistant.smartFormatting.emojis.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-green-700">Emojis:</span>
                  {typingAssistant.smartFormatting.emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(message + emoji)}
                      className="text-lg hover:scale-110 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message Input */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[80px] resize-none pr-20"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          
          {/* Character count and AI indicator */}
          <div className="absolute bottom-2 right-2 flex items-center space-x-2">
            {isTyping && (
              <div className="flex items-center space-x-1 text-xs text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>AI</span>
              </div>
            )}
            <span className="text-xs text-gray-400">
              {message.length}/500
            </span>
          </div>
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled}
          className="px-6 h-[80px] bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Selected Suggestion Indicator */}
      {selectedSuggestion && (
        <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded border">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-800">
            Using AI suggestion: "{selectedSuggestion.substring(0, 50)}..."
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSuggestion(null)}
            className="text-blue-600 hover:text-blue-800"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  )
}
