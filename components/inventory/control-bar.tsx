"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import {
  Grid,
  List,
  FolderTree,
  MapPin,
  Plus,
  Upload,
  Download,
  Printer,
  Filter,
  Search,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ControlBarProps {
  view: string
  setView: (view: string) => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  onSearch: (query: string) => void
}

export function ControlBar({ view, setView, showFilters, setShowFilters, onSearch }: ControlBarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <div className="bg-white border-b p-4 sticky top-0 z-10">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={setView} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger
                value="grid"
                className={cn("data-[state=active]:bg-primary data-[state=active]:text-primary-foreground")}
              >
                <Grid className="h-4 w-4 mr-1" />
                Grid
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className={cn("data-[state=active]:bg-primary data-[state=active]:text-primary-foreground")}
              >
                <List className="h-4 w-4 mr-1" />
                List
              </TabsTrigger>
              <TabsTrigger
                value="category"
                className={cn("data-[state=active]:bg-primary data-[state=active]:text-primary-foreground")}
              >
                <FolderTree className="h-4 w-4 mr-1" />
                Category
              </TabsTrigger>
              <TabsTrigger
                value="location"
                className={cn("data-[state=active]:bg-primary data-[state=active]:text-primary-foreground")}
              >
                <MapPin className="h-4 w-4 mr-1" />
                Location
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-muted")}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search inventory..."
              className="pl-8 bg-white rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/inventory/add">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-1 h-4 w-4" />
              Add Item
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="mr-1 h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="mr-2 h-4 w-4" />
                Print Labels
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
