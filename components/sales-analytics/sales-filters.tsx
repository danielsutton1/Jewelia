"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/business-intelligence/date-range-picker"

export function SalesFilters() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  })
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter])
    }
  }

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-5">
          <div>
            <Label htmlFor="date-range" className="mb-1 block text-sm">
              Date Range
            </Label>
            <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
          </div>

          <div>
            <Label htmlFor="categories" className="mb-1 block text-sm">
              Categories
            </Label>
            <Select onValueChange={(value) => addFilter(`Category: ${value}`)}>
              <SelectTrigger id="categories">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rings">Rings</SelectItem>
                <SelectItem value="necklaces">Necklaces</SelectItem>
                <SelectItem value="earrings">Earrings</SelectItem>
                <SelectItem value="bracelets">Bracelets</SelectItem>
                <SelectItem value="watches">Watches</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="channels" className="mb-1 block text-sm">
              Sales Channels
            </Label>
            <Select onValueChange={(value) => addFilter(`Channel: ${value}`)}>
              <SelectTrigger id="channels">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-store">In-Store</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="events">Events</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="segments" className="mb-1 block text-sm">
              Customer Segments
            </Label>
            <Select onValueChange={(value) => addFilter(`Segment: ${value}`)}>
              <SelectTrigger id="segments">
                <SelectValue placeholder="Select segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New Customers</SelectItem>
                <SelectItem value="returning">Returning Customers</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="bridal">Bridal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="associates" className="mb-1 block text-sm">
              Sales Associates
            </Label>
            <Select onValueChange={(value) => addFilter(`Associate: ${value}`)}>
              <SelectTrigger id="associates">
                <SelectValue placeholder="Select associate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Associates</SelectItem>
                <SelectItem value="emma">Emma Johnson</SelectItem>
                <SelectItem value="michael">Michael Chen</SelectItem>
                <SelectItem value="sophia">Sophia Rodriguez</SelectItem>
                <SelectItem value="james">James Wilson</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge key={filter} variant="secondary" className="gap-1">
                {filter}
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => removeFilter(filter)}>
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {filter} filter</span>
                </Button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setActiveFilters([])}>
              Clear all
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
