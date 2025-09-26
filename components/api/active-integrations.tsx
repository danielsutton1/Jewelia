import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Settings, ExternalLink } from "lucide-react"

// Mock data for active integrations
const integrations = [
  {
    id: 1,
    name: "Shopify",
    status: "active",
    lastSync: "10 minutes ago",
    type: "e-commerce",
  },
  {
    id: 2,
    name: "QuickBooks",
    status: "active",
    lastSync: "1 hour ago",
    type: "accounting",
  },
  {
    id: 3,
    name: "Mailchimp",
    status: "inactive",
    lastSync: "2 days ago",
    type: "marketing",
  },
  {
    id: 4,
    name: "Stripe",
    status: "active",
    lastSync: "30 minutes ago",
    type: "payment",
  },
]

export function ActiveIntegrations() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Active Integrations</CardTitle>
          <CardDescription>Manage your connected services</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          Add New
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="font-medium text-sm">{integration.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium">{integration.name}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={integration.status === "active" ? "default" : "outline"}>
                      {integration.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Last sync: {integration.lastSync}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={integration.status === "active"} />
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
