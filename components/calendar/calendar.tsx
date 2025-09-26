"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns"

interface CalendarProps {
  selectedDate?: Date
  onSelectDate?: (date: Date) => void
  onEventClick?: (event: any) => void
}

export function Calendar({ selectedDate, onSelectDate, onEventClick }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<any[]>([])

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.start), date))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-lg border bg-muted">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="bg-background p-2 text-center text-sm font-medium"
          >
            {day}
          </div>
        ))}

        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDate(day)
          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[100px] bg-background p-2",
                !isSameMonth(day, currentMonth) && "text-muted-foreground",
                isToday(day) && "bg-muted/50",
                selectedDate && isSameDay(day, selectedDate) && "bg-primary/10"
              )}
              onClick={() => onSelectDate?.(day)}
            >
              <time
                dateTime={format(day, "yyyy-MM-dd")}
                className={cn(
                  "block text-sm",
                  isToday(day) && "font-bold text-primary"
                )}
              >
                {format(day, "d")}
              </time>
              <div className="mt-1 space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="cursor-pointer rounded bg-primary/10 px-1 py-0.5 text-xs text-primary hover:bg-primary/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick?.(event)
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 