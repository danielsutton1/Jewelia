"use client"

import { useState } from "react"
import { Copy, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EndpointBrowserProps {
  selectedEndpoint: string
}

const endpoints = {
  "list-inventory": {
    title: "List Inventory Items",
    description: "Returns a paginated list of inventory items",
    url: "/api/v1/inventory",
    method: "GET",
    parameters: [
      { name: "page", type: "integer", required: false, description: "Page number for pagination" },
      { name: "limit", type: "integer", required: false, description: "Number of items per page" },
      { name: "category", type: "string", required: false, description: "Filter by category ID" },
      { name: "location", type: "string", required: false, description: "Filter by location ID" },
      { name: "search", type: "string", required: false, description: "Search term for inventory items" },
    ],
    response: {
      status: 200,
      body: {
        data: [
          {
            id: "inv_12345",
            sku: "JW-RING-001",
            name: "Diamond Engagement Ring",
            description: "1 carat diamond engagement ring",
            category_id: "cat_rings",
            location_id: "loc_showcase1",
            price: 2499.99,
            cost: 1250.0,
            quantity: 3,
            created_at: "2023-01-15T12:00:00Z",
            updated_at: "2023-01-15T12:00:00Z",
          },
          {
            id: "inv_12346",
            sku: "JW-NECK-002",
            name: "Pearl Necklace",
            description: "18 inch freshwater pearl necklace",
            category_id: "cat_necklaces",
            location_id: "loc_showcase2",
            price: 899.99,
            cost: 450.0,
            quantity: 5,
            created_at: "2023-01-16T12:00:00Z",
            updated_at: "2023-01-16T12:00:00Z",
          },
        ],
        meta: {
          current_page: 1,
          total_pages: 5,
          total_count: 42,
          per_page: 10,
        },
      },
    },
  },
  "get-inventory": {
    title: "Get Inventory Item",
    description: "Returns a single inventory item by ID",
    url: "/api/v1/inventory/:id",
    method: "GET",
    parameters: [{ name: "id", type: "string", required: true, description: "Inventory item ID", in: "path" }],
    response: {
      status: 200,
      body: {
        id: "inv_12345",
        sku: "JW-RING-001",
        name: "Diamond Engagement Ring",
        description: "1 carat diamond engagement ring",
        category_id: "cat_rings",
        location_id: "loc_showcase1",
        price: 2499.99,
        cost: 1250.0,
        quantity: 3,
        created_at: "2023-01-15T12:00:00Z",
        updated_at: "2023-01-15T12:00:00Z",
        attributes: {
          metal: "White Gold",
          karat: "14K",
          stone_type: "Diamond",
          stone_weight: "1.0ct",
          stone_color: "F",
          stone_clarity: "VS1",
        },
      },
    },
  },
  // Other endpoints would be defined similarly
}

export function EndpointBrowser({ selectedEndpoint }: EndpointBrowserProps) {
  const endpoint = endpoints[selectedEndpoint as keyof typeof endpoints] || endpoints["list-inventory"]
  const [showHeaders, setShowHeaders] = useState(false)
  const [responseTab, setResponseTab] = useState("preview")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{endpoint.title}</CardTitle>
              <CardDescription className="mt-1">{endpoint.description}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-block text-xs font-mono px-2 py-1 rounded
                ${endpoint.method === "GET" ? "bg-blue-100 text-blue-800" : ""}
                ${endpoint.method === "POST" ? "bg-green-100 text-green-800" : ""}
                ${endpoint.method === "PUT" ? "bg-amber-100 text-amber-800" : ""}
                ${endpoint.method === "DELETE" ? "bg-red-100 text-red-800" : ""}
              `}
              >
                {endpoint.method}
              </span>
              <code className="bg-muted px-2 py-1 rounded text-sm">{endpoint.url}</code>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Request Parameters</h3>
              <Button variant="outline" size="sm" onClick={() => setShowHeaders(!showHeaders)}>
                {showHeaders ? "Hide Headers" : "Show Headers"}
              </Button>
            </div>

            {showHeaders && (
              <div className="space-y-3 border rounded-md p-4 bg-muted/30">
                <div className="space-y-2">
                  <Label htmlFor="auth-type">Authentication</Label>
                  <Select defaultValue="api-key">
                    <SelectTrigger id="auth-type">
                      <SelectValue placeholder="Select authentication type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api-key">API Key</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" placeholder="Enter your API key" defaultValue="sk_test_***YOUR_API_KEY_HERE***" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content-type">Content-Type</Label>
                    <span className="text-xs text-muted-foreground">Default: application/json</span>
                  </div>
                  <Input id="content-type" defaultValue="application/json" />
                </div>
              </div>
            )}

            {endpoint.parameters && endpoint.parameters.length > 0 && (
              <div className="border rounded-md divide-y">
                {endpoint.parameters.map((param, index) => (
                  <div key={index} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{param.name}</span>
                          {param.required && (
                            <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">Required</span>
                          )}
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{param.type}</span>
                          {('in' in param && param.in) && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                              {param.in}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{param.description}</p>
                      </div>
                      <Input
                        className="w-1/3"
                        placeholder={`Enter ${param.name}`}
                        defaultValue={param.name === "id" ? "inv_12345" : ""}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Reset</Button>
          <Button className="flex items-center">
            <Play className="mr-2 h-4 w-4" />
            Test Request
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={responseTab} onValueChange={setResponseTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {endpoint.response.status} OK
                  </span>
                  <span className="text-sm text-muted-foreground">Response time: 124ms</span>
                </div>
                <Button variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>

              <ScrollArea className="h-96 w-full rounded-md border">
                <pre className="p-4 text-sm">
                  <code>{JSON.stringify(endpoint.response.body, null, 2)}</code>
                </pre>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="headers">
              <ScrollArea className="h-96 w-full rounded-md border">
                <div className="p-4 space-y-2">
                  <div className="flex">
                    <span className="font-mono text-sm font-medium w-1/3">Content-Type:</span>
                    <span className="font-mono text-sm">application/json</span>
                  </div>
                  <div className="flex">
                    <span className="font-mono text-sm font-medium w-1/3">X-Request-ID:</span>
                    <span className="font-mono text-sm">req_12345abcdef</span>
                  </div>
                  <div className="flex">
                    <span className="font-mono text-sm font-medium w-1/3">X-Runtime:</span>
                    <span className="font-mono text-sm">0.124s</span>
                  </div>
                  <div className="flex">
                    <span className="font-mono text-sm font-medium w-1/3">X-Rate-Limit-Limit:</span>
                    <span className="font-mono text-sm">100</span>
                  </div>
                  <div className="flex">
                    <span className="font-mono text-sm font-medium w-1/3">X-Rate-Limit-Remaining:</span>
                    <span className="font-mono text-sm">99</span>
                  </div>
                  <div className="flex">
                    <span className="font-mono text-sm font-medium w-1/3">X-Rate-Limit-Reset:</span>
                    <span className="font-mono text-sm">1620000000</span>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
