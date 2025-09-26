"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { mockNotificationPreferences } from "@/data/mock-communications"
import type { NotificationPreference } from "@/types/partner-communication"
import {
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckSquare,
  AlertTriangle,
  Bell,
  Smartphone,
  AtSign,
} from "lucide-react"

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>(mockNotificationPreferences)

  const handleToggle = (index: number, channel: "email" | "push" | "sms" | "inApp") => {
    const newPreferences = [...preferences]
    newPreferences[index] = {
      ...newPreferences[index],
      [channel]: !newPreferences[index][channel],
    }
    setPreferences(newPreferences)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "call":
        return <Phone className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "task":
        return <CheckSquare className="h-4 w-4" />
      case "issue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const handleSave = () => {
    // In a real app, this would save the preferences to the API
    console.log("Saving preferences:", preferences)
    alert("Preferences saved successfully!")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-4 py-2 font-medium text-sm">
          <div>Notification Type</div>
          <div className="text-center flex items-center justify-center">
            <AtSign className="h-4 w-4 mr-1" /> Email
          </div>
          <div className="text-center flex items-center justify-center">
            <Bell className="h-4 w-4 mr-1" /> In-App
          </div>
          <div className="text-center flex items-center justify-center">
            <Smartphone className="h-4 w-4 mr-1" /> Push
          </div>
          <div className="text-center flex items-center justify-center">
            <Phone className="h-4 w-4 mr-1" /> SMS
          </div>
        </div>

        <div className="space-y-2">
          {preferences.map((pref, index) => (
            <div key={pref.type} className="grid grid-cols-5 gap-4 py-3 border-t items-center">
              <div className="flex items-center space-x-2">
                {getTypeIcon(pref.type)}
                <span className="capitalize">{pref.type}</span>
              </div>

              <div className="flex justify-center">
                <Switch
                  checked={pref.email}
                  onCheckedChange={() => handleToggle(index, "email")}
                  aria-label={`Email notifications for ${pref.type}`}
                />
              </div>

              <div className="flex justify-center">
                <Switch
                  checked={pref.inApp}
                  onCheckedChange={() => handleToggle(index, "inApp")}
                  aria-label={`In-app notifications for ${pref.type}`}
                />
              </div>

              <div className="flex justify-center">
                <Switch
                  checked={pref.push}
                  onCheckedChange={() => handleToggle(index, "push")}
                  aria-label={`Push notifications for ${pref.type}`}
                />
              </div>

              <div className="flex justify-center">
                <Switch
                  checked={pref.sms}
                  onCheckedChange={() => handleToggle(index, "sms")}
                  aria-label={`SMS notifications for ${pref.type}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave}>Save Preferences</Button>
      </div>
    </div>
  )
}
