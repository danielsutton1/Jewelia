"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function OrderFilters() {
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const orderStatuses = [
    { id: "completed", label: "Completed" },
    { id: "processing", label: "Processing" },
    { id: "pending", label: "Pending" },
    { id: "cancelled", label: "Cancelled" },
  ]

  const paymentStatuses = [
    { id: "paid", label: "Paid" },
    { id: "pending", label: "Pending" },
    { id: "refunded", label: "Refunded" },
    { id: "failed", label: "Failed" },
  ]

  const shippingStatuses = [
    { id: "delivered", label: "Delivered" },
    { id: "shipped", label: "Shipped" },
    { id: "processing", label: "Processing" },
    { id: "cancelled", label: "Cancelled" },
  ]

  // Horizontal filter content for desktop
  const horizontalFilterContent = (
    <div className="hidden md:flex w-full items-end gap-4 flex-wrap bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl px-4 py-3 mb-4">
      {/* Shipping Status */}
      <div className="flex flex-col min-w-[140px]">
        <span className="text-xs font-medium mb-1">Shipping Status</span>
        <Select defaultValue="all">
          <SelectTrigger className="w-full h-9">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {shippingStatuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>{status.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Sort By */}
      <div className="flex flex-col min-w-[140px]">
        <span className="text-xs font-medium mb-1">Sort By</span>
        <Select defaultValue="newest">
          <SelectTrigger className="w-full h-9">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="highest">Highest Value</SelectItem>
            <SelectItem value="lowest">Lowest Value</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Buttons */}
      <div className="flex gap-2 ml-auto">
        <Button variant="outline" size="sm">Reset</Button>
        <Button size="sm">Apply</Button>
      </div>
    </div>
  )

  // Keep the original filterContent for mobile modal
  const filterContent = (
    <>
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-medium">Date Range</h3>
          <DatePickerWithRange className="w-full" />
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 text-sm font-medium">Order Status</h3>
          <div className="space-y-2">
            {orderStatuses.map((status) => (
              <div key={status.id} className="flex items-center space-x-2">
                <Checkbox id={`status-${status.id}`} />
                <Label htmlFor={`status-${status.id}`} className="text-sm font-normal">
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 text-sm font-medium">Payment Status</h3>
          <div className="space-y-2">
            {paymentStatuses.map((status) => (
              <div key={status.id} className="flex items-center space-x-2">
                <Checkbox id={`payment-${status.id}`} />
                <Label htmlFor={`payment-${status.id}`} className="text-sm font-normal">
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 text-sm font-medium">Shipping Status</h3>
          <div className="space-y-2">
            {shippingStatuses.map((status) => (
              <div key={status.id} className="flex items-center space-x-2">
                <Checkbox id={`shipping-${status.id}`} />
                <Label htmlFor={`shipping-${status.id}`} className="text-sm font-normal">
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 text-sm font-medium">Sort By</h3>
          <RadioGroup defaultValue="newest">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="newest" id="sort-newest" />
              <Label htmlFor="sort-newest" className="text-sm font-normal">
                Newest First
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="oldest" id="sort-oldest" />
              <Label htmlFor="sort-oldest" className="text-sm font-normal">
                Oldest First
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="highest" id="sort-highest" />
              <Label htmlFor="sort-highest" className="text-sm font-normal">
                Highest Value
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lowest" id="sort-lowest" />
              <Label htmlFor="sort-lowest" className="text-sm font-normal">
                Lowest Value
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 text-sm font-medium">Items Per Page</h3>
          <Select defaultValue="10">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 items</SelectItem>
              <SelectItem value="20">20 items</SelectItem>
              <SelectItem value="50">50 items</SelectItem>
              <SelectItem value="100">100 items</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Horizontal filters for desktop */}
      {horizontalFilterContent}

      {/* Mobile filters button */}
      <div className="md:hidden">
        <Button
          variant="outline"
          className="mb-4 w-full flex items-center justify-center gap-2"
          onClick={() => setShowMobileFilters(true)}
        >
          <Filter className="h-4 w-4" />
          Show Filters
        </Button>
      </div>

      {/* Mobile filters panel */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 right-0 z-50 h-full w-full max-w-xs border-l bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-4">{filterContent}</div>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between border-t bg-background p-4">
              <Button variant="outline" onClick={() => setShowMobileFilters(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowMobileFilters(false)}>Apply Filters</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
