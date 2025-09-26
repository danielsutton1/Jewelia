"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { z } from "zod"
import Image from "next/image"
import { format } from "date-fns"
import {
  Camera,
  Upload,
  Trash2,
  Plus,
  X,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  CalendarClock,
  ShieldCheck,
  Clock,
  ArrowRight,
  ImagePlus,
  Info,
  ShoppingCart,
  CalendarIcon,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { createCustomer, createRepair } from "@/lib/database"

// Define repair types
const repairTypes = [
  { id: "ring-sizing", label: "Ring Sizing", description: "Resize a ring to fit properly" },
  { id: "chain-repair", label: "Chain Repair", description: "Fix broken or damaged chains" },
  { id: "stone-replacement", label: "Stone Replacement", description: "Replace missing or damaged stones" },
  { id: "prong-repair", label: "Prong Repair", description: "Fix or replace damaged prongs" },
  { id: "clasp-repair", label: "Clasp Repair", description: "Repair or replace broken clasps" },
  { id: "polishing", label: "Polishing", description: "Clean and polish to restore shine" },
  { id: "engraving", label: "Engraving", description: "Add or restore engraving" },
  { id: "appraisal", label: "Appraisal", description: "Professional jewelry appraisal" },
  { id: "other", label: "Other", description: "Other repair services" },
]

// Define form schema
const repairOrderSchema = z.object({
  // Customer Information
  customerInfo: z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  }),

  // Item Information
  itemInfo: z.object({
    itemType: z.string().min(1, { message: "Please select an item type" }),
    material: z.string().min(1, { message: "Please select a material" }),
    description: z.string().min(5, { message: "Please provide a brief description" }),
    hasStones: z.boolean(),
    stoneDetails: z.string().optional(),
  }),

  // Damage Information
  damageInfo: z.object({
    description: z.string().min(10, { message: "Please describe the damage in detail" }),
    repairType: z.string().min(1, { message: "Please select a repair type" }),
    urgency: z.enum(["standard", "rush", "emergency"]),
    additionalNotes: z.string().optional(),
  }),

  // Original Purchase Information
  purchaseInfo: z.object({
    purchasedHere: z.boolean().default(false),
    purchaseDate: z.date().optional().nullable(),
    purchaseLocation: z.string().optional(),
    hasReceipt: z.boolean().default(false),
    hasWarranty: z.boolean().default(false),
    warrantyDetails: z.string().optional(),
  }),

  // Insurance Claim
  insuranceClaim: z.object({
    isInsuranceClaim: z.boolean().default(false),
    insuranceCompany: z.string().optional(),
    policyNumber: z.string().optional(),
    claimNumber: z.string().optional(),
    deductible: z.number().optional(),
  }),

  // Liability Waiver
  liabilityWaiver: z.object({
    accepted: z.boolean().default(false),
    signature: z.string().optional(),
    date: z.date().optional(),
  }),
})

type RepairOrderFormValues = z.infer<typeof repairOrderSchema>

interface EstimateDetails {
  diagnosisNotes: string
  parts: Array<{ name: string; cost: number }>
  laborHours: number
  laborRate: number
  additionalFees: Array<{ name: string; cost: number }>
  estimatedCompletionDate: Date | undefined
  approved: boolean
  approvalDate: Date | undefined
  approvalSignature: string
}

export function RepairOrderIntake({
  mode = "create",
  initialRepair,
  onSubmit: onSubmitProp
}: {
  mode?: "create" | "edit";
  initialRepair?: RepairOrderFormValues;
  onSubmit?: SubmitHandler<RepairOrderFormValues>;
} = {}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("intake")
  const [itemPhotos, setItemPhotos] = useState<string[]>([])
  const [damagePhotos, setDamagePhotos] = useState<string[]>([])
  const [estimateDetails, setEstimateDetails] = useState<EstimateDetails>({
    diagnosisNotes: "",
    parts: [],
    laborHours: 1,
    laborRate: 75,
    additionalFees: [],
    estimatedCompletionDate: undefined,
    approved: false,
    approvalDate: undefined,
    approvalSignature: "",
  })
  const [newPart, setNewPart] = useState({ name: "", cost: 0 })
  const [newFee, setNewFee] = useState({ name: "", cost: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [repairOrderId, setRepairOrderId] = useState<string | null>(null)

  // Initialize form
  const form = useForm<any>({
    resolver: zodResolver(repairOrderSchema),
    defaultValues: initialRepair || {
      customerInfo: {
        name: "",
        email: "",
        phone: "",
      },
      itemInfo: {
        itemType: "",
        material: "",
        description: "",
        hasStones: false,
        stoneDetails: "",
      },
      damageInfo: {
        description: "",
        repairType: "",
        urgency: "standard",
        additionalNotes: "",
      },
      purchaseInfo: {
        purchasedHere: false,
        purchaseDate: null,
        purchaseLocation: "",
        hasReceipt: false,
        hasWarranty: false,
        warrantyDetails: "",
      },
      insuranceClaim: {
        isInsuranceClaim: false,
        insuranceCompany: "",
        policyNumber: "",
        claimNumber: "",
        deductible: undefined,
      },
      liabilityWaiver: {
        accepted: false,
        signature: "",
        date: undefined,
      },
    },
  })

  // Calculate total estimate
  const calculateTotal = () => {
    const partsCost = estimateDetails.parts.reduce((sum, part) => sum + part.cost, 0)
    const laborCost = estimateDetails.laborHours * estimateDetails.laborRate
    const additionalCost = estimateDetails.additionalFees.reduce((sum, fee) => sum + fee.cost, 0)
    return partsCost + laborCost + additionalCost
  }

  // Add a photo to the item photos
  const addItemPhoto = (url: string) => {
    setItemPhotos([...itemPhotos, url])
  }

  // Remove an item photo
  const removeItemPhoto = (index: number) => {
    const updatedPhotos = [...itemPhotos]
    updatedPhotos.splice(index, 1)
    setItemPhotos(updatedPhotos)
  }

  // Add a photo to the damage photos
  const addDamagePhoto = (url: string) => {
    setDamagePhotos([...damagePhotos, url])
  }

  // Remove a damage photo
  const removeDamagePhoto = (index: number) => {
    const updatedPhotos = [...damagePhotos]
    updatedPhotos.splice(index, 1)
    setDamagePhotos(updatedPhotos)
  }

  // Add a part to the estimate
  const addPart = () => {
    if (newPart.name && newPart.cost > 0) {
      setEstimateDetails({
        ...estimateDetails,
        parts: [...estimateDetails.parts, { ...newPart }],
      })
      setNewPart({ name: "", cost: 0 })
    }
  }

  // Remove a part from the estimate
  const removePart = (index: number) => {
    const updatedParts = [...estimateDetails.parts]
    updatedParts.splice(index, 1)
    setEstimateDetails({
      ...estimateDetails,
      parts: updatedParts,
    })
  }

  // Add a fee to the estimate
  const addFee = () => {
    if (newFee.name && newFee.cost > 0) {
      setEstimateDetails({
        ...estimateDetails,
        additionalFees: [...estimateDetails.additionalFees, { ...newFee }],
      })
      setNewFee({ name: "", cost: 0 })
    }
  }

  // Remove a fee from the estimate
  const removeFee = (index: number) => {
    const updatedFees = [...estimateDetails.additionalFees]
    updatedFees.splice(index, 1)
    setEstimateDetails({
      ...estimateDetails,
      additionalFees: updatedFees,
    })
  }

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (mode === "edit" && onSubmitProp) {
        await onSubmitProp(data)
        toast({
          title: "Repair order updated successfully",
          description: `Repair order has been updated.`,
        })
      } else {
        // 1. Create customer
        const customer = await createCustomer({
          full_name: data.customerInfo.name,
          email: data.customerInfo.email,
          phone: data.customerInfo.phone,
          company: null,
          address: null,
          notes: null,
        })
        
        if (!customer) {
          throw new Error("Failed to create customer")
        }
        
        // 2. Create repair order
        const repairOrder = await createRepair({
          customer_id: customer.id,
          status: "received",
          description: data.damageInfo.description,
          estimated_completion: null,
          actual_completion: null,
          cost: null,
          notes: data.damageInfo.additionalNotes || null,
        })
        
        if (!repairOrder) {
          throw new Error("Failed to create repair order")
        }
        
        setRepairOrderId(repairOrder.id)
        
        toast({
          title: "Repair order created successfully",
          description: `Repair order #${repairOrder.id} has been created.`,
        })
        
        // Navigate to the repair order details or dashboard
        router.push(`/dashboard/repairs/${repairOrder.id}`)
      }
    } catch (error) {
      console.error("Error submitting repair order:", error)
      toast({
        title: "Error",
        description: "Failed to submit repair order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle estimate approval
  const handleApproveEstimate = () => {
    if (!estimateDetails.approvalSignature) {
      toast({
        title: "Signature required",
        description: "Please provide a signature to approve the estimate.",
        variant: "destructive",
      })
      return
    }

    setEstimateDetails({
      ...estimateDetails,
      approved: true,
      approvalDate: new Date(),
    })

    toast({
      title: "Estimate approved",
      description: "The repair estimate has been approved. Work will begin shortly.",
    })
  }

  // Handle simulated photo upload (in a real app, this would be file upload)
  const handlePhotoUpload = (type: "item" | "damage") => {
    // Simulate photo upload with placeholder images
    const placeholderUrl = `/placeholder.svg?height=200&width=200&query=jewelry ${type === "item" ? "item" : "damage"}`

    if (type === "item") {
      addItemPhoto(placeholderUrl)
    } else {
      addDamagePhoto(placeholderUrl)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repair Order System</h1>
          <p className="text-muted-foreground">Create and manage jewelry repair orders</p>
        </div>
        {repairOrderId && (
          <Badge variant="outline" className="text-lg px-3 py-1">
            Order ID: {repairOrderId}
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="intake" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Intake Form</span>
          </TabsTrigger>
          <TabsTrigger value="estimate" className="flex items-center gap-2" disabled={!repairOrderId}>
            <ClipboardCheck className="h-4 w-4" />
            <span>Estimate & Approval</span>
          </TabsTrigger>
        </TabsList>

        {/* Intake Form Tab */}
        <TabsContent value="intake" className="space-y-6 pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                  <CardDescription>Enter the customer's contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="customerInfo.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerInfo.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="customerInfo.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Item Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Item Information
                  </CardTitle>
                  <CardDescription>Provide details about the jewelry item</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="itemInfo.itemType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select item type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ring">Ring</SelectItem>
                              <SelectItem value="necklace">Necklace</SelectItem>
                              <SelectItem value="bracelet">Bracelet</SelectItem>
                              <SelectItem value="earrings">Earrings</SelectItem>
                              <SelectItem value="watch">Watch</SelectItem>
                              <SelectItem value="pendant">Pendant</SelectItem>
                              <SelectItem value="brooch">Brooch</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="itemInfo.material"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Material</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select material" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gold-14k">14K Gold</SelectItem>
                              <SelectItem value="gold-18k">18K Gold</SelectItem>
                              <SelectItem value="platinum">Platinum</SelectItem>
                              <SelectItem value="silver">Sterling Silver</SelectItem>
                              <SelectItem value="white-gold">White Gold</SelectItem>
                              <SelectItem value="rose-gold">Rose Gold</SelectItem>
                              <SelectItem value="titanium">Titanium</SelectItem>
                              <SelectItem value="stainless-steel">Stainless Steel</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="itemInfo.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a brief description of the item"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="itemInfo.hasStones"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Item has gemstones or diamonds</FormLabel>
                          <FormDescription>
                            Check this if the item contains any precious or semi-precious stones
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("itemInfo.hasStones") && (
                    <FormField
                      control={form.control}
                      name="itemInfo.stoneDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stone Details</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the stones (type, size, number, etc.)"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Item Photos */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base">Item Photos</FormLabel>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => handlePhotoUpload("item")}>
                          <Camera className="mr-2 h-4 w-4" />
                          Take Photo
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handlePhotoUpload("item")}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                      </div>
                    </div>
                    <FormDescription>Take clear photos of the item from multiple angles before repair</FormDescription>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {itemPhotos.map((photo, index) => (
                        <div key={index} className="relative rounded-md border">
                          <div className="relative aspect-square">
                            <Image
                              src={photo || "/placeholder.svg"}
                              alt={`Item photo ${index + 1}`}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2 h-6 w-6 rounded-full"
                            onClick={() => removeItemPhoto(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {itemPhotos.length === 0 && (
                        <div className="flex aspect-square flex-col items-center justify-center rounded-md border-2 border-dashed p-4 text-center text-muted-foreground">
                          <ImagePlus className="mb-2 h-8 w-8" />
                          <p className="text-sm">No photos added</p>
                          <p className="text-xs">Take or upload photos of the item</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Damage Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Damage Information
                  </CardTitle>
                  <CardDescription>Describe the damage and required repairs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="damageInfo.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Damage Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the damage in detail" className="min-h-[100px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="damageInfo.repairType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repair Type Needed</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
                          >
                            {repairTypes.map((type) => (
                              <FormItem
                                key={type.id}
                                className={cn(
                                  "flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4",
                                  field.value === type.id && "border-primary bg-primary/5"
                                )}
                              >
                                <FormControl>
                                  <RadioGroupItem value={type.id} />
                                </FormControl>
                                <div className="flex flex-col">
                                  <FormLabel className="font-medium">{type.label}</FormLabel>
                                  <p className="mt-1 text-xs text-muted-foreground">{type.description}</p>
                                </div>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="damageInfo.urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repair Urgency</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="standard" />
                              </FormControl>
                              <FormLabel className="font-normal">Standard (7-14 business days)</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="rush" />
                              </FormControl>
                              <FormLabel className="font-normal">Rush (3-5 business days, +25% fee)</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="emergency" />
                              </FormControl>
                              <FormLabel className="font-normal">Emergency (1-2 business days, +50% fee)</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="damageInfo.additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional information about the repair"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Damage Photos */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base">Damage Photos</FormLabel>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => handlePhotoUpload("damage")}>
                          <Camera className="mr-2 h-4 w-4" />
                          Take Photo
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handlePhotoUpload("damage")}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                      </div>
                    </div>
                    <FormDescription>Take clear close-up photos of the damaged areas</FormDescription>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {damagePhotos.map((photo, index) => (
                        <div key={index} className="relative rounded-md border">
                          <div className="relative aspect-square">
                            <Image
                              src={photo || "/placeholder.svg"}
                              alt={`Damage photo ${index + 1}`}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2 h-6 w-6 rounded-full"
                            onClick={() => removeDamagePhoto(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {damagePhotos.length === 0 && (
                        <div className="flex aspect-square flex-col items-center justify-center rounded-md border-2 border-dashed p-4 text-center text-muted-foreground">
                          <ImagePlus className="mb-2 h-8 w-8" />
                          <p className="text-sm">No photos added</p>
                          <p className="text-xs">Take or upload photos of the damage</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Original Purchase Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Original Purchase Information
                  </CardTitle>
                  <CardDescription>Details about when and where the item was purchased</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="purchaseInfo.purchasedHere"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Item was purchased at this store</FormLabel>
                          <FormDescription>
                            Check this if the customer purchased the item from your store
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!form.watch("purchaseInfo.purchasedHere") && (
                    <FormField
                      control={form.control}
                      name="purchaseInfo.purchaseLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Where was the item purchased?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="purchaseInfo.purchaseDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Purchase Date (if known)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="purchaseInfo.hasReceipt"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Customer has receipt</FormLabel>
                            <FormDescription>Check if the customer has the original receipt</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="purchaseInfo.hasWarranty"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Item is under warranty</FormLabel>
                            <FormDescription>Check if the item is still under warranty</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch("purchaseInfo.hasWarranty") && (
                    <FormField
                      control={form.control}
                      name="purchaseInfo.warrantyDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warranty Details</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide details about the warranty coverage"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Insurance Claim */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Insurance Claim
                  </CardTitle>
                  <CardDescription>Is this repair part of an insurance claim?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="insuranceClaim.isInsuranceClaim"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>This is an insurance claim</FormLabel>
                          <FormDescription>Check this if the repair is being covered by insurance</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("insuranceClaim.isInsuranceClaim") && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="insuranceClaim.insuranceCompany"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Insurance Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Insurance company name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="insuranceClaim.policyNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Policy Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Policy number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="insuranceClaim.claimNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Claim Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Claim number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="insuranceClaim.deductible"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deductible</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Deductible amount" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Liability Waiver */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Liability Waiver
                  </CardTitle>
                  <CardDescription>Please read and acknowledge the liability waiver</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md border p-4 text-sm">
                    <h4 className="font-medium mb-2">Jewelry Repair Liability Waiver</h4>
                    <p className="mb-2">
                      I understand and agree that while Jewelia will exercise reasonable care in handling my jewelry,
                      certain risks are inherent in the repair process. These risks may include, but are not limited to:
                    </p>
                    <ul className="list-disc pl-5 mb-2 space-y-1">
                      <li>Potential damage to stones during removal, setting, or cleaning</li>
                      <li>Discovery of pre-existing damage or weaknesses not visible before repair</li>
                      <li>Variations in metal color after soldering or sizing</li>
                      <li>Potential loss of stones that were loose prior to repair</li>
                    </ul>
                    <p className="mb-2">
                      I acknowledge that Jewelia is not responsible for any pre-existing damage or defects in the item.
                      I understand that older or worn jewelry may have hidden weaknesses that could be revealed during
                      the repair process.
                    </p>
                    <p className="mb-2">
                      I authorize Jewelia to perform the requested repairs and understand that by signing below, I
                      release Jewelia from liability for any damage that may occur as a direct result of the inherent
                      risks in the repair process, provided that reasonable care and professional standards were
                      maintained.
                    </p>
                    <p>
                      This waiver does not release Jewelia from liability for damage caused by negligence or failure to
                      exercise reasonable professional care.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="liabilityWaiver.accepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>I have read and agree to the liability waiver</FormLabel>
                          <FormDescription>You must acknowledge the waiver to proceed</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="liabilityWaiver.signature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Signature</FormLabel>
                        <FormControl>
                          <Input placeholder="Type full name as signature" {...field} />
                        </FormControl>
                        <FormDescription>Type your full legal name as your electronic signature</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="liabilityWaiver.date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="text" value={field.value ? format(field.value, "PPP") : ""} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Submit Repair Order
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* Estimate Tab */}
        <TabsContent value="estimate" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Repair Diagnosis
              </CardTitle>
              <CardDescription>Technical assessment and repair plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Diagnosis Notes</FormLabel>
                <Textarea
                  placeholder="Enter detailed diagnosis of the item's condition and repair needs"
                  className="min-h-[120px]"
                  value={estimateDetails.diagnosisNotes}
                  onChange={(e) =>
                    setEstimateDetails({
                      ...estimateDetails,
                      diagnosisNotes: e.target.value,
                    })
                  }
                />
                <FormDescription>
                  Include technical details about the damage, repair approach, and any potential complications
                </FormDescription>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Estimate
              </CardTitle>
              <CardDescription>Breakdown of parts, labor, and additional fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Parts Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base">Parts Needed</FormLabel>
                </div>

                {estimateDetails.parts.length > 0 && (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-3 gap-4 border-b bg-muted/50 p-3 text-sm font-medium">
                      <div className="col-span-2">Part Description</div>
                      <div className="text-right">Cost</div>
                    </div>
                    {estimateDetails.parts.map((part, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 border-b p-3 text-sm">
                        <div className="col-span-2">{part.name}</div>
                        <div className="flex items-center justify-end gap-2">
                          <span>{formatCurrency(part.cost)}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removePart(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="Part description"
                    value={newPart.name}
                    onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  />
                  <div className="flex w-32 items-center gap-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Cost"
                      value={newPart.cost || ""}
                      onChange={(e) => setNewPart({ ...newPart, cost: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPart}
                    disabled={!newPart.name || newPart.cost <= 0}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Part
                  </Button>
                </div>
              </div>

              {/* Labor Section */}
              <div className="space-y-4">
                <FormLabel className="text-base">Labor</FormLabel>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <FormLabel>Labor Hours</FormLabel>
                    <Input
                      type="number"
                      min="0.25"
                      step="0.25"
                      value={estimateDetails.laborHours}
                      onChange={(e) =>
                        setEstimateDetails({
                          ...estimateDetails,
                          laborHours: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Hourly Rate</FormLabel>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={estimateDetails.laborRate}
                        onChange={(e) =>
                          setEstimateDetails({
                            ...estimateDetails,
                            laborRate: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <div className="flex justify-between">
                    <span>Labor Cost:</span>
                    <span className="font-medium">
                      {formatCurrency(estimateDetails.laborHours * estimateDetails.laborRate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Fees */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base">Additional Fees</FormLabel>
                </div>

                {estimateDetails.additionalFees.length > 0 && (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-3 gap-4 border-b bg-muted/50 p-3 text-sm font-medium">
                      <div className="col-span-2">Fee Description</div>
                      <div className="text-right">Amount</div>
                    </div>
                    {estimateDetails.additionalFees.map((fee, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 border-b p-3 text-sm">
                        <div className="col-span-2">{fee.name}</div>
                        <div className="flex items-center justify-end gap-2">
                          <span>{formatCurrency(fee.cost)}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFee(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="Fee description"
                    value={newFee.name}
                    onChange={(e) => setNewFee({ ...newFee, name: e.target.value })}
                  />
                  <div className="flex w-32 items-center gap-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Amount"
                      value={newFee.cost || ""}
                      onChange={(e) => setNewFee({ ...newFee, cost: Number.parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={addFee} disabled={!newFee.name || newFee.cost <= 0}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Fee
                  </Button>
                </div>
              </div>

              {/* Estimated Completion */}
              <div className="space-y-2">
                <FormLabel>Estimated Completion Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !estimateDetails.estimatedCompletionDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarClock className="mr-2 h-4 w-4" />
                      {estimateDetails.estimatedCompletionDate ? (
                        format(estimateDetails.estimatedCompletionDate, "PPP")
                      ) : (
                        <span>Select completion date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={estimateDetails.estimatedCompletionDate || undefined}
                      onSelect={(date) =>
                        setEstimateDetails({
                          ...estimateDetails,
                          estimatedCompletionDate: date,
                        })
                      }
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Total Estimate */}
              <div className="rounded-md border p-4">
                <h4 className="font-medium mb-4">Estimate Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Parts Subtotal:</span>
                    <span>{formatCurrency(estimateDetails.parts.reduce((sum, part) => sum + part.cost, 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>
                      Labor ({estimateDetails.laborHours} hours @ {formatCurrency(estimateDetails.laborRate)}/hr):
                    </span>
                    <span>{formatCurrency(estimateDetails.laborHours * estimateDetails.laborRate)}</span>
                  </div>
                  {estimateDetails.additionalFees.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Additional Fees:</span>
                      <span>
                        {formatCurrency(estimateDetails.additionalFees.reduce((sum, fee) => sum + fee.cost, 0))}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Estimate:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Customer Approval
              </CardTitle>
              <CardDescription>Customer must approve the estimate before work begins</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium">Important Information</h4>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                    <span>This estimate is valid for 14 days from the date of issue.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                    <span>A 50% deposit is required to begin work on the repair.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                    <span>Additional costs may be incurred if additional damage is discovered during repair.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                    <span>You will be notified and asked for approval before any additional work is performed.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <FormLabel>Customer Signature</FormLabel>
                <Input
                  placeholder="Type full name as signature"
                  value={estimateDetails.approvalSignature}
                  onChange={(e) =>
                    setEstimateDetails({
                      ...estimateDetails,
                      approvalSignature: e.target.value,
                    })
                  }
                  disabled={estimateDetails.approved}
                />
                <FormDescription>Type your full legal name as your electronic signature</FormDescription>
              </div>

              {estimateDetails.approved ? (
                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium text-green-700">Estimate Approved</h4>
                      <p className="text-sm text-green-600">
                        Approved by {estimateDetails.approvalSignature} on{" "}
                        {format(estimateDetails.approvalDate!, "PPP")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleApproveEstimate}
                    disabled={!estimateDetails.approvalSignature}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve Estimate
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <X className="mr-2 h-4 w-4" />
                    Decline Estimate
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("intake")}>
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                Back to Intake Form
              </Button>
              {estimateDetails.approved && (
                <Button>
                  <Clock className="mr-2 h-4 w-4" />
                  Begin Repair Process
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
