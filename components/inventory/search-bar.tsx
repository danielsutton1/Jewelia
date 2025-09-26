"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Mic, Bookmark, Clock, X, ChevronDown } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  const [savedSearches] = useState([
    "Diamond rings under $5000",
    "Gold items in main showroom",
    "New arrivals this month",
    "Items needing repair",
  ])

  const [recentSearches] = useState(["sapphire", "wedding bands", "platinum", "emerald cut"])

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by name, SKU, description..."
          className="pl-9 pr-9"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      <Button variant="outline" size="icon" title="Voice search">
        <Mic className="h-4 w-4" />
        <span className="sr-only">Voice search</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Saved</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {savedSearches.map((search, index) => (
            <DropdownMenuItem key={index} onClick={() => onChange(search)}>
              <Bookmark className="mr-2 h-4 w-4" />
              <span className="truncate">{search}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Recent</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {recentSearches.map((search, index) => (
            <DropdownMenuItem key={index} onClick={() => onChange(search)}>
              <Clock className="mr-2 h-4 w-4" />
              <span>{search}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
