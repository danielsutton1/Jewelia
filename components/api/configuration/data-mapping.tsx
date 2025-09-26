"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, PlusCircle, Trash2 } from "lucide-react"

// Mock data for field mappings
const initialMappings = {
  products: [
    { id: 1, sourceField: "name", targetField: "title", transform: "none" },
    { id: 2, sourceField: "description", targetField: "body_html", transform: "none" },
    { id: 3, sourceField: "price", targetField: "price", transform: "multiply:100" },
  ],
  customers: [
    { id: 1, sourceField: "firstName", targetField: "first_name", transform: "none" },
    { id: 2, sourceField: "lastName", targetField: "last_name", transform: "none" },
    { id: 3, sourceField: "emailAddress", targetField: "email", transform: "lowercase" },
  ],
  orders: [
    { id: 1, sourceField: "orderNumber", targetField: "order_id", transform: "none" },
    { id: 2, sourceField: "orderDate", targetField: "created_at", transform: "date:iso" },
    { id: 3, sourceField: "totalAmount", targetField: "total_price", transform: "multiply:100" },
  ],
}

// Available transformation options
const transformOptions = [
  { value: "none", label: "No Transformation" },
  { value: "uppercase", label: "Convert to Uppercase" },
  { value: "lowercase", label: "Convert to Lowercase" },
  { value: "capitalize", label: "Capitalize" },
  { value: "trim", label: "Trim Whitespace" },
  { value: "date:iso", label: "Format as ISO Date" },
  { value: "multiply:100", label: "Multiply by 100" },
  { value: "divide:100", label: "Divide by 100" },
  { value: "round", label: "Round to Integer" },
]

export function DataMapping() {
  const [activeTab, setActiveTab] = useState("products")
  const [mappings, setMappings] = useState(initialMappings)
  const [newMapping, setNewMapping] = useState({
    sourceField: "",
    targetField: "",
    transform: "none",
  })

  const handleAddMapping = () => {
    if (newMapping.sourceField && newMapping.targetField) {
      const newId = Math.max(0, ...mappings[activeTab as keyof typeof mappings].map((m) => m.id)) + 1
      setMappings({
        ...mappings,
        [activeTab]: [
          ...mappings[activeTab as keyof typeof mappings],
          {
            id: newId,
            ...newMapping,
          },
        ],
      })
      setNewMapping({
        sourceField: "",
        targetField: "",
        transform: "none",
      })
    }
  }

  const handleDeleteMapping = (id: number) => {
    setMappings({
      ...mappings,
      [activeTab]: mappings[activeTab as keyof typeof mappings].filter((mapping) => mapping.id !== id),
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Data Field Mapping</h3>
        <p className="text-sm text-muted-foreground">Configure how data fields are mapped between systems</p>
      </div>

      <Tabs defaultValue="products" className="w-full" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {(["products", "customers", "orders"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{tab} Field Mapping</CardTitle>
                <CardDescription>Map {tab} fields between your system and the API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="source-field">Source Field</Label>
                    <Input
                      id="source-field"
                      placeholder="Your system field name"
                      value={newMapping.sourceField}
                      onChange={(e) => setNewMapping({ ...newMapping, sourceField: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-field">Target Field</Label>
                    <Input
                      id="target-field"
                      placeholder="API field name"
                      value={newMapping.targetField}
                      onChange={(e) => setNewMapping({ ...newMapping, targetField: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transform">Transformation</Label>
                    <Select
                      value={newMapping.transform}
                      onValueChange={(value) => setNewMapping({ ...newMapping, transform: value })}
                    >
                      <SelectTrigger id="transform">
                        <SelectValue placeholder="Select transformation" />
                      </SelectTrigger>
                      <SelectContent>
                        {transformOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleAddMapping} className="gap-2">
                  <PlusCircle className="h-4 w-4" /> Add Mapping
                </Button>

                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">Source Field</th>
                        <th className="p-2 text-center font-medium"></th>
                        <th className="p-2 text-left font-medium">Target Field</th>
                        <th className="p-2 text-left font-medium">Transformation</th>
                        <th className="p-2 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappings[tab].map((mapping) => (
                        <tr key={mapping.id} className="border-b">
                          <td className="p-2 font-mono text-sm">{mapping.sourceField}</td>
                          <td className="p-2 text-center">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </td>
                          <td className="p-2 font-mono text-sm">{mapping.targetField}</td>
                          <td className="p-2 text-sm">
                            {transformOptions.find((o) => o.value === mapping.transform)?.label || mapping.transform}
                          </td>
                          <td className="p-2 text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMapping(mapping.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
