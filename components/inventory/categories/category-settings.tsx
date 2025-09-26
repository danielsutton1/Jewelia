"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Save, MoveVertical, Copy } from "lucide-react"

// Sample attribute data
const attributeGroups = [
  {
    id: "dimensions",
    name: "Dimensions",
    attributes: [
      { id: "length", name: "Length", type: "number", unit: "mm", required: true },
      { id: "width", name: "Width", type: "number", unit: "mm", required: true },
      { id: "height", name: "Height", type: "number", unit: "mm", required: false },
    ],
  },
  {
    id: "materials",
    name: "Materials",
    attributes: [
      {
        id: "metal_type",
        name: "Metal Type",
        type: "select",
        options: ["Gold", "Silver", "Platinum", "Rose Gold"],
        required: true,
      },
      {
        id: "metal_purity",
        name: "Metal Purity",
        type: "select",
        options: ["10K", "14K", "18K", "24K", "925", "950"],
        required: true,
      },
      { id: "metal_weight", name: "Metal Weight", type: "number", unit: "g", required: true },
    ],
  },
  {
    id: "gemstones",
    name: "Gemstones",
    attributes: [
      {
        id: "stone_type",
        name: "Stone Type",
        type: "select",
        options: ["Diamond", "Ruby", "Sapphire", "Emerald"],
        required: false,
      },
      {
        id: "stone_cut",
        name: "Stone Cut",
        type: "select",
        options: ["Round", "Princess", "Cushion", "Oval"],
        required: false,
      },
      { id: "stone_weight", name: "Stone Weight", type: "number", unit: "ct", required: false },
      {
        id: "stone_color",
        name: "Stone Color",
        type: "select",
        options: ["D", "E", "F", "G", "H", "I"],
        required: false,
      },
      {
        id: "stone_clarity",
        name: "Stone Clarity",
        type: "select",
        options: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2"],
        required: false,
      },
    ],
  },
  {
    id: "pricing",
    name: "Pricing",
    attributes: [
      { id: "msrp", name: "MSRP", type: "number", unit: "$", required: true },
      { id: "cost", name: "Cost", type: "number", unit: "$", required: true },
      { id: "markup", name: "Markup", type: "number", unit: "%", required: false },
    ],
  },
]

// Sample display templates
const displayTemplates = [
  { id: "standard", name: "Standard Grid", description: "Default product grid display" },
  { id: "compact", name: "Compact List", description: "Condensed list view with key details" },
  { id: "gallery", name: "Gallery View", description: "Large images with minimal text" },
  { id: "detailed", name: "Detailed View", description: "Complete product information with specifications" },
  { id: "comparison", name: "Comparison View", description: "Side-by-side product comparison" },
]

// Sample pricing rules
const pricingRules = [
  { id: "markup-30", name: "30% Markup", formula: "cost * 1.3", default: true },
  { id: "markup-50", name: "50% Markup", formula: "cost * 1.5", default: false },
  { id: "keystone", name: "Keystone Pricing", formula: "cost * 2", default: false },
  { id: "msrp-10", name: "MSRP - 10%", formula: "msrp * 0.9", default: false },
]

interface CategorySettingsProps {
  selectedCategory: string | null
}

export function CategorySettings({ selectedCategory }: CategorySettingsProps) {
  const [requiredFields, setRequiredFields] = useState<string[]>([])
  const [selectedAttributeGroups, setSelectedAttributeGroups] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState("standard")
  const [selectedPricingRule, setSelectedPricingRule] = useState("markup-30")
  const [inheritSettings, setInheritSettings] = useState(true)
  
  // Reset settings when category changes
  useEffect(() => {
    if (selectedCategory) {
      // In a real app, you would fetch the settings for the selected category
      // For this demo, we'll just set some default values
      setRequiredFields(["name", "sku", "price", "metal_type"])
      setSelectedAttributeGroups(["dimensions", "materials"])
      setSelectedTemplate("standard")
      setSelectedPricingRule("markup-30")
      setInheritSettings(true)
    }
  }, [selectedCategory])
  
  if (!selectedCategory) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <h3 className="text-lg font-medium">No Category Selected</h3>
            <p className="text-muted-foreground">Select a category to configure its settings</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Category Settings</h2>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <Switch id="inherit" checked={inheritSettings} onCheckedChange={setInheritSettings} />
        <Label htmlFor="inherit">Inherit settings from parent category</Label>
        <Badge variant="outline" className="ml-2">
          Inheritance Active
        </Badge>
      </div>
      
      <Tabs defaultValue="fields" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="fields">Required Fields</TabsTrigger>
          <TabsTrigger value="attributes">Attribute Sets</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Rules</TabsTrigger>
          <TabsTrigger value="display">Display Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fields" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Required Fields</CardTitle>
              <CardDescription>
                Select which fields are required for products in this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="field-name" 
                          checked={requiredFields.includes("name")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setRequiredFields([...requiredFields, "name"])
                            } else {
                              setRequiredFields(requiredFields.filter(f => f !== "name"))
                            }
                          }}
                        />
                        <Label htmlFor="field-name">Product Name</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="field-sku" 
                          checked={requiredFields.includes("sku")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setRequiredFields([...requiredFields, "sku"])
                            } else {
                              setRequiredFields(requiredFields.filter(f => f !== "sku"))
                            }
                          }}
                        />
                        <Label htmlFor="field-sku">SKU</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="field-price" 
                          checked={requiredFields.includes("price")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setRequiredFields([...requiredFields, "price"])
                            } else {
                              setRequiredFields(requiredFields.filter(f => f !== "price"))
                            }
                          }}
                        />
                        <Label htmlFor="field-price">Price</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="field-description" 
                          checked={requiredFields.includes("description")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setRequiredFields([...requiredFields, "description"])
                            } else {
                              setRequiredFields(requiredFields.filter(f => f !== "description"))
                            }
                          }}
                        />
                        <Label htmlFor="field-description">Description</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="field-images" 
                          checked={requiredFields.includes("images")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setRequiredFields([...requiredFields, "images"])
                            } else {
                              setRequiredFields(requiredFields.filter(f => f !== "images"))
                            }
                          }}
                        />
                        <Label htmlFor="field-images">Images</Label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="field-inventory" 
                          checked={requiredFields.includes("inventory")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setRequiredFields([...requiredFields, "inventory"])
                            } else {
                              setRequiredFields(requiredFields.filter(f => f !== "inventory"))
                            }
                          }}
                        />
                        <Label htmlFor="field-inventory">Inventory Quantity</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="field-metal_type" 
                          checked={requiredFields.includes("metal_type")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setRequiredFields([...requiredFields, "metal_type"])
                            } else {
                              setRequiredFields(requiredFields.filter(f => f !== "metal_type"))
                            }
                          }}
                        />
                        <Label htmlFor="field-metal_type">Metal Type</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="field-weight" 
                          checked={requiredFields.includes("weight")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setRequiredFields([...requiredFields, "weight"])
                            } else {
                              setRequiredFields(requiredFields.filter(f => f !== "weight"))
                            }
                          }}
                        />
                        <Label htmlFor="field-weight">Weight</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="field-dimensions" 
                          checked={requiredFields.includes("dimensions")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setRequiredFields([...requiredFields, "dimensions"])
                            } else {
                              setRequiredFields(requiredFields.filter(f => f !== "dimensions"))
                            }
                          }}
                        />
                        <Label htmlFor="field-dimensions">Dimensions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="field-warranty" 
                          checked={requiredFields.includes("warranty")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setRequiredFields([...requiredFields, "warranty"])
                            } else {
                              setRequiredFields(requiredFields.filter(f => f !== "warranty"))
                            }
                          }}
                        />
                        <Label htmlFor="field-warranty">Warranty Information</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Custom Required Field
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attributes" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Attribute Sets</CardTitle>
              <CardDescription>
                Select which attribute groups apply to this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {attributeGroups.map((group) => (
                    <div key={group.id} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`group-${group.id}`} 
                            checked={selectedAttributeGroups.includes(group.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAttributeGroups([...selectedAttributeGroups, group.id])
                              } else {
                                setSelectedAttributeGroups(selectedAttributeGroups.filter(g => g !== group.id))
                              }
                            }}
                          />
                          <Label htmlFor={`group-${group.id}`} className="font-medium">
                            {group.name}
                          </Label>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoveVertical className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="attributes">
                          <AccordionTrigger className="py-2">
                            Attributes ({group.attributes.length})
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-6">
                              {group.attributes.map((attr) => (
                                <div key={attr.id} className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox 
                                      id={`attr-${attr.id}`} 
                                      checked={attr.required}
                                      disabled={!selectedAttributeGroups.includes(group.id)}
                                    />
                                    <Label htmlFor={`attr-${attr.id}`}>
                                      {attr.name}
                                      {attr.unit && <span className="text-muted-foreground ml-1">({attr.unit})</span>}
                                    </Label>
                                  </div>
                                  <Badge variant="outline">{attr.type}</Badge>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Attribute Group
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pricing" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Rules</CardTitle>
              <CardDescription>
                Configure how prices are calculated for this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Default Pricing Rule</Label>
                  <div className="grid gap-4">
                    {pricingRules.map((rule) => (
                      <div 
                        key={rule.id} 
                        className={`
                          flex items-center justify-between p-4 border rounded-md cursor-pointer
                          ${selectedPricingRule === rule.id ? 'border-primary bg-primary/5' : ''}
                        `}
                        onClick={() => setSelectedPricingRule(rule.id)}
                      >
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-muted-foreground">Formula: {rule.formula}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {rule.default && <Badge>Default</Badge>}
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Pricing Rule
                  </Button>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Special Pricing Options</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allow-discounts">Allow Discounts</Label>
                      <Switch id="allow-discounts" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enable promotional discounts for this category
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="min-margin">Enforce Minimum Margin</Label>
                      <Switch id="min-margin" defaultChecked />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input type="number" placeholder="20" className="w-20" />
                      <span>% minimum margin</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="round-prices">Round Prices</Label>
                      <Switch id="round-prices" defaultChecked />
                    </div>
                    <Select defaultValue="nearest">
                      <SelectTrigger>
                        <SelectValue placeholder="Select rounding method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nearest">Nearest $0.99</SelectItem>
                        <SelectItem value="up">Up to nearest $0.99</SelectItem>
                        <SelectItem value="down">Down to nearest $0.99</SelectItem>
                        <SelectItem value="nearest10">Nearest $10</SelectItem>
                        <SelectItem value="nearest100">Nearest $100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="display" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Display Templates</CardTitle>
              <CardDescription>
                Choose how products in this category are displayed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Default Display Template</Label>
                  <div className="grid gap-4">
                    {displayTemplates.map((template) => (
                      <div 
                        key={template.id} 
                        className={`
                          flex items-center justify-between p-4 border rounded-md cursor-pointer
                          ${selectedTemplate === template.id ? 'border-primary bg-primary/5' : ''}
                        `}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">{template.description}</div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Custom Template
                  </Button>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Display Options</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-filters">Show Filters</Label>
                      <Switch id="show-filters" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Display filter options for this category
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-sort">Show Sorting Options</Label>
                      <Switch id="show-sort" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Default Sort Order</Label>
                    <Select defaultValue="featured">
                      <SelectTrigger>
                        <SelectValue placeholder="Select sort order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="name-asc">Name: A to Z</SelectItem>
                        <SelectItem value="name-desc">Name: Z to A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Products Per Page</Label>
                    <Select defaultValue="24">
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of products" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="24">24</SelectItem>
                        <SelectItem value="36">36</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

