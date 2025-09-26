"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Filter } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function InventoryFilters() {
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
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                <SelectItem value="vendor1">Diamond Direct</SelectItem>
                <SelectItem value="vendor2">Gem Source</SelectItem>
                <SelectItem value="vendor3">Goldsmith Supplies</SelectItem>
                <SelectItem value="vendor4">Silver Source</SelectItem>
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
                <SelectItem value="diamonds">Diamonds</SelectItem>
                <SelectItem value="gemstones">Gemstones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="overstock">Overstock</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Age Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="0-30">0-30 Days</SelectItem>
                <SelectItem value="31-60">31-60 Days</SelectItem>
                <SelectItem value="61-90">61-90 Days</SelectItem>
                <SelectItem value="91-180">91-180 Days</SelectItem>
                <SelectItem value="181+">181+ Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="ABC Classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                <SelectItem value="a">A Items (High Value)</SelectItem>
                <SelectItem value="b">B Items (Medium Value)</SelectItem>
                <SelectItem value="c">C Items (Low Value)</SelectItem>
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
