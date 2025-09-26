"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow, isToday, isYesterday, isSameWeek } from "date-fns"
import { X, Search, Trash2, Eye, Edit, ArrowUpRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMobile } from "@/hooks/use-mobile"

export type ScanHistoryItem = {
  id: string
  name: string
  sku: string
  timestamp: Date
  imageUrl: string
  type: string
  category: string
}

interface ScanHistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  onClearAll: () => void
  onViewItem: (id: string) => void
  onEditItem: (id: string) => void
  onDeleteItem: (id: string) => void
  items: ScanHistoryItem[]
}

export function ScanHistoryPanel({
  isOpen,
  onClose,
  onClearAll,
  onViewItem,
  onEditItem,
  onDeleteItem,
  items,
}: ScanHistoryPanelProps) {
  const isMobile = useMobile()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredItems, setFilteredItems] = useState<ScanHistoryItem[]>(items)

  // Filter items based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(items)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredItems(
        items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.sku.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query),
        ),
      )
    }
  }, [searchQuery, items])

  // Group items by date
  const groupedItems = filteredItems.reduce<Record<string, ScanHistoryItem[]>>((groups, item) => {
    let dateGroup: string

    if (isToday(item.timestamp)) {
      dateGroup = "Today"
    } else if (isYesterday(item.timestamp)) {
      dateGroup = "Yesterday"
    } else if (isSameWeek(item.timestamp, new Date())) {
      dateGroup = "This Week"
    } else {
      dateGroup = "Earlier"
    }

    if (!groups[dateGroup]) {
      groups[dateGroup] = []
    }
    groups[dateGroup].push(item)
    return groups
  }, {})

  // Format relative time
  const getRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true })
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-30 w-[300px] bg-background shadow-lg transition-transform duration-300 ease-in-out",
        isMobile ? "inset-0 w-full" : "",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Recent Scans</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClearAll} className="h-8 px-2">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Clear All</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 px-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search scans..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Scan List */}
        <ScrollArea className="flex-1">
          {filteredItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <Clock className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No scans found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {items.length === 0 ? "Your scan history will appear here" : "No results match your search"}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedItems).map(([dateGroup, groupItems]) => (
                <div key={dateGroup} className="mb-4">
                  <h3 className="mb-2 px-2 text-sm font-medium text-muted-foreground">{dateGroup}</h3>
                  <div className="space-y-2">
                    {groupItems.map((item) => (
                      <div
                        key={item.id}
                        className="group rounded-lg border bg-card p-2 shadow-sm transition-all hover:shadow"
                      >
                        <div className="flex gap-3">
                          {/* Thumbnail */}
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <h4 className="font-medium line-clamp-1">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                              <div className="mt-1 flex items-center gap-1">
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                  {item.category}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">{getRelativeTime(item.timestamp)}</p>
                              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => onViewItem(item.id)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span className="sr-only">View</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => onEditItem(item.id)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => onDeleteItem(item.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          <Button variant="outline" className="w-full" onClick={onClose}>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            View All Scans
          </Button>
        </div>
      </div>
    </div>
  )
}
