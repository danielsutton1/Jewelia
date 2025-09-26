"use client"

import type React from "react"

import { useState } from "react"
import { Check, ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface LocationSelectionProps {
  auditData: any
  updateAuditData: (data: any) => void
}

// Mock location data
const mockLocations = [
  {
    id: "loc1",
    name: "Main Showroom",
    itemCount: 134,
    subLocations: [
      { id: "loc1-1", name: "Display Case A", itemCount: 42 },
      { id: "loc1-2", name: "Display Case B", itemCount: 38 },
      { id: "loc1-3", name: "Display Case C", itemCount: 54 },
    ],
  },
  {
    id: "loc2",
    name: "Vault",
    itemCount: 87,
    subLocations: [
      { id: "loc2-1", name: "Safe 1", itemCount: 45 },
      { id: "loc2-2", name: "Safe 2", itemCount: 42 },
    ],
  },
  {
    id: "loc3",
    name: "Workshop",
    itemCount: 56,
    subLocations: [
      { id: "loc3-1", name: "Work Bench 1", itemCount: 28 },
      { id: "loc3-2", name: "Work Bench 2", itemCount: 18 },
      { id: "loc3-3", name: "Storage Cabinet", itemCount: 10 },
    ],
  },
  {
    id: "loc4",
    name: "Back Office",
    itemCount: 23,
    subLocations: [{ id: "loc4-1", name: "Office Cabinet", itemCount: 23 }],
  },
]

export function LocationSelection({ auditData, updateAuditData }: LocationSelectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedLocations, setExpandedLocations] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>(auditData.locations || [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const toggleExpand = (locationId: string) => {
    setExpandedLocations((prev) =>
      prev.includes(locationId) ? prev.filter((id) => id !== locationId) : [...prev, locationId],
    )
  }

  const toggleLocationSelection = (locationId: string, checked: boolean) => {
    let newSelectedLocations: string[]

    if (checked) {
      // Add the location
      newSelectedLocations = [...selectedLocations, locationId]
    } else {
      // Remove the location
      newSelectedLocations = selectedLocations.filter((id) => id !== locationId)
    }

    setSelectedLocations(newSelectedLocations)
    updateAuditData({ locations: newSelectedLocations })
  }

  const filteredLocations = searchQuery
    ? mockLocations.filter(
        (location) =>
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.subLocations.some((subLoc) => subLoc.name.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : mockLocations

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Select Locations to Audit</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Choose the store locations that will be included in this physical inventory audit.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search locations..." className="pl-8" value={searchQuery} onChange={handleSearch} />
      </div>

      <div className="border rounded-md">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-4">
            {filteredLocations.map((location) => (
              <div key={location.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={location.id}
                      checked={selectedLocations.includes(location.id)}
                      onCheckedChange={(checked) => toggleLocationSelection(location.id, checked as boolean)}
                    />
                    <label
                      htmlFor={location.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {location.name}
                    </label>
                    <span className="text-xs text-muted-foreground">({location.itemCount} items)</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleExpand(location.id)}>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        expandedLocations.includes(location.id) && "rotate-90",
                      )}
                    />
                  </Button>
                </div>

                {expandedLocations.includes(location.id) && (
                  <div className="pl-6 space-y-2 border-l ml-1.5 mt-2">
                    {location.subLocations.map((subLocation) => (
                      <div key={subLocation.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={subLocation.id}
                          checked={selectedLocations.includes(subLocation.id)}
                          onCheckedChange={(checked) => toggleLocationSelection(subLocation.id, checked as boolean)}
                        />
                        <label
                          htmlFor={subLocation.id}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {subLocation.name}
                        </label>
                        <span className="text-xs text-muted-foreground">({subLocation.itemCount} items)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="bg-muted p-4 rounded-md">
        <h4 className="font-medium mb-2">Selected Locations</h4>
        {selectedLocations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No locations selected. Please select at least one location to continue.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedLocations.map((locId) => {
              // Find the location name
              let locationName = ""
              for (const loc of mockLocations) {
                if (loc.id === locId) {
                  locationName = loc.name
                  break
                }
                for (const subLoc of loc.subLocations) {
                  if (subLoc.id === locId) {
                    locationName = `${loc.name} > ${subLoc.name}`
                    break
                  }
                }
                if (locationName) break
              }

              return (
                <div key={locId} className="bg-background border rounded-md px-3 py-1 text-sm flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  {locationName}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
