"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

// Mock data for suppliers and categories
const suppliers = [
  { id: "diamond-direct", name: "Diamond Direct" },
  { id: "precision-casting", name: "Precision Casting" },
  { id: "artisan-engraving", name: "Artisan Engraving" },
  { id: "master-plating", name: "Master Plating" },
  { id: "gem-source", name: "Gem Source" },
  { id: "express-shipping", name: "Express Shipping" },
  { id: "secure-logistics", name: "Secure Logistics" },
  { id: "craft-alliance", name: "Craft Alliance" },
  { id: "silver-source", name: "Silver Source" },
  { id: "goldsmith-supplies", name: "Goldsmith Supplies" },
]

const categories = [
  { id: "gemstones", name: "Gemstones" },
  { id: "precious-metals", name: "Precious Metals" },
  { id: "findings", name: "Findings" },
  { id: "casting", name: "Casting Services" },
  { id: "plating", name: "Plating Services" },
  { id: "engraving", name: "Engraving" },
  { id: "packaging", name: "Packaging" },
  { id: "shipping", name: "Shipping" },
  { id: "tools", name: "Tools & Equipment" },
  { id: "displays", name: "Displays & Fixtures" },
]

interface SupplierPerformanceFiltersProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
  onFiltersChange: (timeRange: string, suppliers: string[], categories: string[]) => void
}

export default function SupplierPerformanceFilters({
  timeRange,
  selectedSuppliers,
  selectedCategories,
  onFiltersChange,
}: SupplierPerformanceFiltersProps) {
  const [open, setOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [localTimeRange, setLocalTimeRange] = useState(timeRange)
  const [localSelectedSuppliers, setLocalSelectedSuppliers] = useState<string[]>(selectedSuppliers)
  const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>(selectedCategories)
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)

  useEffect(() => {
    onFiltersChange(localTimeRange, localSelectedSuppliers, localSelectedCategories)
  }, [localTimeRange, localSelectedSuppliers, localSelectedCategories, onFiltersChange])

  const handleSupplierSelect = (supplierId: string) => {
    setLocalSelectedSuppliers((current) =>
      current.includes(supplierId) ? current.filter((id) => id !== supplierId) : [...current, supplierId],
    )
  }

  const handleCategorySelect = (categoryId: string) => {
    setLocalSelectedCategories((current) =>
      current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId],
    )
  }

  const clearFilters = () => {
    setLocalSelectedSuppliers([])
    setLocalSelectedCategories([])
    setLocalTimeRange("last-quarter")
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Filters</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsFilterExpanded(!isFilterExpanded)}>
              <Filter className="h-4 w-4 mr-2" />
              {isFilterExpanded ? "Collapse Filters" : "Expand Filters"}
            </Button>
          </div>

          <div
            className={cn(
              "grid gap-4 transition-all duration-200",
              isFilterExpanded ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-3",
            )}
          >
            <div>
              <label className="text-sm font-medium mb-1 block">Time Range</label>
              <Select value={localTimeRange} onValueChange={setLocalTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Suppliers</label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between w-full">
                    {localSelectedSuppliers.length === 0
                      ? "Select suppliers"
                      : `${localSelectedSuppliers.length} selected`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search suppliers..." />
                    <CommandList>
                      <CommandEmpty>No suppliers found.</CommandEmpty>
                      <CommandGroup>
                        {suppliers.map((supplier) => (
                          <CommandItem
                            key={supplier.id}
                            value={supplier.id}
                            onSelect={() => handleSupplierSelect(supplier.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                localSelectedSuppliers.includes(supplier.id) ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {supplier.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Categories</label>
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryOpen}
                    className="justify-between w-full"
                  >
                    {localSelectedCategories.length === 0
                      ? "Select categories"
                      : `${localSelectedCategories.length} selected`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandList>
                      <CommandEmpty>No categories found.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={category.id}
                            onSelect={() => handleCategorySelect(category.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                localSelectedCategories.includes(category.id) ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {(localSelectedSuppliers.length > 0 || localSelectedCategories.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {localSelectedSuppliers.map((supplierId) => {
                const supplier = suppliers.find((s) => s.id === supplierId)
                return supplier ? (
                  <Badge key={supplierId} variant="secondary" className="flex items-center gap-1">
                    {supplier.name}
                    <button className="ml-1 hover:text-destructive" onClick={() => handleSupplierSelect(supplierId)}>
                      ×
                    </button>
                  </Badge>
                ) : null
              })}

              {localSelectedCategories.map((categoryId) => {
                const category = categories.find((c) => c.id === categoryId)
                return category ? (
                  <Badge key={categoryId} variant="outline" className="flex items-center gap-1">
                    {category.name}
                    <button className="ml-1 hover:text-destructive" onClick={() => handleCategorySelect(categoryId)}>
                      ×
                    </button>
                  </Badge>
                ) : null
              })}

              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6">
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
