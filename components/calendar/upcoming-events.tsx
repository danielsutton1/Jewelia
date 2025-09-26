import { Calendar, Clock, Users, Video } from "lucide-react"
import { Button } from "@/components/ui/button"

const events = [
  {
    id: 1,
    title: "Team Meeting",
    time: "10:00 AM - 11:00 AM",
    date: "Today",
    type: "video",
    attendees: 5,
  },
  {
    id: 2,
    title: "Customer Call: Acme Inc.",
    time: "2:30 PM - 3:00 PM",
    date: "Today",
    type: "call",
    attendees: 2,
  },
  {
    id: 3,
    title: "Product Demo",
    time: "11:00 AM - 12:00 PM",
    date: "Tomorrow",
    type: "video",
    attendees: 8,
  },
  {
    id: 4,
    title: "Strategy Planning",
    time: "9:00 AM - 12:00 PM",
    date: "May 17, 2023",
    type: "meeting",
    attendees: 6,
  },
  {
    id: 5,
    title: "Inventory Review",
    time: "1:00 PM - 2:30 PM",
    date: "May 18, 2023",
    type: "task",
    attendees: 3,
  },
]

export function UpcomingEvents() {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="flex flex-col space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{event.title}</h4>
            {event.type === "video" ? (
              <Video className="h-4 w-4 text-primary" />
            ) : (
              <Calendar className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{event.attendees} attendees</span>
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full">
        View All Events
      </Button>
    </div>
  )
}
