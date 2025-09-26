"use client"

import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample data - in a real app, this would come from your database
const productCategories = [
  { label: "All Categories", value: "all" },
  { label: "Rings", value: "rings" },
  { label: "Necklaces", value: "necklaces" },
  { label: "Earrings", value: "earrings" },
  { label: "Bracelets", value: "bracelets" },
  { label: "Custom Pieces", value: "custom" },
]

const stages = [
  { label: "All Stages", value: "all" },
  { label: "Design", value: "design" },
  { label: "Casting", value: "casting" },
  { label: "Stone Setting", value: "stone-setting" },
  { label: "Polishing", value: "polishing" },
  { label: "Quality Control", value: "quality-control" },
  { label: "Final Assembly", value: "final-assembly" },
]

const craftspeople = [
  { label: "All Craftspeople", value: "all" },
  { label: "Emma Johnson", value: "emma-johnson" },
  { label: "Michael Chen", value: "michael-chen" },
  { label: "Sophia Rodriguez", value: "sophia-rodriguez" },
  { label: "David Kim", value: "david-kim" },
  { label: "Olivia Williams", value: "olivia-williams" },
]

export function AnalyticsFilters({ filters, setFilters }: { filters: any; setFilters: any }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal md:w-[300px]",
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
        <SelectTrigger className="w-full md:w-[180px]">
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
          <Button variant="outline" role="combobox" className="w-full justify-between md:w-[200px]">
            {filters.craftsperson === "all"
              ? "All Craftspeople"
              : craftspeople.find((c) => c.value === filters.craftsperson)?.label}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 md:w-[200px]">
          <Command>
            <CommandInput placeholder="Search craftsperson..." />
            <CommandList>
              <CommandEmpty>No craftsperson found.</CommandEmpty>
              <CommandGroup>
                {craftspeople.map((craftsperson) => (
                  <CommandItem
                    key={craftsperson.value}
                    value={craftsperson.value}
                    onSelect={(value) => {
                      setFilters({ ...filters, craftsperson: value })
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        filters.craftsperson === craftsperson.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {craftsperson.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Select value={filters.stage} onValueChange={(value) => setFilters({ ...filters, stage: value })}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Production Stage" />
        </SelectTrigger>
        <SelectContent>
          {stages.map((stage) => (
            <SelectItem key={stage.value} value={stage.value}>
              {stage.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
