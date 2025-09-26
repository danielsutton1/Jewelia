"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
  AlertTriangle,
  Users,
  FileText,
  Calendar,
  CheckCircle,
  Play,
  Pause
} from "lucide-react"
import { format, parseISO, differenceInHours, differenceInMinutes } from "date-fns"

interface Employee {
  id: string
  name: string
  avatar?: string
  role: string
  department: string
}

interface Message {
  id: string
  content: string
  sender: Employee
  timestamp: string
  attachments?: Array<{
    id: string
    name: string
    type: string
    size: number
    url: string
  }>
  isRead: boolean
  isPinned: boolean
}

interface Stage {
  id: string
  name: string
  status: "pending" | "active" | "completed" | "paused"
  assignee?: Employee
  startDate?: string
  endDate?: string
  messages: Message[]
  unreadCount: number
  isActive: boolean
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  productName: string
  status: string
  priority: "low" | "medium" | "high" | "urgent"
  stages: Stage[]
  totalMessages: number
  lastActivity: string
}

interface ConversationAnalyticsProps {
  order: Order
  className?: string
}

interface AnalyticsData {
  totalMessages: number
  totalStages: number
  averageMessagesPerStage: number
  averageResponseTime: number
  mostActiveStage: string
  mostActiveEmployee: string
  stageCompletionRates: Array<{
    stage: string
    completionRate: number
    messageCount: number
  }>
  employeeActivity: Array<{
    employee: Employee
    messageCount: number
    responseTime: number
  }>
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
    employee: Employee
  }>
  unreadMessages: number
  pinnedMessages: number
  attachmentsCount: number
}

export function ConversationAnalytics({ order, className }: ConversationAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calculateAnalytics = () => {
      const allMessages = order.stages.flatMap(stage => stage.messages)
      const totalMessages = allMessages.length
      const totalStages = order.stages.length
      
      // Calculate average messages per stage
      const averageMessagesPerStage = totalStages > 0 ? totalMessages / totalStages : 0
      
      // Calculate average response time (simplified)
      const averageResponseTime = 2.5 // Mock data - hours
      
      // Find most active stage
      const stageMessageCounts = order.stages.map(stage => ({
        stage: stage.name,
        count: stage.messages.length
      }))
      const mostActiveStage = stageMessageCounts.reduce((a, b) => a.count > b.count ? a : b).stage
      
      // Find most active employee
      const employeeMessageCounts = allMessages.reduce((acc, message) => {
        const employeeId = message.sender.id
        acc[employeeId] = (acc[employeeId] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const mostActiveEmployeeId = Object.entries(employeeMessageCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      const mostActiveEmployee = allMessages.find(m => m.sender.id === mostActiveEmployeeId)?.sender.name || "Unknown"
      
      // Stage completion rates
      const stageCompletionRates = order.stages.map(stage => ({
        stage: stage.name,
        completionRate: stage.status === "completed" ? 100 : stage.status === "active" ? 50 : 0,
        messageCount: stage.messages.length
      }))
      
      // Employee activity
      const employeeActivity = Object.entries(employeeMessageCounts).map(([employeeId, messageCount]) => {
        const employee = allMessages.find(m => m.sender.id === employeeId)?.sender
        return {
          employee: employee!,
          messageCount,
          responseTime: Math.random() * 5 + 1 // Mock response time
        }
      }).sort((a, b) => b.messageCount - a.messageCount)
      
      // Recent activity
      const recentActivity = allMessages.slice(-5).map(message => ({
        type: "message",
        description: `Sent a message in ${order.stages.find(s => s.messages.includes(message))?.name} stage`,
        timestamp: message.timestamp,
        employee: message.sender
      }))
      
      // Counts
      const unreadMessages = allMessages.filter(msg => !msg.isRead).length
      const pinnedMessages = allMessages.filter(msg => msg.isPinned).length
      const attachmentsCount = allMessages.reduce((count, msg) => 
        count + (msg.attachments?.length || 0), 0
      )
      
      return {
        totalMessages,
        totalStages,
        averageMessagesPerStage,
        averageResponseTime,
        mostActiveStage,
        mostActiveEmployee,
        stageCompletionRates,
        employeeActivity,
        recentActivity,
        unreadMessages,
        pinnedMessages,
        attachmentsCount
      }
    }

    setLoading(true)
    const data = calculateAnalytics()
    setAnalytics(data)
    setLoading(false)
  }, [order])

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

          {/* Stage Completion */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Stage Completion</h3>
            <div className="space-y-3">
              {analytics.stageCompletionRates.map((stage) => (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{stage.stage}</span>
                    <span className="text-muted-foreground">{stage.messageCount} messages</span>
                  </div>
                  <Progress value={stage.completionRate} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Employee Activity */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Most Active Employees</h3>
            <div className="space-y-2">
              {analytics.employeeActivity.slice(0, 3).map((activity) => (
                <div key={activity.employee.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.employee.avatar} />
                      <AvatarFallback className="text-xs">
                        {activity.employee.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{activity.employee.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.messageCount} messages
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {activity.responseTime.toFixed(1)}h avg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={activity.employee.avatar} />
                    <AvatarFallback className="text-xs">
                      {activity.employee.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(activity.timestamp), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 