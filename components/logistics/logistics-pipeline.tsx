"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, CalendarIcon, Download, Filter, RefreshCw, Settings, Plus } from "lucide-react"
import { LogisticsStage } from "@/components/logistics/logistics-stage"
import { DateRange } from "react-day-picker"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns"
import { Calendar as UICalendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { orders as realOrders } from "@/components/orders/orders-table"
import { mockPackingData, mockShippingData, mockDeliveryData } from "@/data/logistics-mock-data"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { LogisticsPipelineCustomizer } from "@/components/logistics/LogisticsPipelineCustomizer"
import { LogisticsCalendar } from "./logistics-calendar"

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

function generateSampleData(stages: LogisticsStageType[], dateRange?: { from: Date; to: Date }) {
  const customers = [
    "Sophia Chen",
    "Ethan Davis", 
    "Ava Martinez",
    "Liam Smith",
    "Emma Wilson",
    "Noah Johnson",
    "Olivia Brown",
    "William Taylor"
  ]

  const assignees = [
    "Sarah Johnson",
    "David Chen", 
    "Emily Rodriguez",
    "Michael Kim",
    "Lisa Wang",
    "James Thompson"
  ]

  const itemNames = [
    "Custom Engagement Ring",
    "Sapphire Pendant",
    "Diamond Earrings",
    "Gold Bracelet",
    "Platinum Necklace",
    "Silver Ring",
    "Pearl Earrings",
    "Ruby Pendant"
  ]

  // Design-specific statuses
  const designStatuses: StageStatus[] = ["review", "approved", "revise"]
  // Casting-specific statuses
  const castingStatuses: StageStatus[] = ["in-progress", "review", "approved", "revise"]
  // Generic statuses for other stages
  const genericStatuses: StageStatus[] = ["on-track", "delayed", "overdue"]

  const stageItems: Record<string, LogisticsItem[]> = {}

  // Generate a pool of unique order numbers
  const totalOrders = 40;
  const orderNumbers = Array.from({ length: totalOrders }, (_, i) => `ORD-${1001 + i}`)
  let orderIndex = 0;

  stages.forEach((stage) => {
    if (stage === "orders") {
      // Use the real orders data for the orders stage
      stageItems[stage] = realOrders.map(order => ({
        id: order.id,
        name: order.items?.[0]?.id || order.id,
        customer: order.customer?.full_name || "",
        dueDate: order.created_at ? format(new Date(order.created_at), "MMM d") : "",
        status: "in-progress", // You may want to map real status here
        assignee: "",
        notes: "",
      }))
    } else if (stage === "packing") {
      // Use the real packing data for the packing stage
      stageItems[stage] = mockPackingData.map(item => ({
        id: item.id,
        name: item.name,
        customer: item.customer,
        dueDate: item.dueDate,
        status: item.status as any,
        assignee: item.assignee,
        notes: item.notes || "",
      }))
    } else if (stage === "shipping") {
      // Use the real shipping data for the shipping stage
      stageItems[stage] = mockShippingData.map(item => ({
        id: item.id,
        name: item.name,
        customer: item.customer,
        dueDate: item.dueDate,
        status: item.status as any,
        assignee: item.assignee,
        notes: item.notes || "",
      }))
    } else if (stage === "delivery") {
      // Use the real delivery data for the delivery stage
      stageItems[stage] = mockDeliveryData.map(item => ({
        id: item.id,
        name: item.name,
        customer: item.customer,
        dueDate: item.dueDate,
        status: item.status as any,
        assignee: item.assignee,
        notes: item.notes || "",
      }))
    } else {
      // Generate data for other stages
      const itemCount = Math.floor(Math.random() * 8) + 1 // 1-8 items per stage
      const items: LogisticsItem[] = []

      for (let i = 0; i < itemCount; i++) {
        const randomStatus = genericStatuses[Math.floor(Math.random() * genericStatuses.length)]
        
        let dueDate: Date;
        if (dateRange && dateRange.from && dateRange.to) {
          // Generate a due date within the provided range
          const fromTime = dateRange.from.getTime();
          const toTime = dateRange.to.getTime();
          dueDate = new Date(fromTime + Math.random() * (toTime - fromTime));
        } else {
           // Default behavior if no date range
          const daysToAdd = randomStatus === "on-track" ? 7 : randomStatus === "delayed" ? 3 : 0
          dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + daysToAdd)
        }

        const orderNumber = orderNumbers[orderIndex % orderNumbers.length]
        orderIndex++

        items.push({
          id: orderNumber,
          name: itemNames[Math.floor(Math.random() * itemNames.length)],
          customer: customers[Math.floor(Math.random() * customers.length)],
          dueDate: format(dueDate, "MMM d"),
          status: randomStatus,
          assignee: assignees[Math.floor(Math.random() * assignees.length)],
          notes: Math.random() > 0.7 ? "Customer requested rush" : undefined,
        })
      }
      stageItems[stage] = items
    }
  })

  return stageItems
}

const defaultSteps = [
  { key: 'orders', name: 'Orders' },
  { key: 'packing', name: 'Pack & Ship' },
  { key: 'pickup', name: 'Pick Up' },
  { key: 'delivery', name: 'Delivery' },
];

type DatePreset = 'today' | 'week' | 'month' | 'custom';

export function LogisticsPipeline({ searchQuery: searchQueryProp, sortOrder: sortOrderProp }: { searchQuery?: string, sortOrder?: string } = {}) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [steps, setSteps] = React.useState<{key: string, name: string}[]>(defaultSteps)
  const [removedStages, setRemovedStages] = React.useState<{key: string, name: string}[]>([])
  const [stageItems, setStageItems] = React.useState<Record<string, LogisticsItem[]>>({})
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [showCustomizer, setShowCustomizer] = React.useState(false)
  const [activePreset, setActivePreset] = React.useState<DatePreset>('week');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  });
  // Use prop if provided, otherwise internal state
  const [searchQueryInternal, setSearchQueryInternal] = React.useState("");
  const [sortOrderInternal, setSortOrderInternal] = React.useState("oldest");
  const searchQuery = searchQueryProp !== undefined ? searchQueryProp : searchQueryInternal;
  const sortOrder = sortOrderProp !== undefined ? sortOrderProp : sortOrderInternal;
  const [showFilters, setShowFilters] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [customerFilter, setCustomerFilter] = React.useState<string>("all");

  // Memoize the mapped steps to avoid re-calculating on every render
  const logisticsStages = React.useMemo(
    () => steps.map(s => s.key as LogisticsStageType),
    [steps]
  );

  const fetchDataForRange = React.useCallback((range?: DateRange) => {
    setIsLoading(true);
    const effectiveRange = range?.from && range?.to ? { from: range.from, to: range.to } : undefined;
    setTimeout(() => {
      setStageItems(generateSampleData(logisticsStages, effectiveRange))
      setIsLoading(false)
      setIsRefreshing(false)
    }, 500)
  }, [logisticsStages]);


  // Re-fetch and re-generate data when the pipeline steps or date range change
  React.useEffect(() => {
    fetchDataForRange(dateRange)
  }, [logisticsStages, dateRange, fetchDataForRange])

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchDataForRange(dateRange)
  }
  
  const handlePresetChange = (preset: DatePreset) => {
    setActivePreset(preset);
    let newRange: DateRange | undefined;
    const today = new Date();
    if (preset === 'today') {
      newRange = { from: startOfDay(today), to: endOfDay(today) };
    } else if (preset === 'week') {
      newRange = { from: startOfWeek(today), to: endOfWeek(today) };
    } else if (preset === 'month') {
      newRange = { from: startOfMonth(today), to: endOfMonth(today) };
    } else {
      // For 'custom', we don't change the range until the user picks one.
      return; 
    }
    setDateRange(newRange);
  }

  // Collect all unique customers for filter dropdown
  const allCustomers = React.useMemo(() => {
    const set = new Set<string>();
    Object.values(stageItems).flat().forEach(item => {
      if (item.customer) set.add(item.customer);
    });
    return ["all", ...Array.from(set)];
  }, [stageItems]);

  // Apply global filters to all items in all stages
  const getFilteredStageItems = (stage: string) => {
    let items = stageItems[stage] || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      items = items.filter(item => item.status === statusFilter);
    }
    if (customerFilter !== "all") {
      items = items.filter(item => item.customer === customerFilter);
    }
    items = [...items].sort((a, b) => {
      // Parse dueDate strings (e.g., "Jun 10") into Date objects for this year
      const parseDate = (str: string) => {
        const [month, day] = str.split(" ");
        return new Date(`${new Date().getFullYear()} ${month} ${day}`);
      };
      const dateA = parseDate(a.dueDate);
      const dateB = parseDate(b.dueDate);
      return sortOrder === "oldest" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
    return items;
  };

  return (
    <>
      {/* Existing pipeline/kanban board UI above */}
      <div className="space-y-4">
        {/* Controls row: date range, refresh, customize pipeline */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-row gap-2">
            <Button variant={activePreset === 'today' ? 'default' : 'outline'} size="sm" onClick={() => handlePresetChange('today')}>Today</Button>
            <Button variant={activePreset === 'week' ? 'default' : 'outline'} size="sm" onClick={() => handlePresetChange('week')}>This Week</Button>
            <Button variant={activePreset === 'month' ? 'default' : 'outline'} size="sm" onClick={() => handlePresetChange('month')}>This Month</Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={activePreset === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <UICalendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-row gap-2 ml-0 sm:ml-4">
          </div>
        </div>
        {/* Advanced filter panel */}
        {showFilters && (
          <div className="grid gap-4 p-4 border rounded-md bg-muted/20 sm:grid-cols-2 md:grid-cols-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="revise">Revise</SelectItem>
              </SelectContent>
            </Select>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by customer..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {allCustomers.filter(c => c !== "all").map((customer) => (
                  <SelectItem key={customer} value={customer}>{customer}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {/* Pipeline cards */}
        <div className="relative">
          <div className="flex gap-8 overflow-x-auto py-8 px-2 md:px-0 justify-center">
            {steps.map((step, index) => {
              const stageKey = step.key as LogisticsStageType;
              const displayName = step.name;
              return (
                <div key={`${stageKey}-${index}`} className="group relative flex flex-col items-center justify-center min-w-[200px] p-4 bg-white border-2 border-emerald-200 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <LogisticsStage
                    stage={stageKey}
                    displayName={displayName}
                    items={getFilteredStageItems(stageKey)}
                    isLoading={isLoading}
                  />
                </div>
              );
            })}
          </div>
          {/* + Button absolutely positioned bottom right */}
          <button
            className="absolute right-0 bottom-0 p-3 rounded-full bg-white/80 shadow transition flex items-center justify-center mr-4 mb-4 z-10 hover:bg-gradient-to-br hover:from-emerald-400 hover:to-emerald-600 hover:text-white"
            aria-label="Customize logistics pipeline"
            onClick={() => setShowCustomizer(true)}
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
        {/* Customizer panel */}
        <Dialog open={showCustomizer} onOpenChange={setShowCustomizer}>
          <DialogContent className="max-w-lg">
            <DialogTitle>Customize Logistics Pipeline</DialogTitle>
            <LogisticsPipelineCustomizer
              steps={steps}
              removedSteps={removedStages}
              onSave={(newSteps, newRemovedStages) => {
                const normalize = (arr: any[]) => arr.map(s => typeof s === 'string' ? { key: s.toLowerCase().replace(/\s+/g, '-'), name: s } : s);
                setSteps(normalize(newSteps));
                setRemovedStages(normalize(newRemovedStages));
                setShowCustomizer(false);
              }}
              onUpdate={(newSteps, newRemovedStages) => {
                const normalize = (arr: any[]) => arr.map(s => typeof s === 'string' ? { key: s.toLowerCase().replace(/\s+/g, '-'), name: s } : s);
                setSteps(normalize(newSteps));
                setRemovedStages(normalize(newRemovedStages));
              }}
              onCancel={() => setShowCustomizer(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      {/* Logistics Calendar (mimics production kanban calendar) */}
      <LogisticsCalendar />
    </>
  )
} 