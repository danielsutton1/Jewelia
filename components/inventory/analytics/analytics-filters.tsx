"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Filter } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function AnalyticsFilters() {
  const [date, setDate] = useState<Date>()
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Date Range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="rings">Rings</SelectItem>
              <SelectItem value="necklaces">Necklaces</SelectItem>
              <SelectItem value="earrings">Earrings</SelectItem>
              <SelectItem value="bracelets">Bracelets</SelectItem>
              <SelectItem value="watches">Watches</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="main">Main Store</SelectItem>
              <SelectItem value="downtown">Downtown</SelectItem>
              <SelectItem value="mall">Mall Location</SelectItem>
              <SelectItem value="warehouse">Warehouse</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 p-4 border rounded-md">
          <div className="space-y-4">
            <div>
              <Label>Price Range ($)</Label>
              <Slider defaultValue={[0, 5000]} min={0} max={10000} step={100} className="mt-2" />
              <div className="flex justify-between mt-1">
                <span className="text-xs">$0</span>
                <span className="text-xs">$10,000+</span>
              </div>
            </div>

            <div>
              <Label>Inventory Age (days)</Label>
              <Slider defaultValue={[0, 180]} min={0} max={365} step={10} className="mt-2" />
              <div className="flex justify-between mt-1">
                <span className="text-xs">0</span>
                <span className="text-xs">365+</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-dead-stock">Show Dead Stock Only</Label>
              <Switch id="show-dead-stock" />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-fast-moving">Show Fast Moving Only</Label>
              <Switch id="show-fast-moving" />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-consignment">Include Consignment</Label>
              <Switch id="include-consignment" defaultChecked />
            </div>
          </div>

          <div className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                <SelectItem value="vendor1">Vendor 1</SelectItem>
                <SelectItem value="vendor2">Vendor 2</SelectItem>
                <SelectItem value="vendor3">Vendor 3</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Materials" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Materials</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="mixed">Mixed Metals</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="secondary" className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
