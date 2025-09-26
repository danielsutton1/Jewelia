"use client"

import { SalesKanbanBoard } from "@/components/sales/kanban/sales-kanban-board"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { startOfWeek, endOfWeek, startOfDay, endOfDay, startOfMonth, endOfMonth, format } from "date-fns"
import { useState } from "react"

export default function SalesDashboardPage() {
  // Add state for sales search and sort order
  const [salesSearch, setSalesSearch] = useState("");
  const [salesSortOrder, setSalesSortOrder] = useState("oldest");
  
  // Add state for sales date filtering
  const [salesDateRange, setSalesDateRange] = useState<DateRange | undefined>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  });
  const [salesActivePreset, setSalesActivePreset] = useState<'today' | 'week' | 'month' | 'custom'>('week');

  // Sales date filter handlers
  const handleSalesPresetChange = (preset: 'today' | 'week' | 'month' | 'custom') => {
    setSalesActivePreset(preset);
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
    setSalesDateRange(newRange);
  }

  const handleSalesDateRangeChange = (range: DateRange | undefined) => {
    setSalesDateRange(range);
    setSalesActivePreset('custom');
  }

  return (
    <div className="flex flex-col gap-1 p-1 w-full">
      {/* Standardized Sales Header, search, and filters (keep only this set) */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
            Sales Dashboard
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium">Manage jewelry sales workflow</p>
        </div>
        {/* Search and Sort UI */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <div className="relative w-full sm:w-auto">
            <Input
              placeholder="Search by order #, customer, item, amount..."
              value={salesSearch}
              onChange={(e) => setSalesSearch(e.target.value)}
              className="w-full sm:w-[250px] pr-8 rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 min-h-[44px] text-sm"
            />
            {salesSearch && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 min-h-[44px] min-w-[44px]"
                onClick={() => setSalesSearch("")}
              >
                ×
              </Button>
            )}
          </div>
          <Select value={salesSortOrder} onValueChange={v => setSalesSortOrder(v)}>
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
      {/* Standardized Filter Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <Button 
          variant={salesActivePreset === 'today' ? 'default' : 'outline'} 
          size="sm" 
          className="min-h-[44px]"
          onClick={() => handleSalesPresetChange('today')}
        >
          Today
        </Button>
        <Button 
          variant={salesActivePreset === 'week' ? 'default' : 'outline'} 
          size="sm" 
          className="min-h-[44px]"
          onClick={() => handleSalesPresetChange('week')}
        >
          This Week
        </Button>
        <Button 
          variant={salesActivePreset === 'month' ? 'default' : 'outline'} 
          size="sm" 
          className="min-h-[44px]"
          onClick={() => handleSalesPresetChange('month')}
        >
          This Month
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="min-h-[44px]"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {salesDateRange?.from ? (
                salesDateRange.to ? (
                  <>
                    {format(salesDateRange.from, "LLL dd, y")} - {format(salesDateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(salesDateRange.from, "LLL dd, y")
                )
              ) : (
                "Pick a date"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={salesDateRange?.from}
              selected={salesDateRange}
              onSelect={handleSalesDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* Only keep the above header/filter section, remove any other duplicate headers/filters below */}
      <SalesKanbanBoard />
    </div>
  )
} 