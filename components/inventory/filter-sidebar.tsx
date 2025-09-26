"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FilterSidebar() {
  const [expanded, setExpanded] = useState<string[]>(["categories", "price", "metal"])

  const metalTypes = [
    { id: "gold", label: "Gold", color: "bg-amber-400" },
    { id: "silver", label: "Silver", color: "bg-gray-300" },
    { id: "platinum", label: "Platinum", color: "bg-gray-200" },
    { id: "rose-gold", label: "Rose Gold", color: "bg-rose-300" },
    { id: "white-gold", label: "White Gold", color: "bg-gray-100" },
  ]

  const stoneTypes = [
    { id: "diamond", label: "Diamond" },
    { id: "ruby", label: "Ruby" },
    { id: "sapphire", label: "Sapphire" },
    { id: "emerald", label: "Emerald" },
    { id: "pearl", label: "Pearl" },
    { id: "amethyst", label: "Amethyst" },
    { id: "topaz", label: "Topaz" },
  ]

  const availabilityOptions = [
    { id: "in-stock", label: "In Stock", count: 120 },
    { id: "low-stock", label: "Low Stock", count: 15 },
    { id: "out-of-stock", label: "Out of Stock", count: 8 },
    { id: "on-order", label: "On Order", count: 22 },
  ]

  const locations = [
    { id: "main-showroom", label: "Main Showroom" },
    { id: "vault", label: "Vault" },
    { id: "workshop", label: "Workshop" },
    { id: "display-cases", label: "Display Cases" },
  ]

  const vendors = [
    { id: "artisan-gems", label: "Artisan Gems" },
    { id: "luxury-metals", label: "Luxury Metals" },
    { id: "diamond-direct", label: "Diamond Direct" },
    { id: "precious-stones", label: "Precious Stones Inc." },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
          Clear All
        </Button>
      </div>

      <Accordion type="multiple" value={expanded} onValueChange={setExpanded} className="space-y-2">
        <AccordionItem value="categories" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">Categories</AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="category-rings" />
                <Label htmlFor="category-rings" className="text-sm">
                  Rings
                </Label>
              </div>
              <div className="pl-6 space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="category-engagement" />
                  <Label htmlFor="category-engagement" className="text-sm">
                    Engagement
                  </Label>
                </div>
                <div className="pl-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="category-solitaire" />
                    <Label htmlFor="category-solitaire" className="text-sm">
                      Solitaire
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="category-halo" />
                    <Label htmlFor="category-halo" className="text-sm">
                      Halo
                    </Label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="category-wedding" />
                  <Label htmlFor="category-wedding" className="text-sm">
                    Wedding
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="category-fashion" />
                  <Label htmlFor="category-fashion" className="text-sm">
                    Fashion
                  </Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="category-necklaces" />
                <Label htmlFor="category-necklaces" className="text-sm">
                  Necklaces
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="category-earrings" />
                <Label htmlFor="category-earrings" className="text-sm">
                  Earrings
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="category-bracelets" />
                <Label htmlFor="category-bracelets" className="text-sm">
                  Bracelets
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">Price Range</AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            <div className="space-y-4">
              <div className="pt-2">
                <Slider defaultValue={[0, 10000]} max={10000} step={100} className="py-4" />
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <Label htmlFor="price-min" className="sr-only">
                    Minimum Price
                  </Label>
                  <Input id="price-min" type="number" placeholder="Min" className="h-8 w-20" defaultValue={0} />
                </div>
                <span className="text-muted-foreground">to</span>
                <div>
                  <Label htmlFor="price-max" className="sr-only">
                    Maximum Price
                  </Label>
                  <Input id="price-max" type="number" placeholder="Max" className="h-8 w-20" defaultValue={10000} />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="metal" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">Metal Type</AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            <div className="space-y-2">
              {metalTypes.map((metal) => (
                <div key={metal.id} className="flex items-center gap-2">
                  <Checkbox id={`metal-${metal.id}`} />
                  <div className={`h-3 w-3 rounded-full ${metal.color}`} />
                  <Label htmlFor={`metal-${metal.id}`} className="text-sm">
                    {metal.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="stone" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">Stone Type</AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            <div className="space-y-2">
              {stoneTypes.map((stone) => (
                <div key={stone.id} className="flex items-center gap-2">
                  <Checkbox id={`stone-${stone.id}`} />
                  <Label htmlFor={`stone-${stone.id}`} className="text-sm">
                    {stone.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="weight" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">Weight Range</AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            <div className="space-y-4">
              <div className="pt-2">
                <Slider defaultValue={[0, 100]} max={100} step={1} className="py-4" />
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <Label htmlFor="weight-min" className="sr-only">
                    Minimum Weight
                  </Label>
                  <Input id="weight-min" type="number" placeholder="Min" className="h-8 w-16" defaultValue={0} />
                </div>
                <span className="text-muted-foreground">to</span>
                <div>
                  <Label htmlFor="weight-max" className="sr-only">
                    Maximum Weight
                  </Label>
                  <Input id="weight-max" type="number" placeholder="Max" className="h-8 w-16" defaultValue={100} />
                </div>
                <select className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                  <option>g</option>
                  <option>ct</option>
                  <option>oz</option>
                </select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">Availability</AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            <div className="space-y-2">
              {availabilityOptions.map((option) => (
                <div key={option.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id={`availability-${option.id}`} />
                    <Label htmlFor={`availability-${option.id}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                  <span className="text-xs text-muted-foreground">{option.count}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">Location</AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            <div className="space-y-2">
              {locations.map((location) => (
                <div key={location.id} className="flex items-center gap-2">
                  <Checkbox id={`location-${location.id}`} />
                  <Label htmlFor={`location-${location.id}`} className="text-sm">
                    {location.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="vendor" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">Vendor</AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            <div className="space-y-2">
              <div className="mb-2">
                <Input placeholder="Search vendors..." className="h-8 text-sm" />
              </div>
              {vendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center gap-2">
                  <Checkbox id={`vendor-${vendor.id}`} />
                  <Label htmlFor={`vendor-${vendor.id}`} className="text-sm">
                    {vendor.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-2">
        <Button className="w-full bg-primary text-primary-foreground">Apply Filters</Button>
      </div>
    </div>
  )
}
