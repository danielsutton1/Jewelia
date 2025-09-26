import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Mock data for rate limits
const rateLimits = [
  {
    endpoint: "Product API",
    limit: 10000,
    used: 6540,
    resetTime: "2h 15m",
  },
  {
    endpoint: "Order API",
    limit: 5000,
    used: 4200,
    resetTime: "1h 30m",
  },
  {
    endpoint: "Customer API",
    limit: 3000,
    used: 900,
    resetTime: "45m",
  },
  {
    endpoint: "Inventory API",
    limit: 8000,
    used: 7600,
    resetTime: "3h",
  },
]

export function RateLimits() {
  // Function to calculate usage percentage
  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100)
  }

  // Function to determine progress color based on usage
  const getProgressColor = (percentage: number) => {
    if (percentage > 90) return "bg-destructive"
    if (percentage > 75) return "bg-warning"
    return "bg-primary"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Limits</CardTitle>
        <CardDescription>Current API usage limits and status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {rateLimits.map((item, index) => {
            const percentage = getUsagePercentage(item.used, item.limit)
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.endpoint}</span>
                  <span className="text-muted-foreground">Resets in {item.resetTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={percentage} className="h-2" indicatorClassName={getProgressColor(percentage)} />
                  <span className="text-xs font-medium w-12 text-right">{percentage}%</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.used.toLocaleString()} / {item.limit.toLocaleString()} calls
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
