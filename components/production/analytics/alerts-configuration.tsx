"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Mail, MessageSquare } from "lucide-react"

export function AlertsConfiguration() {
  const [alerts, setAlerts] = useState({
    efficiency: {
      enabled: true,
      threshold: 70,
      email: true,
      sms: false,
      notification: true,
    },
    cycleTime: {
      enabled: true,
      threshold: 6,
      email: true,
      sms: true,
      notification: true,
    },
    qualityPass: {
      enabled: true,
      threshold: 85,
      email: true,
      sms: false,
      notification: true,
    },
    onTimeDelivery: {
      enabled: true,
      threshold: 80,
      email: true,
      sms: true,
      notification: true,
    },
  })

  const handleAlertToggle = (metric: any, field: any, value: any) => {
    setAlerts({
      ...alerts,
      [metric]: {
        ...(alerts as any)[metric],
        [field]: typeof value === "undefined" ? !(alerts as any)[metric][field] : value,
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Configuration</CardTitle>
        <CardDescription>Set up alerts for key production metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="efficiency">
          <TabsList className="mb-4 grid w-full grid-cols-4">
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
            <TabsTrigger value="cycleTime">Cycle Time</TabsTrigger>
            <TabsTrigger value="qualityPass">Quality Pass</TabsTrigger>
            <TabsTrigger value="onTimeDelivery">On-Time Delivery</TabsTrigger>
          </TabsList>

          {Object.entries(alerts).map(([metric, config]) => (
            <TabsContent key={metric} value={metric} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Enable {metric.replace(/([A-Z])/g, " $1").trim()} Alerts</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts when{" "}
                    {metric
                      .replace(/([A-Z])/g, " $1")
                      .trim()
                      .toLowerCase()}{" "}
                    falls below threshold
                  </p>
                </div>
                <Switch checked={config.enabled} onCheckedChange={(checked) => handleAlertToggle(metric, "enabled", checked)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${metric}-threshold`}>Alert Threshold</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id={`${metric}-threshold`}
                    type="number"
                    value={config.threshold}
                    onChange={(e) => handleAlertToggle(metric, "threshold", Number.parseFloat(e.target.value))}
                    disabled={!config.enabled}
                    className="w-24"
                  />
                  <span>{metric === "cycleTime" ? "days" : "%"}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {metric === "cycleTime"
                    ? "Alert when cycle time exceeds this value"
                    : "Alert when value falls below this threshold"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Notification Methods</Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`${metric}-email`}
                      checked={config.email}
                      onCheckedChange={(checked) => handleAlertToggle(metric, "email", checked)}
                      disabled={!config.enabled}
                    />
                    <Label htmlFor={`${metric}-email`} className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`${metric}-sms`}
                      checked={config.sms}
                      onCheckedChange={(checked) => handleAlertToggle(metric, "sms", checked)}
                      disabled={!config.enabled}
                    />
                    <Label htmlFor={`${metric}-sms`} className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>SMS</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`${metric}-notification`}
                      checked={config.notification}
                      onCheckedChange={(checked) => handleAlertToggle(metric, "notification", checked)}
                      disabled={!config.enabled}
                    />
                    <Label htmlFor={`${metric}-notification`} className="flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <span>In-app Notification</span>
                    </Label>
                  </div>
                </div>
              </div>

              <Button className="mt-4" disabled={!config.enabled}>
                Save Configuration
              </Button>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
