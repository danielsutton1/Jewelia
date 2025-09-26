"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bell,
  MessageSquare,
  AtSign,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Settings,
  Volume2,
  VolumeX
} from "lucide-react"
import { format, parseISO, isToday, isYesterday } from "date-fns"
import { cn } from "@/lib/utils"

interface Employee {
  id: string
  name: string
  avatar?: string
  role: string
  department: string
}

interface Notification {
  id: string
  type: "message" | "mention" | "stage_change" | "task_assigned" | "file_shared" | "meeting_scheduled"
  title: string
  message: string
  sender?: Employee
  orderNumber?: string
  stageName?: string
  timestamp: string
  isRead: boolean
  isUrgent: boolean
  actionUrl?: string
}

interface NotificationCenterProps {
  notifications: Notification[]
  onNotificationClick: (notification: Notification) => void
  onMarkAllRead: () => void
  onClearAll: () => void
  className?: string
}

export function NotificationCenter({ 
  notifications, 
  onNotificationClick, 
  onMarkAllRead, 
  onClearAll,
  className 
}: NotificationCenterProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length
  const urgentCount = notifications.filter(n => n.isUrgent && !n.isRead).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "mention":
        return <AtSign className="h-4 w-4 text-orange-500" />
      case "stage_change":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "task_assigned":
        return <AlertCircle className="h-4 w-4 text-purple-500" />
      case "file_shared":
        return <MessageSquare className="h-4 w-4 text-indigo-500" />
      case "meeting_scheduled":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string, isUrgent: boolean) => {
    if (isUrgent) return "border-l-red-500 bg-red-50"
    
    switch (type) {
      case "mention":
        return "border-l-orange-500 bg-orange-50"
      case "stage_change":
        return "border-l-green-500 bg-green-50"
      case "task_assigned":
        return "border-l-purple-500 bg-purple-50"
      default:
        return "border-l-blue-500 bg-blue-50"
    }
  }

  const formatNotificationTime = (timestamp: string) => {
    const date = parseISO(timestamp)
    if (isToday(date)) {
      return format(date, "h:mm a")
    } else if (isYesterday(date)) {
      return "Yesterday"
    } else {
      return format(date, "MMM d")
    }
  }

  const sortedNotifications = notifications.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <Card className={cn("w-80", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle className="text-lg">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="h-8 w-8 p-0"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onMarkAllRead}>
              Mark all read
            </Button>
            <Button variant="outline" size="sm" onClick={onClearAll}>
              Clear all
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-1 p-2">
            {sortedNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              sortedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 rounded-lg border-l-4 cursor-pointer transition-colors hover:bg-gray-50",
                    getNotificationColor(notification.type, notification.isUrgent),
                    !notification.isRead && "ring-2 ring-blue-200"
                  )}
                  onClick={() => onNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {notification.isUrgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatNotificationTime(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      {notification.sender && (
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={notification.sender.avatar} />
                            <AvatarFallback className="text-xs">
                              {notification.sender.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-600">{notification.sender.name}</span>
                        </div>
                      )}
                      
                      {(notification.orderNumber || notification.stageName) && (
                        <div className="flex items-center gap-2 mt-1">
                          {notification.orderNumber && (
                            <Badge variant="outline" className="text-xs">
                              {notification.orderNumber}
                            </Badge>
                          )}
                          {notification.stageName && (
                            <Badge variant="outline" className="text-xs">
                              {notification.stageName}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 