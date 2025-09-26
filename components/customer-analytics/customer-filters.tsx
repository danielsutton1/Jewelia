"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const segments = [
  { label: "New Customers", value: "new" },
  { label: "Returning", value: "returning" },
  { label: "VIP", value: "vip" },
  { label: "At Risk", value: "at-risk" },
  { label: "Lapsed", value: "lapsed" },
]

const purchaseHistory = [
  { label: "First Purchase", value: "first" },
  { label: "2-5 Purchases", value: "few" },
  { label: "6-10 Purchases", value: "several" },
  { label: "11+ Purchases", value: "many" },
]

const regions = [
  { label: "North America", value: "north-america" },
  { label: "Europe", value: "europe" },
  { label: "Asia Pacific", value: "asia-pacific" },
  { label: "Latin America", value: "latin-america" },
  { label: "Middle East", value: "middle-east" },
]

const timeframes = [
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "Last 6 Months", value: "6m" },
  { label: "Last 12 Months", value: "12m" },
  { label: "All Time", value: "all" },
]

export function CustomerFilters() {
  const [open, setOpen] = useState(false)
  const [selectedSegments, setSelectedSegments] = useState<string[]>([])
  const [selectedPurchaseHistory, setSelectedPurchaseHistory] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState("90d")

  const totalFilters =
    selectedSegments.length +
    selectedPurchaseHistory.length +
    selectedRegions.length +
    (selectedTimeframe !== "90d" ? 1 : 0)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1 sm:gap-2 min-h-[44px] min-w-[44px]">
            <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Filters</span>
            <span className="sm:hidden">Filters</span>
            {totalFilters > 0 && (
              <Badge variant="secondary" className="ml-1 rounded-full px-1 sm:px-2 text-xs">
                {totalFilters}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] sm:w-[340px] p-0" align="start">
          <div className="p-3 sm:p-4">
            <h4 className="font-medium text-sm sm:text-base">Customer Segments</h4>
            <div className="mt-2 flex flex-wrap gap-1">
              {segments.map((segment) => (
                <Badge
                  key={segment.value}
                  variant={selectedSegments.includes(segment.value) ? "default" : "outline"}
                  className="cursor-pointer text-xs sm:text-sm min-h-[32px] min-w-[32px]"
                  onClick={() => {
                    if (selectedSegments.includes(segment.value)) {
                      setSelectedSegments(selectedSegments.filter((s) => s !== segment.value))
                    } else {
                      setSelectedSegments([...selectedSegments, segment.value])
                    }
                  }}
                >
                  {segment.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="p-3 sm:p-4">
            <h4 className="font-medium text-sm sm:text-base">Purchase History</h4>
            <div className="mt-2 flex flex-wrap gap-1">
              {purchaseHistory.map((history) => (
                <Badge
                  key={history.value}
                  variant={selectedPurchaseHistory.includes(history.value) ? "default" : "outline"}
                  className="cursor-pointer text-xs sm:text-sm min-h-[32px] min-w-[32px]"
                  onClick={() => {
                    if (selectedPurchaseHistory.includes(history.value)) {
                      setSelectedPurchaseHistory(selectedPurchaseHistory.filter((h) => h !== history.value))
                    } else {
                      setSelectedPurchaseHistory([...selectedPurchaseHistory, history.value])
                    }
                  }}
                >
                  {history.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="p-3 sm:p-4">
            <h4 className="font-medium text-sm sm:text-base">Regions</h4>
            <div className="mt-2 flex flex-wrap gap-1">
              {regions.map((region) => (
                <Badge
                  key={region.value}
                  variant={selectedRegions.includes(region.value) ? "default" : "outline"}
                  className="cursor-pointer text-xs sm:text-sm min-h-[32px] min-w-[32px]"
                  onClick={() => {
                    if (selectedRegions.includes(region.value)) {
                      setSelectedRegions(selectedRegions.filter((r) => r !== region.value))
                    } else {
                      setSelectedRegions([...selectedRegions, region.value])
                    }
                  }}
                >
                  {region.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="p-3 sm:p-4">
            <h4 className="font-medium text-sm sm:text-base">Timeframe</h4>
            <div className="mt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between min-h-[44px] min-w-[44px]">
                    {timeframes.find((timeframe) => timeframe.value === selectedTimeframe)?.label || "Select timeframe"}
                    <ChevronsUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search timeframe..." className="text-sm" />
                    <CommandList>
                      <CommandEmpty>No timeframe found.</CommandEmpty>
                      <CommandGroup>
                        {timeframes.map((timeframe) => (
                          <CommandItem
                            key={timeframe.value}
                            value={timeframe.value}
                            onSelect={(currentValue) => {
                              setSelectedTimeframe(currentValue)
                            }}
                            className="min-h-[44px] min-w-[44px]"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-3 w-3 sm:h-4 sm:w-4",
                                selectedTimeframe === timeframe.value ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <span className="text-sm">{timeframe.label}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-3 sm:p-4">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedSegments([])
                setSelectedPurchaseHistory([])
                setSelectedRegions([])
                setSelectedTimeframe("90d")
              }}
              className="min-h-[44px] min-w-[44px] text-xs sm:text-sm"
            >
              Reset filters
            </Button>
            <Button onClick={() => setOpen(false)} className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">
              Apply filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
