"use client"

import { useState, useEffect } from "react"
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
  X,
  Edit
} from "lucide-react"

interface EditEquipmentDialogProps {
  equipment: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (equipment: any) => void
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

const statusOptions = [
  { value: "operational", label: "Operational", color: "bg-green-100 text-green-800" },
  { value: "maintenance", label: "Maintenance", color: "bg-yellow-100 text-yellow-800" },
  { value: "out-of-order", label: "Out of Order", color: "bg-red-100 text-red-800" }
]

export function EditEquipmentDialog({ equipment, open, onOpenChange, onSave }: EditEquipmentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    status: "operational",
    location: "",
    department: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    nextMaintenance: "",
    usageHours: 0,
    notes: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form data when equipment changes
  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || "",
        type: equipment.type || "",
        status: equipment.status || "operational",
        location: equipment.location || "",
        department: equipment.department || "",
        manufacturer: equipment.manufacturer || "",
        model: equipment.model || "",
        serialNumber: equipment.serialNumber || "",
        purchaseDate: equipment.purchaseDate || "",
        nextMaintenance: equipment.nextMaintenance || "",
        usageHours: equipment.usageHours || 0,
        notes: equipment.notes || ""
      })
    }
  }, [equipment])

  const handleInputChange = (field: string, value: string | number) => {
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
      
      const updatedEquipment = {
        ...equipment,
        ...formData
      }

      onSave(updatedEquipment)
    } catch (error) {
      console.error("Error updating equipment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const isFormValid = formData.name && formData.type && formData.location && formData.department

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status)
    return statusOption ? (
      <Badge className={statusOption.color}>{statusOption.label}</Badge>
    ) : (
      <Badge>{status}</Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Equipment: {equipment?.name}
          </DialogTitle>
          <DialogDescription>
            Update equipment information. All changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Equipment ID Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipment ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm">{equipment?.id}</span>
                <Badge variant="outline">Read Only</Badge>
              </div>
            </CardContent>
          </Card>

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
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="usageHours">Usage Hours</Label>
                  <Input
                    id="usageHours"
                    type="number"
                    placeholder="0"
                    value={formData.usageHours}
                    onChange={(e) => handleInputChange("usageHours", parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
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

          {/* Current Status Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getStatusBadge(formData.status)}
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
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
 