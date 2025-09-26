"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { 
  BarChart3, 
  MessageSquare, 
  Clock, 
  User, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Award,
  AlertTriangle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { type ProductionConversationLog, type StageConversation, PRODUCTION_STAGES } from "@/types/production"

interface ConversationAnalyticsProps {
  orderId: string
  className?: string
}

interface AnalyticsData {
  totalMessages: number
  totalStages: number
  averageMessagesPerStage: number
  averageResponseTime: number
  mostActiveStage: string
  mostActiveAssignee: string
  qualityScores: { stage: string; score: number }[]
  timeSpent: { stage: string; time: number }[]
  messageTrends: { date: string; count: number }[]
  unreadMessages: number
  attachmentsCount: number
}

export function ConversationAnalytics({ orderId, className }: ConversationAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [orderId])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}/conversations`)
      if (!response.ok) throw new Error('Failed to fetch conversation data')
      
      const conversationLog: ProductionConversationLog = await response.json()
      const analyticsData = calculateAnalytics(conversationLog)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (log: ProductionConversationLog): AnalyticsData => {
    const allMessages = log.conversations.flatMap(stage => stage.messages)
    const totalMessages = allMessages.length
    const totalStages = log.conversations.length
    
    // Calculate average messages per stage
    const averageMessagesPerStage = totalStages > 0 ? totalMessages / totalStages : 0
    
    // Calculate average response time (simplified - in real app, you'd track actual response times)
    const averageResponseTime = 2.5 // Mock data - hours
    
    // Find most active stage
    const stageMessageCounts = log.conversations.map(stage => ({
      stage: stage.stage,
      count: stage.messages.length
    }))
    const mostActiveStage = stageMessageCounts.reduce((a, b) => a.count > b.count ? a : b).stage
    
    // Find most active assignee
    const assigneeMessageCounts = log.conversations.map(stage => ({
      assignee: stage.assigneeName,
      count: stage.messages.length
    }))
    const mostActiveAssignee = assigneeMessageCounts.reduce((a, b) => a.count > b.count ? a : b).assignee
    
    // Quality scores
    const qualityScores = log.conversations
      .filter(stage => stage.qualityScore !== undefined)
      .map(stage => ({
        stage: stage.stage,
        score: stage.qualityScore!
      }))
    
    // Time spent
    const timeSpent = log.conversations
      .filter(stage => stage.timeSpent !== undefined)
      .map(stage => ({
        stage: stage.stage,
        time: stage.timeSpent!
      }))
    
    // Message trends (last 7 days)
    const messageTrends = generateMessageTrends(allMessages)
    
    // Unread messages
    const unreadMessages = allMessages.filter(msg => !msg.isRead).length
    
    // Attachments count
    const attachmentsCount = allMessages.reduce((count, msg) => 
      count + (msg.attachments?.length || 0), 0
    )
    
    return {
      totalMessages,
      totalStages,
      averageMessagesPerStage,
      averageResponseTime,
      mostActiveStage,
      mostActiveAssignee,
      qualityScores,
      timeSpent,
      messageTrends,
      unreadMessages,
      attachmentsCount
    }
  }

  const generateMessageTrends = (messages: any[]) => {
    const trends = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = format(date, 'MMM d')
      
      const count = messages.filter(msg => {
        const msgDate = new Date(msg.timestamp)
        return format(msgDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      }).length
      
      trends.push({ date: dateStr, count })
    }
    
    return trends
  }

  const getStageConfig = (stage: string) => {
    return PRODUCTION_STAGES[stage as keyof typeof PRODUCTION_STAGES]
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No analytics data available.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle className="text-lg">Conversation Analytics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Key Metrics */}
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{analytics.totalMessages}</div>
              <div className="text-sm text-muted-foreground">Total Messages</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.totalStages}</div>
              <div className="text-sm text-muted-foreground">Production Stages</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.unreadMessages}</div>
              <div className="text-sm text-muted-foreground">Unread Messages</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics.attachmentsCount}</div>
              <div className="text-sm text-muted-foreground">Attachments</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Avg Messages per Stage</span>
                    <span className="font-medium">{analytics.averageMessagesPerStage.toFixed(1)}</span>
                  </div>
                  <Progress value={(analytics.averageMessagesPerStage / 10) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Avg Response Time</span>
                    <span className="font-medium">{analytics.averageResponseTime}h</span>
                  </div>
                  <Progress value={(analytics.averageResponseTime / 8) * 100} className="h-2" />
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span>Most Active Stage</span>
                    <Badge variant="outline">
                      {getStageConfig(analytics.mostActiveStage)?.label || analytics.mostActiveStage}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Most Active Assignee</span>
                  <span className="font-medium">{analytics.mostActiveAssignee}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quality Scores */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Quality Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.qualityScores.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.qualityScores.map((item) => {
                      const stageConfig = getStageConfig(item.stage)
                      const isGood = item.score >= 90
                      const isWarning = item.score >= 75 && item.score < 90
                      
                      return (
                        <div key={item.stage} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: stageConfig?.color || '#666' }}
                            />
                            <span className="text-sm">{stageConfig?.label || item.stage}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{item.score}%</span>
                            {isGood && <Award className="h-4 w-4 text-green-500" />}
                            {isWarning && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No quality scores available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time Spent */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Spent by Stage
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.timeSpent.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.timeSpent.map((item) => {
                      const stageConfig = getStageConfig(item.stage)
                      const totalTime = analytics.timeSpent.reduce((sum, t) => sum + t.time, 0)
                      const percentage = totalTime > 0 ? (item.time / totalTime) * 100 : 0
                      
                      return (
                        <div key={item.stage}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: stageConfig?.color || '#666' }}
                              />
                              <span>{stageConfig?.label || item.stage}</span>
                            </div>
                            <span className="font-medium">{formatDuration(item.time)}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No time data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Message Trends */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Message Trends (7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.messageTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{trend.date}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${Math.min((trend.count / 10) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="font-medium w-8 text-right">{trend.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
 