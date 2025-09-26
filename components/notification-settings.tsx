"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface NotificationPreferences {
  email_notifications: boolean
  in_app_notifications: boolean
  sound_enabled: boolean
  notification_types: {
    meeting: boolean
    calendar: boolean
    system: boolean
    reminder: boolean
  }
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setPreferences(data)
      } else {
        // Create default preferences if none exist
        const defaultPreferences = {
          user_id: user.id,
          email_notifications: true,
          in_app_notifications: true,
          sound_enabled: true,
          notification_types: {
            meeting: true,
            calendar: true,
            system: true,
            reminder: true
          }
        }

        const { error: insertError } = await supabase
          .from('notification_preferences')
          .insert(defaultPreferences)

        if (insertError) throw insertError
        setPreferences(defaultPreferences)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
      toast.error('Failed to load notification preferences')
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({ [key]: value })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

      if (error) throw error

      setPreferences(prev => prev ? { ...prev, [key]: value } : null)
      toast.success('Preferences updated')
    } catch (error) {
      console.error('Error updating preference:', error)
      toast.error('Failed to update preferences')
    }
  }

  const updateNotificationType = async (type: keyof NotificationPreferences['notification_types'], value: boolean) => {
    if (!preferences) return

    try {
      const updatedTypes = {
        ...preferences.notification_types,
        [type]: value
      }

      const { error } = await supabase
        .from('notification_preferences')
        .update({ notification_types: updatedTypes })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

      if (error) throw error

      setPreferences(prev => prev ? {
        ...prev,
        notification_types: updatedTypes
      } : null)
      toast.success('Notification type updated')
    } catch (error) {
      console.error('Error updating notification type:', error)
      toast.error('Failed to update notification type')
    }
  }

  if (loading) {
    return <div>Loading preferences...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Manage how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch
                id="email-notifications"
                checked={preferences?.email_notifications}
                onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="in-app-notifications">In-App Notifications</Label>
              <Switch
                id="in-app-notifications"
                checked={preferences?.in_app_notifications}
                onCheckedChange={(checked) => updatePreference('in_app_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-enabled">Notification Sound</Label>
              <Switch
                id="sound-enabled"
                checked={preferences?.sound_enabled}
                onCheckedChange={(checked) => updatePreference('sound_enabled', checked)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Types</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="meeting-notifications">Meeting Notifications</Label>
                <Switch
                  id="meeting-notifications"
                  checked={preferences?.notification_types.meeting}
                  onCheckedChange={(checked) => updateNotificationType('meeting', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="calendar-notifications">Calendar Notifications</Label>
                <Switch
                  id="calendar-notifications"
                  checked={preferences?.notification_types.calendar}
                  onCheckedChange={(checked) => updateNotificationType('calendar', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="system-notifications">System Notifications</Label>
                <Switch
                  id="system-notifications"
                  checked={preferences?.notification_types.system}
                  onCheckedChange={(checked) => updateNotificationType('system', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reminder-notifications">Reminder Notifications</Label>
                <Switch
                  id="reminder-notifications"
                  checked={preferences?.notification_types.reminder}
                  onCheckedChange={(checked) => updateNotificationType('reminder', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 