"use client"

import * as React from "react"
import {
  Pencil,
  CuboidIcon as Cube,
  Droplets,
  Gem,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  Download,
  Target,
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

export type ProductionStage = "design" | "cad" | "casting" | "setting" | "polishing" | "qc"

export type StageStatus = "on-track" | "delayed" | "overdue" | "review" | "approved" | "revise" | "in-progress"

export interface ProductionItem {
  id: string
  name: string
  customer: string
  dueDate: string
  status: StageStatus
  notes?: string
  assignee?: string
}

interface ProductionStageProps {
  stage: ProductionStage
  items: ProductionItem[]
  isLoading?: boolean
}

export function ProductionStage({ stage, items, isLoading = false }: ProductionStageProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [customerFilter, setCustomerFilter] = React.useState<string>("all")
  const [sortOrder, setSortOrder] = React.useState<string>("oldest")
  const [searchQuery, setSearchQuery] = React.useState("")
  const router = useRouter()

  const stageConfig = {
    design: {
      label: "Design",
      icon: Pencil,
      description: "Initial design and sketching",
    },
    cad: {
      label: "CAD",
      icon: Cube,
      description: "Computer-aided design modeling",
    },
    casting: {
      label: "Casting",
      icon: Droplets,
      description: "Metal casting process",
    },
    setting: {
      label: "Setting",
      icon: Gem,
      description: "Stone setting and assembly",
    },
    polishing: {
      label: "Polishing",
      icon: Sparkles,
      description: "Finishing and polishing",
    },
    qc: {
      label: "QC",
      icon: CheckCircle,
      description: "Quality control and inspection",
    },
  }


  
  // Handle custom stages or stages not in stageConfig
  const stageInfo = stageConfig[stage as keyof typeof stageConfig] || {
    label: stage.charAt(0).toUpperCase() + stage.slice(1), // Capitalize first letter
    icon: Target, // Default icon
    description: `${stage.charAt(0).toUpperCase() + stage.slice(1)} stage`,
  }
  
  const { label, icon: Icon, description } = stageInfo

  // Count items by status - handle design/CAD/casting/setting/polishing/qc and generic statuses
  const isDesignStage = stage === "design"
  const isCADStage = stage === "cad"
  const isCastingStage = stage === "casting"
  const isSettingStage = stage === "setting"
  const isPolishingStage = stage === "polishing"
  const isQCStage = stage === "qc"
  const isDesignOrCAD = isDesignStage || isCADStage
  const isDesignOrCADOrCasting = isDesignOrCAD || isCastingStage
  const isDesignOrCADOrCastingOrSetting = isDesignOrCADOrCasting || isSettingStage
  const isDesignOrCADOrCastingOrSettingOrPolishing = isDesignOrCADOrCastingOrSetting || isPolishingStage
  const isDesignOrCADOrCastingOrSettingOrPolishingOrQC = isDesignOrCADOrCastingOrSettingOrPolishing || isQCStage
  
  // For design, CAD, casting, setting, polishing, and QC stages, use design-specific statuses
  const reviewCount = isDesignOrCADOrCastingOrSettingOrPolishingOrQC ? items.filter((item) => item.status === "review").length : 0
  const approvedCount = isDesignOrCADOrCastingOrSettingOrPolishingOrQC ? items.filter((item) => item.status === "approved").length : 0
  const reviseCount = isDesignOrCADOrCastingOrSettingOrPolishingOrQC ? items.filter((item) => item.status === "revise").length : 0
  const inProgressCount = (isCastingStage || isSettingStage || isPolishingStage || isQCStage) ? items.filter((item) => item.status === "in-progress").length : 0
  
  // For other stages, use generic statuses
  const onTrackCount = !isDesignOrCADOrCastingOrSettingOrPolishingOrQC ? items.filter((item) => item.status === "on-track").length : 0
  const delayedCount = !isDesignOrCADOrCastingOrSettingOrPolishingOrQC ? items.filter((item) => item.status === "delayed").length : 0
  const overdueCount = !isDesignOrCADOrCastingOrSettingOrPolishingOrQC ? items.filter((item) => item.status === "overdue").length : 0

  const uniqueCustomers = React.useMemo(() => {
    const customerSet = new Set(items.map(item => item.customer));
    return ["All Customers", ...Array.from(customerSet)];
  }, [items]);

  // Determine overall status color
  let statusColor = "hsl(var(--emerald-500))"
  if (isDesignOrCADOrCastingOrSettingOrPolishingOrQC) {
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
  const progressValue = totalItems > 0 ? Math.round(((isDesignOrCADOrCastingOrSettingOrPolishingOrQC ? approvedCount : onTrackCount) / totalItems) * 100) : 100

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
      {stage === "design" ? (
        <Link href="/dashboard/production/kanban/design">
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
                  stage === "design" || stage === "cad"
                    ? "border-blue-200 bg-blue-100"
                    : stage === "setting" || stage === "polishing"
                    ? "border-purple-200 bg-purple-100"
                    : "border-muted-foreground/20 bg-muted/5"
                )
              }>
                <Loader2 className={
                  cn(
                    "h-8 w-8 animate-spin",
                    stage === "design" || stage === "cad"
                      ? "text-blue-500"
                      : stage === "setting" || stage === "polishing"
                      ? "text-purple-500"
                      : "text-muted-foreground/70"
                  )
                } />
                <span className="mt-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : totalItems === 0 ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  stage === "design" || stage === "cad"
                    ? "border-blue-200 bg-blue-100"
                    : stage === "setting" || stage === "polishing"
                    ? "border-purple-200 bg-purple-100"
                    : "border-muted-foreground/20 bg-muted/5"
                )
              }>
                <AlertCircle className={
                  cn(
                    "h-8 w-8",
                    stage === "design" || stage === "cad"
                      ? "text-blue-500"
                      : stage === "setting" || stage === "polishing"
                      ? "text-purple-500"
                      : "text-muted-foreground/70"
                  )
                } />
                <span className="mt-2 text-sm text-muted-foreground">No items</span>
              </div>
            ) : (
              <SegmentedCircularProgress
                segments={
                  totalItems > 0
                    ? (isDesignOrCADOrCastingOrSettingOrPolishingOrQC
                      ? ((isCastingStage || isSettingStage || isPolishingStage || isQCStage)
                        ? ([
                            inProgressCount > 0 ? { value: inProgressCount, color: "#3b82f6" } : null, // blue-500 for in-progress
                            reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                            approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                            reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                          ].filter(Boolean) as { value: number; color: string }[])
                        : ([
                            reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                            approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                            reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                          ].filter(Boolean) as { value: number; color: string }[]))
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
              <h3 className="font-medium">{label}</h3>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>View details</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Status indicators */}
            {!isLoading && totalItems > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 w-full min-h-[32px]">
                {isDesignOrCADOrCastingOrSettingOrPolishingOrQC ? (
                  <>
                    {(isCastingStage || isSettingStage || isPolishingStage || isQCStage) && inProgressCount > 0 && (
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
      ) : stage === "cad" ? (
        <Link href="/dashboard/production/kanban/cad">
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
                  stage === "cad"
                    ? "border-blue-200 bg-blue-100"
                    : "border-muted-foreground/20 bg-muted/5"
                )
              }>
                <Loader2 className={
                  cn(
                    "h-8 w-8 animate-spin",
                    stage === "cad"
                      ? "text-blue-500"
                      : "text-muted-foreground/70"
                  )
                } />
                <span className="mt-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : totalItems === 0 ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  stage === "cad"
                    ? "border-blue-200 bg-blue-100"
                    : "border-muted-foreground/20 bg-muted/5"
                )
              }>
                <AlertCircle className={
                  cn(
                    "h-8 w-8",
                    stage === "cad"
                      ? "text-blue-500"
                      : "text-muted-foreground/70"
                  )
                } />
                <span className="mt-2 text-sm text-muted-foreground">No items</span>
              </div>
            ) : (
              <SegmentedCircularProgress
                segments={
                  totalItems > 0
                    ? (isDesignOrCAD
                      ? ([
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
              <h3 className="font-medium">{label}</h3>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>View details</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Status indicators */}
            {!isLoading && totalItems > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 w-full min-h-[32px]">
                {isDesignOrCAD ? (
                  <>
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
      ) : stage === "casting" ? (
        <Link href="/dashboard/production/kanban/casting">
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
                  stage === "casting"
                    ? "border-orange-200 bg-orange-100"
                    : "border-muted-foreground/20 bg-muted/5"
                )
              }>
                <Loader2 className={
                  cn(
                    "h-8 w-8 animate-spin",
                    stage === "casting"
                      ? "text-orange-500"
                      : "text-muted-foreground/70"
                  )
                } />
                <span className="mt-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : totalItems === 0 ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  stage === "casting"
                    ? "border-orange-200 bg-orange-100"
                    : "border-muted-foreground/20 bg-muted/5"
                )
              }>
                <AlertCircle className={
                  cn(
                    "h-8 w-8",
                    stage === "casting"
                      ? "text-orange-500"
                      : "text-muted-foreground/70"
                  )
                } />
                <span className="mt-2 text-sm text-muted-foreground">No items</span>
              </div>
            ) : (
              <SegmentedCircularProgress
                segments={
                  totalItems > 0
                    ? (isDesignOrCADOrCastingOrSettingOrPolishingOrQC
                      ? ((isCastingStage || isSettingStage || isPolishingStage || isQCStage)
                        ? ([
                            inProgressCount > 0 ? { value: inProgressCount, color: "#3b82f6" } : null, // blue-500 for in-progress
                            reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                            approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                            reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                          ].filter(Boolean) as { value: number; color: string }[])
                        : ([
                            reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                            approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                            reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                          ].filter(Boolean) as { value: number; color: string }[]))
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
              <h3 className="font-medium">{label}</h3>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>View details</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Status indicators */}
            {!isLoading && totalItems > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 w-full min-h-[32px]">
                {isDesignOrCADOrCastingOrSettingOrPolishingOrQC ? (
                  <>
                    {(isCastingStage || isSettingStage || isPolishingStage || isQCStage) && inProgressCount > 0 && (
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
      ) : stage === "setting" ? (
        <Link href="/dashboard/production/kanban/setting">
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
                  stage === "setting"
                    ? "border-purple-200 bg-purple-100"
                    : "border-muted-foreground/20 bg-muted/5"
                )
              }>
                <Loader2 className={
                  cn(
                    "h-8 w-8 animate-spin",
                    stage === "setting"
                      ? "text-purple-500"
                      : "text-muted-foreground/70"
                  )
                } />
                <span className="mt-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : totalItems === 0 ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  stage === "setting"
                    ? "border-purple-200 bg-purple-100"
                    : "border-muted-foreground/20 bg-muted/5"
                )
              }>
                <AlertCircle className={
                  cn(
                    "h-8 w-8",
                    stage === "setting"
                      ? "text-purple-500"
                      : "text-muted-foreground/70"
                  )
                } />
                <span className="mt-2 text-sm text-muted-foreground">No items</span>
              </div>
            ) : (
              <SegmentedCircularProgress
                segments={
                  totalItems > 0
                    ? (isDesignOrCADOrCastingOrSettingOrPolishingOrQC
                      ? ((isCastingStage || isSettingStage || isPolishingStage || isQCStage)
                        ? ([
                            inProgressCount > 0 ? { value: inProgressCount, color: "#3b82f6" } : null, // blue-500 for in-progress
                            reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                            approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                            reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                          ].filter(Boolean) as { value: number; color: string }[])
                        : ([
                            reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                            approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                            reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                          ].filter(Boolean) as { value: number; color: string }[]))
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
              <h3 className="font-medium">{label}</h3>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>View details</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Status indicators */}
            {!isLoading && totalItems > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 w-full min-h-[32px]">
                {isDesignOrCADOrCastingOrSettingOrPolishingOrQC ? (
                  <>
                    {(isCastingStage || isSettingStage || isPolishingStage || isQCStage) && inProgressCount > 0 && (
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
      ) : stage === "polishing" ? (
        <Link href="/dashboard/production/kanban/polishing">
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
                  stage === "polishing"
                    ? "border-fuchsia-200 bg-fuchsia-100"
                    : "border-muted-foreground/20 bg-muted/5"
                )
              }>
                <Loader2 className={
                  cn(
                    "h-8 w-8 animate-spin",
                    stage === "polishing"
                      ? "text-fuchsia-500"
                      : "text-muted-foreground/70"
                  )
                } />
                <span className="mt-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : totalItems === 0 ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  stage === "polishing"
                    ? "border-fuchsia-200 bg-fuchsia-100"
                    : "border-muted-foreground/20 bg-muted/5"
                )
              }>
                <AlertCircle className={
                  cn(
                    "h-8 w-8",
                    stage === "polishing"
                      ? "text-fuchsia-500"
                      : "text-muted-foreground/70"
                  )
                } />
                <span className="mt-2 text-sm text-muted-foreground">No items</span>
              </div>
            ) : (
              <SegmentedCircularProgress
                segments={
                  totalItems > 0
                    ? (isDesignOrCADOrCastingOrSettingOrPolishingOrQC
                      ? ((isCastingStage || isSettingStage || isPolishingStage || isQCStage)
                        ? ([
                            inProgressCount > 0 ? { value: inProgressCount, color: "#3b82f6" } : null, // blue-500 for in-progress
                            reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                            approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                            reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                          ].filter(Boolean) as { value: number; color: string }[])
                        : ([
                            reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                            approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                            reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                          ].filter(Boolean) as { value: number; color: string }[]))
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
              <h3 className="font-medium">{label}</h3>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>View details</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Status indicators */}
            {!isLoading && totalItems > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 w-full min-h-[32px]">
                {isDesignOrCADOrCastingOrSettingOrPolishingOrQC ? (
                  <>
                    {(isCastingStage || isSettingStage || isPolishingStage || isQCStage) && inProgressCount > 0 && (
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
      ) : stage === "qc" ? (
        <Link href="/dashboard/production/kanban/qc">
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
                  stage === "qc"
                    ? "border-green-200 bg-green-100"
                    : "border-muted-foreground/20 bg-muted/5"
                )
              }>
                <Loader2 className={
                  cn(
                    "h-8 w-8 animate-spin",
                    stage === "qc"
                      ? "text-green-500"
                      : "text-muted-foreground/70"
                  )
                } />
                <span className="mt-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : totalItems === 0 ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  stage === "qc"
                    ? "border-green-200 bg-green-100"
                    : "border-muted-foreground/20 bg-muted/5"
                )
              }>
                <AlertCircle className={
                  cn(
                    "h-8 w-8",
                    stage === "qc"
                      ? "text-green-500"
                      : "text-muted-foreground/70"
                  )
                } />
                <span className="mt-2 text-sm text-muted-foreground">No items</span>
              </div>
            ) : (
              <SegmentedCircularProgress
                segments={
                  totalItems > 0
                    ? (isDesignOrCADOrCastingOrSettingOrPolishingOrQC
                      ? ((isCastingStage || isSettingStage || isPolishingStage || isQCStage)
                        ? ([
                            inProgressCount > 0 ? { value: inProgressCount, color: "#3b82f6" } : null, // blue-500 for in-progress
                            reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                            approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                            reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                          ].filter(Boolean) as { value: number; color: string }[])
                        : ([
                            reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                            approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                            reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                          ].filter(Boolean) as { value: number; color: string }[]))
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
              <h3 className="font-medium">{label}</h3>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>View details</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Status indicators */}
            {!isLoading && totalItems > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 w-full min-h-[32px]">
                {isDesignOrCADOrCastingOrSettingOrPolishingOrQC ? (
                  <>
                    {(isCastingStage || isSettingStage || isPolishingStage || isQCStage) && inProgressCount > 0 && (
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
                <Loader2 className={
                  cn(
                    "h-8 w-8 animate-spin",
                    "text-muted-foreground/70"
                  )
                } />
                <span className="mt-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : totalItems === 0 ? (
              <div className={
                cn(
                  "flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-2 border-dashed",
                  "border-muted-foreground/20 bg-muted/5"
                )
              }>
                <AlertCircle className={
                  cn(
                    "h-8 w-8",
                    "text-muted-foreground/70"
                  )
                } />
                <span className="mt-2 text-sm text-muted-foreground">No items</span>
              </div>
            ) : (
              <SegmentedCircularProgress
                segments={
                  totalItems > 0
                    ? (isDesignOrCADOrCastingOrSettingOrPolishingOrQC
                      ? ((isCastingStage || isSettingStage || isPolishingStage || isQCStage)
                        ? ([
                            inProgressCount > 0 ? { value: inProgressCount, color: "#3b82f6" } : null, // blue-500 for in-progress
                            reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                            approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                            reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                          ].filter(Boolean) as { value: number; color: string }[])
                        : ([
                            reviewCount > 0 ? { value: reviewCount, color: "#eab308" } : null, // yellow-500 for review
                            approvedCount > 0 ? { value: approvedCount, color: "#22c55e" } : null, // green-500 for approved
                            reviseCount > 0 ? { value: reviseCount, color: "#ef4444" } : null, // red-500 for revise
                          ].filter(Boolean) as { value: number; color: string }[]))
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
              <h3 className="font-medium">{label}</h3>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>View details</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Status indicators */}
            {!isLoading && totalItems > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 w-full min-h-[32px]">
                {isDesignOrCADOrCastingOrSettingOrPolishingOrQC ? (
                  <>
                    {(isCastingStage || isSettingStage || isPolishingStage || isQCStage) && inProgressCount > 0 && (
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

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader className="bg-emerald-50/50 p-6 rounded-t-lg">
          <DialogTitle className="flex items-center gap-2 text-emerald-800">
            <Icon className="h-6 w-6" />
            {label} Stage
          </DialogTitle>
          <DialogDescription className="text-emerald-700">{description}</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4">
          <h3 className="mb-4 text-lg font-semibold">Items in this stage</h3>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Input
              type="text"
              placeholder="Search by order, item, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
             <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={exportToCSV} aria-label="Export to CSV">
                  <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filter by:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="on-track">On Track</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
               <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Customer" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCustomers.map(customer => (
                    <SelectItem key={customer} value={customer === "All Customers" ? "all" : customer}>
                      {customer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oldest">Oldest to Newest</SelectItem>
                  <SelectItem value="newest">Newest to Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {sortedItems.length > 0 ? (
                sortedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    onClick={() => router.push(`/dashboard/orders/${item.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-primary">{item.id}</span>
                        <h5 className="font-medium">{item.name}</h5>
                      </div>
                      <p className="text-sm text-muted-foreground">Customer: {item.customer}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Due: {item.dueDate}</p>
                      {item.assignee && (
                        <p className="mt-1 text-xs text-muted-foreground">Assignee: {item.assignee}</p>
                      )}
                      {item.notes && (
                        <p className="mt-2 text-xs italic text-gray-500">Note: {item.notes}</p>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      <Badge
                        variant={
                          item.status === "overdue"
                            ? "destructive"
                            : item.status === "delayed"
                            ? "warning"
                            : "success"
                        }
                        className="w-20 justify-center"
                      >
                        {item.status}
                      </Badge>
                      <div className="mt-2 flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Contacting assignee for ${item.id}...`);
                          }}
                        >
                          Contact Assignee
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Contacting customer ${item.customer} for ${item.id}...`);
                          }}
                        >
                          Contact Customer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed">
                  <p className="text-muted-foreground">No items match your filters.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
