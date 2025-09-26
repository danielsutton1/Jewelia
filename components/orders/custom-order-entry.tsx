"use client"

import type React from "react"

import { useState } from "react"
import {
  Pencil,
  Gem,
  ImagePlus,
  FileUp,
  Ruler,
  DollarSign,
  CalendarIcon,
  CreditCard,
  Save,
  Trash2,
  Plus,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FormLabel } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import Image from "next/image"

// Types for our form data
interface CustomOrderFormData {
  designSpecifications: {
    designType: string
    designDescription: string
    referenceItems: string
    specialInstructions: string
  }
  materialRequirements: {
    primaryMetal: string
    metalColor: string
    metalFinish: string
    secondaryMetal: string
    secondaryMetalColor: string
    secondaryMetalFinish: string
    additionalMaterials: string[]
  }
  stoneSelection: StoneItem[]
  inspirationImages: string[]
  designFiles: string[]
  sizeRequirements: {
    ringSize: string
    length: string
    width: string
    height: string
    otherDimensions: string
    adjustable: boolean
  }
  budgetRange: {
    minBudget: number
    maxBudget: number
    flexibility: "strict" | "somewhat flexible" | "very flexible"
  }
  timeline: {
    designApprovalDate: Date | null
    productionStartDate: Date | null
    stoneSettingDate: Date | null
    finishingDate: Date | null
    finalQualityCheckDate: Date | null
    completionDate: Date | null
    deliveryDate: Date | null
  }
  paymentSchedule: {
    depositAmount: number
    depositPercentage: number
    depositType: "percentage" | "fixed"
    installments: PaymentInstallment[]
  }
}

interface StoneItem {
  id: string
  type: string
  shape: string
  size: string
  color: string
  clarity: string
  quantity: number
  notes: string
}

interface PaymentInstallment {
  id: string
  amount: number
  percentage: number
  dueDate: Date | null
  description: string
}

// Sample data for dropdowns
const designTypes = [
  "Ring",
  "Necklace",
  "Bracelet",
  "Earrings",
  "Pendant",
  "Brooch",
  "Cufflinks",
  "Tiara",
  "Watch",
  "Other",
]

const metalTypes = [
  "14K Gold",
  "18K Gold",
  "Platinum",
  "Sterling Silver",
  "Palladium",
  "Titanium",
  "White Gold",
  "Rose Gold",
]

const metalColors = ["Yellow", "White", "Rose", "Black", "Two-tone", "Mixed"]

const metalFinishes = ["Polished", "Matte", "Brushed", "Hammered", "Satin", "Florentine", "Sandblasted", "Antique"]

const stoneTypes = [
  "Diamond",
  "Sapphire",
  "Ruby",
  "Emerald",
  "Amethyst",
  "Aquamarine",
  "Topaz",
  "Opal",
  "Pearl",
  "Garnet",
  "Citrine",
  "Peridot",
  "Tanzanite",
  "Tourmaline",
  "Other",
]

const stoneShapes = [
  "Round",
  "Princess",
  "Cushion",
  "Oval",
  "Emerald",
  "Pear",
  "Marquise",
  "Radiant",
  "Asscher",
  "Heart",
  "Baguette",
  "Trillion",
  "Other",
]

const stoneClarity = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3", "N/A"]

// Sample inspiration images
const sampleInspirationImages = [
  "/placeholder-j941g.png",
  "/placeholder-o0yej.png",
  "/placeholder-w6sgs.png",
]

// Sample design files
const sampleDesignFiles = [
  { name: "Initial_Sketch.jpg", type: "image", url: "/placeholder-t3b36.png" },
  { name: "CAD_Model_v1.obj", type: "3d", url: "/placeholder-3vo1x.png" },
  { name: "Dimensions.pdf", type: "document", url: "/placeholder.svg?height=100&width=100&query=technical drawing" },
]

export function CustomOrderEntry() {
  // Initialize form state with default values
  const [formData, setFormData] = useState<CustomOrderFormData>({
    designSpecifications: {
      designType: "",
      designDescription: "",
      referenceItems: "",
      specialInstructions: "",
    },
    materialRequirements: {
      primaryMetal: "",
      metalColor: "",
      metalFinish: "",
      secondaryMetal: "",
      secondaryMetalColor: "",
      secondaryMetalFinish: "",
      additionalMaterials: [],
    },
    stoneSelection: [],
    inspirationImages: [],
    designFiles: [],
    sizeRequirements: {
      ringSize: "",
      length: "",
      width: "",
      height: "",
      otherDimensions: "",
      adjustable: false,
    },
    budgetRange: {
      minBudget: 1000,
      maxBudget: 5000,
      flexibility: "somewhat flexible",
    },
    timeline: {
      designApprovalDate: null,
      productionStartDate: null,
      stoneSettingDate: null,
      finishingDate: null,
      finalQualityCheckDate: null,
      completionDate: null,
      deliveryDate: null,
    },
    paymentSchedule: {
      depositAmount: 0,
      depositPercentage: 30,
      depositType: "percentage",
      installments: [],
    },
  })

  // State for active tab
  const [activeTab, setActiveTab] = useState("design")

  // State for new stone being added
  const [newStone, setNewStone] = useState<Omit<StoneItem, "id">>({
    type: "",
    shape: "",
    size: "",
    color: "",
    clarity: "",
    quantity: 1,
    notes: "",
  })

  // State for new payment installment
  const [newInstallment, setNewInstallment] = useState<Omit<PaymentInstallment, "id">>({
    amount: 0,
    percentage: 0,
    dueDate: null,
    description: "",
  })

  // For demo purposes, let's add some sample data
  const addSampleData = () => {
    setFormData({
      ...formData,
      designSpecifications: {
        designType: "Ring",
        designDescription: "Art deco inspired engagement ring with a center diamond and sapphire accents.",
        referenceItems: "Similar to the Gatsby collection, but with a more modern twist.",
        specialInstructions: "Client prefers a low profile setting for everyday wear.",
      },
      materialRequirements: {
        primaryMetal: "Platinum",
        metalColor: "White",
        metalFinish: "Polished",
        secondaryMetal: "18K Gold",
        secondaryMetalColor: "Yellow",
        secondaryMetalFinish: "Matte",
        additionalMaterials: ["Milgrain detailing", "Filigree work"],
      },
      stoneSelection: [
        {
          id: "stone-1",
          type: "Diamond",
          shape: "Round",
          size: "1.5 ct",
          color: "F",
          clarity: "VS1",
          quantity: 1,
          notes: "Center stone, must be GIA certified",
        },
        {
          id: "stone-2",
          type: "Sapphire",
          shape: "Baguette",
          size: "0.15 ct",
          color: "Blue",
          clarity: "N/A",
          quantity: 6,
          notes: "Side stones, matching color important",
        },
      ],
      inspirationImages: sampleInspirationImages,
      designFiles: sampleDesignFiles.map((file) => file.url),
      sizeRequirements: {
        ringSize: "6.5",
        length: "",
        width: "",
        height: "",
        otherDimensions: "Comfort fit band",
        adjustable: false,
      },
      budgetRange: {
        minBudget: 5000,
        maxBudget: 7500,
        flexibility: "somewhat flexible",
      },
      timeline: {
        designApprovalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        productionStartDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        stoneSettingDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        finishingDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        finalQualityCheckDate: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
        completionDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        deliveryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
      paymentSchedule: {
        depositAmount: 2250,
        depositPercentage: 30,
        depositType: "percentage",
        installments: [
          {
            id: "payment-1",
            amount: 2250,
            percentage: 30,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            description: "Upon design approval",
          },
          {
            id: "payment-2",
            amount: 3000,
            percentage: 40,
            dueDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
            description: "Upon completion before delivery",
          },
        ],
      },
    })
  }

  // Handle form field changes
  const handleInputChange = (section: keyof CustomOrderFormData, field: string, value: any) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    })
  }

  // Handle nested form field changes
  const handleNestedInputChange = (
    section: keyof CustomOrderFormData,
    nestedField: string,
    field: string,
    value: any,
  ) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [nestedField]: {
          ...(formData[section] as any)[nestedField],
          [field]: value,
        },
      },
    })
  }

  // Add a new stone to the selection
  const addStone = () => {
    const newStoneItem: StoneItem = {
      ...newStone,
      id: `stone-${Date.now()}`,
    }

    setFormData({
      ...formData,
      stoneSelection: [...formData.stoneSelection, newStoneItem],
    })

    // Reset the new stone form
    setNewStone({
      type: "",
      shape: "",
      size: "",
      color: "",
      clarity: "",
      quantity: 1,
      notes: "",
    })
  }

  // Remove a stone from the selection
  const removeStone = (stoneId: string) => {
    setFormData({
      ...formData,
      stoneSelection: formData.stoneSelection.filter((stone) => stone.id !== stoneId),
    })
  }

  // Add a new payment installment
  const addInstallment = () => {
    const newInstallmentItem: PaymentInstallment = {
      ...newInstallment,
      id: `payment-${Date.now()}`,
    }

    setFormData({
      ...formData,
      paymentSchedule: {
        ...formData.paymentSchedule,
        installments: [...formData.paymentSchedule.installments, newInstallmentItem],
      },
    })

    // Reset the new installment form
    setNewInstallment({
      amount: 0,
      percentage: 0,
      dueDate: null,
      description: "",
    })
  }

  // Remove a payment installment
  const removeInstallment = (installmentId: string) => {
    setFormData({
      ...formData,
      paymentSchedule: {
        ...formData.paymentSchedule,
        installments: formData.paymentSchedule.installments.filter((installment) => installment.id !== installmentId),
      },
    })
  }

  // Calculate total budget
  const totalBudget = formData.budgetRange.maxBudget

  // Calculate deposit amount based on type
  const calculateDeposit = () => {
    if (formData.paymentSchedule.depositType === "percentage") {
      return (formData.budgetRange.maxBudget * formData.paymentSchedule.depositPercentage) / 100
    } else {
      return formData.paymentSchedule.depositAmount
    }
  }

  // Calculate remaining balance after deposit
  const remainingBalance = totalBudget - calculateDeposit()

  // Calculate total of all installments
  const totalInstallments = formData.paymentSchedule.installments.reduce(
    (sum, installment) => sum + installment.amount,
    0,
  )

  // Calculate final balance
  const finalBalance = remainingBalance - totalInstallments

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Here you would typically send the data to your backend
    alert("Custom order saved successfully!")
  }

  // Handle adding an inspiration image (in a real app, this would be file upload)
  const addInspirationImage = () => {
    const newImage = "/placeholder.svg?height=200&width=200&query=custom jewelry design"
    setFormData({
      ...formData,
      inspirationImages: [...formData.inspirationImages, newImage],
    })
  }

  // Handle removing an inspiration image
  const removeInspirationImage = (index: number) => {
    const updatedImages = [...formData.inspirationImages]
    updatedImages.splice(index, 1)
    setFormData({
      ...formData,
      inspirationImages: updatedImages,
    })
  }

  // Handle adding a design file (in a real app, this would be file upload)
  const addDesignFile = () => {
    const newFile = "/placeholder.svg?height=100&width=100&query=jewelry technical drawing"
    setFormData({
      ...formData,
      designFiles: [...formData.designFiles, newFile],
    })
  }

  // Handle removing a design file
  const removeDesignFile = (index: number) => {
    const updatedFiles = [...formData.designFiles]
    updatedFiles.splice(index, 1)
    setFormData({
      ...formData,
      designFiles: updatedFiles,
    })
  }

  // Update deposit amount when percentage changes
  const updateDepositFromPercentage = (percentage: number) => {
    const amount = (formData.budgetRange.maxBudget * percentage) / 100
    setFormData({
      ...formData,
      paymentSchedule: {
        ...formData.paymentSchedule,
        depositPercentage: percentage,
        depositAmount: amount,
      },
    })
  }

  // Update deposit percentage when amount changes
  const updateDepositFromAmount = (amount: number) => {
    const percentage = (amount / formData.budgetRange.maxBudget) * 100
    setFormData({
      ...formData,
      paymentSchedule: {
        ...formData.paymentSchedule,
        depositAmount: amount,
        depositPercentage: percentage,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Special Order Entry</h1>
          <p className="text-muted-foreground">Create a new custom jewelry order</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={addSampleData}>
            Load Sample Data
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            Save Order
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="design" className="flex items-center gap-1">
            <Pencil className="h-4 w-4" />
            <span>Design</span>
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex items-center gap-1">
            <Gem className="h-4 w-4" />
            <span>Materials</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-1">
            <Ruler className="h-4 w-4" />
            <span>Details</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>Timeline & Payment</span>
          </TabsTrigger>
        </TabsList>

        {/* Design Specifications Tab */}
        <TabsContent value="design" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5" />
                Design Specifications
              </CardTitle>
              <CardDescription>Provide detailed information about the design requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <FormLabel>Design Type</FormLabel>
                  <Select
                    value={formData.designSpecifications.designType}
                    onValueChange={(value) => handleInputChange("designSpecifications", "designType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.designSpecifications.designType || "Select design type"} />
                    </SelectTrigger>
                    <SelectContent>
                      {designTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <FormLabel>Reference Items</FormLabel>
                  <Input
                    placeholder="Similar items or collections"
                    value={formData.designSpecifications.referenceItems}
                    onChange={(e) => handleInputChange("designSpecifications", "referenceItems", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel>Design Description</FormLabel>
                <Textarea
                  placeholder="Detailed description of the desired design"
                  rows={4}
                  value={formData.designSpecifications.designDescription}
                  onChange={(e) => handleInputChange("designSpecifications", "designDescription", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Special Instructions</FormLabel>
                <Textarea
                  placeholder="Any special requirements or considerations"
                  rows={3}
                  value={formData.designSpecifications.specialInstructions}
                  onChange={(e) => handleInputChange("designSpecifications", "specialInstructions", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImagePlus className="h-5 w-5" />
                Inspiration Images
              </CardTitle>
              <CardDescription>Upload images that inspire the design</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {formData.inspirationImages.map((image, index) => (
                  <div key={index} className="relative rounded-md border">
                    <div className="relative aspect-square">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Inspiration image ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 rounded-full"
                      onClick={() => removeInspirationImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div
                  className="flex aspect-square flex-col items-center justify-center rounded-md border-2 border-dashed p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={addInspirationImage}
                >
                  <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Add Inspiration Image</p>
                  <p className="text-xs text-muted-foreground">Upload JPG, PNG or GIF</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                Design Files
              </CardTitle>
              <CardDescription>Upload sketches, CAD files, or other design documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {formData.designFiles.map((file, index) => (
                    <div key={index} className="relative flex items-center rounded-md border p-2">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={file || "/placeholder.svg"}
                          alt={`Design file ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-3 flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">
                          {sampleDesignFiles[index % sampleDesignFiles.length].name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sampleDesignFiles[index % sampleDesignFiles.length].type}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 h-8 w-8"
                        onClick={() => removeDesignFile(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div
                  className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 hover:bg-muted/50 cursor-pointer"
                  onClick={addDesignFile}
                >
                  <FileUp className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Upload Design Files</p>
                  <p className="text-xs text-muted-foreground">
                    Drag and drop or click to upload sketches, CAD files, or other design documents
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gem className="h-5 w-5" />
                Material Requirements
              </CardTitle>
              <CardDescription>Specify the metals and materials to be used</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <FormLabel>Primary Metal</FormLabel>
                  <Select
                    value={formData.materialRequirements.primaryMetal}
                    onValueChange={(value) => handleInputChange("materialRequirements", "primaryMetal", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.materialRequirements.primaryMetal || "Select metal"} />
                    </SelectTrigger>
                    <SelectContent>
                      {metalTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <FormLabel>Metal Color</FormLabel>
                  <Select
                    value={formData.materialRequirements.metalColor}
                    onValueChange={(value) => handleInputChange("materialRequirements", "metalColor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.materialRequirements.metalColor || "Select color"} />
                    </SelectTrigger>
                    <SelectContent>
                      {metalColors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <FormLabel>Metal Finish</FormLabel>
                  <Select
                    value={formData.materialRequirements.metalFinish}
                    onValueChange={(value) => handleInputChange("materialRequirements", "metalFinish", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.materialRequirements.metalFinish || "Select finish"} />
                    </SelectTrigger>
                    <SelectContent>
                      {metalFinishes.map((finish) => (
                        <SelectItem key={finish} value={finish}>
                          {finish}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 text-sm font-medium">Secondary Metal (Optional)</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <FormLabel>Secondary Metal</FormLabel>
                    <Select
                      value={formData.materialRequirements.secondaryMetal}
                      onValueChange={(value) => handleInputChange("materialRequirements", "secondaryMetal", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.materialRequirements.secondaryMetal || "Select metal"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {metalTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Metal Color</FormLabel>
                    <Select
                      value={formData.materialRequirements.secondaryMetalColor}
                      onValueChange={(value) => handleInputChange("materialRequirements", "secondaryMetalColor", value)}
                      disabled={!formData.materialRequirements.secondaryMetal}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={formData.materialRequirements.secondaryMetalColor || "Select color"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {metalColors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Metal Finish</FormLabel>
                    <Select
                      value={formData.materialRequirements.secondaryMetalFinish}
                      onValueChange={(value) =>
                        handleInputChange("materialRequirements", "secondaryMetalFinish", value)
                      }
                      disabled={!formData.materialRequirements.secondaryMetal}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={formData.materialRequirements.secondaryMetalFinish || "Select finish"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {metalFinishes.map((finish) => (
                          <SelectItem key={finish} value={finish}>
                            {finish}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel>Additional Materials or Techniques</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {formData.materialRequirements.additionalMaterials.map((material, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1 px-3 py-1">
                      {material}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1 h-4 w-4 p-0"
                        onClick={() => {
                          const updatedMaterials = [...formData.materialRequirements.additionalMaterials]
                          updatedMaterials.splice(index, 1)
                          handleInputChange("materialRequirements", "additionalMaterials", updatedMaterials)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  <Input
                    placeholder="Add material or technique"
                    className="w-48"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value) {
                        e.preventDefault()
                        const newMaterial = e.currentTarget.value
                        handleInputChange("materialRequirements", "additionalMaterials", [
                          ...formData.materialRequirements.additionalMaterials,
                          newMaterial,
                        ])
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gem className="h-5 w-5" />
                Stone Selection
              </CardTitle>
              <CardDescription>Specify the gemstones to be used in the piece</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.stoneSelection.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Selected Stones</h4>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-7 gap-4 border-b bg-muted/50 p-3 text-sm font-medium">
                      <div>Type</div>
                      <div>Shape</div>
                      <div>Size</div>
                      <div>Color</div>
                      <div>Clarity</div>
                      <div>Quantity</div>
                      <div></div>
                    </div>
                    {formData.stoneSelection.map((stone) => (
                      <div key={stone.id} className="grid grid-cols-7 gap-4 border-b p-3 text-sm">
                        <div>{stone.type}</div>
                        <div>{stone.shape}</div>
                        <div>{stone.size}</div>
                        <div>{stone.color}</div>
                        <div>{stone.clarity}</div>
                        <div>{stone.quantity}</div>
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeStone(stone.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="add-stone">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add New Stone
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <FormLabel>Stone Type</FormLabel>
                          <Select
                            value={newStone.type}
                            onValueChange={(value) => setNewStone({ ...newStone, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={newStone.type || "Select type"} />
                            </SelectTrigger>
                            <SelectContent>
                              {stoneTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <FormLabel>Stone Shape</FormLabel>
                          <Select
                            value={newStone.shape}
                            onValueChange={(value) => setNewStone({ ...newStone, shape: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={newStone.shape || "Select shape"} />
                            </SelectTrigger>
                            <SelectContent>
                              {stoneShapes.map((shape) => (
                                <SelectItem key={shape} value={shape}>
                                  {shape}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <FormLabel>Size</FormLabel>
                          <Input
                            placeholder="e.g., 1.5 ct or 6mm"
                            value={newStone.size}
                            onChange={(e) => setNewStone({ ...newStone, size: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <FormLabel>Color</FormLabel>
                          <Input
                            placeholder="e.g., F or Blue"
                            value={newStone.color}
                            onChange={(e) => setNewStone({ ...newStone, color: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <FormLabel>Clarity</FormLabel>
                          <Select
                            value={newStone.clarity}
                            onValueChange={(value) => setNewStone({ ...newStone, clarity: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select clarity" />
                            </SelectTrigger>
                            <SelectContent>
                              {stoneClarity.map((clarity) => (
                                <SelectItem key={clarity} value={clarity}>
                                  {clarity}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <FormLabel>Quantity</FormLabel>
                          <Input
                            type="number"
                            min="1"
                            value={newStone.quantity}
                            onChange={(e) =>
                              setNewStone({ ...newStone, quantity: Number.parseInt(e.target.value) || 1 })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <FormLabel>Notes</FormLabel>
                        <Textarea
                          placeholder="Additional notes about the stone"
                          value={newStone.notes}
                          onChange={(e) => setNewStone({ ...newStone, notes: e.target.value })}
                        />
                      </div>

                      <Button onClick={addStone} disabled={!newStone.type || !newStone.shape || !newStone.size}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Stone
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Size Requirements
              </CardTitle>
              <CardDescription>Specify the dimensions and sizing details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {formData.designSpecifications.designType === "Ring" && (
                  <div className="space-y-2">
                    <FormLabel>Ring Size</FormLabel>
                    <Input
                      placeholder="e.g., 6.5 or 52mm"
                      value={formData.sizeRequirements.ringSize}
                      onChange={(e) => handleInputChange("sizeRequirements", "ringSize", e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <FormLabel>Length</FormLabel>
                  <Input
                    placeholder="Length in mm"
                    value={formData.sizeRequirements.length}
                    onChange={(e) => handleInputChange("sizeRequirements", "length", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel>Width</FormLabel>
                  <Input
                    placeholder="Width in mm"
                    value={formData.sizeRequirements.width}
                    onChange={(e) => handleInputChange("sizeRequirements", "width", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel>Height</FormLabel>
                  <Input
                    placeholder="Height in mm"
                    value={formData.sizeRequirements.height}
                    onChange={(e) => handleInputChange("sizeRequirements", "height", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel>Other Dimensions or Sizing Notes</FormLabel>
                <Textarea
                  placeholder="Any additional sizing information"
                  value={formData.sizeRequirements.otherDimensions}
                  onChange={(e) => handleInputChange("sizeRequirements", "otherDimensions", e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="adjustable"
                  checked={formData.sizeRequirements.adjustable}
                  onCheckedChange={(checked) => handleInputChange("sizeRequirements", "adjustable", checked)}
                />
                <label
                  htmlFor="adjustable"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Item should be adjustable/resizable
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget Range
              </CardTitle>
              <CardDescription>Specify the budget constraints for this custom order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <FormLabel>Minimum Budget ($)</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.budgetRange.minBudget}
                    onChange={(e) =>
                      handleInputChange("budgetRange", "minBudget", Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel>Maximum Budget ($)</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.budgetRange.maxBudget}
                    onChange={(e) =>
                      handleInputChange("budgetRange", "maxBudget", Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel>Budget Flexibility</FormLabel>
                <RadioGroup
                  value={formData.budgetRange.flexibility}
                  onValueChange={(value) => handleInputChange("budgetRange", "flexibility", value as any)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="strict" id="flexibility-strict" />
                    <label htmlFor="flexibility-strict">Strict budget - cannot exceed maximum</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="somewhat flexible" id="flexibility-somewhat" />
                    <label htmlFor="flexibility-somewhat">Somewhat flexible - can exceed by 10-15% for quality</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="very flexible" id="flexibility-very" />
                    <label htmlFor="flexibility-very">Very flexible - quality is priority over budget</label>
                  </div>
                </RadioGroup>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h4 className="mb-2 font-medium">Budget Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Target Budget Range:</span>
                    <span>
                      ${formData.budgetRange.minBudget.toLocaleString()} - $
                      {formData.budgetRange.maxBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flexibility:</span>
                    <span className="capitalize">{formData.budgetRange.flexibility}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline & Payment Tab */}
        <TabsContent value="timeline" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Timeline Setup
              </CardTitle>
              <CardDescription>Set up the production timeline and milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <FormLabel>Design Approval Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.timeline.designApprovalDate ? (
                            format(formData.timeline.designApprovalDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.timeline.designApprovalDate || undefined}
                          onSelect={(date) => handleInputChange("timeline", "designApprovalDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Production Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.timeline.productionStartDate ? (
                            format(formData.timeline.productionStartDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.timeline.productionStartDate || undefined}
                          onSelect={(date) => handleInputChange("timeline", "productionStartDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <FormLabel>Stone Setting Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.timeline.stoneSettingDate ? (
                            format(formData.timeline.stoneSettingDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.timeline.stoneSettingDate || undefined}
                          onSelect={(date) => handleInputChange("timeline", "stoneSettingDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Finishing Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.timeline.finishingDate ? (
                            format(formData.timeline.finishingDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.timeline.finishingDate || undefined}
                          onSelect={(date) => handleInputChange("timeline", "finishingDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <FormLabel>Final Quality Check Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.timeline.finalQualityCheckDate ? (
                            format(formData.timeline.finalQualityCheckDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.timeline.finalQualityCheckDate || undefined}
                          onSelect={(date) => handleInputChange("timeline", "finalQualityCheckDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Completion Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.timeline.completionDate ? (
                            format(formData.timeline.completionDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.timeline.completionDate || undefined}
                          onSelect={(date) => handleInputChange("timeline", "completionDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel>Delivery Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.timeline.deliveryDate ? (
                          format(formData.timeline.deliveryDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.timeline.deliveryDate || undefined}
                        onSelect={(date) => handleInputChange("timeline", "deliveryDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Timeline Visualization */}
              {Object.values(formData.timeline).some((date) => date !== null) && (
                <div className="mt-6 rounded-md border p-4">
                  <h4 className="mb-4 font-medium">Timeline Visualization</h4>
                  <div className="relative">
                    <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-muted"></div>

                    {Object.entries(formData.timeline)
                      .filter(([_, date]) => date !== null)
                      .sort((a, b) => new Date(a[1] as Date).getTime() - new Date(b[1] as Date).getTime())
                      .map(([key, date], index, array) => {
                        const position = (index / (array.length - 1)) * 100
                        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())

                        return (
                          <div key={key} className="absolute -translate-x-1/2" style={{ left: `${position}%` }}>
                            <div className="flex flex-col items-center">
                              <div className="z-10 h-4 w-4 rounded-full bg-primary"></div>
                              <div className="mt-2 text-center">
                                <p className="text-xs font-medium">{label}</p>
                                <p className="text-xs text-muted-foreground">{format(date as Date, "MMM d")}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Deposit and Payment Schedule
              </CardTitle>
              <CardDescription>Set up the payment terms and schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Initial Deposit</h4>

                <RadioGroup
                  value={formData.paymentSchedule.depositType}
                  onValueChange={(value) =>
                    handleInputChange("paymentSchedule", "depositType", value as "percentage" | "fixed")
                  }
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="deposit-percentage" />
                    <div className="flex flex-1 items-center gap-2">
                      <label htmlFor="deposit-percentage">Percentage of total:</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        className="w-20"
                        value={formData.paymentSchedule.depositPercentage}
                        onChange={(e) => updateDepositFromPercentage(Number.parseInt(e.target.value) || 0)}
                        disabled={formData.paymentSchedule.depositType !== "percentage"}
                      />
                      <span>%</span>
                      <span className="text-sm text-muted-foreground">
                        ($
                        {(
                          (formData.budgetRange.maxBudget * formData.paymentSchedule.depositPercentage) /
                          100
                        ).toLocaleString()}
                        )
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="deposit-fixed" />
                    <div className="flex flex-1 items-center gap-2">
                      <label htmlFor="deposit-fixed">Fixed amount:</label>
                      <span>$</span>
                      <Input
                        type="number"
                        min="0"
                        className="w-32"
                        value={formData.paymentSchedule.depositAmount}
                        onChange={(e) => updateDepositFromAmount(Number.parseInt(e.target.value) || 0)}
                        disabled={formData.paymentSchedule.depositType !== "fixed"}
                      />
                      <span className="text-sm text-muted-foreground">
                        ({((formData.paymentSchedule.depositAmount / formData.budgetRange.maxBudget) * 100).toFixed(1)}%
                        of total)
                      </span>
                    </div>
                  </div>
                </RadioGroup>

                <Separator className="my-4" />

                <h4 className="font-medium">Payment Installments</h4>

                {formData.paymentSchedule.installments.length > 0 && (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 gap-4 border-b bg-muted/50 p-3 text-sm font-medium">
                      <div>Amount</div>
                      <div>Due Date</div>
                      <div>Description</div>
                      <div></div>
                    </div>
                    {formData.paymentSchedule.installments.map((installment) => (
                      <div key={installment.id} className="grid grid-cols-4 gap-4 border-b p-3 text-sm">
                        <div>
                          ${installment.amount.toLocaleString()} ({installment.percentage.toFixed(1)}%)
                        </div>
                        <div>{installment.dueDate ? format(installment.dueDate, "MMM d, yyyy") : "Not set"}</div>
                        <div>{installment.description}</div>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeInstallment(installment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="add-installment">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Payment Installment
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <FormLabel>Amount ($)</FormLabel>
                            <Input
                              type="number"
                              min="0"
                              value={newInstallment.amount}
                              onChange={(e) => {
                                const amount = Number.parseInt(e.target.value) || 0
                                const percentage = (amount / formData.budgetRange.maxBudget) * 100
                                setNewInstallment({
                                  ...newInstallment,
                                  amount: amount,
                                  percentage: percentage,
                                })
                              }}
                            />
                            <p className="text-xs text-muted-foreground">
                              {newInstallment.percentage.toFixed(1)}% of total budget
                            </p>
                          </div>

                          <div className="space-y-2">
                            <FormLabel>Due Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {newInstallment.dueDate ? (
                                    format(newInstallment.dueDate, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={newInstallment.dueDate || undefined}
                                  onSelect={(date) => setNewInstallment({ ...newInstallment, dueDate: date || null })}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <FormLabel>Description</FormLabel>
                          <Input
                            placeholder="e.g., Upon stone setting completion"
                            value={newInstallment.description}
                            onChange={(e) => setNewInstallment({ ...newInstallment, description: e.target.value })}
                          />
                        </div>

                        <Button onClick={addInstallment} disabled={!newInstallment.amount || !newInstallment.dueDate}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Installment
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-4 rounded-md bg-muted p-4">
                  <h4 className="mb-2 font-medium">Payment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Budget:</span>
                      <span>${totalBudget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Initial Deposit:</span>
                      <span>
                        ${calculateDeposit().toLocaleString()} ({formData.paymentSchedule.depositPercentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining After Deposit:</span>
                      <span>${remainingBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Installments Total:</span>
                      <span>${totalInstallments.toLocaleString()}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Final Balance Due:</span>
                      <span>${finalBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSubmit}>
          <Save className="mr-2 h-4 w-4" />
          Save Custom Order
        </Button>
      </div>
    </div>
  )
}
