"use client"

import { ProductionKanbanBoard } from "@/components/production/kanban/production-kanban-board"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRange } from "react-day-picker"
import { startOfWeek, endOfWeek, startOfDay, endOfDay, startOfMonth, endOfMonth, format } from "date-fns"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"

export default function ProductionKanbanPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState("newest")
  const [activePreset, setActivePreset] = useState<'today' | 'week' | 'month' | 'custom'>('today')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  })

  const handlePresetChange = (preset: 'today' | 'week' | 'month' | 'custom') => {
    setActivePreset(preset)
    switch (preset) {
      case 'today':
        setDateRange({
          from: startOfDay(new Date()),
          to: endOfDay(new Date())
        })
        break
      case 'week':
        setDateRange({
          from: startOfWeek(new Date(), { weekStartsOn: 1 }),
          to: endOfWeek(new Date(), { weekStartsOn: 1 })
        })
        break
      case 'month':
        setDateRange({
          from: startOfMonth(new Date()),
          to: endOfMonth(new Date())
        })
        break
    }
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    setActivePreset('custom')
  }

  return (
    <div className="flex flex-col gap-1 p-1 w-full">
      {/* Standardized Production Header, search, and filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
            Production Dashboard
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium">Manage jewelry manufacturing workflow</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <div className="relative w-full sm:w-auto">
            <Input
              placeholder="Search by order #, customer, item, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-[250px] pr-8 rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 min-h-[44px] text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 min-h-[44px] min-w-[44px]"
                onClick={() => setSearchQuery("")}
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
      {/* Standardized Filter Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <Button 
          variant={activePreset === 'today' ? 'default' : 'outline'} 
          size="sm" 
          className="min-h-[44px]"
          onClick={() => handlePresetChange('today')}
        >
          Today
        </Button>
        <Button 
          variant={activePreset === 'week' ? 'default' : 'outline'} 
          size="sm" 
          className="min-h-[44px]"
          onClick={() => handlePresetChange('week')}
        >
          This Week
        </Button>
        <Button 
          variant={activePreset === 'month' ? 'default' : 'outline'} 
          size="sm" 
          className="min-h-[44px]"
          onClick={() => handlePresetChange('month')}
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
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
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
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      <ProductionKanbanBoard dateRange={dateRange} />
    </div>
  )
}
