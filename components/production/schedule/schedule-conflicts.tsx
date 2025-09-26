"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertTriangle, Clock, Users, Target, CheckCircle2, XCircle, ArrowRight, Calendar, UserCheck, AlertCircle } from "lucide-react"

interface WorkOrder {
  id: string
  itemDescription: string
  customerName: string
  currentStage: string
  priority: "high" | "medium" | "low"
  dueDate: string
  assignedTo: string
  estimatedHours: number
  actualHours?: number
  status: string
}

interface ScheduleConflictsProps {
  workOrders: WorkOrder[]
}

interface Conflict {
  id: string
  type: "resource" | "timeline" | "capacity" | "priority"
  severity: "high" | "medium" | "low"
  description: string
  affectedOrders: string[]
  suggestedResolution: string
  impact: string
}

export function ScheduleConflicts({ workOrders }: ScheduleConflictsProps) {
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null)
  const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterSeverity, setFilterSeverity] = useState<string>("all")

  useEffect(() => {
    // Generate sample conflicts
    const sampleConflicts: Conflict[] = [
      {
        id: "conflict-1",
        type: "resource",
        severity: "high",
        description: "Michael Chen assigned to overlapping work orders",
        affectedOrders: ["WO-001", "WO-015", "WO-023"],
        suggestedResolution: "Reassign WO-015 to Sophia Rodriguez",
        impact: "High - May cause delays in both orders"
      },
      {
        id: "conflict-2",
        type: "capacity",
        severity: "medium",
        description: "Stone Setting stage at 120% capacity",
        affectedOrders: ["WO-008", "WO-012", "WO-019", "WO-025"],
        suggestedResolution: "Extend timeline for WO-019 and WO-025",
        impact: "Medium - Risk of quality issues due to rushed work"
      },
      {
        id: "conflict-3",
        type: "timeline",
        severity: "high",
        description: "WO-030 due date conflicts with dependent order WO-031",
        affectedOrders: ["WO-030", "WO-031"],
        suggestedResolution: "Prioritize WO-030 and delay WO-031 by 2 days",
        impact: "High - WO-031 cannot start until WO-030 completes"
      },
      {
        id: "conflict-4",
        type: "priority",
        severity: "low",
        description: "Material shortage may affect casting schedule",
        affectedOrders: ["WO-016", "WO-022", "WO-028"],
        suggestedResolution: "Order additional materials and adjust timeline",
        impact: "Low - Can be resolved with expedited shipping"
      }
    ]
    setConflicts(sampleConflicts)
  }, [])

  const getConflictIcon = (type: string) => {
    switch (type) {
      case "resource":
        return <Users className="h-4 w-4" />
      case "timeline":
        return <Clock className="h-4 w-4" />
      case "capacity":
        return <Target className="h-4 w-4" />
      case "priority":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "resource":
        return "bg-purple-100 text-purple-800"
      case "timeline":
        return "bg-orange-100 text-orange-800"
      case "capacity":
        return "bg-red-100 text-red-800"
      case "priority":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredConflicts = conflicts.filter(conflict => {
    if (filterType !== "all" && conflict.type !== filterType) return false
    if (filterSeverity !== "all" && conflict.severity !== filterSeverity) return false
    return true
  })

  const handleResolveConflict = (conflict: Conflict, resolution: string) => {
    // Scaffold conflict resolution
    console.log(`Resolving conflict ${conflict.id} with resolution: ${resolution}`)
    setConflicts(prev => prev.filter(c => c.id !== conflict.id))
    setResolutionDialogOpen(false)
    setSelectedConflict(null)
  }

  const handleAutoResolve = () => {
    // Scaffold auto-resolution
    alert('Auto-resolution algorithm would:\n- Analyze all conflicts\n- Apply optimal resolutions\n- Rebalance workload\n- Update schedule automatically')
  }

  const conflictStats = {
    total: conflicts.length,
    high: conflicts.filter(c => c.severity === 'high').length,
    medium: conflicts.filter(c => c.severity === 'medium').length,
    low: conflicts.filter(c => c.severity === 'low').length,
    resolved: 0
  }

  return (
    <div className="space-y-6">
      {/* Conflict Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conflictStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {conflictStats.high} high priority
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{conflictStats.high}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Severity</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{conflictStats.medium}</div>
            <p className="text-xs text-muted-foreground">
              Monitor closely
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{conflictStats.resolved}</div>
            <p className="text-xs text-muted-foreground">
              Successfully resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="resource">Resource</SelectItem>
              <SelectItem value="timeline">Timeline</SelectItem>
              <SelectItem value="capacity">Capacity</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAutoResolve}>
            <Target className="h-4 w-4 mr-2" />
            Auto-Resolve
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Conflicts List */}
      <div className="space-y-4">
        {filteredConflicts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Conflicts Found</h3>
              <p className="text-muted-foreground text-center">
                {filterType !== "all" || filterSeverity !== "all" 
                  ? "No conflicts match the current filters. Try adjusting your filter criteria."
                  : "All scheduling conflicts have been resolved. Your production schedule is optimized!"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredConflicts.map((conflict) => (
            <Card key={conflict.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      {getConflictIcon(conflict.type)}
                      <Badge variant="outline" className={getTypeColor(conflict.type)}>
                        {conflict.type}
                      </Badge>
                      <Badge variant="outline" className={getSeverityColor(conflict.severity)}>
                        {conflict.severity}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-2">{conflict.description}</h3>
                      <div className="mt-3 text-sm">
                        <span className="text-muted-foreground">Impact:</span>
                        <span className="ml-2">{conflict.impact}</span>
                      </div>
                      <div className="mt-3 text-sm">
                        <span className="text-muted-foreground">Suggested Resolution:</span>
                        <span className="ml-2">{conflict.suggestedResolution}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedConflict(conflict)
                        setResolutionDialogOpen(true)
                      }}
                    >
                      Resolve
                    </Button>
                    <Button variant="outline" size="sm">
                      Ignore
                    </Button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  Detected {new Date().toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resolution Dialog */}
      <Dialog open={resolutionDialogOpen} onOpenChange={setResolutionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resolve Conflict</DialogTitle>
            <DialogDescription>
              Review and apply the suggested resolution for this scheduling conflict.
            </DialogDescription>
          </DialogHeader>
          
          {selectedConflict && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Conflict Details</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm">{selectedConflict.description}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <div>Type: {selectedConflict.type}</div>
                      <div>Severity: {selectedConflict.severity}</div>
                      <div>Impact: {selectedConflict.impact}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Suggested Resolution</h4>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm">{selectedConflict.suggestedResolution}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Alternative Resolutions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <input type="radio" name="resolution" id="suggested" defaultChecked />
                      <label htmlFor="suggested" className="text-sm">
                        {selectedConflict.suggestedResolution}
                      </label>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <input type="radio" name="resolution" id="alternative1" />
                      <label htmlFor="alternative1" className="text-sm">
                        Extend timeline for all affected orders
                      </label>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <input type="radio" name="resolution" id="alternative2" />
                      <label htmlFor="alternative2" className="text-sm">
                        Reassign to different resources
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setResolutionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleResolveConflict(selectedConflict, selectedConflict.suggestedResolution)}>
                  Apply Resolution
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 
 