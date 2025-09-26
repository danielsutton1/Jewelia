"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Trash2, RefreshCw } from "lucide-react"

// Mock data for webhooks
const initialWebhooks = [
  {
    id: 1,
    name: "New Order",
    url: "https://your-app.com/webhooks/orders",
    events: ["order.created"],
    active: true,
    lastTriggered: "2023-05-15T14:30:00Z",
  },
  {
    id: 2,
    name: "Inventory Update",
    url: "https://your-app.com/webhooks/inventory",
    events: ["inventory.updated", "product.created"],
    active: true,
    lastTriggered: "2023-05-14T10:15:00Z",
  },
  {
    id: 3,
    name: "Customer Events",
    url: "https://your-app.com/webhooks/customers",
    events: ["customer.created", "customer.updated"],
    active: false,
    lastTriggered: "2023-05-10T09:45:00Z",
  },
]

// Available webhook events
const availableEvents = [
  { id: "order.created", label: "Order Created" },
  { id: "order.updated", label: "Order Updated" },
  { id: "order.fulfilled", label: "Order Fulfilled" },
  { id: "product.created", label: "Product Created" },
  { id: "product.updated", label: "Product Updated" },
  { id: "inventory.updated", label: "Inventory Updated" },
  { id: "customer.created", label: "Customer Created" },
  { id: "customer.updated", label: "Customer Updated" },
]

export function WebhookManagement() {
  const [webhooks, setWebhooks] = useState(initialWebhooks)
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [] as string[],
    active: true,
  })

  // Function to format timestamp to relative time
  const formatTime = (timestamp: string) => {
    if (!timestamp) return "Never"

    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)

    if (diffMins < 60) {
      return `${diffMins} min ago`
    } else if (diffMins < 1440) {
      const diffHours = Math.floor(diffMins / 60)
      return `${diffHours} hr ago`
    } else {
      const diffDays = Math.floor(diffMins / 1440)
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    }
  }

  const handleAddWebhook = () => {
    if (newWebhook.name && newWebhook.url && newWebhook.events.length > 0) {
      setWebhooks([
        ...webhooks,
        {
          id: webhooks.length + 1,
          ...newWebhook,
          lastTriggered: "",
        },
      ])
      setNewWebhook({
        name: "",
        url: "",
        events: [],
        active: true,
      })
    }
  }

  const handleToggleActive = (id: number) => {
    setWebhooks(webhooks.map((webhook) => (webhook.id === id ? { ...webhook, active: !webhook.active } : webhook)))
  }

  const handleDeleteWebhook = (id: number) => {
    setWebhooks(webhooks.filter((webhook) => webhook.id !== id))
  }

  const handleToggleEvent = (event: string) => {
    if (newWebhook.events.includes(event)) {
      setNewWebhook({
        ...newWebhook,
        events: newWebhook.events.filter((e) => e !== event),
      })
    } else {
      setNewWebhook({
        ...newWebhook,
        events: [...newWebhook.events, event],
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Webhook Management</h3>
        <p className="text-sm text-muted-foreground">Configure webhooks to receive real-time updates</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="webhook-name">Webhook Name</Label>
            <Input
              id="webhook-name"
              placeholder="e.g., Order Notifications"
              value={newWebhook.name}
              onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-url">Endpoint URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://your-app.com/webhooks"
              value={newWebhook.url}
              onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Events to Subscribe</Label>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {availableEvents.map((event) => (
              <div key={event.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`event-${event.id}`}
                  checked={newWebhook.events.includes(event.id)}
                  onCheckedChange={() => handleToggleEvent(event.id)}
                />
                <label
                  htmlFor={`event-${event.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {event.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleAddWebhook} className="gap-2">
          <PlusCircle className="h-4 w-4" /> Add Webhook
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Last Triggered</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map((webhook) => (
              <TableRow key={webhook.id}>
                <TableCell className="font-medium">{webhook.name}</TableCell>
                <TableCell className="font-mono text-xs">{webhook.url}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{formatTime(webhook.lastTriggered)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch checked={webhook.active} onCheckedChange={() => handleToggleActive(webhook.id)} />
                    <span>{webhook.active ? "Active" : "Inactive"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" title="Test webhook">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      title="Delete webhook"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
