"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Trash2 } from "lucide-react"

// Mock data for endpoints
const initialEndpoints = [
  {
    id: 1,
    name: "Product Sync",
    url: "https://api.jewelia.com/v1/products",
    method: "POST",
    active: true,
  },
  {
    id: 2,
    name: "Order Webhook",
    url: "https://api.jewelia.com/v1/orders",
    method: "POST",
    active: true,
  },
  {
    id: 3,
    name: "Inventory Update",
    url: "https://api.jewelia.com/v1/inventory",
    method: "PUT",
    active: false,
  },
]

export function EndpointSetup() {
  const [endpoints, setEndpoints] = useState(initialEndpoints)
  const [newEndpoint, setNewEndpoint] = useState({
    name: "",
    url: "",
    method: "GET",
    active: true,
  })

  const handleAddEndpoint = () => {
    if (newEndpoint.name && newEndpoint.url) {
      setEndpoints([
        ...endpoints,
        {
          id: endpoints.length + 1,
          ...newEndpoint,
        },
      ])
      setNewEndpoint({
        name: "",
        url: "",
        method: "GET",
        active: true,
      })
    }
  }

  const handleToggleActive = (id: number) => {
    setEndpoints(
      endpoints.map((endpoint) => (endpoint.id === id ? { ...endpoint, active: !endpoint.active } : endpoint)),
    )
  }

  const handleDeleteEndpoint = (id: number) => {
    setEndpoints(endpoints.filter((endpoint) => endpoint.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">API Endpoints</h3>
        <p className="text-sm text-muted-foreground">Configure the endpoints for your API integrations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="name">Endpoint Name</Label>
          <Input
            id="name"
            placeholder="e.g., Product Sync"
            value={newEndpoint.name}
            onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            placeholder="https://api.example.com/v1/resource"
            value={newEndpoint.url}
            onChange={(e) => setNewEndpoint({ ...newEndpoint, url: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="method">Method</Label>
          <Select
            value={newEndpoint.method}
            onValueChange={(value) => setNewEndpoint({ ...newEndpoint, method: value })}
          >
            <SelectTrigger id="method">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleAddEndpoint} className="gap-2">
        <PlusCircle className="h-4 w-4" /> Add Endpoint
      </Button>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {endpoints.map((endpoint) => (
              <TableRow key={endpoint.id}>
                <TableCell className="font-medium">{endpoint.name}</TableCell>
                <TableCell className="font-mono text-sm">{endpoint.url}</TableCell>
                <TableCell>{endpoint.method}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch checked={endpoint.active} onCheckedChange={() => handleToggleActive(endpoint.id)} />
                    <span>{endpoint.active ? "Active" : "Inactive"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteEndpoint(endpoint.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
