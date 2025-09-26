"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import ThreadList from "./thread-list"
import ThreadDetail from "./thread-detail"
import QuickActions from "./quick-actions"
import CommunicationHistory from "./communication-history"
import type { CommunicationThread } from "@/types/partner-communication"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import NotificationPreferences from "./notification-preferences"
import { getCommunicationThreads } from "@/lib/database"
import { useToast } from "@/components/ui/use-toast"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"

const supabase = createSupabaseBrowserClient()

export default function CommunicationCenter() {
  const [threads, setThreads] = useState<CommunicationThread[]>([])
  const [selectedThread, setSelectedThread] = useState<CommunicationThread | null>(null)
  const [activeTab, setActiveTab] = useState("inbox")
  const [showNotificationPreferences, setShowNotificationPreferences] = useState(false)
  const [loading, setLoading] = useState(true)
  const [unreadCounts, setUnreadCounts] = useState<{ [threadId: string]: number }>({})
  const { toast } = useToast()
  const selectedThreadId = selectedThread?.id
  const userRef = useRef<any>(null)

  useEffect(() => {
    loadThreads()
  }, [])

  // Subscribe to new messages for all threads
  useEffect(() => {
    const channel = supabase.channel('all-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'communication_messages',
      }, (payload: any) => {
        const msg = payload.new
        if (!msg) return
        // If the message is not for the selected thread, show a toast and update unread count
        if (msg.thread_id !== selectedThreadId) {
          toast({
            title: "New message",
            description: msg.content?.slice(0, 80) || "New message received",
          })
          setUnreadCounts((prev) => ({
            ...prev,
            [msg.thread_id]: (prev[msg.thread_id] || 0) + 1
          }))
        }
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedThreadId, toast])

  // Reset unread count for selected thread when opened
  useEffect(() => {
    if (selectedThreadId) {
      setUnreadCounts((prev) => ({ ...prev, [selectedThreadId]: 0 }))
    }
  }, [selectedThreadId])

  const loadThreads = async () => {
    try {
      setLoading(true)
      const data = await getCommunicationThreads()
      setThreads(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load communication threads",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleThreadSelect = (thread: CommunicationThread) => {
    setSelectedThread(thread)
    if (activeTab === "history") {
      setActiveTab("inbox")
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="history">Communication History</TabsTrigger>
            </TabsList>

            <Dialog open={showNotificationPreferences} onOpenChange={setShowNotificationPreferences}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Notification Preferences
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Notification Preferences</DialogTitle>
                  <DialogDescription>
                    Configure how you want to be notified about different types of communications.
                  </DialogDescription>
                </DialogHeader>
                <NotificationPreferences />
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="inbox" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <ThreadList
                    threads={threads}
                    selectedThreadId={selectedThread?.id}
                    onSelectThread={handleThreadSelect}
                    loading={loading}
                    unreadCounts={unreadCounts}
                  />
                </Card>
              </div>
              <div className="lg:col-span-2">
                <div className="flex flex-col space-y-4">
                  <Card>
                    <QuickActions onActionComplete={loadThreads} />
                  </Card>
                  <Card className="flex-grow">
                    {selectedThread ? (
                      <ThreadDetail 
                        thread={selectedThread} 
                        onThreadUpdate={loadThreads}
                      />
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <p>Select a conversation to view details</p>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CommunicationHistory 
                onSelectThread={handleThreadSelect}
                loading={loading}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
