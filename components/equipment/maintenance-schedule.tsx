"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, isSameDay, addDays } from "date-fns"
import { CheckCircle2, Clock, Filter, Plus, PenToolIcon as Tool, AlertTriangle, Save, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data for scheduled maintenance
const scheduledMaintenanceData = [
  {
    id: "SM001",
    equipmentId: "EQ001",
    equipmentName: "Laser Welder",
    maintenanceType: "Preventive",
    scheduledDate: new Date(2023, 7, 15), // August 15, 2023
    estimatedDuration: "2 hours",
    assignedTo: "John Smith",
    priority: "medium",
    status: "scheduled",
    notes: "Regular quarterly maintenance",
  },
  {
    id: "SM002",
    equipmentId: "EQ002",
    equipmentName: "Rolling Mill",
    maintenanceType: "Preventive",
    scheduledDate: new Date(2023, 7, 18), // August 18, 2023
    estimatedDuration: "3 hours",
    assignedTo: "Maria Rodriguez",
    priority: "high",
    status: "scheduled",
    notes: "Check for bearing wear and lubrication",
  },
  {
    id: "SM003",
    equipmentId: "EQ003",
    equipmentName: "Ultrasonic Cleaner",
    maintenanceType: "Repair",
    scheduledDate: new Date(2023, 7, 16), // August 16, 2023
    estimatedDuration: "1.5 hours",
    assignedTo: "David Chen",
    priority: "high",
    status: "scheduled",
    notes: "Replace heating element",
  },
  {
    id: "SM004",
    equipmentId: "EQ004",
    equipmentName: "Casting Machine",
    maintenanceType: "Preventive",
    scheduledDate: new Date(2023, 7, 20), // August 20, 2023
    estimatedDuration: "4 hours",
    assignedTo: "Sarah Johnson",
    priority: "medium",
    status: "scheduled",
    notes: "Full system inspection and vacuum pump maintenance",
  },
  {
    id: "SM005",
    equipmentId: "EQ005",
    equipmentName: "Polishing Machine",
    maintenanceType: "Preventive",
    scheduledDate: new Date(2023, 7, 22), // August 22, 2023
    estimatedDuration: "1 hour",
    assignedTo: "Robert Williams",
    priority: "low",
    status: "scheduled",
    notes: "Belt replacement and dust system cleaning",
  },
  {
    id: "SM006",
    equipmentId: "EQ001",
    equipmentName: "Laser Welder",
    maintenanceType: "Calibration",
    scheduledDate: new Date(2023, 7, 25), // August 25, 2023
    estimatedDuration: "2 hours",
    assignedTo: "John Smith",
    priority: "high",
    status: "scheduled",
    notes: "Precision calibration for upcoming custom order production",
  },
]

// Mock data for equipment
const equipmentData = [
  { id: "EQ001", name: "Laser Welder" },
  { id: "EQ002", name: "Rolling Mill" },
  { id: "EQ003", name: "Ultrasonic Cleaner" },
  { id: "EQ004", name: "Casting Machine" },
  { id: "EQ005", name: "Polishing Machine" },
]

// Mock data for technicians
const technicianData = [
  { id: "T001", name: "John Smith" },
  { id: "T002", name: "Maria Rodriguez" },
  { id: "T003", name: "David Chen" },
  { id: "T004", name: "Sarah Johnson" },
  { id: "T005", name: "Robert Williams" },
]

const maintenanceTypes = [
  "Preventive",
  "Repair",
  "Calibration",
  "Inspection",
  "Emergency",
  "Upgrade",
  "Installation"
]

const priorityLevels = [
  { value: "low", label: "Low", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "medium", label: "Medium", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "high", label: "High", color: "bg-red-50 text-red-700 border-red-200" }
]

export function MaintenanceSchedule() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [maintenanceData, setMaintenanceData] = useState(scheduledMaintenanceData)
  
  // Form state for scheduling maintenance
  const [formData, setFormData] = useState({
    equipmentId: "",
    maintenanceType: "",
    scheduledDate: "",
    estimatedDuration: "",
    assignedTo: "",
    priority: "medium",
    notes: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Function to get maintenance events for the selected date
  const getMaintenanceForDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return []
    
    return maintenanceData.filter(maintenance => 
      isSameDay(maintenance.scheduledDate, selectedDate)
    )
  }
  
  // Get maintenance for the selected date
  const selectedDateMaintenance = getMaintenanceForDate(date)
  
  // Function to get dates with maintenance scheduled
  const getMaintenanceDates = () => {
    return maintenanceData.map(maintenance => maintenance.scheduledDate)
  }
  
  // Function to get the appropriate badge color based on priority
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>
      case "medium":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Medium</Badge>
      case "low":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }
  
  // Function to get the appropriate badge color based on maintenance type
  const getMaintenanceTypeBadge = (type: string) => {
    switch (type) {
      case "Preventive":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Preventive</Badge>
      case "Repair":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Repair</Badge>
      case "Calibration":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Calibration</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }
  
  // Function to check if a date has maintenance scheduled
  const hasMaintenanceScheduled = (day: Date) => {
    return maintenanceData.some(maintenance => 
      isSameDay(maintenance.scheduledDate, day)
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleScheduleMaintenance = async () => {
    if (!formData.equipmentId || !formData.maintenanceType || !formData.scheduledDate || !formData.assignedTo) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const selectedEquipment = equipmentData.find(eq => eq.id === formData.equipmentId)
      const selectedTechnician = technicianData.find(tech => tech.id === formData.assignedTo)
      
      const newMaintenance = {
        id: `SM${String(maintenanceData.length + 1).padStart(3, '0')}`,
        equipmentId: formData.equipmentId,
        equipmentName: selectedEquipment?.name || "Unknown Equipment",
        maintenanceType: formData.maintenanceType,
        scheduledDate: new Date(formData.scheduledDate),
        estimatedDuration: formData.estimatedDuration,
        assignedTo: selectedTechnician?.name || "Unassigned",
        priority: formData.priority,
        status: "scheduled",
        notes: formData.notes
      }

      setMaintenanceData(prev => [...prev, newMaintenance])
      setScheduleDialogOpen(false)
      
      // Reset form
      setFormData({
        equipmentId: "",
        maintenanceType: "",
        scheduledDate: "",
        estimatedDuration: "",
        assignedTo: "",
        priority: "medium",
        notes: ""
      })
      
      toast({
        title: "Maintenance Scheduled",
        description: `Maintenance for ${selectedEquipment?.name} has been scheduled successfully.`
      })
    } catch (error) {
      toast({
        title: "Scheduling Failed",
        description: "There was an error scheduling the maintenance. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      equipmentId: "",
      maintenanceType: "",
      scheduledDate: "",
      estimatedDuration: "",
      assignedTo: "",
      priority: "medium",
      notes: ""
    })
    setScheduleDialogOpen(false)
  }

  const isFormValid = formData.equipmentId && formData.maintenanceType && formData.scheduledDate && formData.assignedTo

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Upcoming Maintenance</CardTitle>
            <CardDescription>
              View all scheduled maintenance for the next 30 days
            </CardDescription>
          </div>
          <Button variant="default" size="sm" onClick={() => setScheduleDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Maintenance
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden md:table-cell">Duration</TableHead>
                  <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceData
                  .filter(maintenance => 
                    maintenance.scheduledDate <= addDays(new Date(), 30)
                  )
                  .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
                  .map((maintenance) => (
                    <TableRow key={maintenance.id}>
                      <TableCell className="font-medium">{maintenance.equipmentName}</TableCell>
                      <TableCell>{getMaintenanceTypeBadge(maintenance.maintenanceType)}</TableCell>
                      <TableCell>{format(maintenance.scheduledDate, "MMM d, yyyy")}</TableCell>
                      <TableCell className="hidden md:table-cell">{maintenance.estimatedDuration}</TableCell>
                      <TableCell className="hidden md:table-cell">{maintenance.assignedTo}</TableCell>
                      <TableCell>{getPriorityBadge(maintenance.priority)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" title="Actions">
                              <span className="sr-only">Open actions</span>
                              <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="4" cy="10" r="1.5" fill="currentColor"/><circle cx="10" cy="10" r="1.5" fill="currentColor"/><circle cx="16" cy="10" r="1.5" fill="currentColor"/></svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/equipment/${maintenance.equipmentId}`} passHref legacyBehavior>
                                <span className="flex items-center"><span className="mr-2">🔍</span> View</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/equipment/${maintenance.equipmentId}/edit`} passHref legacyBehavior>
                                <span className="flex items-center"><span className="mr-2">✏️</span> Edit</span>
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Maintenance Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tool className="h-5 w-5" />
              Schedule Maintenance
            </DialogTitle>
            <DialogDescription>
              Schedule a new maintenance task for equipment. Fill in the details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Equipment Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="equipment">Equipment *</Label>
                <Select value={formData.equipmentId} onValueChange={(value) => handleInputChange("equipmentId", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentData.map(equipment => (
                      <SelectItem key={equipment.id} value={equipment.id}>
                        {equipment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="maintenanceType">Maintenance Type *</Label>
                  <Select value={formData.maintenanceType} onValueChange={(value) => handleInputChange("maintenanceType", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {maintenanceTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityLevels.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Scheduling Details */}
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedDuration">Estimated Duration</Label>
                  <Input
                    id="estimatedDuration"
                    placeholder="e.g., 2 hours"
                    value={formData.estimatedDuration}
                    onChange={(e) => handleInputChange("estimatedDuration", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="assignedTo">Assigned To *</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange("assignedTo", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicianData.map(technician => (
                      <SelectItem key={technician.id} value={technician.id}>
                        {technician.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional notes or special instructions for this maintenance task..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="mt-1"
                rows={3}
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
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            
            <Button 
              onClick={handleScheduleMaintenance} 
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
