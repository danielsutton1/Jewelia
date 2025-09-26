"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  Users,
  Calendar,
  FileText,
  Send,
  X,
  Plus,
  Minus,
  Search,
  Filter
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface MaterialRequest {
  id: string
  material: string
  category: string
  quantity: number
  unit: string
  urgency: "low" | "medium" | "high" | "critical"
  priority: "normal" | "high" | "urgent"
  supplier: string
  estimatedCost: number
  requiredBy: string
  reason: string
  notes: string
  status: "draft" | "submitted" | "approved" | "rejected" | "ordered"
  submittedBy: string
  submittedAt: string
  approvedBy?: string
  approvedAt?: string
}

interface QuickRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRequestSubmitted: (request: MaterialRequest) => void
}

// Sample materials for selection
const availableMaterials = [
  { id: "M001", name: "14K Yellow Gold", category: "Precious Metals", unit: "g", unitPrice: 45.50, supplier: "GoldCorp Metals", inStock: 250 },
  { id: "M002", name: "Diamond 1ct Round Brilliant", category: "Gemstones", unit: "pcs", unitPrice: 8500, supplier: "Diamond Source Inc", inStock: 8 },
  { id: "M003", name: "Sterling Silver", category: "Precious Metals", unit: "g", unitPrice: 0.85, supplier: "Silver Solutions", inStock: 500 },
  { id: "M004", name: "Sapphire 2ct Oval", category: "Gemstones", unit: "pcs", unitPrice: 1200, supplier: "Gemstone World", inStock: 3 },
  { id: "M005", name: "Platinum", category: "Precious Metals", unit: "g", unitPrice: 32.00, supplier: "Platinum Plus", inStock: 50 },
  { id: "M006", name: "Lobster Clasp 14K", category: "Findings", unit: "pcs", unitPrice: 25.00, supplier: "Findings Factory", inStock: 0 },
  { id: "M007", name: "18K White Gold", category: "Precious Metals", unit: "g", unitPrice: 52.00, supplier: "GoldCorp Metals", inStock: 180 },
  { id: "M008", name: "Emerald 1.5ct", category: "Gemstones", unit: "pcs", unitPrice: 1800, supplier: "Gemstone World", inStock: 5 },
]

const urgencyLevels = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800", days: "7-14 days" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-800", days: "3-7 days" },
  { value: "high", label: "High", color: "bg-amber-100 text-amber-800", days: "1-3 days" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-800", days: "Same day" },
]

const priorityLevels = [
  { value: "normal", label: "Normal", color: "bg-gray-100 text-gray-800" },
  { value: "high", label: "High", color: "bg-blue-100 text-blue-800" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
]

export function QuickRequestDialog({ open, onOpenChange, onRequestSubmitted }: QuickRequestDialogProps) {
  const [step, setStep] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedMaterials, setSelectedMaterials] = useState<Array<{
    material: any
    quantity: number
    urgency: "low" | "medium" | "high" | "critical"
    priority: "normal" | "high" | "urgent"
  }>>([])
  
  const [requestDetails, setRequestDetails] = useState({
    requiredBy: "",
    reason: "",
    notes: "",
    preferredSupplier: "",
    budget: "",
    contactPerson: "",
    phone: "",
    email: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter materials based on search and category
  const filteredMaterials = availableMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || material.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(availableMaterials.map(m => m.category)))

  const handleAddMaterial = (material: any) => {
    const existing = selectedMaterials.find(item => item.material.id === material.id)
    if (existing) {
      toast({ title: "Material Already Added", description: "This material is already in your request." })
      return
    }
    
    setSelectedMaterials(prev => [...prev, {
      material,
      quantity: 1,
      urgency: "medium" as const,
      priority: "normal" as const
    }])
  }

  const handleRemoveMaterial = (materialId: string) => {
    setSelectedMaterials(prev => prev.filter(item => item.material.id !== materialId))
  }

  const handleUpdateMaterial = (materialId: string, field: string, value: any) => {
    setSelectedMaterials(prev => prev.map(item => 
      item.material.id === materialId ? { ...item, [field]: value } : item
    ))
  }

  const handleNext = () => {
    if (step === 1 && selectedMaterials.length === 0) {
      toast({ title: "No Materials Selected", description: "Please select at least one material to continue." })
      return
    }
    if (step === 2 && !requestDetails.requiredBy) {
      toast({ title: "Required Date Missing", description: "Please specify when you need the materials." })
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const request: MaterialRequest = {
        id: `REQ-${Date.now()}`,
        material: selectedMaterials.map(item => item.material.name).join(", "),
        category: selectedMaterials.map(item => item.material.category).join(", "),
        quantity: selectedMaterials.reduce((sum, item) => sum + item.quantity, 0),
        unit: selectedMaterials.map(item => item.material.unit).join(", "),
        urgency: selectedMaterials.some(item => item.urgency === "critical") ? "critical" :
                selectedMaterials.some(item => item.urgency === "high") ? "high" :
                selectedMaterials.some(item => item.urgency === "medium") ? "medium" : "low",
        priority: selectedMaterials.some(item => item.priority === "urgent") ? "urgent" :
                 selectedMaterials.some(item => item.priority === "high") ? "high" : "normal",
        supplier: requestDetails.preferredSupplier || selectedMaterials[0]?.material.supplier || "TBD",
        estimatedCost: selectedMaterials.reduce((sum, item) => sum + (item.quantity * item.material.unitPrice), 0),
        requiredBy: requestDetails.requiredBy,
        reason: requestDetails.reason,
        notes: requestDetails.notes,
        status: "submitted",
        submittedBy: "Current User",
        submittedAt: new Date().toISOString(),
      }

      onRequestSubmitted(request)
      onOpenChange(false)
      
      // Reset form
      setStep(1)
      setSelectedMaterials([])
      setRequestDetails({
        requiredBy: "",
        reason: "",
        notes: "",
        preferredSupplier: "",
        budget: "",
        contactPerson: "",
        phone: "",
        email: ""
      })
      
      toast({ 
        title: "Request Submitted", 
        description: `Material request ${request.id} has been submitted successfully.` 
      })
    } catch (error) {
      toast({ 
        title: "Submission Failed", 
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalEstimatedCost = selectedMaterials.reduce((sum, item) => 
    sum + (item.quantity * item.material.unitPrice), 0
  )

  const getUrgencyColor = (urgency: string) => {
    return urgencyLevels.find(level => level.value === urgency)?.color || "bg-gray-100 text-gray-800"
  }

  const getPriorityColor = (priority: string) => {
    return priorityLevels.find(level => level.value === priority)?.color || "bg-gray-100 text-gray-800"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Quick Material Request
          </DialogTitle>
          <DialogDescription>
            Create a new material requisition request. Fill in the details below to submit your request.
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Step {step} of 3</span>
            <span>{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        {/* Step 1: Material Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Select Materials</h3>
              
              {/* Search and filters */}
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground flex items-center">
                  {filteredMaterials.length} materials found
                </div>
              </div>

              {/* Available materials */}
              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {filteredMaterials.map((material) => (
                  <Card key={material.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{material.name}</h4>
                          <Badge variant="outline">{material.category}</Badge>
                          <Badge variant={material.inStock > 0 ? "default" : "destructive"}>
                            {material.inStock > 0 ? `${material.inStock} in stock` : "Out of stock"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {material.supplier} • ${material.unitPrice}/{material.unit}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddMaterial(material)}
                        disabled={material.inStock === 0}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Selected materials */}
            {selectedMaterials.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Selected Materials ({selectedMaterials.length})</h4>
                <div className="space-y-3">
                  {selectedMaterials.map((item) => (
                    <Card key={item.material.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-medium">{item.material.name}</h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMaterial(item.material.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-3 md:grid-cols-3">
                            <div>
                              <Label className="text-xs">Quantity</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateMaterial(item.material.id, "quantity", Math.max(1, item.quantity - 1))}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateMaterial(item.material.id, "quantity", parseInt(e.target.value) || 1)}
                                  className="w-20 text-center"
                                  min="1"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateMaterial(item.material.id, "quantity", item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm text-muted-foreground">{item.material.unit}</span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Urgency</Label>
                              <Select 
                                value={item.urgency} 
                                onValueChange={(value) => handleUpdateMaterial(item.material.id, "urgency", value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {urgencyLevels.map(level => (
                                    <SelectItem key={level.value} value={level.value}>
                                      {level.label} ({level.days})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Priority</Label>
                              <Select 
                                value={item.priority} 
                                onValueChange={(value) => handleUpdateMaterial(item.material.id, "priority", value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {priorityLevels.map(level => (
                                    <SelectItem key={level.value} value={level.value}>
                                      {level.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Estimated cost: </span>
                            <span className="font-medium">${(item.quantity * item.material.unitPrice).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Estimated Cost:</span>
                    <span className="text-lg font-bold">${totalEstimatedCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Request Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Request Details</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="requiredBy">Required By Date *</Label>
                  <Input
                    id="requiredBy"
                    type="date"
                    value={requestDetails.requiredBy}
                    onChange={(e) => setRequestDetails(prev => ({ ...prev, requiredBy: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="preferredSupplier">Preferred Supplier</Label>
                  <Select 
                    value={requestDetails.preferredSupplier} 
                    onValueChange={(value) => setRequestDetails(prev => ({ ...prev, preferredSupplier: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(availableMaterials.map(m => m.supplier))).map(supplier => (
                        <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget">Budget Limit (Optional)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="Enter budget amount"
                    value={requestDetails.budget}
                    onChange={(e) => setRequestDetails(prev => ({ ...prev, budget: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    placeholder="Your name"
                    value={requestDetails.contactPerson}
                    onChange={(e) => setRequestDetails(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Phone number"
                    value={requestDetails.phone}
                    onChange={(e) => setRequestDetails(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    value={requestDetails.email}
                    onChange={(e) => setRequestDetails(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="reason">Reason for Request *</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why you need these materials..."
                  value={requestDetails.reason}
                  onChange={(e) => setRequestDetails(prev => ({ ...prev, reason: e.target.value }))}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information or special requirements..."
                  value={requestDetails.notes}
                  onChange={(e) => setRequestDetails(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review and Submit */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Review Request</h3>
              
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">Materials Requested</Label>
                      <p className="text-sm text-muted-foreground">{selectedMaterials.length} items</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Total Estimated Cost</Label>
                      <p className="text-sm font-medium">${totalEstimatedCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Required By</Label>
                      <p className="text-sm text-muted-foreground">{requestDetails.requiredBy}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Preferred Supplier</Label>
                      <p className="text-sm text-muted-foreground">{requestDetails.preferredSupplier || "Any available"}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Reason</Label>
                    <p className="text-sm text-muted-foreground mt-1">{requestDetails.reason}</p>
                  </div>

                  {requestDetails.notes && (
                    <div>
                      <Label className="text-sm font-medium">Notes</Label>
                      <p className="text-sm text-muted-foreground mt-1">{requestDetails.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Materials list */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedMaterials.map((item) => (
                      <div key={item.material.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.material.name}</span>
                            <Badge className={getUrgencyColor(item.urgency)}>{item.urgency}</Badge>
                            <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.quantity} {item.material.unit} • ${(item.quantity * item.material.unitPrice).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Budget warning */}
              {requestDetails.budget && totalEstimatedCost > parseFloat(requestDetails.budget) && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    The estimated cost (${totalEstimatedCost.toFixed(2)}) exceeds your budget limit (${requestDetails.budget}). 
                    Please review your request or increase the budget.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {step < 3 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
 