"use client"

import { useState } from "react"
import { Settings, Plus, Trash2, Save, Copy } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Sample data for jewelry categories
const categories = [
  {
    id: 1,
    name: "Rings",
    minQuantity: 10,
    reorderPoint: 15,
    leadTime: 14,
    preferredVendors: ["Gemstone Supply Co.", "Diamond Distributors"],
    autoReorder: true,
  },
  {
    id: 2,
    name: "Necklaces",
    minQuantity: 8,
    reorderPoint: 12,
    leadTime: 21,
    preferredVendors: ["Gold Chain Supply", "Silver Artisans"],
    autoReorder: false,
  },
  {
    id: 3,
    name: "Earrings",
    minQuantity: 15,
    reorderPoint: 20,
    leadTime: 10,
    preferredVendors: ["Gemstone Supply Co.", "Fine Metals Inc."],
    autoReorder: true,
  },
  {
    id: 4,
    name: "Bracelets",
    minQuantity: 12,
    reorderPoint: 18,
    leadTime: 14,
    preferredVendors: ["Gold Chain Supply", "Diamond Distributors"],
    autoReorder: false,
  },
  {
    id: 5,
    name: "Watches",
    minQuantity: 5,
    reorderPoint: 8,
    leadTime: 30,
    preferredVendors: ["Luxury Timepieces", "Watch Components Ltd."],
    autoReorder: true,
  },
]

// Sample data for vendors
const vendors = [
  "Gemstone Supply Co.",
  "Diamond Distributors",
  "Gold Chain Supply",
  "Silver Artisans",
  "Fine Metals Inc.",
  "Luxury Timepieces",
  "Watch Components Ltd.",
  "Precious Gems International",
  "Jewelry Packaging Co.",
]

export function CategorySettings() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Category-Specific Alert Settings</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Jewelry Categories</CardTitle>
              <CardDescription>Select a category to configure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </CardContent>
            <div>
              <Button variant="outline" className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy Settings
              </Button>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedCategory ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedCategory} Settings</CardTitle>
                <CardDescription>Configure alert settings for {selectedCategory}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="inventory-levels">
                    <AccordionTrigger>Inventory Levels</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Minimum Quantity</Label>
                          <Input
                            type="number"
                            defaultValue={categories.find((c) => c.name === selectedCategory)?.minQuantity}
                          />
                          <p className="text-xs text-muted-foreground">
                            Absolute minimum stock level before critical alert
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Reorder Point</Label>
                          <Input
                            type="number"
                            defaultValue={categories.find((c) => c.name === selectedCategory)?.reorderPoint}
                          />
                          <p className="text-xs text-muted-foreground">Stock level that triggers reorder warning</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Auto-Reorder</Label>
                          <p className="text-sm text-muted-foreground">Automatically create purchase orders</p>
                        </div>
                        <Switch defaultChecked={categories.find((c) => c.name === selectedCategory)?.autoReorder} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="lead-time">
                    <AccordionTrigger>Lead Time Settings</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Standard Lead Time (Days)</Label>
                        <Input
                          type="number"
                          defaultValue={categories.find((c) => c.name === selectedCategory)?.leadTime}
                        />
                        <p className="text-xs text-muted-foreground">Average time from order to delivery</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Buffer Days</Label>
                        <Input type="number" defaultValue="3" />
                        <p className="text-xs text-muted-foreground">Extra days added to lead time for safety</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Seasonal Adjustment</Label>
                          <p className="text-sm text-muted-foreground">Adjust lead times for holiday seasons</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="vendors">
                    <AccordionTrigger>Preferred Vendors</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Primary Vendor</Label>
                        <Select defaultValue={categories.find((c) => c.name === selectedCategory)?.preferredVendors[0]}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                          <SelectContent>
                            {vendors.map((vendor) => (
                              <SelectItem key={vendor} value={vendor}>
                                {vendor}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Secondary Vendors</Label>
                        <div className="space-y-2">
                          {categories
                            .find((c) => c.name === selectedCategory)
                            ?.preferredVendors.slice(1)
                            .map((vendor, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Select defaultValue={vendor}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select vendor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {vendors.map((v) => (
                                      <SelectItem key={v} value={v}>
                                        {v}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          <Button variant="outline" size="sm" className="mt-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Vendor
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="aging">
                    <AccordionTrigger>Aging Inventory Settings</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Warning Threshold (Days)</Label>
                          <Input type="number" defaultValue="60" />
                          <p className="text-xs text-muted-foreground">Days before item is considered aging</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Critical Threshold (Days)</Label>
                          <Input type="number" defaultValue="120" />
                          <p className="text-xs text-muted-foreground">Days before item is considered critical</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Discount Strategy</Label>
                        <Select defaultValue="tiered">
                          <SelectTrigger>
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Automatic Discounts</SelectItem>
                            <SelectItem value="fixed">Fixed Percentage</SelectItem>
                            <SelectItem value="tiered">Tiered by Age</SelectItem>
                            <SelectItem value="dynamic">Dynamic Pricing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="certification">
                    <AccordionTrigger>Certification Settings</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Required Certifications</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Switch defaultChecked={true} id="cert-gia" />
                            <Label htmlFor="cert-gia" className="text-sm font-normal">
                              GIA (Gemological Institute of America)
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch defaultChecked={false} id="cert-igi" />
                            <Label htmlFor="cert-igi" className="text-sm font-normal">
                              IGI (International Gemological Institute)
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch defaultChecked={false} id="cert-ags" />
                            <Label htmlFor="cert-ags" className="text-sm font-normal">
                              AGS (American Gem Society)
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Certification Alert Days</Label>
                        <Input type="number" defaultValue="60" />
                        <p className="text-xs text-muted-foreground">Days before expiration to send first alert</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <div className="flex justify-between">
                <Button variant="outline">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex h-[400px] items-center justify-center">
                <div className="text-center">
                  <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Category Selected</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select a category from the list to configure its alert settings
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
