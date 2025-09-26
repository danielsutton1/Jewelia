"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertStatusDashboard } from "./alert-status-dashboard"
import { AlertTypesConfig } from "./alert-types-config"
import { CategorySettings } from "./category-settings"
import { NotificationPreferences } from "./notification-preferences"

export function StockAlertDashboard() {
  const [activeTab, setActiveTab] = useState("status")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-8">
        <TabsTrigger value="status">Alert Dashboard</TabsTrigger>
        <TabsTrigger value="types">Alert Types</TabsTrigger>
        <TabsTrigger value="categories">Category Settings</TabsTrigger>
        <TabsTrigger value="notifications">Notification Preferences</TabsTrigger>
      </TabsList>

      <TabsContent value="status" className="space-y-6">
        <AlertStatusDashboard />
      </TabsContent>

      <TabsContent value="types" className="space-y-6">
        <AlertTypesConfig />
      </TabsContent>

      <TabsContent value="categories" className="space-y-6">
        <CategorySettings />
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <NotificationPreferences />
      </TabsContent>
    </Tabs>
  )
}
