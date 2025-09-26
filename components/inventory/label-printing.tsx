"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { useReactToPrint } from "react-to-print"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { QRCodeSVG } from "qrcode.react"
import Barcode from "react-barcode"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Edit,
  FileText,
  Grid,
  Layers,
  Layout,
  Minus,
  Plus,
  Printer,
  Save,
  Tag,
  TestTube,
} from "lucide-react"

// Define the form schema
const formSchema = z.object({
  templateId: z.string(),
  title: z.string().optional(),
  showSku: z.boolean().default(true),
  showName: z.boolean().default(true),
  showPrice: z.boolean().default(true),
  showBarcode: z.boolean().default(true),
  showQrCode: z.boolean().default(false),
  showLogo: z.boolean().default(false),
  showMetal: z.boolean().default(true),
  showStone: z.boolean().default(true),
  showWeight: z.boolean().default(true),
  customText: z.string().optional(),
  fontSize: z.number().min(6).max(24).default(10),
  printerName: z.string().optional(),
  paperType: z.string().optional(),
  alignment: z.enum(["left", "center", "right"]).default("center"),
  logoPosition: z.enum(["top", "bottom", "none"]).default("top"),
})

// Template types
const templates = [
  {
    id: "price-tag-small",
    name: "Price Tag (Small)",
    width: 50,
    height: 25,
    unit: "mm",
    description: "Small jewelry price tag (50mm × 25mm)",
    icon: <Tag className="h-4 w-4" />,
  },
  {
    id: "price-tag-medium",
    name: "Price Tag (Medium)",
    width: 70,
    height: 40,
    unit: "mm",
    description: "Medium jewelry price tag (70mm × 40mm)",
    icon: <Tag className="h-4 w-4" />,
  },
  {
    id: "showcase-label",
    name: "Showcase Label",
    width: 90,
    height: 50,
    unit: "mm",
    description: "Display label for showcases (90mm × 50mm)",
    icon: <Layout className="h-4 w-4" />,
  },
  {
    id: "storage-label",
    name: "Storage Label",
    width: 100,
    height: 60,
    unit: "mm",
    description: "Label for storage boxes (100mm × 60mm)",
    icon: <Layers className="h-4 w-4" />,
  },
  {
    id: "certification-tag",
    name: "Certification Tag",
    width: 120,
    height: 80,
    unit: "mm",
    description: "Tag for certification details (120mm × 80mm)",
    icon: <FileText className="h-4 w-4" />,
  },
]

// Sample inventory items
const sampleItems = [
  {
    id: 1,
    name: "Diamond Solitaire Ring",
    sku: "R-DS-001",
    price: 2499.99,
    image: "/sparkling-diamond-ring.png",
    category: "Rings",
    metal: "White Gold",
    purity: "18K",
    stone: "Diamond",
    weight: 4.2,
    selected: false,
    quantity: 1,
  },
  {
    id: 2,
    name: "Sapphire Pendant Necklace",
    sku: "N-SP-002",
    price: 1299.99,
    image: "/sapphire-pendant.png",
    category: "Necklaces",
    metal: "Yellow Gold",
    purity: "14K",
    stone: "Sapphire",
    weight: 6.8,
    selected: false,
    quantity: 1,
  },
  {
    id: 3,
    name: "Pearl Stud Earrings",
    sku: "E-PS-003",
    price: 499.99,
    image: "/pearl-earrings.png",
    category: "Earrings",
    metal: "Silver",
    purity: "925",
    stone: "Pearl",
    weight: 2.4,
    selected: false,
    quantity: 1,
  },
  {
    id: 4,
    name: "Gold Tennis Bracelet",
    sku: "B-GT-004",
    price: 3499.99,
    image: "/placeholder-0ylpa.png",
    category: "Bracelets",
    metal: "Yellow Gold",
    purity: "18K",
    stone: "Diamond",
    weight: 12.6,
    selected: false,
    quantity: 1,
  },
  {
    id: 5,
    name: "Emerald Cut Ring",
    sku: "R-EC-005",
    price: 4299.99,
    image: "/placeholder-4reo5.png",
    category: "Rings",
    metal: "Platinum",
    purity: "950",
    stone: "Emerald",
    weight: 8.3,
    selected: false,
    quantity: 1,
  },
]

// Sample printers
const printers = [
  { id: "printer1", name: "Office Printer (HP LaserJet)" },
  { id: "printer2", name: "Label Printer (Dymo LabelWriter)" },
  { id: "printer3", name: "Thermal Printer (Zebra ZD410)" },
]

// Sample paper types
const paperTypes = [
  { id: "paper1", name: "Standard Labels (Avery)" },
  { id: "paper2", name: "Thermal Labels" },
  { id: "paper3", name: "Glossy Paper" },
  { id: "paper4", name: "Cardstock" },
]

export function LabelPrinting() {
  const [activeTab, setActiveTab] = useState("designer")
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [previewScale, setPreviewScale] = useState(1)
  const [showGuides, setShowGuides] = useState(false)
  const [items, setItems] = useState(sampleItems)
  const [selectedItem, setSelectedItem] = useState(sampleItems[0])
  const [showTestPrintDialog, setShowTestPrintDialog] = useState(false)
  const printRef = useRef(null)
  const batchPrintRef = useRef(null)

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      templateId: templates[0].id,
      showSku: true,
      showName: true,
      showPrice: true,
      showBarcode: true,
      showQrCode: false,
      showLogo: false,
      showMetal: true,
      showStone: true,
      showWeight: true,
      customText: "",
      fontSize: 10,
      alignment: "center",
      logoPosition: "top",
    },
  })

  // Watch form values for preview
  const watchedValues = form.watch()

  // Handle template change
  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      form.setValue("templateId", templateId)
    }
  }

  // Handle print
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  })

  // Handle batch print
  const handleBatchPrint = useReactToPrint({
    contentRef: batchPrintRef,
  })

  // Handle item selection for batch printing
  const toggleItemSelection = (id: number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)))
  }

  // Handle quantity change for batch printing
  const updateItemQuantity = (id: number, quantity: number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  // Select all items for batch printing
  const selectAllItems = () => {
    setItems(items.map((item) => ({ ...item, selected: true })))
  }

  // Deselect all items for batch printing
  const deselectAllItems = () => {
    setItems(items.map((item) => ({ ...item, selected: false })))
  }

  // Get selected items for batch printing
  const selectedItems = items.filter((item) => item.selected)

  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data)
    // Here you would typically save the template or proceed to printing
  }

  // Render label preview
  const renderLabelPreview = (item: any, template: any) => {
    const {
      showSku,
      showName,
      showPrice,
      showBarcode,
      showQrCode,
      showLogo,
      showMetal,
      showStone,
      showWeight,
      customText,
      fontSize,
      alignment,
      logoPosition,
    } = watchedValues

    const alignmentClass = alignment === "left" ? "text-left" : alignment === "right" ? "text-right" : "text-center"

    return (
      <div
        className={`relative bg-white border overflow-hidden ${showGuides ? "bg-grid-pattern" : ""}`}
        style={{
          width: `${template.width}mm`,
          height: `${template.height}mm`,
          transform: `scale(${previewScale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Guides */}
        {showGuides && (
          <>
            <div className="absolute inset-0 border border-dashed border-gray-300 pointer-events-none"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px border-l border-dashed border-gray-300 pointer-events-none"></div>
            <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-gray-300 pointer-events-none"></div>
          </>
        )}

        {/* Content */}
        <div className={`p-2 flex flex-col h-full ${alignmentClass}`}>
          {/* Logo at top */}
          {showLogo && logoPosition === "top" && (
            <div className="flex justify-center mb-1">
              <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                <span className="text-xs">LOGO</span>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1">
            {showName && (
              <div className="font-semibold" style={{ fontSize: `${fontSize}px` }}>
                {item.name}
              </div>
            )}

            {showSku && (
              <div className="text-gray-500" style={{ fontSize: `${Math.max(fontSize - 2, 6)}px` }}>
                {item.sku}
              </div>
            )}

            {(showMetal || showStone || showWeight) && (
              <div className="text-gray-600 mt-1" style={{ fontSize: `${Math.max(fontSize - 2, 6)}px` }}>
                {showMetal && `${item.metal} ${item.purity}`}
                {showMetal && showStone && " • "}
                {showStone && item.stone}
                {(showMetal || showStone) && showWeight && " • "}
                {showWeight && `${item.weight}g`}
              </div>
            )}

            {showPrice && (
              <div className="font-bold mt-1" style={{ fontSize: `${fontSize + 2}px` }}>
                ${item.price.toLocaleString()}
              </div>
            )}

            {customText && (
              <div className="mt-1 text-gray-700" style={{ fontSize: `${fontSize - 1}px` }}>
                {customText}
              </div>
            )}
          </div>

          {/* Barcode/QR code */}
          <div className="mt-1">
            {showBarcode && (
              <div className="flex justify-center">
                <Barcode value={item.sku} width={1} height={20} fontSize={8} margin={0} displayValue={false} />
              </div>
            )}

            {showQrCode && (
              <div className="flex justify-center mt-1">
                <QRCodeSVG
                  value={`https://jewelia-crm.com/items/${item.sku}`}
                  size={Math.min(template.width / 4, template.height / 4)}
                  level="L"
                />
              </div>
            )}
          </div>

          {/* Logo at bottom */}
          {showLogo && logoPosition === "bottom" && (
            <div className="flex justify-center mt-1">
              <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                <span className="text-xs">LOGO</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Label Printing</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="designer">
              <Edit className="mr-2 h-4 w-4" />
              Label Designer
            </TabsTrigger>
            <TabsTrigger value="batch">
              <Printer className="mr-2 h-4 w-4" />
              Batch Printing
            </TabsTrigger>
          </TabsList>

          {/* Label Designer Tab */}
          <TabsContent value="designer" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left Column - Template & Settings */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Template</CardTitle>
                    <CardDescription>Select a label template</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      {templates.map((template) => (
                        <Button
                          key={template.id}
                          variant={selectedTemplate.id === template.id ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => handleTemplateChange(template.id)}
                        >
                          {template.icon}
                          <span className="ml-2">{template.name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {template.width}×{template.height}
                            {template.unit}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Item Selection</CardTitle>
                    <CardDescription>Select an item to preview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={selectedItem.id.toString()}
                      onValueChange={(value) => {
                        const item = items.find((i) => i.id.toString() === value)
                        if (item) setSelectedItem(item)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>

              {/* Middle Column - Preview */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Preview</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPreviewScale(Math.max(previewScale - 0.25, 0.5))}
                        disabled={previewScale <= 0.5}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">{Math.round(previewScale * 100)}%</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPreviewScale(Math.min(previewScale + 0.25, 2))}
                        disabled={previewScale >= 2}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => setShowGuides(!showGuides)}>
                              <Grid className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Toggle alignment guides</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <CardDescription>{selectedTemplate.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="flex justify-center p-4 bg-gray-100 rounded-md overflow-auto"
                    style={{ minHeight: "300px" }}
                  >
                    <div ref={printRef}>{renderLabelPreview(selectedItem, selectedTemplate)}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column - Field Selection */}
              <div className="space-y-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Content</CardTitle>
                        <CardDescription>Select fields to display</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name="showSku"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">SKU</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="showName"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">Name</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="showPrice"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">Price</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="showMetal"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">Metal</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="showStone"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">Stone</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="showWeight"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">Weight</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="showBarcode"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">Barcode</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="showQrCode"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">QR Code</FormLabel>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="showLogo"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">Logo</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />

                        <FormField
                          control={form.control}
                          name="customText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Text</FormLabel>
                              <FormControl>
                                <Input placeholder="Add custom text..." {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fontSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Font Size: {field.value}px</FormLabel>
                              <FormControl>
                                <Slider
                                  min={6}
                                  max={24}
                                  step={1}
                                  defaultValue={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="alignment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Text Alignment</FormLabel>
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  variant={field.value === "left" ? "default" : "outline"}
                                  size="icon"
                                  onClick={() => field.onChange("left")}
                                >
                                  <AlignLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant={field.value === "center" ? "default" : "outline"}
                                  size="icon"
                                  onClick={() => field.onChange("center")}
                                >
                                  <AlignCenter className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant={field.value === "right" ? "default" : "outline"}
                                  size="icon"
                                  onClick={() => field.onChange("right")}
                                >
                                  <AlignRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormItem>
                          )}
                        />

                        {watchedValues.showLogo && (
                          <FormField
                            control={form.control}
                            name="logoPosition"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Logo Position</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select position" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="top">Top</SelectItem>
                                    <SelectItem value="bottom">Bottom</SelectItem>
                                    <SelectItem value="none">None</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        )}
                      </CardContent>
                    </Card>

                    <div className="flex justify-between">
                      <Dialog open={showTestPrintDialog} onOpenChange={setShowTestPrintDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <TestTube className="mr-2 h-4 w-4" />
                            Test Print
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Test Print</DialogTitle>
                            <DialogDescription>Print a test page to check alignment and sizing.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="test-printer">Printer</Label>
                                <Select defaultValue="printer1">
                                  <SelectTrigger id="test-printer">
                                    <SelectValue placeholder="Select printer" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {printers.map((printer) => (
                                      <SelectItem key={printer.id} value={printer.id}>
                                        {printer.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="test-paper">Paper Type</Label>
                                <Select defaultValue="paper1">
                                  <SelectTrigger id="test-paper">
                                    <SelectValue placeholder="Select paper" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {paperTypes.map((paper) => (
                                      <SelectItem key={paper.id} value={paper.id}>
                                        {paper.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="alignment-grid" />
                              <Label htmlFor="alignment-grid">Include alignment grid</Label>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowTestPrintDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handlePrint}>
                              <Printer className="mr-2 h-4 w-4" />
                              Print Test
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <div className="space-x-2">
                        <Button variant="outline" type="button">
                          <Save className="mr-2 h-4 w-4" />
                          Save Template
                        </Button>
                        <Button onClick={handlePrint}>
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </TabsContent>

          {/* Batch Printing Tab */}
          <TabsContent value="batch" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left Column - Item Selection */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Item Selection</CardTitle>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={selectAllItems}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={deselectAllItems}>
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <CardDescription>Select items to print labels for</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <span className="sr-only">Select</span>
                          </TableHead>
                          <TableHead className="w-14">Image</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Checkbox checked={item.selected} onCheckedChange={() => toggleItemSelection(item.id)} />
                            </TableCell>
                            <TableCell>
                              <div className="relative h-10 w-10 overflow-hidden rounded-md">
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>${item.price.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Right Column - Print Settings */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Print Settings</CardTitle>
                    <CardDescription>Configure printer and label settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="template">Template</Label>
                      <Select defaultValue={selectedTemplate.id}>
                        <SelectTrigger id="template">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="printer">Printer</Label>
                      <Select defaultValue="printer1">
                        <SelectTrigger id="printer">
                          <SelectValue placeholder="Select printer" />
                        </SelectTrigger>
                        <SelectContent>
                          {printers.map((printer) => (
                            <SelectItem key={printer.id} value={printer.id}>
                              {printer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="paper">Paper Type</Label>
                      <Select defaultValue="paper1">
                        <SelectTrigger id="paper">
                          <SelectValue placeholder="Select paper" />
                        </SelectTrigger>
                        <SelectContent>
                          {paperTypes.map((paper) => (
                            <SelectItem key={paper.id} value={paper.id}>
                              {paper.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="copies">Copies per label</Label>
                        <span className="text-sm">1</span>
                      </div>
                      <Slider id="copies" defaultValue={[1]} min={1} max={10} step={1} />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="print-preview" />
                      <Label htmlFor="print-preview">Show print preview</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Selected Items:</span>
                      <span className="font-medium">{selectedItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Labels:</span>
                      <span className="font-medium">{selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    <div className="pt-4">
                      <Button className="w-full" disabled={selectedItems.length === 0} onClick={handleBatchPrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print {selectedItems.length} Items
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Hidden batch print content */}
            <div className="hidden">
              <div ref={batchPrintRef}>
                <div className="p-4 space-y-4">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="page-break">
                      {Array.from({ length: item.quantity }).map((_, index) => (
                        <div key={index} className="mb-4">
                          {renderLabelPreview(item, selectedTemplate)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
