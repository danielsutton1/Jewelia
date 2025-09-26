"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, CalendarIcon, Download, Filter, RefreshCw, Settings } from "lucide-react"
import { LogisticsPipeline } from "@/components/logistics/logistics-pipeline"
import { DateRange } from "react-day-picker"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns"
import { Calendar as UICalendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

type DatePreset = 'today' | 'week' | 'month' | 'custom';

const defaultSteps = [
  'Orders',
  'Pack & Ship',
  'Pick Up',
  'Delivery',
];

export default function LogisticsDashboard() {
  const [activePreset, setActivePreset] = React.useState<DatePreset>('week');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  });
  const [search, setSearch] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState("oldest");
  const [showFilters, setShowFilters] = React.useState(false);
  const [steps, setSteps] = React.useState<string[]>(defaultSteps);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [customerFilter, setCustomerFilter] = React.useState<string>("all");

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
      return;
    }
    setDateRange(newRange);
  };

  return (
    <div className="flex flex-col gap-1 p-1 w-full">
      {/* Header row: title left, controls right */}
      <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight logistics-heading">Logistics Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Input
              placeholder="Search by order #, customer, tracking, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-[250px] pr-8 rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 min-h-[44px] text-sm"
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 min-h-[44px] min-w-[44px]"
                onClick={() => setSearch("")}
              >
                ×
              </Button>
            )}
          </div>
          <Select value={sortOrder} onValueChange={v => setSortOrder(v)}>
            <SelectTrigger className="w-full sm:w-48 min-h-[44px] text-sm">
              <SelectValue placeholder="Sort by due date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oldest">Oldest to Newest</SelectItem>
              <SelectItem value="newest">Newest to Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Subtitle below header row */}
      <div>
        <p className="text-sm sm:text-base text-muted-foreground logistics-subtext">Manage jewelry logistics workflow</p>
      </div>
      {/* Kanban Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1">
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <LogisticsPipeline />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 