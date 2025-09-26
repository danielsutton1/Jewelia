"use client"

import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateRangePickerProps {
  dateRange: DateRange
  setDateRange: (dateRange: DateRange) => void
}

export function DateRangePicker({ dateRange, setDateRange }: DateRangePickerProps) {
  const presets = [
    {
      label: "Last 7 days",
      value: "7days",
      dateRange: {
        from: addDays(new Date(), -7),
        to: new Date(),
      },
    },
    {
      label: "Last 30 days",
      value: "30days",
      dateRange: {
        from: addDays(new Date(), -30),
        to: new Date(),
      },
    },
    {
      label: "Last 90 days",
      value: "90days",
      dateRange: {
        from: addDays(new Date(), -90),
        to: new Date(),
      },
    },
    {
      label: "Year to date",
      value: "ytd",
      dateRange: {
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
      },
    },
  ]

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button id="date" variant={"outline"} className="w-[260px] justify-start text-left font-normal">
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
          <Select
            onValueChange={(value) => {
              const preset = presets.find((preset) => preset.value === value)
              if (preset) {
                setDateRange(preset.dateRange)
              }
            }}
          >
            <SelectTrigger className="m-1 w-[calc(100%-0.5rem)]">
              <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="border-t p-3">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
              numberOfMonths={2}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
