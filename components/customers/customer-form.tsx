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
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Building, MapPin, FileText, Save, Plus, X } from "lucide-react"

const customerFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  company: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  address: z.string().optional(),
  notes: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

// API function for creating customers
const createCustomerAPI = async (customerData: {
  full_name: string
  email: string
  phone?: string
  address?: string
  notes?: string
  company?: string
}) => {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customerData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create customer')
  }

  return response.json()
}

export function CustomerForm({ onSuccess }: { onSuccess?: (customer: any) => void } = {}) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    },
  })
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(data: CustomerFormValues, andAddAnother = false) {
    setLoading(true)
    try {
      const customer = await createCustomerAPI({
        full_name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: data.phone,
        address: data.address || undefined,
        notes: data.notes || undefined,
        company: data.company || undefined,
      })
      toast.success("Customer created successfully")
      
      if (andAddAnother) {
        form.reset()
        document.getElementById("firstName")?.focus()
      } else if (onSuccess) {
        onSuccess(customer.data)
      } else {
        router.push("/dashboard/customers")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create customer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="p-8">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Required fields marked with *
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Complete the form below to create a new customer profile</p>
        </div>

        {/* Personal Information Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="h-4 w-4" />
                    First Name *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John" 
                      {...field} 
                      id="firstName"
                      className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="h-4 w-4" />
                    Last Name *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Doe" 
                      {...field}
                      className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building className="h-4 w-4" />
                  Company Name
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Company name (optional)" 
                    {...field}
                    className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="john.doe@example.com" 
                      type="email" 
                      {...field}
                      className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Phone className="h-4 w-4" />
                    Phone Number *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(555) 555-5555" 
                      type="tel" 
                      {...field}
                      className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4" />
                  Address
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter customer's full address"
                    className="resize-none border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4" />
                  Notes
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any additional notes about the customer (preferences, special requirements, etc.)"
                    className="resize-none border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Optional notes about the customer's preferences or special requirements.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-8" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()} 
            disabled={loading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          <Button 
            type="button" 
            onClick={form.handleSubmit((data) => onSubmit(data, true))} 
            disabled={loading}
            variant="outline"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Save & Add Another
          </Button>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : "Create Customer"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 
 
 