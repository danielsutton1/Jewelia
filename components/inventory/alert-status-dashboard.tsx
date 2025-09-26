"use client"

import { useState } from "react"
import {
  PackageOpen,
  Clock,
  DollarSign,
  FileCheck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample data for alerts
const alertSummary = {
  total: 42,
  critical: 8,
  warning: 24,
  info: 10,
  categories: {
    "Low Stock": 15,
    Overstock: 7,
    "Aging Inventory": 12,
    "Price Changes": 5,
    "Certification Expiration": 3,
  },
}

const recentAlerts = [
  {
    id: 1,
    type: "Low Stock",
    item: "Diamond Stud Earrings",
    message: "Only 2 items remaining (below threshold of 5)",
    severity: "critical",
    timestamp: "2 hours ago",
    category: "Earrings",
    icon: PackageOpen,
  },
  {
    id: 2,
    type: "Overstock",
    item: "Silver Chain Necklaces",
    message: "32 items in stock (above threshold of 25)",
    severity: "warning",
    timestamp: "5 hours ago",
    category: "Necklaces",
    icon: PackageOpen,
  },
  {
    id: 3,
    type: "Aging Inventory",
    item: "Ruby Tennis Bracelet",
    message: "In stock for 120 days (threshold: 90 days)",
    severity: "warning",
    timestamp: "1 day ago",
    category: "Bracelets",
    icon: Clock,
  },
  {
    id: 4,
    type: "Price Change",
    item: "Platinum Wedding Bands",
    message: "Market price increased by 12% since last update",
    severity: "info",
    timestamp: "2 days ago",
    category: "Rings",
    icon: DollarSign,
  },
  {
    id: 5,
    type: "Certification Expiration",
    item: "2ct Diamond Solitaire Ring",
    message: "GIA certification expires in 30 days",
    severity: "warning",
    timestamp: "3 days ago",
    category: "Rings",
    icon: FileCheck,
  },
]

export function AlertStatusDashboard() {
  const [alertFilter, setAlertFilter] = useState("all")

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-5 w-5 text-destructive" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "info":
        return <Bell className="h-5 w-5 text-blue-500" />
      default:
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }
  }

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 border-destructive/20 text-destructive"
      case "warning":
        return "bg-amber-500/10 border-amber-500/20 text-amber-500"
      case "info":
        return "bg-blue-500/10 border-blue-500/20 text-blue-500"
      default:
        return "bg-green-500/10 border-green-500/20 text-green-500"
    }
  }

  const filteredAlerts =
    alertFilter === "all" ? recentAlerts : recentAlerts.filter((alert) => alert.type === alertFilter)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{alertSummary.total}</div>
            <Progress value={100} className="h-2 mt-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <div>{alertSummary.critical} Critical</div>
              <div>{alertSummary.warning} Warning</div>
              <div>{alertSummary.info} Info</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{alertSummary.categories["Low Stock"]}</div>
            <Progress value={(alertSummary.categories["Low Stock"] / alertSummary.total) * 100} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((alertSummary.categories["Low Stock"] / alertSummary.total) * 100)}% of all alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aging Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{alertSummary.categories["Aging Inventory"]}</div>
            <Progress
              value={(alertSummary.categories["Aging Inventory"] / alertSummary.total) * 100}
              className="h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((alertSummary.categories["Aging Inventory"] / alertSummary.total) * 100)}% of all alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Certification Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{alertSummary.categories["Certification Expiration"]}</div>
            <Progress
              value={(alertSummary.categories["Certification Expiration"] / alertSummary.total) * 100}
              className="h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((alertSummary.categories["Certification Expiration"] / alertSummary.total) * 100)}% of all
              alerts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Alerts</h2>
        <div className="flex items-center gap-2">
          <Select value={alertFilter} onValueChange={setAlertFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Alert Types</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Overstock">Overstock</SelectItem>
              <SelectItem value="Aging Inventory">Aging Inventory</SelectItem>
              <SelectItem value="Price Change">Price Changes</SelectItem>
              <SelectItem value="Certification Expiration">Certification Expiration</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-4 rounded-lg border p-4 ${getSeverityClass(alert.severity)}`}
          >
            <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="font-medium">{alert.item}</div>
                <Badge variant="outline">{alert.category}</Badge>
              </div>
              <p className="text-sm">{alert.message}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  <alert.icon className="mr-1 h-3 w-3" />
                  {alert.type}
                </Badge>
                <span>{alert.timestamp}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Resolve
              </Button>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="outline">Load More Alerts</Button>
      </div>
    </div>
  )
}
