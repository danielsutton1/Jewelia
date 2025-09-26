"use client"

import { useState, useEffect } from "react"
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

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
})

// Infer the TypeScript type from the schema
type FormValues = z.infer<typeof formSchema>

// Phone number formatting utility
function formatPhoneNumber(value: string): string {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, "")
  
  // Format the number as (XXX) XXX-XXXX
  if (numbers.length <= 3) {
    return numbers
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
  } else {
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }
}

export function ExampleForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formInteractions, setFormInteractions] = useState({
    fieldChanges: 0,
    validationErrors: 0,
    lastInteraction: new Date(),
  })

  // Initialize the form with validation and persistence
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
    // Enable form persistence
    shouldUnregister: false,
    // Enable debounced validation
    mode: "onChange",
    reValidateMode: "onChange",
  })

  // Track form interactions
  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormInteractions(prev => ({
        ...prev,
        fieldChanges: prev.fieldChanges + 1,
        lastInteraction: new Date(),
      }))
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  // Track validation errors
  useEffect(() => {
    const errorCount = Object.keys(form.formState.errors).length
    if (errorCount > 0) {
      setFormInteractions(prev => ({
        ...prev,
        validationErrors: prev.validationErrors + 1,
      }))
    }
  }, [form.formState.errors])

  // Form submission handler
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      // Here you would typically make an API call to submit the form data
      // For example:
      // await submitFormData(data)
      
      // Log form analytics before submission
      console.log("Form Analytics:", {
        ...formInteractions,
        submissionTime: new Date(),
        formData: data,
      })
      
      // Show success message
      toast.success("Form submitted successfully")
      
      // Reset the form
      form.reset()
      
      // Reset form interactions
      setFormInteractions({
        fieldChanges: 0,
        validationErrors: 0,
        lastInteraction: new Date(),
      })
      
      // Optionally redirect
      // router.push("/success")
    } catch (error: any) {
      // Handle errors
      toast.error(error.message || "Failed to submit form")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john.doe@example.com" type="email" {...field} />
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
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(555) 555-5555" 
                  type="tel" 
                  {...field}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    field.onChange(formatted)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter your message here..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Please provide details about your inquiry.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
          
          {/* Form Analytics Display (for development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-sm text-muted-foreground">
              <p>Field Changes: {formInteractions.fieldChanges}</p>
              <p>Validation Errors: {formInteractions.validationErrors}</p>
              <p>Last Interaction: {formInteractions.lastInteraction.toLocaleTimeString()}</p>
            </div>
          )}
        </div>
      </form>
    </Form>
  )
} 