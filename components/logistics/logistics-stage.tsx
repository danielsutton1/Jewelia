"use client"

import * as React from "react"
import {
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  Download,
  ShoppingCart,
} from "lucide-react"
import { SegmentedCircularProgress } from "@/components/ui/segmented-circular-progress"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export type LogisticsStageType = "orders" | "packing" | "shipping" | "delivery" | "pickup"

export type StageStatus = "on-track" | "delayed" | "overdue" | "review" | "approved" | "revise" | "in-progress"

export interface LogisticsItem {
  id: string
  name: string
  customer: string
  dueDate: string
  status: StageStatus
  notes?: string
  assignee?: string
}

interface LogisticsStageProps {
  stage: LogisticsStageType
  displayName?: string
  items: LogisticsItem[]
  isLoading?: boolean
}

export function LogisticsStage({ stage, displayName, items, isLoading = false }: LogisticsStageProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [customerFilter, setCustomerFilter] = React.useState<string>("all")
  const [sortOrder, setSortOrder] = React.useState<string>("oldest")
  const [searchQuery, setSearchQuery] = React.useState("")
  const router = useRouter()

  const stageConfig = {
    orders: {
      label: "Orders",
      icon: ShoppingCart,
      description: "Order processing and management",
    },
    packing: {
      label: "Pack & Ship",
      icon: Package,
      description: "Order packaging and preparation",
    },
    pickup: {
      label: "Pick Up",
      icon: Truck,
      description: "Order pickup and collection",
    },
    shipping: {
      label: "Shipping",
      icon: Truck,
      description: "Order shipping and tracking",
    },
    delivery: {
      label: "Delivery",
      icon: CheckCircle,
      description: "Order delivery and confirmation",
    },
  }

  console.log("LOGISTICS STAGE DEBUG: stage", stage)
  console.log("LOGISTICS STAGE DEBUG: items", items)
  console.log("LOGISTICS STAGE DEBUG: stageConfig[stage]", stageConfig[stage])
  
  // Add error handling for undefined stage config
  if (!stageConfig[stage]) {
    console.error("LOGISTICS STAGE ERROR: Unknown stage:", stage, "Available stages:", Object.keys(stageConfig))
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-sm">Unknown stage: {stage}</div>
      </div>
    )
  }
  
  const { label, icon: Icon, description } = stageConfig[stage]

  // Use displayName if provided, otherwise use the default label
  const finalLabel = displayName || label

  // Count items by status - handle logistics stages with specific statuses
  const isOrdersStage = stage === "orders"
  const isPackingStage = stage === "packing"
  const isShippingStage = stage === "shipping"
  const isDeliveryStage = stage === "delivery"
  const isPickupStage = stage === "pickup"
  const isLogisticsStage = isOrdersStage || isPackingStage || isShippingStage || isDeliveryStage || isPickupStage
  
  // For logistics stages, use logistics-specific statuses
  const reviewCount = isLogisticsStage ? items.filter((item) => item.status === "review").length : 0
  const approvedCount = isLogisticsStage ? items.filter((item) => item.status === "approved").length : 0
  const reviseCount = isLogisticsStage ? items.filter((item) => item.status === "revise").length : 0
  const inProgressCount = isLogisticsStage ? items.filter((item) => item.status === "in-progress").length : 0
  
  // For other stages, use generic statuses
  const onTrackCount = !isLogisticsStage ? items.filter((item) => item.status === "on-track").length : 0
  const delayedCount = !isLogisticsStage ? items.filter((item) => item.status === "delayed").length : 0
  const overdueCount = !isLogisticsStage ? items.filter((item) => item.status === "overdue").length : 0

  const uniqueCustomers = React.useMemo(() => {
    const customerSet = new Set(items.map(item => item.customer));
    return ["All Customers", ...Array.from(customerSet)];
  }, [items]);

  // Determine overall status color
  let statusColor = "hsl(var(--emerald-500))"
  if (isLogisticsStage) {
    if (reviseCount > 0) {
      statusColor = "hsl(var(--destructive))"
    } else if (reviewCount > 0 || inProgressCount > 0) {
      statusColor = "hsl(var(--amber-500))"
    }
  } else {
    if (overdueCount > 0) {
      statusColor = "hsl(var(--destructive))"
    } else if (delayedCount > 0) {
      statusColor = "hsl(var(--amber-500))"
    }
  }

  // Calculate progress percentage
  const totalItems = items.length
  const progressValue = totalItems > 0 ? Math.round(((isLogisticsStage ? approvedCount : onTrackCount) / totalItems) * 100) : 100

  const searchedItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.customer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter items
  const filteredItems = searchedItems.filter((item) => {
    const statusMatch = statusFilter === "all" || item.status === statusFilter
    const customerMatch = customerFilter === "all" || item.customer === customerFilter
    return statusMatch && customerMatch
  })

  // Sort items by due date
  const sortedItems = [...filteredItems].sort((a, b) => {
    // Parse dueDate strings (e.g., "Jun 10") into Date objects for this year
    const parseDate = (str: string) => {
      const [month, day] = str.split(" ")
      return new Date(`${new Date().getFullYear()} ${month} ${day}`)
    }
    const dateA = parseDate(a.dueDate)
    const dateB = parseDate(b.dueDate)
    return sortOrder === "oldest" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
  })

  const exportToCSV = () => {
    const headers = ["Order ID", "Item Name", "Customer", "Due Date", "Status", "Notes"];

    const formatRow = (row: (string | undefined)[]) => {
        return row.map(field => {
            const str = String(field ?? '');
            if (/[",\n]/.test(str)) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        }).join(',');
    }

    const headerRow = formatRow(headers);
    const itemRows = sortedItems.map(item => formatRow([
      item.id,
      item.name,
      item.customer,
      item.dueDate,
      item.status,
      item.notes,
    ]));

    const csvString = [headerRow, ...itemRows].join("\n");

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${label}_stage_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {stage === "orders" ? (
        <Link href="/dashboard/orders">
          <div
            className={cn(
              "group relative flex flex-col items-center justify-center p-4 transition-all",
              "cursor-pointer rounded-lg hover:bg-muted/50",
            )}
          >
            {isLoading ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  "border-emerald-200 bg-emerald-100"
                )
              }>
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <span className="mt-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : totalItems === 0 ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  "border-emerald-200 bg-emerald-100"
                )
              }>
                <AlertCircle className="h-8 w-8 text-emerald-500" />
                <span className="mt-2 text-sm text-muted-foreground">No items</span>
              </div>
            ) : (
              <SegmentedCircularProgress
                segments={
                  totalItems > 0
                    ? (isLogisticsStage
                      ? ([
                          inProgressCount > 0 ? { value: inProgressCount, color: "#3b82f6" } : null, // blue-500 for in-progress
                          reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                          approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                          reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                        ].filter(Boolean) as { value: number; color: string }[])
                      : ([
                          onTrackCount > 0 ? { value: onTrackCount, color: "#22c55e" } : null, // green-500
                          delayedCount > 0 ? { value: delayedCount, color: "#eab308" } : null, // yellow-500
                          overdueCount > 0 ? { value: overdueCount, color: "#ef4444" } : null, // red-500
                        ].filter(Boolean) as { value: number; color: string }[]))
                    : [
                        { value: 1, color: "#e5e7eb" } // gray-200 fallback
                      ]
                }
                size={120}
                strokeWidth={10}
                backgroundColor="#f3f4f6" // gray-100
                className="transition-transform duration-300 group-hover:scale-105"
              >
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Icon className="h-6 w-6" />
                  <span className="text-lg font-semibold">{totalItems}</span>
                </div>
              </SegmentedCircularProgress>
            )}

            <div className="mt-3 text-center">
              <h3 className="font-medium">{finalLabel}</h3>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>View details</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Status indicators */}
            {!isLoading && totalItems > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 w-full min-h-[32px]">
                {isLogisticsStage ? (
                  <>
                    {inProgressCount > 0 && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                        {inProgressCount} In Progress
                      </Badge>
                    )}
                    {reviewCount > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        {reviewCount} Review
                      </Badge>
                    )}
                    {approvedCount > 0 && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        {approvedCount} Approved
                      </Badge>
                    )}
                    {reviseCount > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        {reviseCount} Revise
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    {onTrackCount > 0 && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        {onTrackCount} On track
                      </Badge>
                    )}
                    {delayedCount > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        {delayedCount} Delayed
                      </Badge>
                    )}
                    {overdueCount > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        {overdueCount} Overdue
                      </Badge>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Link>
      ) : stage === "packing" ? (
        <Link href="/dashboard/logistics/kanban/packandship">
          <div
            className={cn(
              "group relative flex flex-col items-center justify-center p-4 transition-all",
              "cursor-pointer rounded-lg hover:bg-muted/50",
            )}
          >
            {isLoading ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  "border-orange-200 bg-orange-100"
                )
              }>
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="mt-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : totalItems === 0 ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  "border-orange-200 bg-orange-100"
                )
              }>
                <AlertCircle className="h-8 w-8 text-orange-500" />
                <span className="mt-2 text-sm text-muted-foreground">No items</span>
              </div>
            ) : (
              <SegmentedCircularProgress
                segments={
                  totalItems > 0
                    ? (isLogisticsStage
                      ? ([
                          inProgressCount > 0 ? { value: inProgressCount, color: "#3b82f6" } : null, // blue-500 for in-progress
                          reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                          approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                          reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                        ].filter(Boolean) as { value: number; color: string }[])
                      : ([
                          onTrackCount > 0 ? { value: onTrackCount, color: "#22c55e" } : null, // green-500
                          delayedCount > 0 ? { value: delayedCount, color: "#eab308" } : null, // yellow-500
                          overdueCount > 0 ? { value: overdueCount, color: "#ef4444" } : null, // red-500
                        ].filter(Boolean) as { value: number; color: string }[]))
                    : [
                        { value: 1, color: "#e5e7eb" } // gray-200 fallback
                      ]
                }
                size={120}
                strokeWidth={10}
                backgroundColor="#f3f4f6" // gray-100
                className="transition-transform duration-300 group-hover:scale-105"
              >
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Icon className="h-6 w-6" />
                  <span className="text-lg font-semibold">{totalItems}</span>
                </div>
              </SegmentedCircularProgress>
            )}

            <div className="mt-3 text-center">
              <h3 className="font-medium">{finalLabel}</h3>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>View details</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Status indicators */}
            {!isLoading && totalItems > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 w-full min-h-[32px]">
                {isLogisticsStage ? (
                  <>
                    {inProgressCount > 0 && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                        {inProgressCount} In Progress
                      </Badge>
                    )}
                    {reviewCount > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        {reviewCount} Review
                      </Badge>
                    )}
                    {approvedCount > 0 && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        {approvedCount} Approved
                      </Badge>
                    )}
                    {reviseCount > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        {reviseCount} Revise
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    {onTrackCount > 0 && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        {onTrackCount} On track
                      </Badge>
                    )}
                    {delayedCount > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        {delayedCount} Delayed
                      </Badge>
                    )}
                    {overdueCount > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        {overdueCount} Overdue
                      </Badge>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Link>
      ) : stage === "pickup" ? (
        <Link href="/dashboard/logistics/kanban/pickup">
          <div
            className={cn(
              "group relative flex flex-col items-center justify-center p-4 transition-all",
              "cursor-pointer rounded-lg hover:bg-muted/50",
            )}
          >
            {isLoading ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  "border-blue-200 bg-blue-100"
                )
              }>
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="mt-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : totalItems === 0 ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  "border-blue-200 bg-blue-100"
                )
              }>
                <AlertCircle className="h-8 w-8 text-blue-500" />
                <span className="mt-2 text-sm text-muted-foreground">No items</span>
              </div>
            ) : (
              <SegmentedCircularProgress
                segments={
                  totalItems > 0
                    ? (isLogisticsStage
                      ? ([
                          inProgressCount > 0 ? { value: inProgressCount, color: "#3b82f6" } : null, // blue-500 for in-progress
                          reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                          approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                          reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                        ].filter(Boolean) as { value: number; color: string }[])
                      : ([
                          onTrackCount > 0 ? { value: onTrackCount, color: "#22c55e" } : null, // green-500
                          delayedCount > 0 ? { value: delayedCount, color: "#eab308" } : null, // yellow-500
                          overdueCount > 0 ? { value: overdueCount, color: "#ef4444" } : null, // red-500
                        ].filter(Boolean) as { value: number; color: string }[]))
                    : [
                        { value: 1, color: "#e5e7eb" } // gray-200 fallback
                      ]
                }
                size={120}
                strokeWidth={10}
                backgroundColor="#f3f4f6" // gray-100
                className="transition-transform duration-300 group-hover:scale-105"
              >
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Icon className="h-6 w-6" />
                  <span className="text-lg font-semibold">{totalItems}</span>
                </div>
              </SegmentedCircularProgress>
            )}

            <div className="mt-3 text-center">
              <h3 className="font-medium">{finalLabel}</h3>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>View details</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Status indicators */}
            {!isLoading && totalItems > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 w-full min-h-[32px]">
                {isLogisticsStage ? (
                  <>
                    {inProgressCount > 0 && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                        {inProgressCount} In Progress
                      </Badge>
                    )}
                    {reviewCount > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        {reviewCount} Review
                      </Badge>
                    )}
                    {approvedCount > 0 && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        {approvedCount} Approved
                      </Badge>
                    )}
                    {reviseCount > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        {reviseCount} Revise
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    {onTrackCount > 0 && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        {onTrackCount} On track
                      </Badge>
                    )}
                    {delayedCount > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        {delayedCount} Delayed
                      </Badge>
                    )}
                    {overdueCount > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        {overdueCount} Overdue
                      </Badge>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Link>
      ) : stage === "shipping" ? (
        <Link href="/dashboard/logistics/kanban/shipping">
          <div
            className={cn(
              "group relative flex flex-col items-center justify-center p-4 transition-all",
              "cursor-pointer rounded-lg hover:bg-muted/50",
            )}
          >
            {isLoading ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  "border-blue-200 bg-blue-100"
                )
              }>
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="mt-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : totalItems === 0 ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  "border-blue-200 bg-blue-100"
                )
              }>
                <AlertCircle className="h-8 w-8 text-blue-500" />
                <span className="mt-2 text-sm text-muted-foreground">No items</span>
              </div>
            ) : (
              <SegmentedCircularProgress
                segments={
                  totalItems > 0
                    ? (isLogisticsStage
                      ? ([
                          inProgressCount > 0 ? { value: inProgressCount, color: "#3b82f6" } : null, // blue-500 for in-progress
                          reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                          approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                          reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                        ].filter(Boolean) as { value: number; color: string }[])
                      : ([
                          onTrackCount > 0 ? { value: onTrackCount, color: "#22c55e" } : null, // green-500
                          delayedCount > 0 ? { value: delayedCount, color: "#eab308" } : null, // yellow-500
                          overdueCount > 0 ? { value: overdueCount, color: "#ef4444" } : null, // red-500
                        ].filter(Boolean) as { value: number; color: string }[]))
                    : [
                        { value: 1, color: "#e5e7eb" } // gray-200 fallback
                      ]
                }
                size={120}
                strokeWidth={10}
                backgroundColor="#f3f4f6" // gray-100
                className="transition-transform duration-300 group-hover:scale-105"
              >
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Icon className="h-6 w-6" />
                  <span className="text-lg font-semibold">{totalItems}</span>
                </div>
              </SegmentedCircularProgress>
            )}

            <div className="mt-3 text-center">
              <h3 className="font-medium">{finalLabel}</h3>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>View details</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Status indicators */}
            {!isLoading && totalItems > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 w-full min-h-[32px]">
                {isLogisticsStage ? (
                  <>
                    {inProgressCount > 0 && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                        {inProgressCount} In Progress
                      </Badge>
                    )}
                    {reviewCount > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        {reviewCount} Review
                      </Badge>
                    )}
                    {approvedCount > 0 && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        {approvedCount} Approved
                      </Badge>
                    )}
                    {reviseCount > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        {reviseCount} Revise
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    {onTrackCount > 0 && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        {onTrackCount} On track
                      </Badge>
                    )}
                    {delayedCount > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        {delayedCount} Delayed
                      </Badge>
                    )}
                    {overdueCount > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        {overdueCount} Overdue
                      </Badge>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Link>
      ) : stage === "delivery" ? (
        <Link href="/dashboard/logistics/kanban/delivery">
          <div
            className={cn(
              "group relative flex flex-col items-center justify-center p-4 transition-all",
              "cursor-pointer rounded-lg hover:bg-muted/50",
            )}
          >
            {isLoading ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  "border-green-200 bg-green-100"
                )
              }>
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                <span className="mt-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : totalItems === 0 ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  "border-green-200 bg-green-100"
                )
              }>
                <AlertCircle className="h-8 w-8 text-green-500" />
                <span className="mt-2 text-sm text-muted-foreground">No items</span>
              </div>
            ) : (
              <SegmentedCircularProgress
                segments={
                  totalItems > 0
                    ? (isLogisticsStage
                      ? ([
                          inProgressCount > 0 ? { value: inProgressCount, color: "#3b82f6" } : null, // blue-500 for in-progress
                          reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                          approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                          reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                        ].filter(Boolean) as { value: number; color: string }[])
                      : ([
                          onTrackCount > 0 ? { value: onTrackCount, color: "#22c55e" } : null, // green-500
                          delayedCount > 0 ? { value: delayedCount, color: "#eab308" } : null, // yellow-500
                          overdueCount > 0 ? { value: overdueCount, color: "#ef4444" } : null, // red-500
                        ].filter(Boolean) as { value: number; color: string }[]))
                    : [
                        { value: 1, color: "#e5e7eb" } // gray-200 fallback
                      ]
                }
                size={120}
                strokeWidth={10}
                backgroundColor="#f3f4f6" // gray-100
                className="transition-transform duration-300 group-hover:scale-105"
              >
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Icon className="h-6 w-6" />
                  <span className="text-lg font-semibold">{totalItems}</span>
                </div>
              </SegmentedCircularProgress>
            )}

            <div className="mt-3 text-center">
              <h3 className="font-medium">{finalLabel}</h3>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>View details</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Status indicators */}
            {!isLoading && totalItems > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 w-full min-h-[32px]">
                {isLogisticsStage ? (
                  <>
                    {inProgressCount > 0 && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                        {inProgressCount} In Progress
                      </Badge>
                    )}
                    {reviewCount > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        {reviewCount} Review
                      </Badge>
                    )}
                    {approvedCount > 0 && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        {approvedCount} Approved
                      </Badge>
                    )}
                    {reviseCount > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        {reviseCount} Revise
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    {onTrackCount > 0 && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        {onTrackCount} On track
                      </Badge>
                    )}
                    {delayedCount > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        {delayedCount} Delayed
                      </Badge>
                    )}
                    {overdueCount > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        {overdueCount} Overdue
                      </Badge>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Link>
      ) : (
        <DialogTrigger asChild>
          <div
            className={cn(
              "group relative flex flex-col items-center justify-center p-4 transition-all",
              "cursor-pointer rounded-lg hover:bg-muted/50",
            )}
          >
            {isLoading ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  "border-muted-foreground/20 bg-muted/5"
                )
              }>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/70" />
                <span className="mt-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : totalItems === 0 ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  "border-muted-foreground/20 bg-muted/5"
                )
              }>
                <AlertCircle className="h-8 w-8 text-muted-foreground/70" />
                <span className="mt-2 text-sm text-muted-foreground">No items</span>
              </div>
            ) : (
              <SegmentedCircularProgress
                segments={
                  totalItems > 0
                    ? (isLogisticsStage
                      ? ([
                          inProgressCount > 0 ? { value: inProgressCount, color: "#3b82f6" } : null, // blue-500 for in-progress
                          reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                          approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                          reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                        ].filter(Boolean) as { value: number; color: string }[])
                      : ([
                          onTrackCount > 0 ? { value: onTrackCount, color: "#22c55e" } : null, // green-500
                          delayedCount > 0 ? { value: delayedCount, color: "#eab308" } : null, // yellow-500
                          overdueCount > 0 ? { value: overdueCount, color: "#ef4444" } : null, // red-500
                        ].filter(Boolean) as { value: number; color: string }[]))
                    : [
                        { value: 1, color: "#e5e7eb" } // gray-200 fallback
                      ]
                }
                size={120}
                strokeWidth={10}
                backgroundColor="#f3f4f6" // gray-100
                className="transition-transform duration-300 group-hover:scale-105"
              >
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Icon className="h-6 w-6" />
                  <span className="text-lg font-semibold">{totalItems}</span>
                </div>
              </SegmentedCircularProgress>
            )}

            <div className="mt-3 text-center">
              <h3 className="font-medium">{finalLabel}</h3>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>View details</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Status indicators */}
            {!isLoading && totalItems > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 w-full min-h-[32px]">
                {isLogisticsStage ? (
                  <>
                    {inProgressCount > 0 && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                        {inProgressCount} In Progress
                      </Badge>
                    )}
                    {reviewCount > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        {reviewCount} Review
                      </Badge>
                    )}
                    {approvedCount > 0 && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        {approvedCount} Approved
                      </Badge>
                    )}
                    {reviseCount > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        {reviseCount} Revise
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    {onTrackCount > 0 && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        {onTrackCount} On track
                      </Badge>
                    )}
                    {delayedCount > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        {delayedCount} Delayed
                      </Badge>
                    )}
                    {overdueCount > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        {overdueCount} Overdue
                      </Badge>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {finalLabel} Stage Details
          </DialogTitle>
          <DialogDescription>
            {description} - {totalItems} items
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Filters and Search */}
          <div className="flex flex-wrap gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="revise">Revise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Customer" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCustomers.map((customer) => (
                    <SelectItem key={customer} value={customer}>
                      {customer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Items List */}
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {sortedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    // Navigate to detail page
                    router.push(`/dashboard/logistics/kanban/${stage}/${item.id}`)
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.customer}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium">Due: {item.dueDate}</span>
                      <span className="text-xs text-muted-foreground">{item.assignee}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        item.status === "in-progress" && "bg-blue-50 text-blue-700",
                        item.status === "review" && "bg-amber-50 text-amber-700",
                        item.status === "approved" && "bg-emerald-50 text-emerald-700",
                        item.status === "revise" && "bg-red-50 text-red-700"
                      )}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
} 