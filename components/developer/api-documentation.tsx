"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiSidebar } from "./api-sidebar"
import { EndpointBrowser } from "./endpoint-browser"
import { CodeExamples } from "./code-examples"
import { RateLimits } from "./rate-limits"
import { WebhookConfiguration } from "./webhook-configuration"
import { ApiKeyManagement } from "./api-key-management"
import { IntegrationMarketplace } from "./integration-marketplace"
import { CustomIntegrationBuilder } from "./custom-integration-builder"

export function ApiDocumentation() {
  const [selectedEndpoint, setSelectedEndpoint] = useState("list-inventory")

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 md:space-y-8 p-3 sm:p-4 md:p-6 lg:p-8 pt-3 sm:pt-4 md:pt-6">
      <div className="flex flex-col space-y-1 sm:space-y-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">API Documentation & Integration Center</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Integrate with Jewelia CRM's comprehensive API system and discover powerful integrations for the jewelry industry.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
        <div className="w-full lg:w-64 flex-shrink-0">
          <ApiSidebar selectedEndpoint={selectedEndpoint} onSelectEndpoint={setSelectedEndpoint} />
        </div>

        <div className="flex-1">
          <Tabs defaultValue="endpoints" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1 sm:gap-2 overflow-x-auto">
              <TabsTrigger value="endpoints" className="text-xs sm:text-sm min-h-[44px]">Endpoints</TabsTrigger>
              <TabsTrigger value="examples" className="text-xs sm:text-sm min-h-[44px]">Code Examples</TabsTrigger>
              <TabsTrigger value="rate-limits" className="text-xs sm:text-sm min-h-[44px]">Rate Limits</TabsTrigger>
              <TabsTrigger value="webhooks" className="text-xs sm:text-sm min-h-[44px]">Webhooks</TabsTrigger>
              <TabsTrigger value="api-keys" className="text-xs sm:text-sm min-h-[44px]">API Keys</TabsTrigger>
              <TabsTrigger value="marketplace" className="text-xs sm:text-sm min-h-[44px]">Marketplace</TabsTrigger>
              <TabsTrigger value="builder" className="text-xs sm:text-sm min-h-[44px]">Integration Builder</TabsTrigger>
            </TabsList>

            <TabsContent value="endpoints" className="space-y-3 sm:space-y-4">
              <EndpointBrowser selectedEndpoint={selectedEndpoint} />
            </TabsContent>

            <TabsContent value="examples" className="space-y-3 sm:space-y-4">
              <CodeExamples selectedEndpoint={selectedEndpoint} />
            </TabsContent>

            <TabsContent value="rate-limits" className="space-y-3 sm:space-y-4">
              <RateLimits />
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-3 sm:space-y-4">
              <WebhookConfiguration />
            </TabsContent>

            <TabsContent value="api-keys" className="space-y-3 sm:space-y-4">
              <ApiKeyManagement />
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-3 sm:space-y-4">
              <IntegrationMarketplace />
            </TabsContent>

            <TabsContent value="builder" className="space-y-3 sm:space-y-4">
              <CustomIntegrationBuilder />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
