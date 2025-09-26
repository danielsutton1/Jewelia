"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Webhook {
  id: string
  url: string
  events: string[]
  active: boolean
  created: string
  last_triggered?: string
}

const sampleWebhooks: Webhook[] = [
  {
    id: "wh_123456",
    url: "https://example.com/webhooks/inventory",
    events: ["inventory.created", "inventory.updated", "inventory.deleted"],
    active: true,
    created: "2023-01-15T12:00:00Z",
    last_triggered: "2023-05-10T15:23:45Z",
  },
  {
    id: "wh_789012",
    url: "https://example.com/webhooks/categories",
    events: ["category.created", "category.updated"],
    active: true,
    created: "2023-02-20T09:30:00Z",
    last_triggered: "2023-05-09T11:12:33Z",
  },
]

export function WebhookConfiguration() {
  const [webhooks, setWebhooks] = useState<Webhook[]>(sampleWebhooks)
  const [newWebhookUrl, setNewWebhookUrl] = useState("")
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  const handleAddWebhook = () => {
    if (!newWebhookUrl || selectedEvents.length === 0) return

    const newWebhook: Webhook = {
      id: `wh_${Math.random().toString(36).substring(2, 8)}`,
      url: newWebhookUrl,
      events: selectedEvents,
      active: true,
      created: new Date().toISOString(),
    }

    setWebhooks([...webhooks, newWebhook])
    setNewWebhookUrl("")
    setSelectedEvents([])
  }

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((webhook) => webhook.id !== id))
  }

  const handleToggleWebhook = (id: string) => {
    setWebhooks(webhooks.map((webhook) => (webhook.id === id ? { ...webhook, active: !webhook.active } : webhook)))
  }

  const handleEventToggle = (event: string) => {
    if (selectedEvents.includes(event)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== event))
    } else {
      setSelectedEvents([...selectedEvents, event])
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>
            Configure webhooks to receive real-time notifications when events occur in your Jewelia CRM account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="webhooks">
            <TabsList>
              <TabsTrigger value="webhooks">Your Webhooks</TabsTrigger>
              <TabsTrigger value="create">Create Webhook</TabsTrigger>
              <TabsTrigger value="events">Available Events</TabsTrigger>
            </TabsList>

            <TabsContent value="webhooks" className="space-y-4 pt-4">
              {webhooks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No webhooks configured. Create one to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <Card key={webhook.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{webhook.url}</CardTitle>
                            <CardDescription>ID: {webhook.id}</CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`webhook-${webhook.id}`}
                                checked={webhook.active}
                                onCheckedChange={() => handleToggleWebhook(webhook.id)}
                              />
                              <Label htmlFor={`webhook-${webhook.id}`}>{webhook.active ? "Active" : "Inactive"}</Label>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteWebhook(webhook.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="secondary">
                              {event}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>Created: {new Date(webhook.created).toLocaleDateString()}</span>
                          {webhook.last_triggered && (
                            <span className="ml-4">
                              Last triggered: {new Date(webhook.last_triggered).toLocaleDateString()}{" "}
                              {new Date(webhook.last_triggered).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://example.com/webhooks/inventory"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Events to Subscribe</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "inventory.created",
                      "inventory.updated",
                      "inventory.deleted",
                      "category.created",
                      "category.updated",
                      "category.deleted",
                      "stone.created",
                      "stone.updated",
                      "stone.deleted",
                      "location.created",
                      "location.updated",
                      "location.deleted",
                    ].map((event) => (
                      <div key={event} className="flex items-center space-x-2">
                        <Switch
                          id={`event-${event}`}
                          checked={selectedEvents.includes(event)}
                          onCheckedChange={() => handleEventToggle(event)}
                        />
                        <Label htmlFor={`event-${event}`} className="text-sm">
                          {event}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Webhook Secret (Optional)</Label>
                  <Input id="webhook-secret" placeholder="Enter a secret key to verify webhook payloads" />
                  <p className="text-xs text-muted-foreground">
                    We'll use this secret to sign the webhook payload. You can verify the signature to ensure the
                    webhook came from us.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="events" className="pt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Inventory Events</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 border-b pb-2">
                        <div className="font-medium">Event</div>
                        <div className="font-medium">Description</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-b py-2">
                        <div className="font-mono text-sm">inventory.created</div>
                        <div className="text-sm">Triggered when a new inventory item is created</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-b py-2">
                        <div className="font-mono text-sm">inventory.updated</div>
                        <div className="text-sm">Triggered when an inventory item is updated</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-b py-2">
                        <div className="font-mono text-sm">inventory.deleted</div>
                        <div className="text-sm">Triggered when an inventory item is deleted</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Category Events</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 border-b pb-2">
                        <div className="font-medium">Event</div>
                        <div className="font-medium">Description</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-b py-2">
                        <div className="font-mono text-sm">category.created</div>
                        <div className="text-sm">Triggered when a new category is created</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-b py-2">
                        <div className="font-mono text-sm">category.updated</div>
                        <div className="text-sm">Triggered when a category is updated</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-b py-2">
                        <div className="font-mono text-sm">category.deleted</div>
                        <div className="text-sm">Triggered when a category is deleted</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Stone Events</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 border-b pb-2">
                        <div className="font-medium">Event</div>
                        <div className="font-medium">Description</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-b py-2">
                        <div className="font-mono text-sm">stone.created</div>
                        <div className="text-sm">Triggered when a new stone is created</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-b py-2">
                        <div className="font-mono text-sm">stone.updated</div>
                        <div className="text-sm">Triggered when a stone is updated</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-b py-2">
                        <div className="font-mono text-sm">stone.deleted</div>
                        <div className="text-sm">Triggered when a stone is deleted</div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end">
          {newWebhookUrl && selectedEvents.length > 0 && (
            <Button onClick={handleAddWebhook}>
              <Plus className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
