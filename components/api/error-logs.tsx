import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight } from "lucide-react"

// Mock data for error logs
const errorLogs = [
  {
    id: 1,
    endpoint: "/api/products",
    status: 429,
    message: "Rate limit exceeded",
    timestamp: "2023-05-15T14:30:00Z",
    severity: "warning",
  },
  {
    id: 2,
    endpoint: "/api/orders",
    status: 500,
    message: "Internal server error",
    timestamp: "2023-05-15T13:45:00Z",
    severity: "critical",
  },
  {
    id: 3,
    endpoint: "/api/customers",
    status: 403,
    message: "Unauthorized access",
    timestamp: "2023-05-15T12:15:00Z",
    severity: "warning",
  },
  {
    id: 4,
    endpoint: "/api/inventory",
    status: 404,
    message: "Resource not found",
    timestamp: "2023-05-15T10:20:00Z",
    severity: "low",
  },
]

export function ErrorLogs() {
  // Function to format timestamp to relative time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)

    if (diffMins < 60) {
      return `${diffMins} min ago`
    } else {
      const diffHours = Math.floor(diffMins / 60)
      return `${diffHours} hr ago`
    }
  }

  // Function to get badge variant based on severity
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "warning":
        return "warning"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Error Logs</CardTitle>
          <CardDescription>Recent API errors and issues</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          View All <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {errorLogs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3">
              <AlertCircle
                className={`h-5 w-5 ${log.severity === "critical" ? "text-destructive" : "text-muted-foreground"}`}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{log.endpoint}</p>
                  <Badge variant={getSeverityVariant(log.severity)}>{log.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{log.message}</p>
                <p className="text-xs text-muted-foreground">{formatTime(log.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
