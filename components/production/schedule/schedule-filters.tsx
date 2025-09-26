"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Filter, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Sample data for craftspeople
const craftspeople = [
  { id: "1", name: "Michael Chen" },
  { id: "2", name: "Sophia Rodriguez" },
  { id: "3", name: "David Kim" },
  { id: "4", name: "Emma Johnson" },
  { id: "5", name: "James Wilson" },
  { id: "6", name: "Olivia Martinez" },
  { id: "7", name: "William Taylor" },
  { id: "8", name: "Ava Thompson" },
]

// Sample data for production stages
const stages = [
  { id: "design", name: "Design", color: "bg-blue-500" },
  { id: "wax", name: "Wax", color: "bg-purple-500" },
  { id: "casting", name: "Casting", color: "bg-amber-500" },
  { id: "setting", name: "Setting", color: "bg-emerald-500" },
  { id: "polishing", name: "Polishing", color: "bg-pink-500" },
  { id: "qc", name: "Quality Control", color: "bg-red-500" },
  { id: "ready", name: "Ready", color: "bg-green-500" },
]

export function ScheduleFilters() {
  const [view, setView] = useState<"month" | "week" | "day">("week")
  const [selectedCraftspeople, setSelectedCraftspeople] = useState<string[]>([])
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [craftspeopleOpen, setCraftspeopleOpen] = useState(false)
  const [stagesOpen, setStagesOpen] = useState(false)

  const toggleCraftsperson = (id: string) => {
    setSelectedCraftspeople((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const toggleStage = (id: string) => {
    setSelectedStages((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  const clearFilters = () => {
    setSelectedCraftspeople([])
    setSelectedStages([])
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border">
          <Button
            variant="ghost"
            className={cn("rounded-none rounded-l-md px-3", view === "month" && "bg-muted hover:bg-muted")}
            onClick={() => setView("month")}
          >
            Month
          </Button>
          <Separator orientation="vertical" className="h-[20px] my-auto" />
          <Button
            variant="ghost"
            className={cn("rounded-none px-3", view === "week" && "bg-muted hover:bg-muted")}
            onClick={() => setView("week")}
          >
            Week
          </Button>
          <Separator orientation="vertical" className="h-[20px] my-auto" />
          <Button
            variant="ghost"
            className={cn("rounded-none rounded-r-md px-3", view === "day" && "bg-muted hover:bg-muted")}
            onClick={() => setView("day")}
          >
            Day
          </Button>
        </div>

        <Popover open={craftspeopleOpen} onOpenChange={setCraftspeopleOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-1">
              <Users className="h-4 w-4" />
              Craftspeople
              {selectedCraftspeople.length > 0 && (
                <Badge variant="secondary" className="ml-1 rounded-full px-1">
                  {selectedCraftspeople.length}
                </Badge>
              )}
              <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search craftspeople..." />
              <CommandList>
                <CommandEmpty>No craftsperson found.</CommandEmpty>
                <CommandGroup>
                  {craftspeople.map((person) => (
                    <CommandItem
                      key={person.id}
                      onSelect={() => toggleCraftsperson(person.id)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-sm border",
                          selectedCraftspeople.includes(person.id)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{person.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover open={stagesOpen} onOpenChange={setStagesOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4" />
              Stages
              {selectedStages.length > 0 && (
                <Badge variant="secondary" className="ml-1 rounded-full px-1">
                  {selectedStages.length}
                </Badge>
              )}
              <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search stages..." />
              <CommandList>
                <CommandEmpty>No stage found.</CommandEmpty>
                <CommandGroup>
                  {stages.map((stage) => (
                    <CommandItem
                      key={stage.id}
                      onSelect={() => toggleStage(stage.id)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-sm border",
                          selectedStages.includes(stage.id)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                        <span>{stage.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {(selectedCraftspeople.length > 0 || selectedStages.length > 0) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <div>
        <Button variant="outline" size="sm">
          Today
        </Button>
      </div>
    </div>
  )
}
