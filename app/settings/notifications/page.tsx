import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationTypes } from "@/components/notifications/notification-types"
import { DeliveryChannels } from "@/components/notifications/delivery-channels"
import { NotificationConfig } from "@/components/notifications/notification-config"
import { TemplateEditor } from "@/components/notifications/template-editor"

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Notification Preferences</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage how and when you receive notifications</p>
      </div>

      <Tabs defaultValue="types" className="w-full">
        <TabsList className="mb-4 sm:mb-6 grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 overflow-x-auto">
          <TabsTrigger value="types" className="text-xs sm:text-sm min-h-[44px]">Notification Types</TabsTrigger>
          <TabsTrigger value="channels" className="text-xs sm:text-sm min-h-[44px]">Delivery Channels</TabsTrigger>
          <TabsTrigger value="config" className="text-xs sm:text-sm min-h-[44px]">Configuration</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs sm:text-sm min-h-[44px]">Notification Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="types">
          <NotificationTypes />
        </TabsContent>

        <TabsContent value="channels">
          <DeliveryChannels />
        </TabsContent>

        <TabsContent value="config">
          <NotificationConfig />
        </TabsContent>

        <TabsContent value="templates">
          <TemplateEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
