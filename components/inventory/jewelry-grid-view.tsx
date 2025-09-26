"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useDraggable } from "@dnd-kit/core"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import { Edit, Eye, Heart, MoreHorizontal, ShoppingCart, Tag, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Status indicator colors
const statusColors = {
  available: "bg-green-500",
  reserved: "bg-amber-500",
  sold: "bg-red-500",
}

// Location badge colors
const locationColors: { [key: string]: string } = {
  "Main Showroom": "bg-blue-100 text-blue-800",
  Vault: "bg-amber-100 text-amber-800",
  Workshop: "bg-green-100 text-green-800",
  "Display Cases": "bg-purple-100 text-purple-800",
}

interface DiamondSpecs {
  clarity: string
  color: string
  cut: string
  caratWeight: number
  fluorescence?: string
  polish?: string
  symmetry?: string
  gradingLab?: string
  reportNumber?: string
  depthPercentage?: number
  tablePercentage?: number
  measurements?: { length: number; width: number; depth: number }
}

interface JewelryItem {
  id: string | number
  name: string
  sku: string
  retailPrice: number
  wholesalePrice: number
  image: string
  status: "available" | "reserved" | "sold"
  location: string
  category: string
  tags: string[]
  diamondSpecs?: DiamondSpecs
}

interface JewelryGridViewProps {
  items: JewelryItem[]
  onItemClick?: (item: JewelryItem) => void
  onItemEdit?: (item: JewelryItem) => void
  onBulkAction?: (items: JewelryItem[], action: string) => void
}

export function JewelryGridView({ items, onItemClick, onItemEdit, onBulkAction }: JewelryGridViewProps) {
  const [columns, setColumns] = useState(4)
  const [showWholesale, setShowWholesale] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set())
  const [visibleItems, setVisibleItems] = useState(12)
  const gridRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0)

  // Handle column adjustment
  const adjustColumns = (newColumns: number) => {
    setColumns(Math.min(Math.max(newColumns, 2), 6))
  }

  // Handle lazy loading
  useEffect(() => {
    const handleScroll = () => {
      if (gridRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement
        if (scrollTop + clientHeight >= scrollHeight - 300 && visibleItems < items.length) {
          setVisibleItems((prev) => Math.min(prev + 8, items.length))
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [visibleItems, items.length])

  // Handle bulk selection
  const toggleSelectItem = (id: string | number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)))
    }
  }

  // Mobile swipe navigation
  const handlePrevious = () => {
    setCurrentMobileIndex((prev) => Math.max(prev - 1, 0))
  }

  const handleNext = () => {
    setCurrentMobileIndex((prev) => Math.min(prev + 1, items.length - 1))
  }

  // Render grid or mobile view
  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-2">
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 rounded-md border bg-background p-1">
            {[2, 3, 4, 5, 6].map((col) => (
              <Button
                key={col}
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0", columns === col && "bg-muted text-muted-foreground")}
                onClick={() => adjustColumns(col)}
              >
                {col}
              </Button>
            ))}
          </div>
          <Toggle aria-label="Toggle bulk selection mode" pressed={bulkMode} onPressedChange={setBulkMode}>
            <Tag className="h-4 w-4 mr-1" />
            Bulk
          </Toggle>
        </div>

        <div className="flex items-center gap-2">
          <Toggle aria-label="Toggle price view" pressed={showWholesale} onPressedChange={setShowWholesale}>
            {showWholesale ? "Wholesale" : "Retail"}
          </Toggle>
          {bulkMode && selectedItems.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{selectedItems.size} selected</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onBulkAction &&
                  onBulkAction(
                    items.filter((item) => selectedItems.has(item.id)),
                    "print",
                  )
                }
              >
                Print Labels
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onBulkAction &&
                  onBulkAction(
                    items.filter((item) => selectedItems.has(item.id)),
                    "export",
                  )
                }
              >
                Export
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View */}
      {isMobile && (
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentMobileIndex * 100}%)` }}
            >
              {items.slice(0, visibleItems).map((item) => (
                <div key={item.id} className="w-full flex-shrink-0 px-1">
                  <JewelryCard
                    item={item}
                    showWholesale={showWholesale}
                    bulkMode={bulkMode}
                    isSelected={selectedItems.has(item.id)}
                    onSelect={() => toggleSelectItem(item.id)}
                    onClick={() => onItemClick && onItemClick(item)}
                    onEdit={() => onItemEdit && onItemEdit(item)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Navigation Controls */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={handlePrevious}
            disabled={currentMobileIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={handleNext}
            disabled={currentMobileIndex >= items.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Pagination Indicator */}
          <div className="mt-2 flex justify-center">
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, Math.ceil(items.length / 1)) }).map((_, i) => (
                <div
                  key={i}
                  className={cn("h-1.5 w-1.5 rounded-full", i === currentMobileIndex % 5 ? "bg-primary" : "bg-muted")}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Grid View */}
      {!isMobile && (
        <>
          {bulkMode && (
            <div className="flex items-center gap-2 py-2">
              <Checkbox checked={selectedItems.size === items.length} onCheckedChange={toggleSelectAll} />
              <span className="text-sm font-medium">Select All</span>
            </div>
          )}
          <div
            ref={gridRef}
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {items.slice(0, visibleItems).map((item) => (
              <JewelryCard
                key={item.id}
                item={item}
                showWholesale={showWholesale}
                bulkMode={bulkMode}
                isSelected={selectedItems.has(item.id)}
                onSelect={() => toggleSelectItem(item.id)}
                onClick={() => onItemClick && onItemClick(item)}
                onEdit={() => onItemEdit && onItemEdit(item)}
              />
            ))}
          </div>
        </>
      )}

      {/* Load More Button */}
      {visibleItems < items.length && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setVisibleItems((prev) => Math.min(prev + 8, items.length))}>
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}

interface JewelryCardProps {
  item: JewelryItem
  showWholesale: boolean
  bulkMode: boolean
  isSelected: boolean
  onSelect: () => void
  onClick: () => void
  onEdit: () => void
}

function JewelryCard({ item, showWholesale, bulkMode, isSelected, onSelect, onClick, onEdit }: JewelryCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // For drag functionality
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id.toString(),
    disabled: !bulkMode,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative overflow-hidden transition-all duration-200",
        bulkMode && isSelected && "ring-2 ring-primary ring-offset-2",
        bulkMode && "cursor-grab active:cursor-grabbing",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...(bulkMode ? { ...attributes, ...listeners } : {})}
    >
      {/* Bulk Selection Checkbox */}
      {bulkMode && (
        <div className="absolute left-2 top-2 z-20">
          <Checkbox checked={isSelected} onCheckedChange={() => onSelect()} />
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute right-2 top-2 z-20">
        <Badge className={cn("capitalize", statusColors[item.status])}>{item.status}</Badge>
      </div>

      {/* Image Container with Hover Zoom */}
      <div className="relative aspect-square overflow-hidden" onClick={() => !bulkMode && onClick()}>
        {!imageLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}
        <Image
          src={item.image || "/placeholder.svg?height=300&width=300&query=jewelry"}
          alt={item.name}
          fill
          className={cn(
            "object-cover transition-transform duration-300",
            isHovered && "scale-110",
            !imageLoaded && "opacity-0",
          )}
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />

        {/* Quick Action Overlay on Hover */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-200",
            isHovered && "opacity-100",
          )}
        >
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-3">
        {/* Location Badge */}
        <div className="mb-2 flex items-center">
          <Badge
            variant="outline"
            className={cn("flex items-center gap-1 px-2 py-0.5", locationColors[item.location] || "bg-gray-100")}
          >
            <MapPin className="h-3 w-3" />
            {item.location}
          </Badge>
        </div>

        {/* SKU and Name */}
        <div className="mb-1 text-xs text-muted-foreground">SKU: {item.sku}</div>
        <h3 className="line-clamp-2 font-medium">{item.name}</h3>

        {/* Price Display */}
        <div className="mt-2 flex items-baseline justify-between">
          <div className="text-lg font-bold">
            ${showWholesale ? item.wholesalePrice.toLocaleString() : item.retailPrice.toLocaleString()}
          </div>
          {showWholesale && (
            <div className="text-xs text-muted-foreground">MSRP: ${item.retailPrice.toLocaleString()}</div>
          )}
        </div>
        {/* Diamond Specs Display */}
        {item.diamondSpecs && (
          <div className="mt-2 rounded bg-muted/50 p-2 text-xs">
            <div><b>Clarity:</b> {item.diamondSpecs.clarity} <b>Color:</b> {item.diamondSpecs.color} <b>Cut:</b> {item.diamondSpecs.cut}</div>
            <div><b>Carat:</b> {item.diamondSpecs.caratWeight}ct <b>Fluor:</b> {item.diamondSpecs.fluorescence || '-'}</div>
            <div><b>Polish:</b> {item.diamondSpecs.polish || '-'} <b>Symmetry:</b> {item.diamondSpecs.symmetry || '-'}</div>
            <div><b>Lab:</b> {item.diamondSpecs.gradingLab || '-'} <b>Report #:</b> {item.diamondSpecs.reportNumber || '-'}</div>
            <div><b>Depth %:</b> {item.diamondSpecs.depthPercentage || '-'} <b>Table %:</b> {item.diamondSpecs.tablePercentage || '-'}</div>
            <div><b>Measurements:</b> {item.diamondSpecs.measurements ? `${item.diamondSpecs.measurements.length} x ${item.diamondSpecs.measurements.width} x ${item.diamondSpecs.measurements.depth} mm` : '-'}</div>
          </div>
        )}
      </CardContent>

      <div className="flex justify-between border-t p-2">
        <Button variant="ghost" size="sm" onClick={onClick}>
          <Eye className="mr-1 h-4 w-4" />
          View
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="mr-1 h-4 w-4" />
          Edit
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Tag className="mr-2 h-4 w-4" />
              Print Label
            </DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}

export type { JewelryItem }
