"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, Search } from "lucide-react"

// Mock data for error alerts
const errorAlerts = [
  {
    id: 1,
    timestamp: "2023-05-15T14:30:00Z",
    service: "Order API",
    endpoint: "/api/orders/create",
    status: 500,
    error: "Internal Server Error",
    message: "Database connection timeout",
    count: 12,
    resolved: false,
  },
  {
    id: 2,
    timestamp: "2023-05-15T13:45:00Z",
    service: "Authentication",
    endpoint: "/api/auth/token",
    status: 429,
    error: "Too Many Requests",
    message: "Rate limit exceeded",
    count: 45,
    resolved: false,
  },
  {
    id: 3,
    timestamp: "2023-05-15T12:15:00Z",
    service: "Product API",
    endpoint: "/api/products/update",
    status: 400,
    error: "Bad Request",
    message: "Invalid product data format",
    count: 8,
    resolved: true,
  },
  {
    id: 4,
    timestamp: "2023-05-15T10:20:00Z",
    service: "Webhook Delivery",
    endpoint: "/api/webhooks/deliver",
    status: 504,
    error: "Gateway Timeout",
    message: "Destination server not responding",
    count: 23,
    resolved: false,
  },
  {
    id: 5,
    timestamp: "2023-05-14T22:10:00Z",
    service: "Customer API",
    endpoint: "/api/customers/search",
    status: 503,
    error: "Service Unavailable",
    message: "Search service is down",
    count: 17,
    resolved: true,
  },
]

export function ErrorAlerts() {
  const [alerts, setAlerts] = useState(errorAlerts)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Function to format timestamp to readable format
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Function to toggle resolved status
  const toggleResolved = (id: number) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, resolved: !alert.resolved } : alert)))
  }

  // Filter alerts based on selected filter and search term
  const filteredAlerts = alerts.filter((alert) => {
    const matchesFilter =
      filter === "all" || (filter === "resolved" && alert.resolved) || (filter === "unresolved" && !alert.resolved)

    const matchesSearch =
      alert.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.error.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Error Alerts</h3>
        <p className="text-sm text-muted-foreground">Monitor and manage API error alerts</p>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Alerts</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="unresolved">Unresolved</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search alerts..."
              className="pl-8 md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <div className="mr-1 h-2 w-2 rounded-full bg-red-500"></div>
            <span>{alerts.filter((a) => !a.resolved).length} Unresolved</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1 h-2 w-2 rounded-full bg-green-500"></div>
            <span>{alerts.filter((a) => a.resolved).length} Resolved</span>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="whitespace-nowrap">{formatTime(alert.timestamp)}</TableCell>
                  <TableCell>{alert.service}</TableCell>
                  <TableCell className="font-mono text-xs">{alert.endpoint}</TableCell>
                  <TableCell>
                    <Badge variant={alert.status >= 500 ? "destructive" : "warning"}>{alert.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={`${alert.error}: ${alert.message}`}>
                      {alert.error}: {alert.message}
                    </div>
                  </TableCell>
                  <TableCell>{alert.count}</TableCell>
                  <TableCell>
                    {alert.resolved ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="mr-1 h-3 w-3" /> Resolved
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        <AlertCircle className="mr-1 h-3 w-3" /> Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => toggleResolved(alert.id)}>
                      {alert.resolved ? "Reopen" : "Resolve"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAlerts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-muted-foreground" />
                      <p className="mt-2">No matching alerts found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
