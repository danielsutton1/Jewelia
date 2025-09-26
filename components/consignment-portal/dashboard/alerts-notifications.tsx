"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock, CheckCircle2, Info } from "lucide-react"

export function AlertsNotifications() {
  // This would be fetched from your API in a real application
  const alerts = [
    {
      id: 1,
      type: "expiring",
      title: "Items Expiring Soon",
      description: "3 items are approaching the end of their consignment period",
      icon: Clock,
      variant: "default",
    },
    {
      id: 2,
      type: "price_suggestion",
      title: "Price Adjustment Suggested",
      description: "Consider lowering the price of 'Vintage Gold Watch' to improve sales chances",
      icon: Info,
      variant: "default",
    },
    {
      id: 3,
      type: "settlement",
      title: "Settlement Processed",
      description: "Your settlement for April has been processed and will be paid on May 15",
      icon: CheckCircle2,
      variant: "default",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts & Notifications</CardTitle>
        <CardDescription>Important updates about your consignment items</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <Alert key={alert.id} variant={alert.variant as "default" | "destructive"}>
            <alert.icon className="h-4 w-4" />
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        ))}
        {alerts.length === 0 && (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            No alerts at this time
          </div>
        )}
      </CardContent>
    </Card>
  )
}
