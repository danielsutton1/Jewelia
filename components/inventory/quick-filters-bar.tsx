"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronDown, Filter, Search, X } from "lucide-react"

interface FilterOption {
  value: string
  label: string
}

interface FilterCategory {
  name: string
  options: FilterOption[]
}

interface QuickFiltersBarProps {
  categories: FilterCategory[]
  onFilterChange: (filters: Record<string, string[]>) => void
}

export function QuickFiltersBar({ categories, onFilterChange }: QuickFiltersBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic
    console.log("Search for:", searchQuery)
  }

  const toggleFilter = (category: string, value: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev }

      if (!newFilters[category]) {
        newFilters[category] = []
      }

      const index = newFilters[category].indexOf(value)
      if (index === -1) {
        newFilters[category] = [...newFilters[category], value]
      } else {
        newFilters[category] = newFilters[category].filter((v) => v !== value)
        if (newFilters[category].length === 0) {
          delete newFilters[category]
        }
      }

      onFilterChange(newFilters)
      return newFilters
    })
  }

  const removeFilter = (category: string, value: string) => {
    toggleFilter(category, value)
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    onFilterChange({})
  }

  const hasActiveFilters = Object.keys(activeFilters).length > 0

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1">
          <form onSubmit={handleSearch}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search inventory..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {categories.map((category) => (
          <Popover
            key={category.name}
            open={openCategory === category.name}
            onOpenChange={(open) => setOpenCategory(open ? category.name : null)}
          >
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                {category.name}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder={`Search ${category.name.toLowerCase()}...`} />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {category.options.map((option) => {
                      const isSelected = activeFilters[category.name]?.includes(option.value)
                      return (
                        <CommandItem
                          key={option.value}
                          onSelect={() => toggleFilter(category.name, option.value)}
                          className="flex items-center justify-between"
                        >
                          <span>{option.label}</span>
                          {isSelected && <Check className="h-4 w-4" />}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        ))}

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm text-muted-foreground">Active filters:</div>
          {Object.entries(activeFilters).map(([category, values]) =>
            values.map((value) => {
              const label =
                categories.find((c) => c.name === category)?.options.find((o) => o.value === value)?.label || value

              return (
                <Badge key={`${category}-${value}`} variant="outline" className="flex items-center gap-1">
                  <span className="font-medium">{category}:</span> {label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => removeFilter(category, value)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )
            }),
          )}
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
