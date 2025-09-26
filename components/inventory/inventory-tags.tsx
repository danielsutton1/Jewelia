"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Printer, Settings, Download, Plus, Check, X } from "lucide-react"
import Barcode from "react-barcode"
import { toast } from "sonner"

// Interface for inventory items
interface InventoryItem {
  id: string
  name: string
  category: string
  location: string
  lastTagged?: string
  price?: string
  description?: string
  sku?: string
}

// Mock inventory items for batch printing - will be overridden by props
const defaultInventoryItems: InventoryItem[] = [
  {
    id: "SKU-001",
    name: "Diamond Ring",
    category: "Rings",
    location: "Case A-1",
    lastTagged: "2024-03-15",
    price: "$1,999.00",
    description: "14K White Gold",
  },
  {
    id: "SKU-002",
    name: "Sapphire Necklace",
    category: "Necklaces",
    location: "Case B-2",
    lastTagged: "2024-03-10",
    price: "$2,499.00",
    description: "18K Yellow Gold",
  },
  {
    id: "SKU-003",
    name: "Pearl Earrings",
    category: "Earrings",
    location: "Case C-3",
    lastTagged: "2024-03-05",
    price: "$899.00",
    description: "Freshwater Pearls",
  },
]

// Mock tag templates
const tagTemplates = [
  {
    id: "default",
    name: "Default Tag",
    fields: ["sku", "name", "price", "barcode"],
    size: "medium",
    showBarcode: true,
    showPrice: true,
    showDescription: true,
  },
  {
    id: "compact",
    name: "Compact Tag",
    fields: ["sku", "name", "barcode"],
    size: "small",
    showBarcode: true,
    showPrice: false,
    showDescription: false,
  },
  {
    id: "detailed",
    name: "Detailed Tag",
    fields: ["sku", "name", "price", "description", "barcode", "location"],
    size: "large",
    showBarcode: true,
    showPrice: true,
    showDescription: true,
  },
]

// Available fields for tags
const availableFields = [
  { id: "sku", label: "SKU" },
  { id: "name", label: "Item Name" },
  { id: "price", label: "Price" },
  { id: "description", label: "Description" },
  { id: "barcode", label: "Barcode" },
  { id: "location", label: "Location" },
  { id: "category", label: "Category" },
  { id: "metal", label: "Metal Type" },
  { id: "weight", label: "Weight" },
  { id: "dimensions", label: "Dimensions" },
]

interface InventoryTagsProps {
  inventoryItems?: InventoryItem[]
  title?: string
  description?: string
}

export function InventoryTags({ 
  inventoryItems = defaultInventoryItems, 
  title = "Inventory Tags",
  description = "Customize and manage your inventory tags and barcodes"
}: InventoryTagsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(tagTemplates[0])
  const [showPreview, setShowPreview] = useState(false)
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [customFields, setCustomFields] = useState(selectedTemplate.fields)
  const [barcodeType, setBarcodeType] = useState("code128")
  const [tagSize, setTagSize] = useState(selectedTemplate.size)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateFields, setNewTemplateFields] = useState<string[]>([])
  const [previewItem, setPreviewItem] = useState(inventoryItems[0] || defaultInventoryItems[0])

  const handleFieldToggle = (fieldId: string) => {
    setCustomFields(prev => 
      prev.includes(fieldId)
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    )
  }

  const handleTemplateChange = (templateId: string) => {
    const template = tagTemplates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      setCustomFields(template.fields)
    }
  }

  const getBarcodeOptions = () => {
    const baseOptions = {
      width: tagSize === "small" ? 1.5 : tagSize === "medium" ? 2 : 2.5,
      height: tagSize === "small" ? 40 : tagSize === "medium" ? 60 : 80,
      fontSize: tagSize === "small" ? 10 : tagSize === "medium" ? 12 : 14,
      margin: 0,
    }

    switch (barcodeType) {
      case "code128":
        return { ...baseOptions, format: "CODE128" as const }
      case "code39":
        return { ...baseOptions, format: "CODE39" as const }
      case "ean13":
        return { ...baseOptions, format: "EAN13" as const }
      case "upc":
        return { ...baseOptions, format: "UPC" as const }
      default:
        return { ...baseOptions, format: "CODE128" as const }
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? inventoryItems.map(item => item.id) : [])
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked 
        ? [...prev, itemId]
        : prev.filter(id => id !== itemId)
    )
  }

  const handleCreateTemplate = () => {
    if (!newTemplateName) {
      toast.error("Please enter a template name")
      return
    }
    if (newTemplateFields.length === 0) {
      toast.error("Please select at least one field")
      return
    }

    const newTemplate = {
      id: `template-${Date.now()}`,
      name: newTemplateName,
      fields: newTemplateFields,
      size: tagSize,
      showBarcode: newTemplateFields.includes("barcode"),
      showPrice: newTemplateFields.includes("price"),
      showDescription: newTemplateFields.includes("description"),
    }

    tagTemplates.push(newTemplate)
    setSelectedTemplate(newTemplate)
    setCustomFields(newTemplateFields)
    setShowNewTemplate(false)
    setNewTemplateName("")
    setNewTemplateFields([])
    toast.success("Template created successfully")
  }

  const handleExportTags = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to export")
      return
    }

    // In a real application, this would generate and download PDF/print files
    toast.success(`Exporting ${selectedItems.length} tags...`)
  }

  const handlePrintTags = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to print")
      return
    }

    // In a real application, this would send to printer
    toast.success(`Printing ${selectedItems.length} tags...`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Printer className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleExportTags}>
            <Download className="h-4 w-4 mr-2" />
            Export Tags
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Tag Templates</TabsTrigger>
          <TabsTrigger value="customize">Customize Tags</TabsTrigger>
          <TabsTrigger value="batch">Batch Print</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {tagTemplates.map((template) => (
              <Card key={template.id} className={selectedTemplate.id === template.id ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>
                    {template.fields.length} fields • {template.size} size
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant={selectedTemplate.id === template.id ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleTemplateChange(template.id)}
                  >
                    {selectedTemplate.id === template.id ? "Selected" : "Select Template"}
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardHeader>
                <CardTitle>Create New Template</CardTitle>
                <CardDescription>Design a custom tag template</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => setShowNewTemplate(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customize Tag Fields</CardTitle>
              <CardDescription>Select which information appears on your tags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tag Size</Label>
                    <Select 
                      defaultValue={selectedTemplate.size}
                      onValueChange={(value) => setTagSize(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Barcode Type</Label>
                    <Select 
                      defaultValue="code128"
                      onValueChange={(value) => setBarcodeType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select barcode type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="code128">Code 128</SelectItem>
                        <SelectItem value="code39">Code 39</SelectItem>
                        <SelectItem value="ean13">EAN-13</SelectItem>
                        <SelectItem value="upc">UPC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Available Fields</Label>
                  <div className="grid gap-2">
                    {availableFields.map((field) => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Switch
                          id={field.id}
                          checked={customFields.includes(field.id)}
                          onCheckedChange={() => handleFieldToggle(field.id)}
                        />
                        <Label htmlFor={field.id}>{field.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Print Tags</CardTitle>
              <CardDescription>Select items to print tags for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button onClick={handlePrintTags} disabled={selectedItems.length === 0}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Selected ({selectedItems.length})
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.length === inventoryItems.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Tagged</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <input 
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{item.lastTagged}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tag Preview</DialogTitle>
          </DialogHeader>
          <div className="p-4 border rounded-lg bg-white">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-bold">{previewItem.id}</div>
                <div className="text-lg">{previewItem.name}</div>
                <div className="text-sm text-muted-foreground">{previewItem.description}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{previewItem.price}</div>
                <div className="text-sm">{previewItem.location}</div>
              </div>
            </div>
            <div className="flex justify-center bg-white p-2">
              <Barcode
                value={previewItem.id}
                {...getBarcodeOptions()}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input 
                placeholder="Enter template name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tag Size</Label>
              <Select 
                defaultValue="medium"
                onValueChange={(value) => setTagSize(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fields to Include</Label>
              <div className="grid gap-2">
                {availableFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Switch
                      id={`new-${field.id}`}
                      checked={newTemplateFields.includes(field.id)}
                      onCheckedChange={(checked) => {
                        setNewTemplateFields(prev => 
                          checked 
                            ? [...prev, field.id]
                            : prev.filter(f => f !== field.id)
                        )
                      }}
                    />
                    <Label htmlFor={`new-${field.id}`}>{field.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
 