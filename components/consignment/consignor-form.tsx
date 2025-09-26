"use client"

import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { createConsignor, updateConsignor } from "@/lib/database"
import type { Consignor } from "@/types/consignment"

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  commission_rate: z.number().min(0).max(100),
  status: z.string(),
  tax_id: z.string().optional(),
  bank_account_info: z.object({
    account_number: z.string().optional(),
    routing_number: z.string().optional(),
    account_type: z.string().optional(),
    bank_name: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ConsignorFormProps {
  consignor?: Consignor
  onSubmit: () => void
}

export function ConsignorForm({ consignor, onSubmit }: ConsignorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: consignor?.name || "",
      email: consignor?.email || "",
      phone: consignor?.phone || "",
      address: consignor?.address || "",
      commission_rate: consignor?.commission_rate || 30,
      status: consignor?.status || "active",
      tax_id: consignor?.tax_id || "",
      bank_account_info: consignor?.bank_account_info || {},
      notes: consignor?.notes || "",
    },
  })

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      if (consignor) {
        await updateConsignor(consignor.id, data)
        toast.success("Consignor updated successfully")
      } else {
        await createConsignor(data)
        toast.success("Consignor created successfully")
      }
      onSubmit()
    } catch (error: any) {
      toast.error(error.message || "Failed to save consignor")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Basic Details</TabsTrigger>
          <TabsTrigger value="agreement">Agreement Terms</TabsTrigger>
          <TabsTrigger value="payment">Payment Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...form.register("phone")}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...form.register("address")}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Additional information about this consignor..."
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-red-500">{form.formState.errors.notes.message}</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="agreement" className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission_rate">Commission Rate (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                min="0"
                max="100"
                {...form.register("commission_rate", { valueAsNumber: true })}
              />
              {form.formState.errors.commission_rate && (
                <p className="text-sm text-red-500">{form.formState.errors.commission_rate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID</Label>
              <Input
                id="tax_id"
                {...form.register("tax_id")}
              />
              {form.formState.errors.tax_id && (
                <p className="text-sm text-red-500">{form.formState.errors.tax_id.message}</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              {...form.register("bank_account_info.bank_name")}
            />
            {form.formState.errors.bank_account_info?.bank_name && (
              <p className="text-sm text-red-500">{form.formState.errors.bank_account_info.bank_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                {...form.register("bank_account_info.account_number")}
              />
              {form.formState.errors.bank_account_info?.account_number && (
                <p className="text-sm text-red-500">{form.formState.errors.bank_account_info.account_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="routing_number">Routing Number</Label>
              <Input
                id="routing_number"
                {...form.register("bank_account_info.routing_number")}
              />
              {form.formState.errors.bank_account_info?.routing_number && (
                <p className="text-sm text-red-500">{form.formState.errors.bank_account_info.routing_number.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type</Label>
            <Select
              value={form.watch("bank_account_info.account_type")}
              onValueChange={(value) => form.setValue("bank_account_info.account_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.bank_account_info?.account_type && (
              <p className="text-sm text-red-500">{form.formState.errors.bank_account_info.account_type.message}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : consignor ? "Update Consignor" : "Add Consignor"}
        </Button>
      </DialogFooter>
    </form>
  )
}
