"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Users, Target, AlertTriangle, Plus, Filter, Download, Share2, Settings, BarChart3, TrendingUp, CalendarDays, UserCheck, AlertCircle, X, CheckCircle, Save, Crown, Sparkles, Gem, ArrowLeft, RefreshCw, Zap, Award, Globe, Briefcase, Database, Warehouse, Diamond, Circle, Square, Hexagon, Star, Heart, DollarSign, ShoppingBag } from "lucide-react"
import { ProductionScheduleCalendar } from "@/components/production/schedule/production-schedule-calendar"
import { ScheduleFilters } from "@/components/production/schedule/schedule-filters"
import { ResourceWorkload } from "@/components/production/schedule/resource-workload"
import { UpcomingDeadlines } from "@/components/production/schedule/upcoming-deadlines"
import { ScheduleInsights } from "@/components/production/schedule/schedule-insights"
import { ScheduleConflicts } from "@/components/production/schedule/schedule-conflicts"
import { ScheduleOptimization } from "@/components/production/schedule/schedule-optimization"
import { generateSampleWorkOrders } from "@/components/production/kanban/data"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { copyToClipboard } from "@/components/ui/utils";

interface ScheduleStats {
  totalOrders: number
  scheduledOrders: number
  overdueOrders: number
  urgentOrders: number
  overallocatedResources: number
  conflicts: number
  averageCompletionTime: number
  capacityUtilization: number
}

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

interface Resource {
  id: string
  name: string
  capacity: number
  currentLoad: number
  skills: string[]
  available: boolean
}

// Simple Modal component
function SimpleModal({ open, title, children, onClose }: { open: boolean, title: string, children: React.ReactNode, onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose} aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <div>{children}</div>
      </div>
    </div>
  )
}

export default function ProductionSchedulePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("calendar")
  const [scheduleStats, setScheduleStats] = useState<ScheduleStats>({
    totalOrders: 0,
    scheduledOrders: 0,
    overdueOrders: 0,
    urgentOrders: 0,
    overallocatedResources: 0,
    conflicts: 0,
    averageCompletionTime: 0,
    capacityUtilization: 0
  })
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [modal, setModal] = useState<{ open: boolean, title: string, content: React.ReactNode }>({ open: false, title: "", content: null })

  // Sample resources data
  const sampleResources: Resource[] = [
    { id: "1", name: "Michael Chen", capacity: 40, currentLoad: 32, skills: ["design", "cad", "setting"], available: true },
    { id: "2", name: "Sophia Rodriguez", capacity: 40, currentLoad: 38, skills: ["casting", "polishing"], available: true },
    { id: "3", name: "David Kim", capacity: 40, currentLoad: 25, skills: ["design", "qc"], available: true },
    { id: "4", name: "Emma Johnson", capacity: 40, currentLoad: 40, skills: ["setting", "polishing"], available: false },
    { id: "5", name: "James Wilson", capacity: 40, currentLoad: 15, skills: ["cad", "casting"], available: true },
    { id: "6", name: "Olivia Martinez", capacity: 40, currentLoad: 30, skills: ["design", "setting"], available: true },
    { id: "7", name: "William Taylor", capacity: 40, currentLoad: 22, skills: ["casting", "qc"], available: true },
    { id: "8", name: "Ava Thompson", capacity: 40, currentLoad: 35, skills: ["polishing", "qc"], available: true },
  ]

  useEffect(() => {
    // Generate sample data
    const orders = generateSampleWorkOrders(50)
    // Transform the imported WorkOrder type to match our interface
    const transformedOrders: WorkOrder[] = orders.map(order => ({
      id: order.id,
      itemDescription: order.itemDescription,
      customerName: order.customerName,
      currentStage: order.currentStage,
      priority: order.priority,
      dueDate: order.dueDate.split('T')[0], // Convert ISO string to date string
      assignedTo: order.assignedTo,
      estimatedHours: Math.floor(Math.random() * 20) + 4, // Generate random estimated hours
      actualHours: undefined, // Not available in the source data
      status: "active" // Default status
    }))
    setWorkOrders(transformedOrders)
    setResources(sampleResources)

    // Calculate schedule statistics
    const today = new Date()
    const overdue = transformedOrders.filter(order => new Date(order.dueDate) < today).length
    const urgent = transformedOrders.filter(order => {
      const dueDate = new Date(order.dueDate)
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return order.priority === 'high' && daysDiff <= 3
    }).length

    setScheduleStats({
      totalOrders: transformedOrders.length,
      scheduledOrders: Math.floor(transformedOrders.length * 0.85),
      overdueOrders: overdue,
      urgentOrders: urgent,
      overallocatedResources: 3,
      conflicts: 2,
      averageCompletionTime: 12.5,
      capacityUtilization: 78
    })
  }, [])

  const handleExportSchedule = () => {
    const data = {
      workOrders,
      scheduleStats,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `production-schedule-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
    toast({ title: "Schedule Exported", description: "Production schedule has been exported successfully." })
  }

  const handleShareSchedule = () => {
    const shareData = {
      title: 'Production Schedule',
      text: `Production Schedule Overview:\n- Total Orders: ${scheduleStats.totalOrders}\n- Scheduled: ${scheduleStats.scheduledOrders}\n- Overdue: ${scheduleStats.overdueOrders}\n- Urgent: ${scheduleStats.urgentOrders}`,
      url: window.location.href
    }
    
    if (navigator.share) {
      navigator.share(shareData)
    } else {
      copyToClipboard(shareData.text, (msg) => toast({ title: msg, description: "Schedule information copied to clipboard!" }));
    }
  }

  const handleOptimizeSchedule = () => {
    // Real optimization logic
    const optimizedOrders = [...workOrders]
    const availableResources = resources.filter(r => r.available)
    
    // Simple optimization: assign unassigned orders to least loaded resources
    const unassignedOrders = optimizedOrders.filter(order => !order.assignedTo || order.assignedTo === "Unassigned")
    
    unassignedOrders.forEach(order => {
      const leastLoadedResource = availableResources.reduce((min, resource) => 
        resource.currentLoad < min.currentLoad ? resource : min
      )
      
      if (leastLoadedResource) {
        order.assignedTo = leastLoadedResource.name
        // Update resource load
        const resourceIndex = resources.findIndex(r => r.id === leastLoadedResource.id)
        if (resourceIndex !== -1) {
          const updatedResources = [...resources]
          updatedResources[resourceIndex].currentLoad += order.estimatedHours || 8
          setResources(updatedResources)
        }
      }
    })
    
    setWorkOrders(optimizedOrders)
    toast({ title: "Schedule Optimized", description: `Assigned ${unassignedOrders.length} orders to available resources.` })
  }

  // Modal open helpers
  const openModal = (title: string, content: React.ReactNode) => setModal({ open: true, title, content })
  const closeModal = () => setModal({ open: false, title: "", content: null })

  // Add Work Order Form Component
  const AddWorkOrderForm = () => {
    const [formData, setFormData] = useState({
      itemDescription: "",
      customerName: "",
      currentStage: "design",
      priority: "medium" as "high" | "medium" | "low",
      dueDate: "",
      assignedTo: "unassigned",
      estimatedHours: 8,
      notes: ""
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      
      const newWorkOrder: WorkOrder = {
        id: `WO-${Date.now()}`,
        ...formData,
        assignedTo: formData.assignedTo === "unassigned" ? "Unassigned" : formData.assignedTo,
        status: "active"
      }
      
      setWorkOrders(prev => [...prev, newWorkOrder])
      
      // Update stats
      setScheduleStats(prev => ({
        ...prev,
        totalOrders: prev.totalOrders + 1,
        scheduledOrders: prev.scheduledOrders + 1
      }))
      
      toast({ title: "Work Order Added", description: `New work order "${formData.itemDescription}" has been created.` })
      closeModal()
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="itemDescription">Item Description</Label>
            <Input
              id="itemDescription"
              value={formData.itemDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, itemDescription: e.target.value }))}
              placeholder="e.g., Diamond Engagement Ring"
              required
            />
          </div>
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              placeholder="e.g., John Smith"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currentStage">Production Stage</Label>
            <Select value={formData.currentStage} onValueChange={(value) => setFormData(prev => ({ ...prev, currentStage: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="cad">CAD</SelectItem>
                <SelectItem value="casting">Casting</SelectItem>
                <SelectItem value="setting">Setting</SelectItem>
                <SelectItem value="polishing">Polishing</SelectItem>
                <SelectItem value="qc">Quality Control</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value: "high" | "medium" | "low") => setFormData(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="assignedTo">Assign To</Label>
            <Select value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {resources.filter(r => r.available).map(resource => (
                  <SelectItem key={resource.id} value={resource.name}>
                    {resource.name} ({resource.currentLoad}/{resource.capacity}h)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="estimatedHours">Estimated Hours</Label>
          <Input
            id="estimatedHours"
            type="number"
            value={formData.estimatedHours}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
            min="1"
            max="40"
          />
        </div>
        
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes or special requirements..."
            rows={3}
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Create Work Order
          </Button>
        </div>
      </form>
    )
  }

  // Assign Resources Form Component
  const AssignResourcesForm = () => {
    const [selectedOrder, setSelectedOrder] = useState("")
    const [selectedResource, setSelectedResource] = useState("")
    const [bulkAssign, setBulkAssign] = useState(false)
    const [selectedOrders, setSelectedOrders] = useState<string[]>([])

    const unassignedOrders = workOrders.filter(order => !order.assignedTo || order.assignedTo === "Unassigned")
    const availableResources = resources.filter(r => r.available)

    const handleAssign = () => {
      if (bulkAssign) {
        // Bulk assign multiple orders
        const updatedOrders = workOrders.map(order => {
          if (selectedOrders.includes(order.id)) {
            return { ...order, assignedTo: selectedResource }
          }
          return order
        })
        setWorkOrders(updatedOrders)
        toast({ title: "Resources Assigned", description: `Assigned ${selectedOrders.length} orders to ${selectedResource}.` })
      } else {
        // Single order assignment
        const updatedOrders = workOrders.map(order => {
          if (order.id === selectedOrder) {
            return { ...order, assignedTo: selectedResource }
          }
          return order
        })
        setWorkOrders(updatedOrders)
        toast({ title: "Resource Assigned", description: `Assigned order to ${selectedResource}.` })
      }
      closeModal()
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="bulkAssign"
            checked={bulkAssign}
            onChange={(e) => setBulkAssign(e.target.checked)}
          />
          <Label htmlFor="bulkAssign">Bulk Assign Multiple Orders</Label>
        </div>

        {bulkAssign ? (
          <div>
            <Label>Select Orders to Assign</Label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
              {unassignedOrders.map(order => (
                <div key={order.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={order.id}
                    checked={selectedOrders.includes(order.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(prev => [...prev, order.id])
                      } else {
                        setSelectedOrders(prev => prev.filter(id => id !== order.id))
                      }
                    }}
                  />
                  <Label htmlFor={order.id} className="text-sm">
                    {order.itemDescription} - {order.customerName}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <Label htmlFor="orderSelect">Select Work Order</Label>
            <Select value={selectedOrder} onValueChange={setSelectedOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Choose work order" />
              </SelectTrigger>
              <SelectContent>
                {unassignedOrders.map(order => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.itemDescription} - {order.customerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="resourceSelect">Select Resource</Label>
          <Select value={selectedResource} onValueChange={setSelectedResource}>
            <SelectTrigger>
              <SelectValue placeholder="Choose resource" />
            </SelectTrigger>
            <SelectContent>
              {availableResources.map(resource => (
                <SelectItem key={resource.id} value={resource.name}>
                  {resource.name} ({resource.currentLoad}/{resource.capacity}h) - {resource.skills.join(", ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedResource || (bulkAssign ? selectedOrders.length === 0 : !selectedOrder)}>
            <Users className="h-4 w-4 mr-2" />
            Assign Resource
          </Button>
        </div>
      </div>
    )
  }

  // Auto-Schedule Component
  const AutoScheduleForm = () => {
    const [isRunning, setIsRunning] = useState(false)
    const [results, setResults] = useState<{ assigned: number, conflicts: number, efficiency: number } | null>(null)

    const runAutoSchedule = () => {
      setIsRunning(true)
      
      // Simulate auto-scheduling algorithm
      setTimeout(() => {
        const unassignedOrders = workOrders.filter(order => !order.assignedTo || order.assignedTo === "Unassigned")
        const availableResources = resources.filter(r => r.available)
        
        let assigned = 0
        let conflicts = 0
        
        const updatedOrders = workOrders.map(order => {
          if (!order.assignedTo || order.assignedTo === "Unassigned") {
            // Find best resource based on skills and current load
            const bestResource = availableResources
              .filter(r => r.skills.includes(order.currentStage))
              .sort((a, b) => a.currentLoad - b.currentLoad)[0]
            
            if (bestResource && bestResource.currentLoad + (order.estimatedHours || 8) <= bestResource.capacity) {
              assigned++
              return { ...order, assignedTo: bestResource.name }
            } else {
              conflicts++
              return order
            }
          }
          return order
        })
        
        setWorkOrders(updatedOrders)
        setResults({ assigned, conflicts, efficiency: Math.round((assigned / (assigned + conflicts)) * 100) })
        setIsRunning(false)
      }, 2000)
    }

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Auto-Scheduling Algorithm</h3>
          <p className="text-sm text-gray-600">
            This will automatically assign unassigned work orders to the most suitable resources based on:
          </p>
          <ul className="text-sm text-gray-600 mt-2 space-y-1">
            <li>• Resource skills matching production stage</li>
            <li>• Current workload and capacity</li>
            <li>• Priority and due dates</li>
            <li>• Resource availability</li>
          </ul>
        </div>

        {!results ? (
          <div className="text-center">
            <Button onClick={runAutoSchedule} disabled={isRunning} className="w-full">
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Auto-Schedule...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Run Auto-Schedule
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Auto-Schedule Complete!</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.assigned}</div>
                  <div className="text-green-700">Orders Assigned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{results.conflicts}</div>
                  <div className="text-amber-700">Conflicts Found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.efficiency}%</div>
                  <div className="text-blue-700">Efficiency</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button onClick={() => setResults(null)}>
                Run Again
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Header actions
  const handleAddWorkOrder = () => {
    openModal("Add Work Order", <AddWorkOrderForm />)
  }
  
  const handleAssignResources = () => {
    openModal("Assign Resources", <AssignResourcesForm />)
  }
  
  const handleAutoSchedule = () => {
    openModal("Auto-Schedule", <AutoScheduleForm />)
  }
  
  const handleExportScheduleQuick = () => {
    handleExportSchedule()
  }
  
  const handleAutoAssignAvailable = () => {
    const unassignedOrders = workOrders.filter(order => !order.assignedTo || order.assignedTo === "Unassigned")
    const availableResources = resources.filter(r => r.available)
    
    let assigned = 0
    const updatedOrders = workOrders.map(order => {
      if (!order.assignedTo || order.assignedTo === "Unassigned") {
        const availableResource = availableResources.find(r => r.currentLoad < r.capacity)
        if (availableResource) {
          assigned++
          return { ...order, assignedTo: availableResource.name }
        }
      }
      return order
    })
    
    setWorkOrders(updatedOrders)
    toast({ title: "Auto-Assign Complete", description: `Automatically assigned ${assigned} orders to available resources.` })
  }
  
  const handleBalanceWorkload = () => {
    const updatedResources = [...resources]
    const totalLoad = updatedResources.reduce((sum, r) => sum + r.currentLoad, 0)
    const averageLoad = Math.round(totalLoad / updatedResources.length)
    
    // Simple workload balancing
    updatedResources.forEach(resource => {
      if (resource.currentLoad > averageLoad + 5) {
        resource.currentLoad = averageLoad
      }
    })
    
    setResources(updatedResources)
    toast({ title: "Workload Balanced", description: "Resource workload has been redistributed for better efficiency." })
  }
  
  const handleSetAvailability = () => {
    const updatedResources = resources.map(resource => ({
      ...resource,
      available: !resource.available
    }))
    setResources(updatedResources)
    toast({ title: "Availability Updated", description: "Resource availability has been toggled." })
  }
  
  const handleExtendDeadlines = () => {
    const overdueOrders = workOrders.filter(order => new Date(order.dueDate) < new Date())
    const updatedOrders = workOrders.map(order => {
      if (new Date(order.dueDate) < new Date()) {
        const newDueDate = new Date(order.dueDate)
        newDueDate.setDate(newDueDate.getDate() + 7) // Extend by 1 week
        return { ...order, dueDate: newDueDate.toISOString().split('T')[0] }
      }
      return order
    })
    
    setWorkOrders(updatedOrders)
    toast({ title: "Deadlines Extended", description: `Extended ${overdueOrders.length} overdue order deadlines by 1 week.` })
  }
  
  const handleFlagUrgent = () => {
    const updatedOrders = workOrders.map(order => {
      if (new Date(order.dueDate) < new Date()) {
        return { ...order, priority: "high" as const }
      }
      return order
    })
    
    setWorkOrders(updatedOrders)
    toast({ title: "Orders Flagged", description: "Overdue orders have been marked as high priority." })
  }
  
  const handleReassignPriority = () => {
    const updatedOrders = workOrders.map(order => {
      // Simple priority reassignment logic
      const daysUntilDue = Math.ceil((new Date(order.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilDue <= 3) {
        return { ...order, priority: "high" as const }
      } else if (daysUntilDue <= 7) {
        return { ...order, priority: "medium" as const }
      } else {
        return { ...order, priority: "low" as const }
      }
    })
    
    setWorkOrders(updatedOrders)
    toast({ title: "Priorities Reassigned", description: "Work order priorities have been updated based on due dates." })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/50 relative overflow-hidden p-1 w-full">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/20 to-teal-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4 sm:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
              <div className="space-y-3 w-full md:w-auto">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight schedule-heading">
                      Production Schedule
                    </h1>
                    <p className="text-slate-600 text-base md:text-lg font-medium schedule-subtext">Manage and optimize your production schedule</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <span>Advanced Scheduling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-emerald-500" />
                    <span>Resource Optimization</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 items-center">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleExportSchedule}
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="Export Schedule"
                  title="Export Schedule"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleShareSchedule}
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="Share Schedule"
                  title="Share Schedule"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Cards - Matching Dashboard Style */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4">
            <div className="w-full overflow-x-auto md:overflow-visible">
              <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 min-w-[320px] md:min-w-0 flex-nowrap">
                {/* Total Orders */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <ShoppingBag className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Total Orders</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Production
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {scheduleStats.totalOrders}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+{scheduleStats.scheduledOrders} scheduled</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total production orders
                    </p>
                  </CardContent>
                </Card>
                
                {/* Capacity Utilization */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Target className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Capacity Utilization</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Efficiency
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {scheduleStats.capacityUtilization}%
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>optimal</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Current resource utilization
                    </p>
                  </CardContent>
                </Card>
                
                {/* Urgent Orders */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Urgent Orders</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Priority
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {scheduleStats.urgentOrders}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>{scheduleStats.overdueOrders} overdue</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Orders requiring immediate attention
                    </p>
                  </CardContent>
                </Card>
                
                {/* Avg Completion */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Avg Completion</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Performance
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {scheduleStats.averageCompletionTime}h
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>-2.3h from last week</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Average order completion time
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20">
                <TabsTrigger 
                  value="calendar" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  Calendar
                </TabsTrigger>
                <TabsTrigger 
                  value="workload" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  Workload
                </TabsTrigger>
                <TabsTrigger 
                  value="deadlines" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  Deadlines
                </TabsTrigger>
                <TabsTrigger 
                  value="insights" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  Insights
                </TabsTrigger>
                <TabsTrigger 
                  value="conflicts" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  Conflicts
                </TabsTrigger>
                <TabsTrigger 
                  value="optimization" 
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  Optimize
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                  <ProductionScheduleCalendar />
                </div>
              </TabsContent>

              <TabsContent value="workload" className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                  <ResourceWorkload />
                </div>
              </TabsContent>

              <TabsContent value="deadlines" className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                  <UpcomingDeadlines />
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                  <ScheduleInsights workOrders={workOrders} stats={scheduleStats} />
                </div>
              </TabsContent>

              <TabsContent value="conflicts" className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                  <ScheduleConflicts workOrders={workOrders} />
                </div>
              </TabsContent>

              <TabsContent value="optimization" className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                  <ScheduleOptimization workOrders={workOrders} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Enhanced Modal */}
        <SimpleModal 
          open={modal.open} 
          title={modal.title} 
          onClose={closeModal}
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl p-6">
            {modal.content}
          </div>
        </SimpleModal>
      </div>
    </div>
  )
}
