"use client"

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
// import { createClient } from '@supabase/supabase-js'
// import { getUserNotifications, markNotificationAsRead } from '@/lib/notifications'
import { format } from 'date-fns'

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// )

interface Notification {
  id: string
  type: 'meeting' | 'brief' | 'system'
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  created_at: string
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Get initial notifications
    fetchNotifications()

    // Subscribe to new notifications
    // const channel = supabase
    //   .channel('notifications')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: 'INSERT',
    //       schema: 'public',
    //       table: 'notifications',
    //       filter: `user_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`,
    //     },
    //     () => {
    //       fetchNotifications()
    //     }
    //   )
    //   .subscribe()

    return () => {
      // supabase.removeChannel(channel)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      // const { data: { user } } = await supabase.auth.getUser()
      // if (!user) return

      // const notifications = await getUserNotifications(/* user.id */)
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        // await markNotificationAsRead(notification.id)
        setNotifications(notifications.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    }

    // Handle notification click based on type
    switch (notification.type) {
      case 'meeting':
        if (notification.data?.joinUrl) {
          window.open(notification.data.joinUrl, '_blank')
        }
        break
      case 'brief':
        // TODO: Navigate to brief view
        break
      default:
        break
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // TODO: Mark all as read
              }}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-muted/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.created_at), 'PPp')}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
} 