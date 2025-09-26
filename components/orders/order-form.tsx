"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
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
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

const orderFormSchema = z.object({
  customerName: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  customerEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  customerPhone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  items: z.array(z.object({
    productId: z.string({
      required_error: "Please select a product.",
    }),
    quantity: z.string().min(1, {
      message: "Please enter a valid quantity.",
    }),
    material: z.object({
      type: z.string({
        required_error: "Please select a material type.",
      }),
      karat: z.string().optional(),
      color: z.string().optional(),
    }),
    diamond: z.object({
      clarity: z.string().optional(),
      color: z.string().optional(),
      cut: z.string().optional(),
      caratWeight: z.string().optional(),
      shape: z.string().optional(),
    }).optional(),
    setting: z.object({
      type: z.string().optional(),
      style: z.string().optional(),
      size: z.string().optional(),
    }).optional(),
    customSpecs: z.string().optional(),
  })).min(1, {
    message: "Please add at least one item to the order.",
  }),
  deliveryMethod: z.string({
    required_error: "Please select a delivery method.",
  }),
  paymentMethod: z.string({
    required_error: "Please select a payment method.",
  }),
  notes: z.string().optional(),
})

type OrderFormValues = z.infer<typeof orderFormSchema>

const deliveryMethods = [
  "Store Pickup",
  "Standard Shipping",
  "Express Shipping",
  "Local Delivery",
]

const paymentMethods = [
  "Credit Card",
  "Debit Card",
  "Cash",
  "Bank Transfer",
  "Check",
]

const materials = [
  { type: "Gold", karats: ["10K", "14K", "18K", "22K", "24K"], colors: ["Yellow", "White", "Rose"] },
  { type: "Platinum", karats: ["950", "900"], colors: [] },
  { type: "Silver", karats: ["925", "999"], colors: [] },
  { type: "Palladium", karats: ["950", "900"], colors: [] },
]

const diamondClarities = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"]
const diamondColors = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]
const diamondCuts = ["Excellent", "Very Good", "Good", "Fair", "Poor"]
const diamondShapes = ["Round", "Princess", "Cushion", "Oval", "Emerald", "Pear", "Marquise", "Radiant", "Asscher", "Heart"]

const settingTypes = ["Prong", "Bezel", "Channel", "Pave", "Tension", "Flush", "Halo"]
const settingStyles = ["Classic", "Modern", "Vintage", "Contemporary", "Art Deco"]

// Mock products data - in a real app, this would come from an API
const products = [
  { id: "1", name: "Diamond Engagement Ring", price: 2999.99 },
  { id: "2", name: "Gold Necklace", price: 499.99 },
  { id: "3", name: "Silver Bracelet", price: 199.99 },
  { id: "4", name: "Pearl Earrings", price: 149.99 },
]

export function OrderForm() {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      items: [{
        productId: "",
        quantity: "1",
        material: {
          type: "",
          karat: "",
          color: "",
        },
        diamond: {
          clarity: "",
          color: "",
          cut: "",
          caratWeight: "",
          shape: "",
        },
        setting: {
          type: "",
          style: "",
          size: "",
        },
        customSpecs: "",
      }],
      deliveryMethod: "",
      paymentMethod: "",
      notes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  })

  async function onSubmit(data: OrderFormValues) {
    try {
      // Calculate total amount
      const totalAmount = data.items.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId)
        return sum + (product ? product.price * parseInt(item.quantity) : 0)
      }, 0)

      // Prepare order data for API
      const orderData = {
        customerId: "1", // For demo purposes, use a default customer ID
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        items: data.items.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          unitPrice: products.find(p => p.id === item.productId)?.price || 0,
          material: item.material,
          diamond: item.diamond,
          setting: item.setting,
          customSpecs: item.customSpecs
        })),
        totalAmount: totalAmount,
        taxAmount: totalAmount * 0.08, // 8% tax
        shippingAmount: data.deliveryMethod === 'Express Shipping' ? 25 : 10,
        discountAmount: 0,
        notes: data.notes,
        deliveryMethod: data.deliveryMethod,
        paymentMethod: data.paymentMethod,
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
      }

      // Call the orders API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create order')
      }

      const result = await response.json()
      console.log('Order created successfully:', result)
      toast.success("Order created successfully!")
      
      // Reset form
      form.reset()
      
    } catch (error: any) {
      console.error('Failed to create order:', error)
      toast.error(error.message || "Failed to create order. Please try again.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="customerPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone *</FormLabel>
              <FormControl>
                <Input placeholder="(555) 555-5555" type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Order Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                productId: "",
                quantity: "1",
                material: {
                  type: "",
                  karat: "",
                  color: "",
                },
                diamond: {
                  clarity: "",
                  color: "",
                  cut: "",
                  caratWeight: "",
                  shape: "",
                },
                setting: {
                  type: "",
                  style: "",
                  size: "",
                },
                customSpecs: "",
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {fields.map((field: typeof fields[number], index: number) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - ${product.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end gap-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Quantity *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="1"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.material.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select material" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {materials.map((material) => (
                                <SelectItem key={material.type} value={material.type}>
                                  {material.type}
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
                      name={`items.${index}.material.karat`}
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
                              {materials
                                .find(m => m.type === form.watch(`items.${index}.material.type`))
                                ?.karats.map((karat) => (
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

                    <FormField
                      control={form.control}
                      name={`items.${index}.material.color`}
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
                              {materials
                                .find(m => m.type === form.watch(`items.${index}.material.type`))
                                ?.colors.map((color) => (
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

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Diamond Specifications</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.diamond.clarity`}
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
                                {diamondClarities.map((clarity) => (
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
                        name={`items.${index}.diamond.color`}
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
                                {diamondColors.map((color) => (
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
                        name={`items.${index}.diamond.cut`}
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
                                {diamondCuts.map((cut) => (
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
                        name={`items.${index}.diamond.caratWeight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carat Weight</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Enter carat weight"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.diamond.shape`}
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
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Setting Details</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.setting.type`}
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
                                {settingTypes.map((type) => (
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
                        name={`items.${index}.setting.style`}
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
                                {settingStyles.map((style) => (
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
                        name={`items.${index}.setting.size`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Enter size (e.g., 6.5)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name={`items.${index}.customSpecs`}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="deliveryMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Method *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {deliveryMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
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
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes about the order"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional notes about the order or special instructions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create Order</Button>
      </form>
    </Form>
  )
} 
 
 