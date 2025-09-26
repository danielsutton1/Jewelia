"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Info } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Sample work orders for the dropdown
const workOrders = [
  { id: "WO-2023-1001", description: "Diamond Engagement Ring" },
  { id: "WO-2023-1002", description: "Sapphire Pendant" },
  { id: "WO-2023-1003", description: "Gold Chain Bracelet" },
  { id: "WO-2023-1004", description: "Pearl Earrings" },
]

type BaseMaterial = {
  id: string
  name: string
  unit: string
  stock: number
  type: string
}

type GoldMaterial = BaseMaterial & {
  type: "gold"
  purity: string
  color: string
}

type DiamondMaterial = BaseMaterial & {
  type: "diamond"
  cut: string
  size: string
  clarity: string
  color: string
  polish: string
  symmetry: string
  fluorescence: string
}

type OtherMetalMaterial = BaseMaterial & {
  type: "silver" | "platinum"
}

type FindingMaterial = BaseMaterial & {
  type: "finding"
}

type Material = GoldMaterial | DiamondMaterial | OtherMetalMaterial | FindingMaterial

// Sample materials for each category
const materials: Record<string, Material[]> = {
  metal: [
    { id: "M001", name: "14K Yellow Gold", unit: "g", stock: 250, type: "gold", purity: "14K", color: "Yellow" },
    { id: "M002", name: "18K White Gold", unit: "g", stock: 180, type: "gold", purity: "18K", color: "White" },
    { id: "M003", name: "Sterling Silver", unit: "g", stock: 500, type: "silver" },
    { id: "M004", name: "Platinum", unit: "g", stock: 50, type: "platinum" },
    { id: "M005", name: "24K Gold", unit: "g", stock: 100, type: "gold", purity: "24K", color: "Yellow" },
    { id: "M006", name: "22K Gold", unit: "g", stock: 150, type: "gold", purity: "22K", color: "Yellow" },
    { id: "M007", name: "10K Gold", unit: "g", stock: 300, type: "gold", purity: "10K", color: "Yellow" },
    { id: "M008", name: "18K Rose Gold", unit: "g", stock: 120, type: "gold", purity: "18K", color: "Rose" },
  ],
  stones: [
    { 
      id: "S001", 
      name: "Diamond", 
      unit: "pcs", 
      stock: 15,
      type: "diamond",
      cut: "Round",
      size: "0.5ct",
      clarity: "VS1",
      color: "D",
      polish: "Excellent",
      symmetry: "Very Good",
      fluorescence: "None"
    },
    { 
      id: "S002", 
      name: "Diamond", 
      unit: "pcs", 
      stock: 8,
      type: "diamond",
      cut: "Round",
      size: "1ct",
      clarity: "VVS2",
      color: "E",
      polish: "Excellent",
      symmetry: "Excellent",
      fluorescence: "Faint"
    },
    { 
      id: "S003", 
      name: "Diamond", 
      unit: "pcs", 
      stock: 5,
      type: "diamond",
      cut: "Oval",
      size: "0.75ct",
      clarity: "SI1",
      color: "F",
      polish: "Very Good",
      symmetry: "Very Good",
      fluorescence: "None"
    },
    { 
      id: "S004", 
      name: "Diamond", 
      unit: "pcs", 
      stock: 12,
      type: "diamond",
      cut: "Princess",
      size: "0.3ct",
      clarity: "VS2",
      color: "G",
      polish: "Excellent",
      symmetry: "Excellent",
      fluorescence: "None"
    },
    { 
      id: "S005", 
      name: "Diamond", 
      unit: "pcs", 
      stock: 3,
      type: "diamond",
      cut: "Emerald",
      size: "1.5ct",
      clarity: "VVS1",
      color: "D",
      polish: "Excellent",
      symmetry: "Excellent",
      fluorescence: "None"
    },
    { 
      id: "S006", 
      name: "Diamond", 
      unit: "pcs", 
      stock: 7,
      type: "diamond",
      cut: "Pear",
      size: "0.8ct",
      clarity: "SI2",
      color: "H",
      polish: "Very Good",
      symmetry: "Good",
      fluorescence: "Medium"
    },
  ],
  findings: [
    { id: "F001", name: "Lobster Clasp 14K", unit: "pcs", stock: 30, type: "finding" },
    { id: "F002", name: "Jump Rings 18K", unit: "pcs", stock: 100, type: "finding" },
    { id: "F003", name: "Earring Posts Silver", unit: "pairs", stock: 45, type: "finding" },
    { id: "F004", name: 'Box Chain 18"', unit: "pcs", stock: 20, type: "finding" },
  ],
}

const formSchema = z.object({
  productId: z.string({
    required_error: "Please select a product.",
  }),
  quantity: z.coerce.number().positive({
    message: "Quantity must be a positive number.",
  }),
  materialType: z.enum(["gold", "platinum", "silver"], {
    required_error: "Please select a material type.",
  }),
  karat: z.string({
    required_error: "Please select karat.",
  }),
  color: z.string({
    required_error: "Please select color.",
  }),
  diamondClarity: z.string().optional(),
  diamondColor: z.string().optional(),
  diamondCut: z.string().optional(),
  caratWeight: z.coerce.number().positive().optional(),
  shape: z.string().optional(),
  settingType: z.string().optional(),
  style: z.string().optional(),
  size: z.coerce.number().positive().optional(),
  customSpecifications: z.string().optional(),
  requiredDate: z.date({
    required_error: "Required date is required.",
  }),
  urgencyLevel: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Please select an urgency level.",
  }),
})

// Sample products for the dropdown
const products = [
  { id: "P001", name: "Diamond Engagement Ring" },
  { id: "P002", name: "Sapphire Pendant" },
  { id: "P003", name: "Gold Chain Bracelet" },
  { id: "P004", name: "Pearl Earrings" },
]

// Material options
const materialOptions = {
  karat: ["24K", "22K", "18K", "14K", "10K"],
  color: ["Yellow", "White", "Rose"],
  diamondClarity: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"],
  diamondColor: ["D", "E", "F", "G", "H", "I", "J"],
  diamondCut: ["Round", "Princess", "Cushion", "Oval", "Emerald", "Pear", "Marquise", "Radiant"],
  shape: ["Round", "Princess", "Cushion", "Oval", "Emerald", "Pear", "Marquise", "Radiant"],
  settingType: ["Prong", "Bezel", "Channel", "Pave", "Tension", "Halo"],
  style: ["Classic", "Modern", "Vintage", "Contemporary", "Art Deco"],
}

export function MaterialRequestForm() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedMaterialType, setSelectedMaterialType] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customSpecifications: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    alert("Material request submitted successfully!")
    form.reset()
    setSelectedProduct(null)
    setSelectedMaterialType(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Material Request</CardTitle>
        <CardDescription>Request materials needed for production work orders</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Selection */}
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        const product = products.find((p) => p.id === value)
                        setSelectedProduct(product)
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min="1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Material Type */}
              <FormField
                control={form.control}
                name="materialType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        setSelectedMaterialType(value)
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Karat (only for gold) */}
              {selectedMaterialType === "gold" && (
                <FormField
                  control={form.control}
                  name="karat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Karat</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select karat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materialOptions.karat.map((karat) => (
                            <SelectItem key={karat} value={karat}>
                              {karat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Color (only for gold) */}
              {selectedMaterialType === "gold" && (
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
                          {materialOptions.color.map((color) => (
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
              )}

              {/* Diamond Specifications */}
              {selectedProduct?.name.toLowerCase().includes("diamond") && (
                <>
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Diamond Specifications</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="diamondClarity"
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
                            {materialOptions.diamondClarity.map((clarity) => (
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
                    name="diamondColor"
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
                            {materialOptions.diamondColor.map((color) => (
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

                  <FormField
                    control={form.control}
                    name="diamondCut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cut</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cut" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {materialOptions.diamondCut.map((cut) => (
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
                    name="caratWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carat Weight</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min="0.01" step="0.01" />
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
                            {materialOptions.shape.map((shape) => (
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
                </>
              )}

              {/* Setting Details */}
              {selectedProduct?.name.toLowerCase().includes("ring") && (
                <>
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Setting Details</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="settingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Setting Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select setting type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {materialOptions.settingType.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
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
                    name="style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {materialOptions.style.map((style) => (
                              <SelectItem key={style} value={style}>
                                {style}
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
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min="1" step="0.5" placeholder="Enter size (e.g., 6.5)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Custom Specifications */}
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="customSpecifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Specifications</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any additional specifications or requirements"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Include any special requirements or context for this request.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Required Date */}
              <FormField
                control={form.control}
                name="requiredDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Required By</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Urgency Level */}
              <FormField
                control={form.control}
                name="urgencyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Request
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
