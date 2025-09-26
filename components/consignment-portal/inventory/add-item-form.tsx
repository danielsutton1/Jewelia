"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function AddItemForm() {
  const [itemData, setItemData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    condition: "excellent",
    dateReceived: new Date(),
    consignmentPeriod: "365",
    commissionRate: "30",
    sku: "",
    notes: "",
  })

  const handleChange = (field: string, value: string | Date) => {
    setItemData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would save the data to your backend here
    console.log("Submitting item data:", itemData)
    // Redirect to inventory page
  }

  const endDate = new Date(itemData.dateReceived)
  endDate.setDate(endDate.getDate() + Number.parseInt(itemData.consignmentPeriod))

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Add New Item</h2>
        <p className="text-muted-foreground">Add a new item to your consignment inventory</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>Enter the details of the item you want to consign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details & Condition</TabsTrigger>
                <TabsTrigger value="terms">Consignment Terms</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    value={itemData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={itemData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Detailed description of the item..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={itemData.category} onValueChange={(value) => handleChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rings">Rings</SelectItem>
                        <SelectItem value="necklaces">Necklaces</SelectItem>
                        <SelectItem value="bracelets">Bracelets</SelectItem>
                        <SelectItem value="earrings">Earrings</SelectItem>
                        <SelectItem value="watches">Watches</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Item Photos</Label>
                  <div className="border-2 border-dashed rounded-md p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Drag and drop photos here or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload up to 5 high-quality photos (max 5MB each)
                    </p>
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      Upload Photos
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={itemData.condition} onValueChange={(value) => handleChange("condition", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU/Item Number (Optional)</Label>
                  <Input
                    id="sku"
                    value={itemData.sku}
                    onChange={(e) => handleChange("sku", e.target.value)}
                    placeholder="Your internal reference number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={itemData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Any additional information about this item..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Certificates & Documentation</Label>
                  <div className="border-2 border-dashed rounded-md p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Upload any certificates or documentation for this item
                    </p>
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      Upload Documents
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="terms" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateReceived">Date Received</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !itemData.dateReceived && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {itemData.dateReceived ? format(itemData.dateReceived, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={itemData.dateReceived as Date}
                          onSelect={(date) => handleChange("dateReceived", date as Date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consignmentPeriod">Consignment Period (days)</Label>
                    <Select
                      value={itemData.consignmentPeriod}
                      onValueChange={(value) => handleChange("consignmentPeriod", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="270">270 days</SelectItem>
                        <SelectItem value="365">365 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">End date: {format(endDate, "PPP")}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Select
                    value={itemData.commissionRate}
                    onValueChange={(value) => handleChange("commissionRate", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25%</SelectItem>
                      <SelectItem value="30">30%</SelectItem>
                      <SelectItem value="35">35%</SelectItem>
                      <SelectItem value="40">40%</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Standard rate from your agreement: 30%</p>
                </div>

                <div className="rounded-md bg-muted p-4 text-sm">
                  <p className="font-medium">Consignment Terms Summary</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Item will be listed for sale until {format(endDate, "PPP")}</li>
                    <li>• Commission rate: {itemData.commissionRate}%</li>
                    <li>• Settlement will be processed within 15 days of sale</li>
                    <li>• You may request price adjustments during the consignment period</li>
                    <li>• You may request return of the item at any time</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/consignment-portal/inventory">Cancel</Link>
            </Button>
            <Button type="submit">Add Item</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
