"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { useRouter } from "next/navigation"

// Enhanced schema to include diamond-specific fields
const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  sku: z.string().min(3, {
    message: "SKU must be at least 3 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  price: z.string().min(1, {
    message: "Please enter a valid price.",
  }),
  stock: z.string().min(1, {
    message: "Please enter a valid stock quantity.",
  }),
  image: z.string().optional(),
  status: z.string().optional(),
  // Diamond-specific fields
  carat_weight: z.string().optional(),
  clarity: z.string().optional(),
  color: z.string().optional(),
  cut: z.string().optional(),
  shape: z.string().optional(),
  certification: z.string().optional(),
  fluorescence: z.string().optional(),
  polish: z.string().optional(),
  symmetry: z.string().optional(),
  depth_percentage: z.string().optional(),
  table_percentage: z.string().optional(),
  measurements: z.string().optional(),
  origin: z.string().optional(),
  treatment: z.string().optional(),
  description: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

const categories = [
  "Diamond",
  "Ring",
  "Necklace", 
  "Earrings",
  "Bracelet",
  "Watch",
  "Pendant",
  "Chain",
  "Locket",
  "Tiara",
  "Cufflinks",
  "Other",
]

const statuses = [
  "active",
  "inactive", 
  "discontinued",
  "out_of_stock",
  "low_stock"
]

// Diamond-specific options
const clarityGrades = [
  "FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"
]

const colorGrades = [
  "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
]

const cutGrades = [
  "Excellent", "Very Good", "Good", "Fair", "Poor"
]

const diamondShapes = [
  "Round", "Princess", "Cushion", "Oval", "Emerald", "Pear", "Marquise", "Radiant", "Asscher", "Heart", "Trillion", "Baguette"
]

const certificationLabs = [
  "GIA", "IGI", "AGS", "GCAL", "HRD", "None"
]

const fluorescenceLevels = [
  "None", "Faint", "Medium", "Strong", "Very Strong"
]

const polishGrades = [
  "Excellent", "Very Good", "Good", "Fair", "Poor"
]

const symmetryGrades = [
  "Excellent", "Very Good", "Good", "Fair", "Poor"
]

const origins = [
  "Natural", "Lab Grown", "Canada", "Botswana", "Russia", "South Africa", "Australia", "Other"
]

const treatments = [
  "None", "HPHT", "CVD", "Irradiation", "Coating", "Fracture Filling", "Other"
]

export function ProductForm() {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      price: "",
      stock: "",
      image: "",
      status: "active",
      carat_weight: "",
      clarity: "",
      color: "",
      cut: "",
      shape: "",
      certification: "",
      fluorescence: "",
      polish: "",
      symmetry: "",
      depth_percentage: "",
      table_percentage: "",
      measurements: "",
      origin: "",
      treatment: "",
      description: "",
    },
  })

  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Watch the category to show/hide diamond fields
  const selectedCategory = form.watch("category")
  const isDiamond = selectedCategory === "Diamond"

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true)
    
    try {
      // Validate price and stock are numbers
      const price = parseFloat(data.price)
      const stock = parseInt(data.stock)
      
      if (isNaN(price) || price <= 0) {
        toast.error("Please enter a valid price")
        return
      }
      
      if (isNaN(stock) || stock < 0) {
        toast.error("Please enter a valid stock quantity")
        return
      }

      // Prepare product data for API
      const productData = {
        name: data.name,
        sku: data.sku,
        category: data.category,
        price: price,
        stock: stock,
        image: data.image || undefined,
        status: data.status || "active",
        // Include diamond-specific data if it's a diamond
        ...(isDiamond && {
          carat_weight: data.carat_weight,
          clarity: data.clarity,
          color: data.color,
          cut: data.cut,
          shape: data.shape,
          certification: data.certification,
          fluorescence: data.fluorescence,
          polish: data.polish,
          symmetry: data.symmetry,
          depth_percentage: data.depth_percentage,
          table_percentage: data.table_percentage,
          measurements: data.measurements,
          origin: data.origin,
          treatment: data.treatment,
          description: data.description,
        })
      }

      // Call our Products API
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create product")
      }

      const result = await response.json()
      
      toast.success("Product created successfully!")
      
      // Reset form
      form.reset()
      
      // Navigate to products list or stay on form for another product
      setTimeout(() => {
        router.push("/dashboard/products")
      }, 1500)
      
    } catch (error: any) {
      console.error("Error creating product:", error)
      toast.error(error.message || "Failed to create product")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Product Information */}
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Diamond Engagement Ring" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU *</FormLabel>
                  <FormControl>
                    <Input placeholder="RING-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="299.99" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      placeholder="10" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="/images/product.jpg" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Optional image URL for the product
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* General Description */}
          <div className="mt-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the product, its features, materials, craftsmanship, or any other relevant details..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of the product to help customers understand its features and value.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Diamond-Specific Information */}
        {isDiamond && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💎</span>
              Diamond Specifications
            </h3>
            
            {/* Basic Diamond Properties */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <FormField
                control={form.control}
                name="carat_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carat Weight</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="1.50" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shape"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shape</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shape" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {diamondShapes.map((shape) => (
                          <SelectItem key={shape} value={shape}>
                            {shape}
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
                name="clarity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clarity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select clarity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clarityGrades.map((clarity) => (
                          <SelectItem key={clarity} value={clarity}>
                            {clarity}
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colorGrades.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cut Quality */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <FormField
                control={form.control}
                name="cut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cut Grade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cutGrades.map((cut) => (
                          <SelectItem key={cut} value={cut}>
                            {cut}
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
                name="polish"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Polish</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select polish" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {polishGrades.map((polish) => (
                          <SelectItem key={polish} value={polish}>
                            {polish}
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
                name="symmetry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symmetry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select symmetry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {symmetryGrades.map((symmetry) => (
                          <SelectItem key={symmetry} value={symmetry}>
                            {symmetry}
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
                name="fluorescence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fluorescence</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fluorescence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fluorescenceLevels.map((fluorescence) => (
                          <SelectItem key={fluorescence} value={fluorescence}>
                            {fluorescence}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Measurements */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <FormField
                control={form.control}
                name="depth_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depth %</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="100" 
                        placeholder="62.5" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="table_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table %</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="100" 
                        placeholder="58.0" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="measurements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measurements (mm)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="6.50 x 6.52 x 4.05" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="certification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certification Lab</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lab" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {certificationLabs.map((lab) => (
                          <SelectItem key={lab} value={lab}>
                            {lab}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Origin and Treatment */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select origin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {origins.map((origin) => (
                          <SelectItem key={origin} value={origin}>
                            {origin}
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
                name="treatment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treatment</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select treatment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {treatments.map((treatment) => (
                          <SelectItem key={treatment} value={treatment}>
                            {treatment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Diamond-Specific Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diamond-Specific Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional diamond-specific details, characteristics, history, or special features..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Add any diamond-specific details that complement the general product description above.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 
 
 