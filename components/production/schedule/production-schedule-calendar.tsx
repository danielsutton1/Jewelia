"use client"

import { useState, useEffect } from "react"
import { Calendar, dateFnsLocalizer, Views, type SlotInfo, type EventProps } from "react-big-calendar"
import { format, parse, startOfWeek, getDay, isWithinInterval } from "date-fns"
import { enUS } from "date-fns/locale"
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"

import "react-big-calendar/lib/css/react-big-calendar.css"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import { generateSampleWorkOrders } from "../kanban/data"

// Configure localizer for the calendar
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

// Create a drag and drop enabled calendar
const DragAndDropCalendar = withDragAndDrop(Calendar)

// Define the work order event type
interface WorkOrderEvent {
  id: string
  title: string
  start: Date
  end: Date
  resourceId: string
  stage: string
  customer: string
  description: string
  dueDate: Date
  priority: "high" | "medium" | "low"
  allDay?: boolean
}

// Define the resource type
interface Resource {
  id: string
  title: string
  capacity: number
  currentLoad: number
}

// Generate sample work order events
const generateWorkOrderEvents = () => {
  const workOrders = generateSampleWorkOrders(30)
  const events: WorkOrderEvent[] = []

  workOrders.forEach((order) => {
    // Create a random start date within the next 30 days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30))
    startDate.setHours(8 + Math.floor(Math.random() * 8)) // Between 8 AM and 4 PM
    startDate.setMinutes(0)

    // Create an end date 1-3 days after the start date
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3) + 1)
    endDate.setHours(8 + Math.floor(Math.random() * 8)) // Between 8 AM and 4 PM
    endDate.setMinutes(0)

    // Create the event
    events.push({
      id: order.id,
      title: order.itemDescription,
      start: startDate,
      end: endDate,
      resourceId: order.assignedTo,
      stage: order.currentStage,
      customer: order.customerName,
      description: order.itemDescription,
      dueDate: new Date(order.dueDate),
      priority: order.priority,
      allDay: Math.random() > 0.7, // Some events are all day
    })
  })

  return events
}

// Generate sample resources (craftspeople)
const generateResources = (): Resource[] => {
  return [
    { id: "Michael Chen", title: "Michael Chen", capacity: 40, currentLoad: 32 },
    { id: "Sophia Rodriguez", title: "Sophia Rodriguez", capacity: 40, currentLoad: 38 },
    { id: "David Kim", title: "David Kim", capacity: 40, currentLoad: 25 },
    { id: "Emma Johnson", title: "Emma Johnson", capacity: 40, currentLoad: 40 },
    { id: "James Wilson", title: "James Wilson", capacity: 40, currentLoad: 15 },
    { id: "Olivia Martinez", title: "Olivia Martinez", capacity: 40, currentLoad: 30 },
    { id: "William Taylor", title: "William Taylor", capacity: 40, currentLoad: 22 },
    { id: "Ava Thompson", title: "Ava Thompson", capacity: 40, currentLoad: 35 },
  ]
}

// Custom event component
const EventComponent = ({ event }: EventProps<WorkOrderEvent>) => {
  // Define colors for different stages
  const stageColors: Record<string, string> = {
    design: "bg-blue-500 border-blue-600",
    wax: "bg-purple-500 border-purple-600",
    casting: "bg-amber-500 border-amber-600",
    setting: "bg-emerald-500 border-emerald-600",
    polishing: "bg-pink-500 border-pink-600",
    qc: "bg-red-500 border-red-600",
    ready: "bg-green-500 border-green-600",
  }

  // Define colors for different priorities
  const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-emerald-100 text-emerald-800 border-emerald-200",
  }

  const backgroundColor = stageColors[event.stage] || "bg-gray-500 border-gray-600"

  return (
    <div
      className={`flex h-full w-full flex-col rounded px-1 py-0.5 text-white ${backgroundColor} border-l-4`}
      title={`${event.title} - ${event.customer}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium truncate">{event.title}</span>
        {!event.allDay && (
          <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px] bg-white/20 text-white border-white/30">
            {format(event.start, "h:mm a")}
          </Badge>
        )}
      </div>
      <div className="mt-0.5 flex items-center text-[10px]">
        <span className="truncate">{event.customer}</span>
      </div>
    </div>
  )
}

export function ProductionScheduleCalendar() {
  const [events, setEvents] = useState<WorkOrderEvent[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [view, setView] = useState(Views.WEEK)
  const [date, setDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<WorkOrderEvent | null>(null)
  const [conflicts, setConflicts] = useState<WorkOrderEvent[][]>([])

  // Initialize with sample data
  useEffect(() => {
    setEvents(generateWorkOrderEvents())
    setResources(generateResources())
  }, [])

  // Check for scheduling conflicts
  useEffect(() => {
    const newConflicts: WorkOrderEvent[][] = []

    // Check each event against all other events for the same resource
    events.forEach((event1) => {
      const conflictsForEvent = events.filter(
        (event2) =>
          event1.id !== event2.id &&
          event1.resourceId === event2.resourceId &&
          (isWithinInterval(event1.start, { start: event2.start, end: event2.end }) ||
            isWithinInterval(event1.end, { start: event2.start, end: event2.end }) ||
            (event1.start <= event2.start && event1.end >= event2.end)),
      )

      if (conflictsForEvent.length > 0) {
        newConflicts.push([event1, ...conflictsForEvent])
      }
    })

    // Remove duplicate conflict groups
    const uniqueConflicts = newConflicts.filter((conflicts, index) => {
      const conflictIds = conflicts
        .map((event) => event.id)
        .sort()
        .join(",")
      return (
        newConflicts.findIndex(
          (c) =>
            c
              .map((event) => event.id)
              .sort()
              .join(",") === conflictIds,
        ) === index
      )
    })

    setConflicts(uniqueConflicts)
  }, [events])

  // Handle event selection
  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event)
  }

  // Handle event moving (drag and drop)
  const handleEventDrop = ({ event, start, end, resourceId }: any) => {
    const updatedEvents = events.map((e) => {
      if (e.id === event.id) {
        return {
          ...e,
          start,
          end,
          resourceId: resourceId || e.resourceId,
        }
      }
      return e
    })
    setEvents(updatedEvents)
  }

  // Handle event resizing
  const handleEventResize = ({ event, start, end }: any) => {
    const updatedEvents = events.map((e) => {
      if (e.id === event.id) {
        return {
          ...e,
          start,
          end,
        }
      }
      return e
    })
    setEvents(updatedEvents)
  }

  // Handle slot selection (creating new events)
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    // In a real app, you would open a form to create a new work order
    console.log("Selected slot:", slotInfo)
  }

  // Custom toolbar component
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
      <div className="flex items-center justify-between mb-4 px-4 pt-4">
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
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Conflicts alert */}
      {conflicts.length > 0 && (
        <Alert variant="destructive" className="mx-4 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Scheduling Conflicts Detected</AlertTitle>
          <AlertDescription>
            There are {conflicts.length} scheduling conflicts. Please review and adjust the schedule.
          </AlertDescription>
        </Alert>
      )}

      {/* Calendar */}
      <div className="h-[700px] p-4">
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          resources={resources}
          resourceIdAccessor={(resource: any) => resource.id}
          resourceTitleAccessor={(resource: any) => resource.title}
          startAccessor={(event: any) => event.start}
          endAccessor={(event: any) => event.end}
          defaultView={Views.WEEK}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          step={60}
          showMultiDayTimes
          date={date}
          onNavigate={setDate}
          view={view as any}
          onView={setView as any}
          selectable
          resizable
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onSelectSlot={handleSelectSlot}
          components={{
            toolbar: CustomToolbar,
            event: EventComponent as any,
          }}
          dayPropGetter={(date) => {
            // Highlight weekends
            const isWeekend = getDay(date) === 0 || getDay(date) === 6
            return {
              style: {
                backgroundColor: isWeekend ? "#f9fafb" : undefined,
              },
            }
          }}
          eventPropGetter={(event) => {
            // Add custom styling based on event properties
            return {
              className: "",
              style: {
                height: "100%",
              },
            }
          }}
          dayLayoutAlgorithm="no-overlap"
        />
      </div>

      {/* Event details dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Work Order Details</DialogTitle>
            <DialogDescription>View and manage the details for this production work order.</DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    selectedEvent.priority === "high"
                      ? "bg-red-100 text-red-800 border-red-200"
                      : selectedEvent.priority === "medium"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-emerald-100 text-emerald-800 border-emerald-200"
                  }
                >
                  {selectedEvent.priority.charAt(0).toUpperCase() + selectedEvent.priority.slice(1)} Priority
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Customer</h4>
                  <p>{selectedEvent.customer}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Current Stage</h4>
                  <p className="capitalize">{selectedEvent.stage}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Assigned To</h4>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={`/abstract-geometric-shapes.png?height=32&width=32&query=${selectedEvent.resourceId}`}
                      />
                      <AvatarFallback>{selectedEvent.resourceId.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{selectedEvent.resourceId}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Due Date</h4>
                  <p>{format(selectedEvent.dueDate, "MMM d, yyyy")}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Scheduled Start</h4>
                  <p>{format(selectedEvent.start, "MMM d, yyyy h:mm a")}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Scheduled End</h4>
                  <p>{format(selectedEvent.end, "MMM d, yyyy h:mm a")}</p>
                </div>
              </div>

              {/* Check for conflicts with this event */}
              {conflicts.some((conflictGroup) => conflictGroup.some((event) => event.id === selectedEvent.id)) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Scheduling Conflict</AlertTitle>
                  <AlertDescription>
                    This work order has scheduling conflicts with other work orders assigned to{" "}
                    {selectedEvent.resourceId}.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
                <Button>View Work Order</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
