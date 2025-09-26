"use client"

import { useState } from "react"
import { 
  Plus, 
  ArrowRight, 
  Users, 
  Calendar,
  Clock,
  Star,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { type ProductionStage, PRODUCTION_STAGES } from "@/types/production"

interface StageManagementProps {
  orderId: string
  currentStage: ProductionStage
  onStageCreated: () => void
}

// Mock assignees - in real app, this would come from your user/employee system
const AVAILABLE_ASSIGNEES = [
  { id: "design-001", name: "Sarah Johnson", role: "Designer", avatar: "/avatars/sarah.jpg" },
  { id: "casting-001", name: "Mike Rodriguez", role: "Caster", avatar: "/avatars/mike.jpg" },
  { id: "setting-001", name: "Lisa Chen", role: "Master Setter", avatar: "/avatars/lisa.jpg" },
  { id: "polishing-001", name: "David Kim", role: "Polisher", avatar: "/avatars/david.jpg" },
  { id: "qc-001", name: "Maria Garcia", role: "QC Manager", avatar: "/avatars/maria.jpg" },
  { id: "shipping-001", name: "Alex Thompson", role: "Shipping Manager", avatar: "/avatars/alex.jpg" },
]

export function StageManagement({ orderId, currentStage, onStageCreated }: StageManagementProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<ProductionStage | "">("")
  const [selectedAssignee, setSelectedAssignee] = useState("")
  const [stageNotes, setStageNotes] = useState("")
  const [creating, setCreating] = useState(false)

  const getNextStages = (currentStage: ProductionStage): ProductionStage[] => {
    const stageOrder: ProductionStage[] = ["Design", "Casting", "Setting", "Polishing", "QC", "Completed"]
    const currentIndex = stageOrder.indexOf(currentStage)
    
    if (currentIndex === -1) return []
    
    // Return next stage and any special stages (like Rework)
    const nextStages: ProductionStage[] = []
    
    if (currentIndex < stageOrder.length - 1) {
      nextStages.push(stageOrder[currentIndex + 1])
    }
    
    // Add Rework as an option for most stages
    if (currentStage !== "Completed" && currentStage !== "Rework") {
      nextStages.push("Rework")
    }
    
    // Add Shipping as an option after QC
    if (currentStage === "QC") {
      nextStages.push("Shipping")
    }
    
    return nextStages
  }

  const getAssigneesForStage = (stage: ProductionStage) => {
    const stageConfig = PRODUCTION_STAGES[stage]
    const requiredRole = stageConfig.requiredApprovals[0] // Simplified - use first required role
    
    return AVAILABLE_ASSIGNEES.filter(assignee => 
      assignee.role.toLowerCase().includes(requiredRole.toLowerCase()) ||
      assignee.role.toLowerCase().includes(stage.toLowerCase())
    )
  }

  const handleCreateStage = async () => {
    if (!selectedStage || !selectedAssignee) {
      toast({
        title: "Missing Information",
        description: "Please select both a stage and an assignee",
        variant: "destructive"
      })
      return
    }

    try {
      setCreating(true)
      const assignee = AVAILABLE_ASSIGNEES.find(a => a.id === selectedAssignee)
      
      const response = await fetch(`/api/orders/${orderId}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createStage',
          stage: selectedStage,
          assigneeId: selectedAssignee,
          assigneeName: assignee?.name || 'Unknown',
          notes: stageNotes
        })
      })

      if (!response.ok) throw new Error('Failed to create stage')
      
      const data = await response.json()
      
      toast({
        title: "Stage Created",
        description: `Successfully created ${PRODUCTION_STAGES[selectedStage as ProductionStage].label} stage`
      })
      
      setIsOpen(false)
      setSelectedStage("")
      setSelectedAssignee("")
      setStageNotes("")
      onStageCreated()
    } catch (error) {
      console.error('Error creating stage:', error)
      toast({
        title: "Error",
        description: "Failed to create stage",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  // Validate that currentStage is a valid ProductionStage
  const isValidStage = (stage: string): stage is ProductionStage => {
    return stage in PRODUCTION_STAGES
  }

  // If currentStage is not valid, use Design as fallback
  const validCurrentStage = isValidStage(currentStage) ? currentStage : "Design"
  const validCurrentStageConfig = PRODUCTION_STAGES[validCurrentStage]

  const nextStages = getNextStages(validCurrentStage)
  const currentStageConfig = PRODUCTION_STAGES[currentStage] || PRODUCTION_STAGES.Design

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Stage Management</CardTitle>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Next Stage
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Production Stage</DialogTitle>
                <DialogDescription>
                  Move the order to the next production stage and assign a team member.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stage">Production Stage</Label>
                  <Select value={selectedStage} onValueChange={(value) => setSelectedStage(value as ProductionStage)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {nextStages.map((stage) => {
                        const config = PRODUCTION_STAGES[stage]
                        return (
                          <SelectItem key={stage} value={stage}>
                            <div className="flex items-center gap-2">
                              <span>{config.icon}</span>
                              <span>{config.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedStage && (
                  <div>
                    <Label htmlFor="assignee">Assign To</Label>
                    <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAssigneesForStage(selectedStage as ProductionStage).map((assignee) => (
                          <SelectItem key={assignee.id} value={assignee.id}>
                            <div className="flex items-center gap-2">
                              <span>{assignee.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {assignee.role}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Stage Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any special instructions or notes for this stage..."
                    value={stageNotes}
                    onChange={(e) => setStageNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {selectedStage && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            Estimated Duration: {PRODUCTION_STAGES[selectedStage as ProductionStage].estimatedDuration} days
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">
                            Required Approvals: {PRODUCTION_STAGES[selectedStage as ProductionStage].requiredApprovals.join(', ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          <span className="text-sm">
                            Quality Checkpoints: {PRODUCTION_STAGES[selectedStage as ProductionStage].qualityCheckpoints.join(', ')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateStage}
                  disabled={!selectedStage || !selectedAssignee || creating}
                >
                  {creating ? "Creating..." : "Create Stage"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Current Stage Info */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: validCurrentStageConfig.color }}
              >
                {validCurrentStageConfig.icon}
              </div>
              <div>
                <h3 className="font-semibold">Current Stage: {validCurrentStageConfig.label}</h3>
                <p className="text-sm text-muted-foreground">{validCurrentStageConfig.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Est. Duration: {validCurrentStageConfig.estimatedDuration} days</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Required: {validCurrentStageConfig.requiredApprovals.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Next Stages */}
          {nextStages.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Available Next Stages</h4>
              <div className="space-y-2">
                {nextStages.map((stage) => {
                  const config = PRODUCTION_STAGES[stage]
                  const assignees = getAssigneesForStage(stage)
                  
                  return (
                    <div key={stage} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: config.color }}
                        >
                          {config.icon}
                        </div>
                        <div>
                          <p className="font-medium">{config.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {assignees.length} available assignees
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {nextStages.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <p>All production stages completed!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 
 