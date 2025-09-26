import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react"

// Mock data for API services status
const servicesStatus = [
  {
    name: "Product API",
    status: "operational",
    uptime: 99.98,
    responseTime: 120,
    lastChecked: "30 seconds ago",
  },
  {
    name: "Order API",
    status: "operational",
    uptime: 99.95,
    responseTime: 145,
    lastChecked: "45 seconds ago",
  },
  {
    name: "Customer API",
    status: "degraded",
    uptime: 98.75,
    responseTime: 320,
    lastChecked: "1 minute ago",
  },
  {
    name: "Inventory API",
    status: "operational",
    uptime: 99.99,
    responseTime: 110,
    lastChecked: "25 seconds ago",
  },
  {
    name: "Authentication Service",
    status: "operational",
    uptime: 100,
    responseTime: 95,
    lastChecked: "40 seconds ago",
  },
  {
    name: "Webhook Delivery",
    status: "incident",
    uptime: 95.5,
    responseTime: 450,
    lastChecked: "2 minutes ago",
  },
]

export function RealTimeStatus() {
  // Function to render status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "incident":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  // Function to get badge variant based on status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "operational":
        return "success"
      case "degraded":
        return "warning"
      case "incident":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Function to get response time color
  const getResponseTimeColor = (time: number) => {
    if (time < 150) return "text-green-500"
    if (time < 300) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">API Services Status</h3>
        <p className="text-sm text-muted-foreground">Real-time status of all API services and endpoints</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {servicesStatus.map((service, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{service.name}</CardTitle>
                <Badge variant={getStatusVariant(service.status) as any}>{service.status}</Badge>
              </div>
              <CardDescription>Last checked: {service.lastChecked}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="font-medium">{service.uptime}%</span>
                </div>
                <Progress value={service.uptime} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Response Time</span>
                  <span className={`font-medium ${getResponseTimeColor(service.responseTime)}`}>
                    {service.responseTime} ms
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Overall API system health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold">All Systems Operational</p>
              <p className="text-sm text-muted-foreground">5 operational, 1 degraded, 0 outages</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
