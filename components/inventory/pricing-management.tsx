"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Plus } from "lucide-react"

// Sample data - replace with actual data fetching
const samplePricingRules = [
  {
    id: "1",
    itemSku: "FP-001",
    itemName: "Diamond Engagement Ring",
    customerType: "Retail",
    costMethod: "Piece Weight",
    basePrice: 3500,
    markup: 1.4,
    finalPrice: 4900,
  },
  // Add more sample items...
]

const sampleCustomers = [
  {
    id: "1",
    name: "John Smith",
    type: "Retail",
    discount: 0,
  },
  // Add more sample items...
]

export function PricingManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [pricingRules, setPricingRules] = useState(samplePricingRules)
  const [showForm, setShowForm] = useState(false)
  const [newRule, setNewRule] = useState({
    itemSku: "",
    customerType: "Retail",
    costMethod: "Piece Weight",
    basePrice: "",
    markup: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Add validation and API call here
    setShowForm(false)
    setNewRule({
      itemSku: "",
      customerType: "Retail",
      costMethod: "Piece Weight",
      basePrice: "",
      markup: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pricing Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pricingRules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(pricingRules.map((rule) => rule.customerType)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(pricingRules.map((rule) => rule.costMethod)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search pricing rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px] rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          New Pricing Rule
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-lg font-semibold">New Pricing Rule</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Item SKU</label>
                <Input
                  value={newRule.itemSku}
                  onChange={(e) =>
                    setNewRule({ ...newRule, itemSku: e.target.value })
                  }
                  placeholder="Enter item SKU"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Type</label>
                <Select
                  value={newRule.customerType}
                  onValueChange={(value) =>
                    setNewRule({ ...newRule, customerType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Wholesale">Wholesale</SelectItem>
                    <SelectItem value="Trade">Trade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cost Method</label>
                <Select
                  value={newRule.costMethod}
                  onValueChange={(value) =>
                    setNewRule({ ...newRule, costMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piece Weight">Piece Weight</SelectItem>
                    <SelectItem value="Labor Plus Metal">Labor Plus Metal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Price</label>
                <Input
                  type="number"
                  value={newRule.basePrice}
                  onChange={(e) =>
                    setNewRule({ ...newRule, basePrice: e.target.value })
                  }
                  placeholder="Enter base price"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Markup</label>
                <Input
                  type="number"
                  value={newRule.markup}
                  onChange={(e) =>
                    setNewRule({ ...newRule, markup: e.target.value })
                  }
                  placeholder="Enter markup"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Rule</Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item SKU</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Customer Type</TableHead>
              <TableHead>Cost Method</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Markup</TableHead>
              <TableHead>Final Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricingRules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>{rule.itemSku}</TableCell>
                <TableCell>{rule.itemName}</TableCell>
                <TableCell>{rule.customerType}</TableCell>
                <TableCell>{rule.costMethod}</TableCell>
                <TableCell>${rule.basePrice}</TableCell>
                <TableCell>{rule.markup}x</TableCell>
                <TableCell>${rule.finalPrice}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 
 
 