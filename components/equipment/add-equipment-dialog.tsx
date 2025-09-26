"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Package, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  MapPin,
  Building,
  Calendar,
  Hash,
  Settings,
  Save,
  X
} from "lucide-react"

interface AddEquipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (equipment: any) => void
}

const equipmentTypes = [
  "Welding",
  "Casting", 
  "Finishing",
  "Quality Control",
  "Setting",
  "Cleaning",
  "Prototyping",
  "Design",
  "Testing",
  "Other"
]

const departments = [
  "Production",
  "Quality Control", 
  "Stone Setting",
  "Finishing",
  "Design",
  "R&D",
  "Maintenance",
  "Other"
]

const locations = [
  "Main Workshop",
  "Casting Room",
  "Finishing Area", 
  "QC Lab",
  "Setting Room",
  "Cleaning Area",
  "Design Studio",
  "Storage Room",
  "Other"
]

const manufacturers = [
  "JewelTech",
  "MetalCast",
  "PolishPro",
  "OptiView",
  "SetMaster",
  "CleanTech",
  "FormTech",
  "Other"
]

export function AddEquipmentDialog({ open, onOpenChange, onAdd }: AddEquipmentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    location: "",
    department: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    nextMaintenance: "",
    notes: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.type || !formData.location || !formData.department) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newEquipment = {
        ...formData,
        status: "operational" as const,
        lastMaintenance: new Date().toISOString().split('T')[0],
        usageHours: 0,
        purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
        nextMaintenance: formData.nextMaintenance || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      onAdd(newEquipment)
      
      // Reset form
      setFormData({
        name: "",
        type: "",
        location: "",
        department: "",
        manufacturer: "",
        model: "",
        serialNumber: "",
        purchaseDate: "",
        nextMaintenance: "",
        notes: ""
      })
    } catch (error) {
      console.error("Error adding equipment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: "",
      type: "",
      location: "",
      department: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      nextMaintenance: "",
      notes: ""
    })
    onOpenChange(false)
  }

  const isFormValid = formData.name && formData.type && formData.location && formData.department

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add New Equipment
          </DialogTitle>
          <DialogDescription>
            Add a new piece of equipment to the inventory. Fill in the required fields below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Essential equipment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Equipment Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Laser Welder"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Equipment Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Select value={formData.manufacturer} onValueChange={(value) => handleInputChange("manufacturer", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.map(manufacturer => (
                        <SelectItem key={manufacturer} value={manufacturer}>{manufacturer}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="e.g., LW-5000"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Department */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location & Department</CardTitle>
              <CardDescription>Where the equipment is located and which department owns it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(department => (
                        <SelectItem key={department} value={department}>{department}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Details</CardTitle>
              <CardDescription>Serial number and important dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    placeholder="e.g., LW-2020-45678"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="nextMaintenance">Next Maintenance Date</Label>
                  <Input
                    id="nextMaintenance"
                    type="date"
                    value={formData.nextMaintenance}
                    onChange={(e) => handleInputChange("nextMaintenance", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
              <CardDescription>Any additional notes or special instructions</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional notes, special instructions, or important information about this equipment..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

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
            onClick={handleSubmit} 
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Add Equipment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
 