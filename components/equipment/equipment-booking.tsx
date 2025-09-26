"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Clock, Users, AlertTriangle, Save, X, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

// Mock data for equipment bookings
const bookingsData = [
  {
    id: "B001",
    equipmentId: "EQ001",
    equipmentName: "Laser Welder",
    bookedBy: "Emma Thompson",
    department: "Production",
    date: "2023-08-15",
    startTime: "09:00",
    endTime: "12:00",
    purpose: "Custom order production",
    status: "confirmed",
  },
  {
    id: "B002",
    equipmentId: "EQ003",
    equipmentName: "Ultrasonic Cleaner",
    bookedBy: "Michael Chen",
    department: "Quality Control",
    date: "2023-08-15",
    startTime: "13:00",
    endTime: "15:00",
    purpose: "Batch cleaning of components",
    status: "confirmed",
  },
  {
    id: "B003",
    equipmentId: "EQ002",
    equipmentName: "Rolling Mill",
    bookedBy: "Sarah Johnson",
    department: "Production",
    date: "2023-08-16",
    startTime: "10:00",
    endTime: "16:00",
    purpose: "Sheet metal preparation",
    status: "pending",
  },
  {
    id: "B004",
    equipmentId: "EQ004",
    equipmentName: "Casting Machine",
    bookedBy: "David Wilson",
    department: "Production",
    date: "2023-08-17",
    startTime: "08:00",
    endTime: "17:00",
    purpose: "Monthly production run",
    status: "confirmed",
  },
  {
    id: "B005",
    equipmentId: "EQ001",
    equipmentName: "Laser Welder",
    bookedBy: "Jessica Martinez",
    department: "R&D",
    date: "2023-08-18",
    startTime: "14:00",
    endTime: "16:30",
    purpose: "Prototype development",
    status: "confirmed",
  },
]

// Mock data for equipment
const equipmentData = [
  { id: "EQ001", name: "Laser Welder", status: "operational" },
  { id: "EQ002", name: "Rolling Mill", status: "operational" },
  { id: "EQ003", name: "Ultrasonic Cleaner", status: "maintenance" },
  { id: "EQ004", name: "Casting Machine", status: "operational" },
  { id: "EQ005", name: "Polishing Machine", status: "operational" },
]

// Mock data for users/departments
const userData = [
  { id: "U001", name: "Emma Thompson", department: "Production" },
  { id: "U002", name: "Michael Chen", department: "Quality Control" },
  { id: "U003", name: "Sarah Johnson", department: "Production" },
  { id: "U004", name: "David Wilson", department: "Production" },
  { id: "U005", name: "Jessica Martinez", department: "R&D" },
]

const departments = [
  "Production",
  "Quality Control",
  "R&D",
  "Design",
  "Maintenance",
  "Other"
]

export function EquipmentBooking() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [bookings, setBookings] = useState(bookingsData)
  
  // Form state for booking
  const [formData, setFormData] = useState({
    equipmentId: "",
    bookedBy: "",
    department: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter bookings for the selected date
  const filteredBookings = bookings.filter((booking) => 
    booking.date === (date ? format(date, "yyyy-MM-dd") : "")
  )

  // Function to get the appropriate badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateBooking = async () => {
    if (!formData.equipmentId || !formData.bookedBy || !formData.date || !formData.startTime || !formData.endTime || !formData.purpose) {
      return
    }

    // Check for time conflicts
    const hasConflict = bookings.some(booking => 
      booking.equipmentId === formData.equipmentId &&
      booking.date === formData.date &&
      booking.status !== "cancelled" &&
      (
        (formData.startTime >= booking.startTime && formData.startTime < booking.endTime) ||
        (formData.endTime > booking.startTime && formData.endTime <= booking.endTime) ||
        (formData.startTime <= booking.startTime && formData.endTime >= booking.endTime)
      )
    )

    if (hasConflict) {
      toast({
        title: "Booking Conflict",
        description: "This equipment is already booked for the selected time period.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const selectedEquipment = equipmentData.find(eq => eq.id === formData.equipmentId)
      const selectedUser = userData.find(user => user.id === formData.bookedBy)
      
      const newBooking = {
        id: `B${String(bookings.length + 1).padStart(3, '0')}`,
        equipmentId: formData.equipmentId,
        equipmentName: selectedEquipment?.name || "Unknown Equipment",
        bookedBy: selectedUser?.name || "Unknown User",
        department: formData.department || selectedUser?.department || "Unknown",
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        status: "pending"
      }

      setBookings(prev => [...prev, newBooking])
      setBookingDialogOpen(false)
      
      // Reset form
      setFormData({
        equipmentId: "",
        bookedBy: "",
        department: "",
        date: "",
        startTime: "",
        endTime: "",
        purpose: ""
      })
      
      toast({
        title: "Booking Created",
        description: `Booking for ${selectedEquipment?.name} has been created successfully.`
      })
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error creating the booking. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelBooking = () => {
    setFormData({
      equipmentId: "",
      bookedBy: "",
      department: "",
      date: "",
      startTime: "",
      endTime: "",
      purpose: ""
    })
    setBookingDialogOpen(false)
  }

  const handleConfirmBooking = (bookingId: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status: "confirmed" } : booking
    ))
    toast({
      title: "Booking Confirmed",
      description: "The booking has been confirmed successfully."
    })
  }

  const handleCancelExistingBooking = (bookingId: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status: "cancelled" } : booking
    ))
    toast({
      title: "Booking Cancelled",
      description: "The booking has been cancelled."
    })
  }

  const isFormValid = formData.equipmentId && formData.bookedBy && formData.date && formData.startTime && formData.endTime && formData.purpose

  const getAvailableEquipment = () => {
    return equipmentData.filter(eq => eq.status === "operational")
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Equipment Calendar</CardTitle>
          <CardDescription>Select a date to view or create bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          <div className="mt-4">
            <Button className="w-full" onClick={() => setBookingDialogOpen(true)}>
              Book Equipment
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Bookings for {date ? format(date, "MMMM d, yyyy") : "Today"}</CardTitle>
          <CardDescription>Equipment reservations and availability</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{booking.equipmentName}</h4>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {booking.bookedBy} ({booking.department})
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Purpose:</span> {booking.purpose}
                  </div>
                  {booking.status === "pending" && (
                    <div className="mt-3 flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleConfirmBooking(booking.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCancelExistingBooking(booking.id)}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">No bookings for this date</p>
                <Button variant="outline" className="mt-2" onClick={() => setBookingDialogOpen(true)}>
                  Create Booking
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Book Equipment
            </DialogTitle>
            <DialogDescription>
              Create a new equipment reservation. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="equipment">Equipment *</Label>
              <Select value={formData.equipmentId} onValueChange={(value) => handleInputChange("equipmentId", value)}>
                <SelectTrigger id="equipment">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableEquipment().map((equipment) => (
                    <SelectItem key={equipment.id} value={equipment.id}>
                      {equipment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bookedBy">Booked By *</Label>
              <Select value={formData.bookedBy} onValueChange={(value) => handleInputChange("bookedBy", value)}>
                <SelectTrigger id="bookedBy">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {userData.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(new Date(formData.date), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single" 
                    selected={formData.date ? new Date(formData.date) : undefined} 
                    onSelect={(date) => handleInputChange("date", date ? format(date, "yyyy-MM-dd") : "")} 
                    initialFocus 
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input 
                  id="startTime" 
                  type="time" 
                  value={formData.startTime}
                  onChange={(e) => handleInputChange("startTime", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input 
                  id="endTime" 
                  type="time" 
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Textarea 
                id="purpose" 
                placeholder="Describe the purpose of this booking" 
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
              />
            </div>

            {/* Form Validation Alert */}
            {!isFormValid && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please fill in all required fields (marked with *) to continue.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between">
            <Button variant="outline" onClick={handleCancelBooking}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBooking} 
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
