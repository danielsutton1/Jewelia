"use client"

import { CalendarIcon, ChevronsUpDown, Filter } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Sample data - in a real app, this would come from your database
const productCategories = [
  { label: "All Categories", value: "all" },
  { label: "Rings", value: "rings" },
  { label: "Necklaces", value: "necklaces" },
  { label: "Earrings", value: "earrings" },
  { label: "Bracelets", value: "bracelets" },
  { label: "Custom Pieces", value: "custom" },
]

const workOrders = [
  { id: "WO-1001", description: "Diamond Engagement Ring" },
  { id: "WO-1002", description: "Gold Wedding Band Set" },
  { id: "WO-1003", description: "Sapphire Pendant" },
  { id: "WO-1004", description: "Pearl Earrings" },
  { id: "WO-1005", description: "Custom Emerald Bracelet" },
  { id: "WO-1006", description: "Ruby Anniversary Ring" },
  { id: "WO-1007", description: "Silver Chain Necklace" },
  { id: "WO-1008", description: "Diamond Tennis Bracelet" },
]

const costCategories = [
  { id: "materials", label: "Direct Materials" },
  { id: "labor", label: "Labor Hours" },
  { id: "machine", label: "Machine Time" },
  { id: "overhead", label: "Overhead Allocation" },
  { id: "outsourced", label: "Outsourced Services" },
]

export function CostFilters({ filters, setFilters }: { filters: any; setFilters: any }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal md:w-[300px]",
                !filters.dateRange && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd, y")} - {format(filters.dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange?.from}
              selected={filters.dateRange}
              onSelect={(range) => setFilters({ ...filters, dateRange: range })}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Select
        value={filters.productCategory}
        onValueChange={(value) => setFilters({ ...filters, productCategory: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Product Category" />
        </SelectTrigger>
        <SelectContent>
          {productCategories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex justify-between gap-1 md:w-[200px]">
            <span className="truncate">
              {filters.workOrderIds.length
                ? `${filters.workOrderIds.length} Work Order${filters.workOrderIds.length > 1 ? "s" : ""}`
                : "Select Work Orders"}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search work orders..." />
            <CommandList>
              <CommandEmpty>No work orders found.</CommandEmpty>
              <CommandGroup>
                {workOrders.map((order) => (
                  <CommandItem
                    key={order.id}
                    onSelect={() => {
                      setFilters({
                        ...filters,
                        workOrderIds: filters.workOrderIds.includes(order.id)
                          ? filters.workOrderIds.filter((id: any) => id !== order.id)
                          : [...filters.workOrderIds, order.id],
                      })
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={filters.workOrderIds.includes(order.id)}
                        onCheckedChange={(checked) => {
                          setFilters({
                            ...filters,
                            workOrderIds: checked
                              ? [...filters.workOrderIds, order.id]
                              : filters.workOrderIds.filter((id: any) => id !== order.id),
                          })
                        }}
                      />
                      <span>{order.id}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-1">
            <Filter className="h-4 w-4" />
            <span>Cost Categories</span>
            <Badge variant="secondary" className="ml-1">
              {filters.costCategories.length}
            </Badge>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Cost Categories</SheetTitle>
            <SheetDescription>Select which cost categories to include in the analysis</SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <div className="space-y-4">
              {costCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.costCategories.includes(category.id)}
                    onCheckedChange={(checked) => {
                      setFilters({
                        ...filters,
                        costCategories: checked
                          ? [...filters.costCategories, category.id]
                          : filters.costCategories.filter((id: any) => id !== category.id),
                      })
                    }}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button>Apply Filters</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
