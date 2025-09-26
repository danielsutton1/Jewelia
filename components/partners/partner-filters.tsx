"use client"

import { useState } from "react"
import type { PartnerCategory, PartnerFilterState, PartnerSpecialty } from "@/types/partner-management"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface PartnerFiltersProps {
  filters: PartnerFilterState
  onFiltersChange: (filters: PartnerFilterState) => void
  onSearchChange: (search: string) => void
  onReset: () => void
}

export function PartnerFilters({ filters, onFiltersChange, onSearchChange, onReset }: PartnerFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const categoryOptions: { value: PartnerCategory; label: string }[] = [
    { value: "supplier-metals", label: "Metal Suppliers" },
    { value: "supplier-stones", label: "Stone Suppliers" },
    { value: "supplier-findings", label: "Findings Suppliers" },
    { value: "service-casting", label: "Casting Services" },
    { value: "service-engraving", label: "Engraving Services" },
    { value: "service-plating", label: "Plating Services" },
    { value: "contractor", label: "Contractors" },
    { value: "shipping", label: "Shipping Partners" },
  ]

  const specialtyOptions: { value: PartnerSpecialty; label: string }[] = [
    { value: "gold", label: "Gold" },
    { value: "silver", label: "Silver" },
    { value: "platinum", label: "Platinum" },
    { value: "diamonds", label: "Diamonds" },
    { value: "gemstones", label: "Gemstones" },
    { value: "pearls", label: "Pearls" },
    { value: "chains", label: "Chains" },
    { value: "clasps", label: "Clasps" },
    { value: "settings", label: "Settings" },
    { value: "lost-wax-casting", label: "Lost Wax Casting" },
    { value: "hand-engraving", label: "Hand Engraving" },
    { value: "machine-engraving", label: "Machine Engraving" },
    { value: "rhodium-plating", label: "Rhodium Plating" },
    { value: "gold-plating", label: "Gold Plating" },
    { value: "stone-setting", label: "Stone Setting" },
    { value: "polishing", label: "Polishing" },
    { value: "domestic-shipping", label: "Domestic Shipping" },
    { value: "international-shipping", label: "International Shipping" },
    { value: "express-shipping", label: "Express Shipping" },
    { value: "custom-packaging", label: "Custom Packaging" },
  ]

  const handleCategoryChange = (category: PartnerCategory, checked: boolean) => {
    const newCategories = checked ? [...filters.categories, category] : filters.categories.filter((c) => c !== category)

    onFiltersChange({
      ...filters,
      categories: newCategories,
    })
  }

  const handleSpecialtyChange = (specialty: PartnerSpecialty, checked: boolean) => {
    const newSpecialties = checked
      ? [...filters.specialties, specialty]
      : filters.specialties.filter((s) => s !== specialty)

    onFiltersChange({
      ...filters,
      specialties: newSpecialties,
    })
  }

  const handleRatingChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      minRating: value[0],
    })
  }

  const handleResponseTimeChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      maxResponseTime: value[0],
    })
  }

  const handleReset = () => {
    onReset()
    setIsOpen(false)
  }

  const activeFilterCount =
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.specialties.length > 0 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxResponseTime !== null ? 1 : 0)

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-grow">
        <Input
          placeholder="Search partners..."
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {filters.search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 rounded-full px-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[320px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filter Partners</SheetTitle>
            <SheetDescription>Narrow down partners based on your requirements</SheetDescription>
          </SheetHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Partner Categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categoryOptions.map((category) => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.value}`}
                      checked={filters.categories.includes(category.value)}
                      onCheckedChange={(checked) => handleCategoryChange(category.value, checked as boolean)}
                    />
                    <Label htmlFor={`category-${category.value}`}>{category.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Specialties</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specialtyOptions.map((specialty) => (
                  <div key={specialty.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`specialty-${specialty.value}`}
                      checked={filters.specialties.includes(specialty.value)}
                      onCheckedChange={(checked) => handleSpecialtyChange(specialty.value, checked as boolean)}
                    />
                    <Label htmlFor={`specialty-${specialty.value}`}>{specialty.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Minimum Rating</h3>
                <span className="text-sm">{filters.minRating.toFixed(1)}</span>
              </div>
              <Slider
                defaultValue={[filters.minRating]}
                min={0}
                max={5}
                step={0.1}
                onValueChange={handleRatingChange}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Max Response Time (hours)</h3>
                <span className="text-sm">
                  {filters.maxResponseTime === null ? "Any" : `${filters.maxResponseTime}h`}
                </span>
              </div>
              <Slider
                defaultValue={[filters.maxResponseTime || 24]}
                min={1}
                max={24}
                step={1}
                onValueChange={handleResponseTimeChange}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleReset}>
                Reset Filters
              </Button>
              <Button onClick={() => setIsOpen(false)}>Apply Filters</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
