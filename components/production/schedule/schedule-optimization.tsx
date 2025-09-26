"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, Zap, TrendingUp, Clock, Users, BarChart3, CheckCircle2, AlertTriangle, Settings, ArrowRight, Brain, Lightbulb, Play, Pause, RotateCcw } from "lucide-react"

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

interface ScheduleOptimizationProps {
  workOrders: WorkOrder[]
}

interface OptimizationResult {
  id: string
  type: "workload_balance" | "resource_assignment" | "timeline_optimization" | "priority_optimization"
  description: string
  impact: {
    efficiency: number
    timeSaved: number
    conflicts: number
  }
  changes: {
    orders: string[]
    resources: string[]
    timeline: string
  }
  status: "pending" | "applied" | "failed"
}

export function ScheduleOptimization({ workOrders }: ScheduleOptimizationProps) {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([])
  const [currentOptimization, setCurrentOptimization] = useState<string | null>(null)

  // Generate sample optimization results
  const generateOptimizationResults = (): OptimizationResult[] => {
    return [
      {
        id: "opt-1",
        type: "workload_balance",
        description: "Redistribute workload across available resources",
        impact: {
          efficiency: 15,
          timeSaved: 24,
          conflicts: -3
        },
        changes: {
          orders: ["WO-001", "WO-015", "WO-023"],
          resources: ["Michael Chen", "Sophia Rodriguez", "David Kim"],
          timeline: "Immediate"
        },
        status: "pending"
      },
      {
        id: "opt-2",
        type: "resource_assignment",
        description: "Assign unassigned orders to best matching resources",
        impact: {
          efficiency: 22,
          timeSaved: 18,
          conflicts: -2
        },
        changes: {
          orders: ["WO-008", "WO-012", "WO-019"],
          resources: ["Emma Johnson", "James Wilson"],
          timeline: "Immediate"
        },
        status: "pending"
      },
      {
        id: "opt-3",
        type: "timeline_optimization",
        description: "Optimize production timeline to reduce bottlenecks",
        impact: {
          efficiency: 12,
          timeSaved: 36,
          conflicts: -1
        },
        changes: {
          orders: ["WO-030", "WO-031", "WO-035"],
          resources: ["All Teams"],
          timeline: "Next 3 days"
        },
        status: "pending"
      },
      {
        id: "opt-4",
        type: "priority_optimization",
        description: "Reorganize priorities based on due dates and customer importance",
        impact: {
          efficiency: 8,
          timeSaved: 12,
          conflicts: -1
        },
        changes: {
          orders: ["WO-005", "WO-018", "WO-025"],
          resources: ["All Teams"],
          timeline: "Immediate"
        },
        status: "pending"
      }
    ]
  }

  const runOptimization = async () => {
    setIsOptimizing(true)
    setCurrentOptimization("Starting optimization analysis...")
    
    // Simulate optimization process
    const results = generateOptimizationResults()
    
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      setCurrentOptimization(`Running ${result.type.replace('_', ' ')} optimization...`)
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update result status
      results[i].status = "applied"
      setOptimizationResults([...results])
    }
    
    setCurrentOptimization("Optimization complete!")
    setIsOptimizing(false)
    
    // Clear current optimization message after a delay
    setTimeout(() => setCurrentOptimization(null), 3000)
  }

  const applyOptimization = (optimizationId: string) => {
    setOptimizationResults(prev => 
      prev.map(opt => 
        opt.id === optimizationId 
          ? { ...opt, status: "applied" as const }
          : opt
      )
    )
  }

  const resetOptimization = () => {
    setOptimizationResults(prev => 
      prev.map(opt => ({ ...opt, status: "pending" as const }))
    )
  }

  const getOptimizationIcon = (type: string) => {
    switch (type) {
      case "workload_balance":
        return <Users className="h-4 w-4" />
      case "resource_assignment":
        return <Target className="h-4 w-4" />
      case "timeline_optimization":
        return <Clock className="h-4 w-4" />
      case "priority_optimization":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getOptimizationTypeLabel = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const totalEfficiencyGain = optimizationResults.reduce((sum, opt) => sum + opt.impact.efficiency, 0)
  const totalTimeSaved = optimizationResults.reduce((sum, opt) => sum + opt.impact.timeSaved, 0)
  const totalConflictsReduced = optimizationResults.reduce((sum, opt) => sum + opt.impact.conflicts, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Schedule Optimization</h2>
          <p className="text-muted-foreground">
            AI-powered optimization to improve production efficiency
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={resetOptimization}
            disabled={isOptimizing}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={runOptimization}
            disabled={isOptimizing}
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Optimizing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Optimization
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Current optimization status */}
      {currentOptimization && (
        <Alert>
          <BarChart3 className="h-4 w-4" />
          <AlertTitle>Optimization in Progress</AlertTitle>
          <AlertDescription>{currentOptimization}</AlertDescription>
        </Alert>
      )}

      {/* Optimization summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Gain</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{totalEfficiencyGain}%</div>
            <p className="text-xs text-muted-foreground">
              Overall improvement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalTimeSaved}h</div>
            <p className="text-xs text-muted-foreground">
              Production time saved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts Reduced</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{totalConflictsReduced}</div>
            <p className="text-xs text-muted-foreground">
              Fewer scheduling conflicts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimizations</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizationResults.length}</div>
            <p className="text-xs text-muted-foreground">
              Available optimizations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization algorithms */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Algorithms</CardTitle>
          <CardDescription>AI-powered algorithms used to optimize your production schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Workload Balancing</h4>
              <p className="text-sm text-muted-foreground">
                Distributes work orders evenly across available resources to maximize efficiency and minimize bottlenecks.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Reduces resource overallocation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Improves team productivity</span>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Resource Assignment</h4>
              <p className="text-sm text-muted-foreground">
                Matches work orders to the most suitable resources based on skills, availability, and current workload.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Optimizes skill utilization</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Reduces training time</span>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Timeline Optimization</h4>
              <p className="text-sm text-muted-foreground">
                Adjusts production timelines to minimize delays and maximize throughput while maintaining quality.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Reduces production delays</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Improves customer satisfaction</span>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Priority Optimization</h4>
              <p className="text-sm text-muted-foreground">
                Reorganizes work order priorities based on due dates, customer importance, and resource availability.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Ensures critical orders</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Balances workload priorities</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization results */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Optimization Results</h3>
        {optimizationResults.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Optimizations Available</h3>
                <p className="text-muted-foreground">Run optimization analysis to see potential improvements.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          optimizationResults.map((optimization) => (
            <Card key={optimization.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getOptimizationIcon(optimization.type)}
                    <div>
                      <CardTitle className="text-base">{optimization.description}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="capitalize">
                          {getOptimizationTypeLabel(optimization.type)}
                        </Badge>
                        <Badge variant={getStatusColor(optimization.status)} className="capitalize">
                          {optimization.status}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  {optimization.status === "pending" && (
                    <Button size="sm" onClick={() => applyOptimization(optimization.id)}>
                      Apply
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Impact Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Efficiency Improvement:</span>
                        <span className="font-medium text-green-600">+{optimization.impact.efficiency}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Time Saved:</span>
                        <span className="font-medium text-blue-600">{optimization.impact.timeSaved}h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Conflicts Reduced:</span>
                        <span className="font-medium text-amber-600">{optimization.impact.conflicts}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-3">Proposed Changes</h4>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Orders:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {optimization.changes.orders.map((order) => (
                            <Badge key={order} variant="secondary" className="text-xs">
                              {order}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Resources:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {optimization.changes.resources.map((resource) => (
                            <Badge key={resource} variant="outline" className="text-xs">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Timeline:</span>
                        <span className="font-medium ml-2">{optimization.changes.timeline}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Optimization settings */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Settings</CardTitle>
          <CardDescription>Configure optimization parameters and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Optimization Goals</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="goal-efficiency" defaultChecked />
                  <label htmlFor="goal-efficiency" className="text-sm">Maximize efficiency</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="goal-time" defaultChecked />
                  <label htmlFor="goal-time" className="text-sm">Minimize production time</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="goal-quality" defaultChecked />
                  <label htmlFor="goal-quality" className="text-sm">Maintain quality standards</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="goal-cost" />
                  <label htmlFor="goal-cost" className="text-sm">Minimize costs</label>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Constraints</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="constraint-overtime" />
                  <label htmlFor="constraint-overtime" className="text-sm">Allow overtime</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="constraint-reassign" defaultChecked />
                  <label htmlFor="constraint-reassign" className="text-sm">Allow resource reassignment</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="constraint-deadline" defaultChecked />
                  <label htmlFor="constraint-deadline" className="text-sm">Respect deadlines</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="constraint-priority" defaultChecked />
                  <label htmlFor="constraint-priority" className="text-sm">Maintain priority order</label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
