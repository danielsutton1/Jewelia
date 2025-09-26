"use client"

import type React from "react"
import Image from "next/image"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ChevronRight, Check, X, Loader2, Camera, Upload, Edit3, RotateCw, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useApi } from "@/lib/api-service"

interface Category {
  id: string
  label: string
  subcategories?: Category[]
}

// Sample data for dropdowns
const categories: Category[] = [
  {
    id: "rings",
    label: "Rings",
    subcategories: [
      {
        id: "engagement",
        label: "Engagement",
        subcategories: [
          { id: "solitaire", label: "Solitaire" },
          { id: "halo", label: "Halo" },
          { id: "three-stone", label: "Three Stone" },
        ],
      },
      { id: "wedding", label: "Wedding Bands" },
      { id: "fashion", label: "Fashion Rings" },
    ],
  },
  {
    id: "necklaces",
    label: "Necklaces",
    subcategories: [
      { id: "pendants", label: "Pendants" },
      { id: "chains", label: "Chains" },
      { id: "chokers", label: "Chokers" },
    ],
  },
  {
    id: "earrings",
    label: "Earrings",
    subcategories: [
      { id: "studs", label: "Studs" },
      { id: "hoops", label: "Hoops" },
      { id: "drops", label: "Drops" },
    ],
  },
  {
    id: "bracelets",
    label: "Bracelets",
    subcategories: [
      { id: "bangles", label: "Bangles" },
      { id: "tennis", label: "Tennis Bracelets" },
      { id: "cuffs", label: "Cuffs" },
    ],
  },
  { id: "watches", label: "Watches" },
  { id: "other", label: "Other Jewelry" },
]

const vendors = [
  { id: "v1", name: "Elegant Gems Wholesale" },
  { id: "v2", name: "Diamond District Supply" },
  { id: "v3", name: "Precious Metals Inc." },
  { id: "v4", name: "Artisan Jewelry Makers" },
  { id: "v5", name: "Global Gem Traders" },
]

const brands = [
  { id: "b1", name: "Tiffany & Co." },
  { id: "b2", name: "Cartier" },
  { id: "b3", name: "Pandora" },
  { id: "b4", name: "David Yurman" },
  { id: "b5", name: "Swarovski" },
  { id: "b6", name: "House Brand" },
]

const metalTypes = [
  { id: "gold", name: "Gold", colors: ["Yellow", "White", "Rose"] },
  { id: "silver", name: "Silver", colors: ["Polished", "Antiqued", "Brushed"] },
  { id: "platinum", name: "Platinum", colors: ["Natural", "Ruthenium Plated"] },
  { id: "palladium", name: "Palladium", colors: ["Natural"] },
  { id: "titanium", name: "Titanium", colors: ["Gray", "Black", "Blue", "Rainbow"] },
  { id: "stainless", name: "Stainless Steel", colors: ["Silver", "Gold Tone", "Black"] },
]

const purities = {
  gold: ["10K", "14K", "18K", "22K", "24K"],
  silver: ["925 Sterling", "958 Britannia", "999 Fine"],
  platinum: ["850", "900", "950", "999"],
  palladium: ["500", "950", "999"],
  titanium: ["Grade 1", "Grade 2", "Grade 5"],
  stainless: ["304", "316L", "904L"],
}

const popularTags = [
  "Bestseller",
  "New Arrival",
  "Limited Edition",
  "Handcrafted",
  "Vintage",
  "Modern",
  "Classic",
  "Statement",
  "Minimalist",
  "Bridal",
  "Gift",
  "Holiday",
  "Summer",
  "Winter",
  "Exclusive",
  "Sale",
  "Clearance",
]

// Form schema
const formSchema = z.object({
  // Basic Information
  sku: z.string().min(3, { message: "SKU must be at least 3 characters" }),
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  subcategory: z.string().optional(),
  subsubcategory: z.string().optional(),
  tags: z.array(z.string()),
  vendor: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),

  // Images
  images: z.array(z.any()),

  // Physical Specs
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  weightUnit: z.enum(["g", "oz"]),
  ringSize: z.string().optional(),

  // Metal Details
  metalType: z.string().optional(),
  purity: z.string().optional(),
  metalColor: z.string().optional(),
  hallmarks: z.string().optional(),

  // Additional fields based on category
  stoneType: z.string().optional(),
  stoneWeight: z.number().optional(),
  stoneColor: z.string().optional(),
  stoneClarity: z.string().optional(),
  stoneCut: z.string().optional(),
  stoneCount: z.number().optional(),

  // Watch specific fields
  watchMovement: z.string().optional(),
  watchCaseSize: z.number().optional(),
  watchBandMaterial: z.string().optional(),
  watchWaterResistance: z.string().optional(),

  // Pricing and Inventory
  cost: z.number().optional(),
  retailPrice: z.number().optional(),
  salePrice: z.number().optional(),
  quantity: z.number().int().min(0),
  location: z.string().optional(),
  reorderPoint: z.number().int().min(0).optional(),

  // Status
  status: z.enum(["active", "inactive", "discontinued"]),
  featured: z.boolean(),

  // Metadata
  notes: z.string().optional(),
  warrantyInfo: z.string().optional(),
  careInstructions: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function JewelryItemForm({ productId }: { productId?: string }) {
  const [autoSku, setAutoSku] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState("")
  const [selectedMetalType, setSelectedMetalType] = useState("")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const api = useApi()

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: generateSku(),
      name: "",
      category: "",
      subcategory: "",
      subsubcategory: "",
      tags: [],
      vendor: "",
      brand: "",
      description: "",
      images: [],
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      weightUnit: "g",
      ringSize: "",
      metalType: "",
      purity: "",
      metalColor: "",
      hallmarks: "",
      stoneType: "",
      stoneWeight: 0,
      stoneColor: "",
      stoneClarity: "",
      stoneCut: "",
      stoneCount: 0,
      watchMovement: "",
      watchCaseSize: 0,
      watchBandMaterial: "",
      watchWaterResistance: "",
      cost: 0,
      retailPrice: 0,
      salePrice: 0,
      quantity: 1,
      location: "",
      reorderPoint: 0,
      status: "active",
      featured: false,
      notes: "",
      warrantyInfo: "",
      careInstructions: "",
    },
  })

  // Watch for category changes to show/hide sections
  const watchCategory = form.watch("category")
  const watchMetalType = form.watch("metalType")

  // Generate a random SKU
  function generateSku() {
    const prefix = "JWL"
    const randomNum = Math.floor(10000 + Math.random() * 90000)
    return `${prefix}-${randomNum}`
  }

  // Auto-generate SKU when toggled
  useEffect(() => {
    if (autoSku) {
      form.setValue("sku", generateSku())
    }
  }, [autoSku, form])

  // Update category state when form value changes
  useEffect(() => {
    setSelectedCategory(watchCategory || "")
  }, [watchCategory])

  // Update metal type state when form value changes
  useEffect(() => {
    setSelectedMetalType(watchMetalType || "")
  }, [watchMetalType])

  // Load product data if editing
  useEffect(() => {
    if (productId) {
      ;(async () => {
        try {
          const data = await api.inventory.get(productId)
          if (data) {
            form.reset({ ...data })
          }
        } catch (e) {
          // handle error
        }
      })()
    }
  }, [productId, form, api.inventory])

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setImageFiles((prev) => [...prev, ...files])

      // Create URLs for preview
      const newUrls = files.map((file) => URL.createObjectURL(file))
      setImageUrls((prev) => [...prev, ...newUrls])

      // Update form value
      form.setValue("images", [...imageFiles, ...files])
    }
  }

  // Remove image
  const removeImage = (index: number) => {
    const newFiles = [...imageFiles]
    const newUrls = [...imageUrls]

    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newUrls[index])

    newFiles.splice(index, 1)
    newUrls.splice(index, 1)

    setImageFiles(newFiles)
    setImageUrls(newUrls)
    form.setValue("images", newFiles)
  }

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      if (productId) {
        await api.inventory.update(productId, data)
        toast({ title: "Product updated", description: `${data.name} has been updated.` })
      } else {
        await api.inventory.create(data)
        toast({ title: "Product created", description: `${data.name} has been added.` })
      }
      // Reset form
      form.reset({
        sku: generateSku(),
        name: "",
        category: "",
        subcategory: "",
        subsubcategory: "",
        tags: [],
        vendor: "",
        brand: "",
        description: "",
        images: [],
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
        weightUnit: "g",
        ringSize: "",
        metalType: "",
        purity: "",
        metalColor: "",
        hallmarks: "",
        stoneType: "",
        stoneWeight: 0,
        stoneColor: "",
        stoneClarity: "",
        stoneCut: "",
        stoneCount: 0,
        watchMovement: "",
        watchCaseSize: 0,
        watchBandMaterial: "",
        watchWaterResistance: "",
        cost: 0,
        retailPrice: 0,
        salePrice: 0,
        quantity: 1,
        location: "",
        reorderPoint: 0,
        status: "active",
        featured: false,
        notes: "",
        warrantyInfo: "",
        careInstructions: "",
      })

      setImageFiles([])
      setImageUrls([])
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "There was an error adding the item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render category options recursively
  const renderCategoryOptions = (categories: Category[], level = 0) => {
    return categories.map((category) => (
      <SelectItem
        key={category.id}
        value={category.id}
        className={cn("pl-[calc(0.5rem*var(--level))]", { "font-medium": level === 0 })}
        style={{ "--level": level } as React.CSSProperties}
      >
        {category.label}
      </SelectItem>
    ))
  }

  // Render subcategory options based on selected category
  const renderSubcategoryOptions = () => {
    const category = categories.find((c) => c.id === selectedCategory)
    if (category?.subcategories) {
      return category.subcategories.map((sub) => (
        <SelectItem key={sub.id} value={sub.id}>
          {sub.label}
        </SelectItem>
      ))
    }
    return null
  }

  // Render sub-subcategory options based on selected subcategory
  const renderSubSubcategoryOptions = () => {
    const category = categories.find((c) => c.id === selectedCategory)
    if (category?.subcategories) {
      const subcategory = category.subcategories.find((s) => s.id === selectedSubcategory)
      if (subcategory?.subcategories) {
        return subcategory.subcategories.map((sub) => (
          <SelectItem key={sub.id} value={sub.id}>
            {sub.label}
          </SelectItem>
        ))
      }
    }
    return null
  }

  // Check if a section should be shown based on category
  const shouldShowSection = (section: string) => {
    switch (section) {
      case "stoneDetails":
        return ["rings", "necklaces", "earrings", "bracelets"].includes(selectedCategory)
      case "watchDetails":
        return selectedCategory === "watches"
      case "ringSize":
        return selectedCategory === "rings"
      default:
        return true
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-semibold">Add New Jewelry Item</CardTitle>
              <CardDescription>Enter the details of your new jewelry item</CardDescription>
            </div>
          </div>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="p-6 space-y-8">
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                    1
                  </div>
                  <h3 className="text-xl font-medium">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>SKU</FormLabel>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Auto-generate</span>
                              <Switch
                                checked={autoSku}
                                onCheckedChange={setAutoSku}
                                className="data-[state=checked]:bg-primary"
                              />
                            </div>
                          </div>
                          <FormControl>
                            <Input {...field} disabled={autoSku} className={cn({ "bg-muted": autoSku })} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Name*</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. Diamond Solitaire Ring" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category*</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              form.setValue("subcategory", "")
                              form.setValue("subsubcategory", "")
                              setSelectedSubcategory("")
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>{renderCategoryOptions(categories)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedCategory && (
                      <FormField
                        control={form.control}
                        name="subcategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subcategory</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value)
                                setSelectedSubcategory(value)
                                form.setValue("subsubcategory", "")
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a subcategory" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>{renderSubcategoryOptions()}</SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {selectedSubcategory && (
                      <FormField
                        control={form.control}
                        name="subsubcategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sub-subcategory</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a sub-subcategory" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>{renderSubSubcategoryOptions()}</SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="vendor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor/Supplier</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a vendor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vendors.map((vendor) => (
                                <SelectItem key={vendor.id} value={vendor.id}>
                                  {vendor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={() => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <div className="border rounded-md p-4 space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {popularTags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className={cn(
                                    "cursor-pointer hover:bg-muted transition-colors",
                                    form.getValues("tags")?.includes(tag)
                                      ? "bg-muted border"
                                      : "bg-transparent",
                                  )}
                                  onClick={() => {
                                    const currentTags = form.getValues("tags") || []
                                    if (currentTags.includes(tag)) {
                                      form.setValue(
                                        "tags",
                                        currentTags.filter((t) => t !== tag),
                                      )
                                    } else {
                                      form.setValue("tags", [...currentTags, tag])
                                    }
                                  }}
                                >
                                  {tag}
                                  {form.getValues("tags")?.includes(tag) && <Check className="ml-1 h-3 w-3" />}
                                </Badge>
                              ))}
                            </div>
                            <FormDescription>Click to select tags for this item</FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter a detailed description of the item"
                              className="min-h-[120px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Images */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                    2
                  </div>
                  <h3 className="text-xl font-medium">Images</h3>
                </div>

                <div className="space-y-6">
                  <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center bg-muted">
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <Upload className="h-12 w-12 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-foreground">Drag and drop images here</h4>
                        <p className="text-sm text-muted-foreground mt-1">Upload high-quality images from multiple angles</p>
                      </div>
                      <div className="flex justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-primary text-foreground hover:bg-muted"
                          onClick={() => document.getElementById("image-upload")?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Browse Files
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-primary text-foreground hover:bg-muted"
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Take Photo
                        </Button>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <div className="text-xs text-muted-foreground">
                        Supported formats: JPG, PNG, WEBP. Max size: 5MB per image.
                      </div>
                    </div>
                  </div>

                  {imageUrls.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground">Uploaded Images</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-md overflow-hidden border border-primary">
                              <Image
                                src={url || "/placeholder.svg"}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-full object-cover"
                                width={300}
                                height={300}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-white hover:bg-white/20"
                                onClick={() => {
                                  // Edit image functionality would go here
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-white hover:bg-white/20"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow">
                              <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-white">
                                {index === 0 ? "Main" : `#${index + 1}`}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-primary rounded-md p-4 border border-primary">
                    <h4 className="font-medium text-foreground mb-2">Required Angles</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-md border text-center",
                          imageUrls.length >= 1 ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50",
                        )}
                      >
                        <div className="text-sm font-medium mb-1">
                          {imageUrls.length >= 1 ? (
                            <span className="text-green-600">✓ Front</span>
                          ) : (
                            <span className="text-amber-600">Front</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">Main product view</div>
                      </div>

                      <div
                        className={cn(
                          "p-3 rounded-md border text-center",
                          imageUrls.length >= 2 ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50",
                        )}
                      >
                        <div className="text-sm font-medium mb-1">
                          {imageUrls.length >= 2 ? (
                            <span className="text-green-600">✓ Side</span>
                          ) : (
                            <span className="text-amber-600">Side</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">Profile view</div>
                      </div>

                      <div
                        className={cn(
                          "p-3 rounded-md border text-center",
                          imageUrls.length >= 3 ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50",
                        )}
                      >
                        <div className="text-sm font-medium mb-1">
                          {imageUrls.length >= 3 ? (
                            <span className="text-green-600">✓ Back</span>
                          ) : (
                            <span className="text-amber-600">Back</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">Reverse angle</div>
                      </div>

                      <div
                        className={cn(
                          "p-3 rounded-md border text-center",
                          imageUrls.length >= 4 ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50",
                        )}
                      >
                        <div className="text-sm font-medium mb-1">
                          {imageUrls.length >= 4 ? (
                            <span className="text-green-600">✓ Detail</span>
                          ) : (
                            <span className="text-amber-600">Detail</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">Close-up features</div>
                      </div>

                      <div
                        className={cn(
                          "p-3 rounded-md border text-center",
                          imageUrls.length >= 5 ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50",
                        )}
                      >
                        <div className="text-sm font-medium mb-1">
                          {imageUrls.length >= 5 ? (
                            <span className="text-green-600">✓ On Model</span>
                          ) : (
                            <span className="text-amber-600">On Model</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">Worn example</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-md p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <RotateCw className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800">360° View Support</h4>
                        <p className="text-sm text-blue-600 mt-1">
                          Upload multiple images taken at regular intervals around the item to create a 360° view. For
                          best results, use 24-36 images with consistent lighting and background.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload 360° Images
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Physical Specs */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                    3
                  </div>
                  <h3 className="text-xl font-medium">Physical Specifications</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Dimensions</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length (mm)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="width"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Width (mm)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (mm)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weightUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex gap-4 pt-2"
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="g" className="text-primary" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Grams (g)</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="oz" className="text-primary" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Ounces (oz)</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {shouldShowSection("ringSize") && (
                      <FormField
                        control={form.control}
                        name="ringSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ring Size</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ring size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[
                                  "3",
                                  "3.5",
                                  "4",
                                  "4.5",
                                  "5",
                                  "5.5",
                                  "6",
                                  "6.5",
                                  "7",
                                  "7.5",
                                  "8",
                                  "8.5",
                                  "9",
                                  "9.5",
                                  "10",
                                  "10.5",
                                  "11",
                                  "11.5",
                                  "12",
                                  "12.5",
                                  "13",
                                ].map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>US standard ring size</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {shouldShowSection("stoneDetails") && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground">Stone Details</h4>
                      <FormField
                        control={form.control}
                        name="stoneType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stone Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select stone type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[
                                  "Diamond",
                                  "Sapphire",
                                  "Ruby",
                                  "Emerald",
                                  "Amethyst",
                                  "Topaz",
                                  "Opal",
                                  "Pearl",
                                  "Garnet",
                                  "Aquamarine",
                                  "Citrine",
                                  "Peridot",
                                ].map((stone) => (
                                  <SelectItem key={stone} value={stone.toLowerCase()}>
                                    {stone}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="stoneWeight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stone Weight (carats)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="stoneCount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stone Count</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1"
                                  onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="stoneColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stone Color</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select color" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"].map((color) => (
                                    <SelectItem key={color} value={color.toLowerCase()}>
                                      {color}{" "}
                                      {color <= "J" ? "(Colorless to Near Colorless)" : "(Faint to Light Yellow)"}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>For diamonds</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="stoneClarity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stone Clarity</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select clarity" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"].map(
                                    (clarity) => (
                                      <SelectItem key={clarity} value={clarity.toLowerCase()}>
                                        {clarity}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                              <FormDescription>For diamonds</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="stoneCut"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stone Cut</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select cut" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[
                                  "Round",
                                  "Princess",
                                  "Cushion",
                                  "Emerald",
                                  "Oval",
                                  "Radiant",
                                  "Asscher",
                                  "Marquise",
                                  "Pear",
                                  "Heart",
                                ].map((cut) => (
                                  <SelectItem key={cut} value={cut.toLowerCase()}>
                                    {cut}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {shouldShowSection("watchDetails") && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground">Watch Details</h4>
                      <FormField
                        control={form.control}
                        name="watchMovement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Movement Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select movement type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {["Quartz", "Automatic", "Mechanical", "Solar", "Kinetic"].map((movement) => (
                                  <SelectItem key={movement} value={movement.toLowerCase()}>
                                    {movement}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="watchCaseSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Case Size (mm)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="watchBandMaterial"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Band Material</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select band material" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {["Leather", "Stainless Steel", "Gold", "Titanium", "Rubber", "Fabric", "Ceramic"].map(
                                  (material) => (
                                    <SelectItem key={material} value={material.toLowerCase()}>
                                      {material}
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="watchWaterResistance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Water Resistance</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select water resistance" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {["30m", "50m", "100m", "200m", "300m", "500m", "1000m"].map((resistance) => (
                                  <SelectItem key={resistance} value={resistance}>
                                    {resistance} (
                                    {resistance === "30m"
                                      ? "Splash Resistant"
                                      : resistance === "50m"
                                        ? "Swimming"
                                        : resistance === "100m"
                                          ? "Snorkeling"
                                          : "Diving"}
                                    )
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-primary">
                  <h4 className="font-medium text-foreground mb-4">Pricing and Inventory</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="retailPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retail Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[
                                "Main Showroom",
                                "Back Office",
                                "Safe",
                                "Display Case A",
                                "Display Case B",
                                "Display Case C",
                                "Window Display",
                                "Warehouse",
                              ].map((location) => (
                                <SelectItem key={location} value={location.toLowerCase()}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reorderPoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reorder Point</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>Minimum quantity before reordering</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Metal Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                    4
                  </div>
                  <h3 className="text-xl font-medium">Metal Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="metalType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Metal Type</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              form.setValue("purity", "")
                              form.setValue("metalColor", "")
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select metal type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {metalTypes.map((metal) => (
                                <SelectItem key={metal.id} value={metal.id}>
                                  {metal.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedMetalType && (
                      <FormField
                        control={form.control}
                        name="purity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Purity</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select purity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {purities[selectedMetalType as keyof typeof purities]?.map((purity) => (
                                  <SelectItem key={purity} value={purity.toLowerCase()}>
                                    {purity}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {selectedMetalType && (
                      <FormField
                        control={form.control}
                        name="metalColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color/Finish</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select color/finish" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {metalTypes
                                  .find((m) => m.id === selectedMetalType)
                                  ?.colors.map((color) => (
                                    <SelectItem key={color} value={color.toLowerCase()}>
                                      {color}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="hallmarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hallmarks</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. 925, 14K, Maker&apos;s Mark" />
                          </FormControl>
                          <FormDescription>Enter any hallmarks or stamps present on the item</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Status and Visibility</h4>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="discontinued">Discontinued</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-primary"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Featured Item</FormLabel>
                            <FormDescription>Display this item prominently in featured sections</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter any additional notes about this item"
                              className="min-h-[120px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-primary">
                  <h4 className="font-medium text-foreground mb-4">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="warrantyInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warranty Information</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Enter warranty details" className="min-h-[80px]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="careInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Care Instructions</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Enter care instructions" className="min-h-[80px]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t border-primary p-6 bg-muted">
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Item
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
