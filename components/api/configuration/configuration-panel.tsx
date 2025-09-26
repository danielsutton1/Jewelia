import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { EndpointSetup } from "./endpoint-setup"
import { AuthenticationConfig } from "./authentication-config"
import { WebhookManagement } from "./webhook-management"
import { DataMapping } from "./data-mapping"

export function ConfigurationPanel() {
  return (
    <Card className="p-6">
      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="data-mapping">Data Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="pt-6">
          <EndpointSetup />
        </TabsContent>

        <TabsContent value="authentication" className="pt-6">
          <AuthenticationConfig />
        </TabsContent>

        <TabsContent value="webhooks" className="pt-6">
          <WebhookManagement />
        </TabsContent>

        <TabsContent value="data-mapping" className="pt-6">
          <DataMapping />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
