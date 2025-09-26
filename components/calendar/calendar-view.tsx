"use client"

import { useState } from "react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

const locales = {
  "en-US": enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Sample events
const events = [
  {
    id: 1,
    title: "Team Meeting",
    start: new Date(2023, 4, 15, 10, 0),
    end: new Date(2023, 4, 15, 11, 0),
    category: "meeting",
  },
  {
    id: 2,
    title: "Customer Call: Acme Inc.",
    start: new Date(2023, 4, 15, 14, 30),
    end: new Date(2023, 4, 15, 15, 0),
    category: "call",
  },
  {
    id: 3,
    title: "Product Demo",
    start: new Date(2023, 4, 16, 11, 0),
    end: new Date(2023, 4, 16, 12, 0),
    category: "demo",
  },
  {
    id: 4,
    title: "Strategy Planning",
    start: new Date(2023, 4, 17, 9, 0),
    end: new Date(2023, 4, 17, 12, 0),
    category: "meeting",
  },
  {
    id: 5,
    title: "Inventory Review",
    start: new Date(2023, 4, 18, 13, 0),
    end: new Date(2023, 4, 18, 14, 30),
    category: "task",
  },
  {
    id: 6,
    title: "Client Presentation",
    start: new Date(2023, 4, 19, 15, 0),
    end: new Date(2023, 4, 19, 16, 0),
    category: "presentation",
  },
]

// Event styling based on category
const eventStyleGetter = (event: any) => {
  let backgroundColor = ""
  switch (event.category) {
    case "meeting":
      backgroundColor = "hsl(var(--primary))"
      break
    case "call":
      backgroundColor = "#0ea5e9"
      break
    case "demo":
      backgroundColor = "#8b5cf6"
      break
    case "task":
      backgroundColor = "#f59e0b"
      break
    case "presentation":
      backgroundColor = "#10b981"
      break
    default:
      backgroundColor = "hsl(var(--primary))"
  }

  const style = {
    backgroundColor,
    borderRadius: "4px",
    opacity: 0.8,
    color: "white",
    border: "0px",
    display: "block",
  }
  return {
    style,
  }
}

export function CalendarView() {
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState("month")

  const onNavigate = (newDate: Date) => {
    setDate(newDate)
  }

  const onView = (newView: string) => {
    setView(newView)
  }

  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate("PREV")
    }

    const goToNext = () => {
      toolbar.onNavigate("NEXT")
    }

    const goToCurrent = () => {
      toolbar.onNavigate("TODAY")
    }

    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToCurrent}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold ml-2">{format(date, "MMMM yyyy")}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView("month")}
            className={view === "month" ? "bg-muted" : ""}
          >
            Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView("week")}
            className={view === "week" ? "bg-muted" : ""}
          >
            Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView("day")}
            className={view === "day" ? "bg-muted" : ""}
          >
            Day
          </Button>
          <Button className="ml-2 gap-1">
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        views={["month", "week", "day"]}
        defaultView="month"
        defaultDate={new Date()}
        date={date}
        onNavigate={onNavigate}
        view={view as any}
        onView={onView as any}
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: CustomToolbar,
        }}
      />
    </div>
  )
}
