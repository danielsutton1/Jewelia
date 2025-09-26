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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { createConsignedItem, updateConsignedItem } from "@/lib/database"
import type { ConsignedItem, ConsignmentStatus } from "@/types/consignment"

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  consignor_id: z.string().min(1, {
    message: "Please select a consignor.",
  }),
  price: z.number().min(0, {
    message: "Price must be greater than 0.",
  }),
  status: z.enum(["active", "sold", "returned", "expired"] as const),
  date_received: z.date(),
  end_date: z.date(),
  category: z.string(),
  condition: z.string(),
  photos: z.array(z.string()),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ConsignedItemFormProps {
  item?: ConsignedItem
  onSubmit: () => void
}

// Sample consignors for the dropdown - in a real app, this would come from your API
const consignors = [
  { id: "CON-001", name: "Eleanor Rigby", commissionRate: 30 },
  { id: "CON-002", name: "Jude Fawley", commissionRate: 35 },
  { id: "CON-003", name: "Lucy Diamond", commissionRate: 25 },
  { id: "CON-004", name: "Maxwell Edison", commissionRate: 30 },
  { id: "CON-005", name: "Rita Meter", commissionRate: 40 },
]

export function ConsignedItemForm({ item, onSubmit }: ConsignedItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedConsignor, setSelectedConsignor] = useState<any>(
    item ? consignors.find((c) => c.id === item.consignor_id) : null,
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      consignor_id: item?.consignor_id || "",
      price: item?.price || 0,
      status: item?.status || "active",
      date_received: item?.date_received ? new Date(item.date_received) : new Date(),
      end_date: item?.end_date ? new Date(item.end_date) : new Date(),
      category: item?.category || "",
      condition: item?.condition || "excellent",
      photos: item?.photos || [],
      notes: item?.notes || "",
    },
  })

  const handleConsignorChange = (consignorId: string) => {
    const consignor = consignors.find((c) => c.id === consignorId)
    setSelectedConsignor(consignor)
    form.setValue("consignor_id", consignorId)
  }

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const formattedData = {
        ...data,
        date_received: format(data.date_received, "yyyy-MM-dd"),
        end_date: format(data.end_date, "yyyy-MM-dd"),
      }

      if (item) {
        await updateConsignedItem(item.id, formattedData)
        toast.success("Item updated successfully")
      } else {
        await createConsignedItem(formattedData)
        toast.success("Item created successfully")
      }
      onSubmit()
    } catch (error: any) {
      toast.error(error.message || "Failed to save item")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Item Details</TabsTrigger>
          <TabsTrigger value="consignment">Consignment Terms</TabsTrigger>
          <TabsTrigger value="additional">Additional Info</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Detailed description of the item..."
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value) => form.setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rings">Rings</SelectItem>
                  <SelectItem value="necklaces">Necklaces</SelectItem>
                  <SelectItem value="bracelets">Bracelets</SelectItem>
                  <SelectItem value="earrings">Earrings</SelectItem>
                  <SelectItem value="watches">Watches</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={form.watch("condition")}
                onValueChange={(value) => form.setValue("condition", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.condition && (
                <p className="text-sm text-red-500">{form.formState.errors.condition.message}</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="consignment" className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="consignor">Consignor</Label>
            <Select
              value={form.watch("consignor_id")}
              onValueChange={handleConsignorChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select consignor" />
              </SelectTrigger>
              <SelectContent>
                {consignors.map((consignor) => (
                  <SelectItem key={consignor.id} value={consignor.id}>
                    {consignor.name} ({consignor.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.consignor_id && (
              <p className="text-sm text-red-500">{form.formState.errors.consignor_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as ConsignmentStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_received">Date Received</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("date_received") && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("date_received") ? format(form.watch("date_received"), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("date_received")}
                    onSelect={(date) => form.setValue("date_received", date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.date_received && (
                <p className="text-sm text-red-500">{form.formState.errors.date_received.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("end_date") && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("end_date") ? format(form.watch("end_date"), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("end_date")}
                    onSelect={(date) => form.setValue("end_date", date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.end_date && (
                <p className="text-sm text-red-500">{form.formState.errors.end_date.message}</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="additional" className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Additional information about this item..."
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-red-500">{form.formState.errors.notes.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Item Photos</Label>
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <p className="text-sm text-muted-foreground">Drag and drop photos here or click to upload</p>
              <Button type="button" variant="outline" size="sm" className="mt-2">
                Upload Photos
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : item ? "Update Item" : "Add Item"}
        </Button>
      </DialogFooter>
    </form>
  )
}
