"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import * as LucideIcons from "lucide-react"

interface IconPickerProps {
  selectedIcon: string
  onSelectIcon: (icon: string) => void
}

// Get all icon names from Lucide
const iconNames = Object.keys(LucideIcons).filter((key) => key !== "createLucideIcon" && key !== "default")

export function IconPicker({ selectedIcon, onSelectIcon }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter icons based on search term
  const filteredIcons = iconNames.filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Get the actual icon component
  const getIconComponent = (name: string) => {
    const IconComponent = (LucideIcons as any)[name]
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search icons..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-md">
        <ScrollArea className="h-[200px]">
          <div className="grid grid-cols-8 gap-1 p-2">
            {filteredIcons.map((name) => (
              <Button
                key={name}
                variant="ghost"
                size="icon"
                className={`h-10 w-10 rounded-md ${selectedIcon === name ? "bg-primary/20" : ""}`}
                onClick={() => onSelectIcon(name)}
                title={name}
              >
                {getIconComponent(name)}
              </Button>
            ))}
            {filteredIcons.length === 0 && (
              <div className="col-span-8 py-8 text-center text-muted-foreground">No icons match your search</div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex items-center space-x-2">
        <div className="font-medium">Selected:</div>
        <div className="flex items-center space-x-1">
          <div className="h-8 w-8 flex items-center justify-center border rounded-md">
            {getIconComponent(selectedIcon)}
          </div>
          <div className="text-sm">{selectedIcon}</div>
        </div>
      </div>
    </div>
  )
}
