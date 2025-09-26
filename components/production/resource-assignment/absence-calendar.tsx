"use client"

import * as React from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns"
import { CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Craftsperson } from "./data"

interface AbsenceCalendarProps {
  craftspeople: Craftsperson[]
  onAddAbsence: (craftspersonId: string, startDate: Date, endDate: Date, reason: string) => void
  onRemoveAbsence: (craftspersonId: string, absenceId: string) => void
}

export function AbsenceCalendar({ craftspeople, onAddAbsence, onRemoveAbsence }: AbsenceCalendarProps) {
  const [date, setDate] = React.useState<Date>(new Date())
  const [selectedCraftsperson, setSelectedCraftsperson] = React.useState<string | null>(null)
  const [absenceStartDate, setAbsenceStartDate] = React.useState<Date | null>(null)
  const [absenceEndDate, setAbsenceEndDate] = React.useState<Date | null>(null)
  const [absenceReason, setAbsenceReason] = React.useState<string>("")

  // Get all absences for the calendar view
  const allAbsences = React.useMemo(() => {
    const absences: {
      id: string
      craftspersonId: string
      craftspersonName: string
      startDate: Date
      endDate: Date
      reason: string
    }[] = []

    craftspeople.forEach((person) => {
      person.absences?.forEach((absence) => {
        absences.push({
          id: absence.id,
          craftspersonId: person.id,
          craftspersonName: person.name,
          startDate: new Date(absence.startDate),
          endDate: new Date(absence.endDate),
          reason: absence.reason,
        })
      })
    })

    return absences
  }, [craftspeople])

  // Get days with absences for the current month
  const daysWithAbsences = React.useMemo(() => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const days = eachDayOfInterval({ start, end })

    return days.map((day) => {
      const absencesOnDay = allAbsences.filter((absence) => day >= absence.startDate && day <= absence.endDate)
      return {
        date: day,
        absences: absencesOnDay,
      }
    })
  }, [date, allAbsences])

  // Handle adding a new absence
  const handleAddAbsence = () => {
    if (selectedCraftsperson && absenceStartDate && absenceEndDate) {
      onAddAbsence(selectedCraftsperson, absenceStartDate, absenceEndDate, absenceReason)
      setSelectedCraftsperson(null)
      setAbsenceStartDate(null)
      setAbsenceEndDate(null)
      setAbsenceReason("")
    }
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Calendar view */}
      <Card>
        <CardHeader>
          <CardTitle>Absence Calendar</CardTitle>
          <CardDescription>View all scheduled absences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border"
                components={{
                  Day: ({ day, ...props }) => {
                    const dayWithAbsences = daysWithAbsences.find((d) => isSameDay(d.date, day as unknown as Date))
                    const hasAbsences = dayWithAbsences && dayWithAbsences.absences.length > 0
                    return (
                      <Button
                        className={cn(
                          "h-8 w-8 p-0 font-normal",
                          hasAbsences && "relative bg-red-100 text-red-900 hover:bg-red-200",
                          !isSameMonth(day as unknown as Date, date) && "text-muted-foreground opacity-50",
                        )}
                        variant="ghost"
                      >
                        {format(day as unknown as Date, "d")}
                        {hasAbsences && (
                          <div className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                          </div>
                        )}
                      </Button>
                    )
                  },
                }}
              />
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Absences on {format(date, "MMMM d, yyyy")}</h3>
              <div className="space-y-2">
                {daysWithAbsences
                  .find((d) => isSameDay(d.date, date))
                  ?.absences.map((absence) => (
                    <div
                      key={absence.id}
                      className="flex items-center justify-between rounded-md border bg-red-50 p-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`/abstract-geometric-shapes.png?height=24&width=24&query=${absence.craftspersonName}`}
                          />
                          <AvatarFallback>{getInitials(absence.craftspersonName)}</AvatarFallback>
                        </Avatar>
                        <span>{absence.craftspersonName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          {format(absence.startDate, "MMM d")} - {format(absence.endDate, "MMM d")}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onRemoveAbsence(absence.craftspersonId, absence.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No absences on this day.</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add absence form */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Absence</CardTitle>
          <CardDescription>Add vacation or absence for a craftsperson</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="craftsperson">Craftsperson</Label>
              <Select value={selectedCraftsperson || ""} onValueChange={setSelectedCraftsperson}>
                <SelectTrigger id="craftsperson">
                  <SelectValue placeholder="Select craftsperson" />
                </SelectTrigger>
                <SelectContent>
                  {craftspeople.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !absenceStartDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {absenceStartDate ? format(absenceStartDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={absenceStartDate || undefined} onSelect={(date) => setAbsenceStartDate(date || null)} initialFocus required={false} />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !absenceEndDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {absenceEndDate ? format(absenceEndDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={absenceEndDate || undefined} onSelect={(date) => setAbsenceEndDate(date || null)} initialFocus required={false} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                placeholder="Vacation, sick leave, training, etc."
                value={absenceReason}
                onChange={(e) => setAbsenceReason(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <div>
          <Button
            onClick={handleAddAbsence}
            disabled={!selectedCraftsperson || !absenceStartDate || !absenceEndDate}
            className="ml-auto"
          >
            Schedule Absence
          </Button>
        </div>
      </Card>

      {/* All absences list */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>All Scheduled Absences</CardTitle>
          <CardDescription>View and manage all upcoming absences</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {allAbsences.length === 0 ? (
                <p className="text-sm text-muted-foreground">No absences scheduled.</p>
              ) : (
                allAbsences
                  .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                  .map((absence) => (
                    <div key={absence.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`/abstract-geometric-shapes.png?height=24&width=24&query=${absence.craftspersonName}`}
                          />
                          <AvatarFallback>{getInitials(absence.craftspersonName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{absence.craftspersonName}</div>
                          <div className="text-xs text-muted-foreground">{absence.reason}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          {format(absence.startDate, "MMM d")} - {format(absence.endDate, "MMM d")}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onRemoveAbsence(absence.craftspersonId, absence.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
