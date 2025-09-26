"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"
import { format as formatDate } from "date-fns"

interface ScheduleDeliveryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScheduleDeliveryDialog({ open, onOpenChange }: ScheduleDeliveryDialogProps) {
  const [scheduleType, setScheduleType] = useState("recurring")
  const [frequency, setFrequency] = useState("weekly")
  const [dayOfWeek, setDayOfWeek] = useState("monday")
  const [dayOfMonth, setDayOfMonth] = useState("1")
  const [time, setTime] = useState("09:00")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [recipients, setRecipients] = useState("")
  const [format, setFormat] = useState("pdf")
  const [includeAttachment, setIncludeAttachment] = useState(true)

  const handleSchedule = () => {
    // Logic to schedule the report
    console.log("Scheduling report:", {
      scheduleType,
      frequency,
      dayOfWeek,
      dayOfMonth,
      time,
      selectedDate,
      recipients,
      format,
      includeAttachment,
    })

    // Reset form and close dialog
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Report Delivery</DialogTitle>
          <DialogDescription>Set up automated delivery of this report to your team.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Tabs defaultValue="recurring" value={scheduleType} onValueChange={setScheduleType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
              <TabsTrigger value="oneTime">One-time</TabsTrigger>
            </TabsList>
            <TabsContent value="recurring" className="mt-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {frequency === "weekly" && (
                <div className="grid gap-2">
                  <Label htmlFor="dayOfWeek">Day of Week</Label>
                  <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                    <SelectTrigger id="dayOfWeek">
                      <SelectValue placeholder="Select day of week" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                      <SelectItem value="sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {frequency === "monthly" && (
                <div className="grid gap-2">
                  <Label htmlFor="dayOfMonth">Day of Month</Label>
                  <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                    <SelectTrigger id="dayOfMonth">
                      <SelectValue placeholder="Select day of month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </TabsContent>
            <TabsContent value="oneTime" className="mt-4 space-y-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <ChevronDown className="mr-2 h-4 w-4" />
                      {selectedDate ? formatDate(selectedDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="oneTimeTime">Time</Label>
                <Input id="oneTimeTime" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid gap-2">
            <Label htmlFor="recipients">Recipients</Label>
            <Input
              id="recipients"
              placeholder="Enter email addresses (comma separated)"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="attachment"
              checked={includeAttachment}
              onCheckedChange={(checked) => setIncludeAttachment(checked as boolean)}
            />
            <Label htmlFor="attachment" className="text-sm font-normal">
              Include report as attachment
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule}>Schedule Delivery</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
