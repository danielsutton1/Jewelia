"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Play, Save, XCircle } from "lucide-react"

export function TestingTools() {
  const [method, setMethod] = useState("GET")
  const [endpoint, setEndpoint] = useState("/api/products")
  const [headers, setHeaders] = useState(
    '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer YOUR_API_KEY"\n}',
  )
  const [body, setBody] = useState(
    '{\n  "name": "Test Product",\n  "price": 19.99,\n  "description": "This is a test product"\n}',
  )
  const [response, setResponse] = useState<null | {
    status: number
    time: string
    headers: string
    body: string
  }>(null)
  const [loading, setLoading] = useState(false)
  const [savedRequests, setSavedRequests] = useState([
    { name: "Get All Products", method: "GET", endpoint: "/api/products" },
    { name: "Create Product", method: "POST", endpoint: "/api/products" },
    { name: "Get Customer", method: "GET", endpoint: "/api/customers/123" },
  ])

  const handleSendRequest = () => {
    setLoading(true)

    // Simulate API request
    setTimeout(() => {
      setResponse({
        status: 200,
        time: "256 ms",
        headers: '{\n  "content-type": "application/json",\n  "cache-control": "no-cache"\n}',
        body: '{\n  "success": true,\n  "data": {\n    "id": 123,\n    "name": "Test Product",\n    "price": 19.99,\n    "description": "This is a test product"\n  }\n}',
      })
      setLoading(false)
    }, 1000)
  }

  const handleSaveRequest = () => {
    const name = prompt("Enter a name for this request:")
    if (name) {
      setSavedRequests([...savedRequests, { name, method, endpoint }])
    }
  }

  const handleLoadRequest = (savedRequest: { name: string; method: string; endpoint: string }) => {
    setMethod(savedRequest.method)
    setEndpoint(savedRequest.endpoint)

    // Set default body based on method
    if (savedRequest.method === "POST" || savedRequest.method === "PUT") {
      setBody('{\n  "name": "Test Product",\n  "price": 19.99,\n  "description": "This is a test product"\n}')
    } else {
      setBody("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">API Testing Tools</h3>
        <p className="text-sm text-muted-foreground">Test your API endpoints and verify responses</p>
      </div>

      <Tabs defaultValue="request-builder" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="request-builder">Request Builder</TabsTrigger>
          <TabsTrigger value="webhook-tester">Webhook Tester</TabsTrigger>
          <TabsTrigger value="batch-testing">Batch Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="request-builder" className="space-y-4 pt-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="md:col-span-3 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Request</CardTitle>
                  <CardDescription>Configure your API request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="w-[150px]">
                      <Label htmlFor="method">Method</Label>
                      <Select value={method} onValueChange={setMethod}>
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
                    <div className="flex-1">
                      <Label htmlFor="endpoint">Endpoint</Label>
                      <Input
                        id="endpoint"
                        placeholder="/api/resource"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headers">Headers</Label>
                    <Textarea
                      id="headers"
                      placeholder="Enter request headers as JSON"
                      className="font-mono text-sm"
                      rows={5}
                      value={headers}
                      onChange={(e) => setHeaders(e.target.value)}
                    />
                  </div>

                  {(method === "POST" || method === "PUT" || method === "PATCH") && (
                    <div className="space-y-2">
                      <Label htmlFor="body">Request Body</Label>
                      <Textarea
                        id="body"
                        placeholder="Enter request body as JSON"
                        className="font-mono text-sm"
                        rows={8}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                      />
                    </div>
                  )}
                </CardContent>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleSaveRequest}>
                    <Save className="mr-2 h-4 w-4" /> Save Request
                  </Button>
                  <Button onClick={handleSendRequest} disabled={loading}>
                    {loading ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" /> Send Request
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {response && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                      <CardTitle>Response</CardTitle>
                      <CardDescription>Completed in {response.time}</CardDescription>
                    </div>
                    <Badge
                      variant={response.status >= 200 && response.status < 300 ? "default" : "destructive"}
                      className="px-3"
                    >
                      {response.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Response Headers</Label>
                      <div className="rounded-md bg-muted p-4">
                        <pre className="font-mono text-sm whitespace-pre-wrap">{response.headers}</pre>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Response Body</Label>
                      <div className="rounded-md bg-muted p-4">
                        <pre className="font-mono text-sm whitespace-pre-wrap">{response.body}</pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Saved Requests</CardTitle>
                  <CardDescription>Load previously saved requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {savedRequests.map((request, index) => (
                      <div
                        key={index}
                        className="flex cursor-pointer items-center justify-between rounded-md border p-2 hover:bg-muted"
                        onClick={() => handleLoadRequest(request)}
                      >
                        <div>
                          <p className="font-medium">{request.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {request.method} {request.endpoint}
                          </p>
                        </div>
                        <Badge variant="outline">{request.method}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="webhook-tester" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Tester</CardTitle>
              <CardDescription>Test your webhook endpoints with simulated events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-app.com/webhooks"
                    defaultValue="https://your-app.com/webhooks/orders"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-type">Event Type</Label>
                  <Select defaultValue="order.created">
                    <SelectTrigger id="event-type">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order.created">Order Created</SelectItem>
                      <SelectItem value="order.updated">Order Updated</SelectItem>
                      <SelectItem value="order.fulfilled">Order Fulfilled</SelectItem>
                      <SelectItem value="product.created">Product Created</SelectItem>
                      <SelectItem value="product.updated">Product Updated</SelectItem>
                      <SelectItem value="customer.created">Customer Created</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-payload">Payload</Label>
                <Textarea
                  id="webhook-payload"
                  className="font-mono text-sm"
                  rows={10}
                  defaultValue={`{
  "event": "order.created",
  "created_at": "2023-05-15T14:30:00Z",
  "data": {
    "id": "ord_12345",
    "customer_id": "cus_67890",
    "amount": 129.99,
    "currency": "USD",
    "status": "processing",
    "items": [
      {
        "product_id": "prod_123",
        "quantity": 1,
        "price": 129.99
      }
    ]
  }
}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-headers">Headers</Label>
                <Textarea
                  id="webhook-headers"
                  className="font-mono text-sm"
                  rows={5}
                  defaultValue={`{
  "Content-Type": "application/json",
  "X-Webhook-Signature": "sha256=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce7b91d6fad"
}`}
                />
              </div>

              <div className="rounded-md border p-4">
                <div className="mb-4 flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  <div>
                    <h4 className="font-medium">Last Delivery: Successful</h4>
                    <p className="text-sm text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <span className="font-medium">200 OK</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Response Time:</span>
                    <span className="font-medium">156 ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Response Size:</span>
                    <span className="font-medium">1.2 KB</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <div>
              <Button className="w-full">
                <Play className="mr-2 h-4 w-4" /> Send Webhook
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="batch-testing" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Testing</CardTitle>
              <CardDescription>Run multiple API tests in sequence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">Name</th>
                      <th className="p-2 text-left font-medium">Method</th>
                      <th className="p-2 text-left font-medium">Endpoint</th>
                      <th className="p-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Get Products</td>
                      <td className="p-2">GET</td>
                      <td className="p-2 font-mono text-sm">/api/products</td>
                      <td className="p-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="mr-1 h-3 w-3" /> Passed
                        </Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Create Product</td>
                      <td className="p-2">POST</td>
                      <td className="p-2 font-mono text-sm">/api/products</td>
                      <td className="p-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="mr-1 h-3 w-3" /> Passed
                        </Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Update Product</td>
                      <td className="p-2">PUT</td>
                      <td className="p-2 font-mono text-sm">/api/products/123</td>
                      <td className="p-2">
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          <XCircle className="mr-1 h-3 w-3" /> Failed
                        </Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Delete Product</td>
                      <td className="p-2">DELETE</td>
                      <td className="p-2 font-mono text-sm">/api/products/123</td>
                      <td className="p-2">
                        <Badge variant="outline" className="bg-muted text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" /> Pending
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-script">Test Script</Label>
                <Textarea
                  id="test-script"
                  className="font-mono text-sm"
                  rows={10}
                  defaultValue={`// Test suite for Products API
const tests = [
  {
    name: "Get Products",
    method: "GET",
    endpoint: "/api/products",
    validate: (response) => {
      return response.status === 200 && Array.isArray(response.data);
    }
  },
  {
    name: "Create Product",
    method: "POST",
    endpoint: "/api/products",
    body: {
      name: "Test Product",
      price: 19.99,
      description: "This is a test product"
    },
    validate: (response) => {
      return response.status === 201 && response.data.id;
    }
  }
];`}
                />
              </div>
            </CardContent>
            <div className="flex justify-between">
              <Button variant="outline">
                <Save className="mr-2 h-4 w-4" /> Save Tests
              </Button>
              <Button>
                <Play className="mr-2 h-4 w-4" /> Run All Tests
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
