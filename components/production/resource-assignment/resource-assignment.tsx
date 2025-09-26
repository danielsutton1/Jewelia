"use client"

import * as React from "react"
import { DndContext, DragOverlay, closestCorners, useSensor, useSensors, PointerSensor } from "@dnd-kit/core"
import { restrictToParentElement } from "@dnd-kit/modifiers"
import { AlertCircle, Calendar, Clock, Filter, Lightbulb, RefreshCw, Sliders } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { UnassignedWorkOrders } from "./unassigned-work-orders"
import { CraftspeopleList } from "./craftspeople-list"
import { AbsenceCalendar } from "./absence-calendar"
import { generateSampleWorkOrders, generateSampleCraftspeople, type WorkOrder, type Craftsperson } from "./data"

async function fetchCraftspeople(): Promise<Craftsperson[]> {
  try {
    const res = await fetch("/api/resources?type=craftsperson")
    const json = await res.json()
    if (!json.success || !Array.isArray(json.data)) return []
    // Map API data to Craftsperson type
    return json.data.map((r: any) => ({
      id: r.id,
      name: r.name,
      skills: r.metadata?.skills || [],
      currentWorkload: r.current_load ?? 0,
      efficiencyRating: r.metadata?.efficiencyRating ?? 80,
      qualityRating: r.metadata?.qualityRating ?? 80,
      onLeave: r.metadata?.onLeave ?? false,
      absences: r.metadata?.absences ?? [],
      assignedOrders: r.metadata?.assignedOrders ?? [],
    }))
  } catch {
    return []
  }
}

export function ResourceAssignment() {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [workOrders, setWorkOrders] = React.useState<WorkOrder[]>(() => generateSampleWorkOrders(15))
  const [craftspeople, setCraftspeople] = useState<Craftsperson[]>([])
  const [loadingCraftspeople, setLoadingCraftspeople] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterSkill, setFilterSkill] = React.useState<string | null>(null)
  const [filterAvailability, setFilterAvailability] = React.useState<string | null>(null)
  const [showFilters, setShowFilters] = React.useState(false)
  const [showAutoAssignDialog, setShowAutoAssignDialog] = React.useState(false)
  const [showAbsenceDialog, setShowAbsenceDialog] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("all")
  const [showWorkloadWarnings, setShowWorkloadWarnings] = React.useState(true)
  const [showSkillMismatchWarnings, setShowSkillMismatchWarnings] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    setLoadingCraftspeople(true)
    fetchCraftspeople().then((data) => {
      if (mounted) {
        if (data.length === 0) {
          setCraftspeople(generateSampleCraftspeople(8))
          setApiError("Could not load craftspeople from API. Showing sample data.")
        } else {
          setCraftspeople(data)
          setApiError(null)
        }
        setLoadingCraftspeople(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  // Get unassigned work orders
  const unassignedWorkOrders = React.useMemo(() => {
    return workOrders.filter((order) => !order.assignedTo)
  }, [workOrders])

  // Get all skills from craftspeople
  const allSkills = React.useMemo(() => {
    const skillsSet = new Set<string>()
    craftspeople.forEach((person) => {
      person.skills.forEach((skill) => {
        skillsSet.add(skill.name)
      })
    })
    return Array.from(skillsSet)
  }, [craftspeople])

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  // Filter craftspeople based on search and filters
  const filteredCraftspeople = React.useMemo(() => {
    let filtered = [...craftspeople]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((person) => person.name.toLowerCase().includes(query))
    }

    if (filterSkill) {
      filtered = filtered.filter((person) =>
        person.skills.some((skill) => skill.name.toLowerCase() === filterSkill.toLowerCase()),
      )
    }

    if (filterAvailability) {
      if (filterAvailability === "available") {
        filtered = filtered.filter((person) => !person.onLeave)
      } else if (filterAvailability === "onLeave") {
        filtered = filtered.filter((person) => person.onLeave)
      }
    }

    if (activeTab === "overloaded") {
      filtered = filtered.filter((person) => person.currentWorkload > 85)
    } else if (activeTab === "available") {
      filtered = filtered.filter((person) => person.currentWorkload < 50 && !person.onLeave)
    } else if (activeTab === "onLeave") {
      filtered = filtered.filter((person) => person.onLeave)
    }

    return filtered
  }, [craftspeople, searchQuery, filterSkill, filterAvailability, activeTab])

  // Handle drag start
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  // Handle drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const workOrderId = active.id
      const craftspersonId = over.id.replace("craftsperson-", "")

      // Find the work order and craftsperson
      const workOrder = workOrders.find((order) => order.id === workOrderId)
      const craftsperson = craftspeople.find((person) => person.id === craftspersonId)

      if (workOrder && craftsperson) {
        // Check for skill match
        const requiredSkill = workOrder.requiredSkill
        const hasSkill = craftsperson.skills.some((skill) => skill.name === requiredSkill)

        // Check for workload
        const isOverloaded = craftsperson.currentWorkload >= 90

        // Assign the work order regardless of warnings
        setWorkOrders((prev) =>
          prev.map((order) =>
            order.id === workOrderId
              ? {
                  ...order,
                  assignedTo: craftspersonId,
                  assignedToName: craftsperson.name,
                }
              : order,
          ),
        )

        // Update craftsperson's workload
        setCraftspeople((prev) =>
          prev.map((person) =>
            person.id === craftspersonId
              ? {
                  ...person,
                  currentWorkload: Math.min(100, person.currentWorkload + workOrder.workloadImpact),
                  assignedOrders: [...person.assignedOrders, workOrderId],
                }
              : person,
          ),
        )
      }
    }

    setActiveId(null)
  }

  // Handle unassigning a work order
  const handleUnassignWorkOrder = (workOrderId: string) => {
    const workOrder = workOrders.find((order) => order.id === workOrderId)
    if (!workOrder || !workOrder.assignedTo) return

    // Update the work order
    setWorkOrders((prev) =>
      prev.map((order) =>
        order.id === workOrderId
          ? {
              ...order,
              assignedTo: null,
              assignedToName: null,
            }
          : order,
      ),
    )

    // Update the craftsperson's workload
    setCraftspeople((prev) =>
      prev.map((person) =>
        person.id === workOrder.assignedTo
          ? {
              ...person,
              currentWorkload: Math.max(0, person.currentWorkload - workOrder.workloadImpact),
              assignedOrders: person.assignedOrders.filter((id) => id !== workOrderId),
            }
          : person,
      ),
    )
  }

  // Auto-assign work orders
  const handleAutoAssign = () => {
    // Clone current state
    const updatedWorkOrders = [...workOrders]
    const updatedCraftspeople = [...craftspeople]

    // Get only unassigned work orders
    const unassigned = updatedWorkOrders.filter((order) => !order.assignedTo)

    // Sort work orders by priority (high to low)
    unassigned.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return (
        priorityOrder[b.priority as keyof typeof priorityOrder] -
        priorityOrder[a.priority as keyof typeof priorityOrder]
      )
    })

    // For each unassigned work order, find the best craftsperson
    unassigned.forEach((workOrder) => {
      // Filter craftspeople who are not on leave
      const availableCraftspeople = updatedCraftspeople.filter((person) => !person.onLeave)

      // First, try to find someone with the exact skill and reasonable workload
      let bestMatch = availableCraftspeople.find(
        (person) =>
          person.skills.some((skill) => skill.name === workOrder.requiredSkill) && person.currentWorkload < 80,
      )

      // If no ideal match, find someone with the skill regardless of workload
      if (!bestMatch) {
        bestMatch = availableCraftspeople.find((person) =>
          person.skills.some((skill) => skill.name === workOrder.requiredSkill),
        )
      }

      // If still no match, find someone with the lowest workload
      if (!bestMatch && availableCraftspeople.length > 0) {
        bestMatch = availableCraftspeople.reduce((prev, current) =>
          prev.currentWorkload < current.currentWorkload ? prev : current,
        )
      }

      // If we found a match, assign the work order
      if (bestMatch) {
        // Update the work order
        const workOrderIndex = updatedWorkOrders.findIndex((order) => order.id === workOrder.id)
        if (workOrderIndex !== -1) {
          updatedWorkOrders[workOrderIndex] = {
            ...updatedWorkOrders[workOrderIndex],
            assignedTo: bestMatch.id,
            assignedToName: bestMatch.name,
          }
        }

        // Update the craftsperson
        const craftspersonIndex = updatedCraftspeople.findIndex((person) => person.id === bestMatch!.id)
        if (craftspersonIndex !== -1) {
          updatedCraftspeople[craftspersonIndex] = {
            ...updatedCraftspeople[craftspersonIndex],
            currentWorkload: Math.min(
              100,
              updatedCraftspeople[craftspersonIndex].currentWorkload + workOrder.workloadImpact,
            ),
            assignedOrders: [...updatedCraftspeople[craftspersonIndex].assignedOrders, workOrder.id],
          }
        }
      }
    })

    // Update state
    setWorkOrders(updatedWorkOrders)
    setCraftspeople(updatedCraftspeople)
    setShowAutoAssignDialog(false)
  }

  // Handle adding an absence
  const handleAddAbsence = (craftspersonId: string, startDate: Date, endDate: Date, reason: string) => {
    setCraftspeople((prev) =>
      prev.map((person) =>
        person.id === craftspersonId
          ? {
              ...person,
              onLeave: true,
              absences: [
                ...(person.absences || []),
                {
                  id: `absence-${Date.now()}`,
                  startDate: startDate.toISOString(),
                  endDate: endDate.toISOString(),
                  reason,
                },
              ],
            }
          : person,
      ),
    )
    setShowAbsenceDialog(false)
  }

  // Get the active work order for drag overlay
  const activeWorkOrder = activeId ? workOrders.find((order) => order.id === activeId) : null

  return (
    <div className="flex flex-col gap-4">
      {/* Header with title and actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resource Assignment</h1>
          <p className="text-muted-foreground">Assign work orders to craftspeople based on skills and availability</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Dialog open={showAutoAssignDialog} onOpenChange={setShowAutoAssignDialog}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Lightbulb className="mr-2 h-4 w-4" />
                Auto-Assign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Auto-Assign Work Orders</DialogTitle>
                <DialogDescription>
                  This will automatically assign unassigned work orders to the most suitable craftspeople based on
                  skills, workload, and availability.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Please confirm</AlertTitle>
                  <AlertDescription>
                    Auto-assignment will assign {unassignedWorkOrders.length} work orders to available craftspeople.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="prioritize-skills" defaultChecked />
                    <Label htmlFor="prioritize-skills">Prioritize skill matching</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="balance-workload" defaultChecked />
                    <Label htmlFor="balance-workload">Balance workload</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="consider-efficiency" defaultChecked />
                    <Label htmlFor="consider-efficiency">Consider efficiency ratings</Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAutoAssignDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAutoAssign}>Proceed with Auto-Assignment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showAbsenceDialog} onOpenChange={setShowAbsenceDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Absences
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Manage Absences & Vacations</DialogTitle>
                <DialogDescription>Schedule and manage craftspeople absences and vacations</DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <AbsenceCalendar
                  craftspeople={craftspeople}
                  onAddAbsence={handleAddAbsence}
                  onRemoveAbsence={(craftspersonId, absenceId) => {
                    setCraftspeople((prev) =>
                      prev.map((person) =>
                        person.id === craftspersonId
                          ? {
                              ...person,
                              absences: person.absences?.filter((absence) => absence.id !== absenceId) || [],
                              onLeave:
                                (person.absences?.filter((absence) => absence.id !== absenceId) || []).length > 0,
                            }
                          : person,
                      ),
                    )
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>

          <Button variant="ghost" size="icon" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <Label htmlFor="search-craftspeople" className="text-sm">
                  Search Craftspeople
                </Label>
                <Input
                  id="search-craftspeople"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="filter-skill" className="text-sm">
                  Filter by Skill
                </Label>
                <Select value={filterSkill || "all"} onValueChange={(value) => setFilterSkill(value || null)}>
                  <SelectTrigger id="filter-skill" className="mt-1">
                    <SelectValue placeholder="All skills" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All skills</SelectItem>
                    {allSkills.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-availability" className="text-sm">
                  Availability
                </Label>
                <Select
                  value={filterAvailability || "all"}
                  onValueChange={(value) => setFilterAvailability(value || null)}
                >
                  <SelectTrigger id="filter-availability" className="mt-1">
                    <SelectValue placeholder="All craftspeople" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All craftspeople</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="onLeave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Warnings</Label>
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-workload-warnings"
                      checked={showWorkloadWarnings}
                      onCheckedChange={setShowWorkloadWarnings}
                    />
                    <Label htmlFor="show-workload-warnings" className="text-sm">
                      Workload warnings
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-skill-mismatch-warnings"
                      checked={showSkillMismatchWarnings}
                      onCheckedChange={setShowSkillMismatchWarnings}
                    />
                    <Label htmlFor="show-skill-mismatch-warnings" className="text-sm">
                      Skill mismatch warnings
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main content - Split view */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left side - Unassigned work orders */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Unassigned Work Orders</span>
              <Badge variant="secondary">{unassignedWorkOrders.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToParentElement]}
            >
              <UnassignedWorkOrders workOrders={unassignedWorkOrders} />

              {/* Right side - Craftspeople */}
              <Card className="mt-4 lg:hidden">
                <CardHeader className="pb-3">
                  <CardTitle>Craftspeople</CardTitle>
                  <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="available">Available</TabsTrigger>
                      <TabsTrigger value="overloaded">Overloaded</TabsTrigger>
                      <TabsTrigger value="onLeave">On Leave</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  <CraftspeopleList
                    craftspeople={filteredCraftspeople}
                    workOrders={workOrders}
                    onUnassignWorkOrder={handleUnassignWorkOrder}
                    showWorkloadWarnings={showWorkloadWarnings}
                    showSkillMismatchWarnings={showSkillMismatchWarnings}
                  />
                </CardContent>
              </Card>

              <DragOverlay>
                {activeWorkOrder && (
                  <div className="w-full max-w-sm rounded-lg border bg-card p-4 text-card-foreground shadow-lg opacity-80">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{activeWorkOrder.id}</h3>
                        <p className="text-sm text-muted-foreground">{activeWorkOrder.itemDescription}</p>
                      </div>
                      <Badge
                        className={
                          activeWorkOrder.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : activeWorkOrder.priority === "medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {activeWorkOrder.priority}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">{activeWorkOrder.requiredSkill}</Badge>
                      <Badge variant="outline">
                        <Clock className="mr-1 h-3 w-3" />
                        {activeWorkOrder.estimatedHours}h
                      </Badge>
                    </div>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </CardContent>
        </Card>

        {/* Right side - Craftspeople (desktop only) */}
        <Card className="hidden lg:col-span-2 lg:block">
          <CardHeader className="pb-3">
            <CardTitle>Craftspeople</CardTitle>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="available">Available</TabsTrigger>
                <TabsTrigger value="overloaded">Overloaded</TabsTrigger>
                <TabsTrigger value="onLeave">On Leave</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <CraftspeopleList
              craftspeople={filteredCraftspeople}
              workOrders={workOrders}
              onUnassignWorkOrder={handleUnassignWorkOrder}
              showWorkloadWarnings={showWorkloadWarnings}
              showSkillMismatchWarnings={showSkillMismatchWarnings}
            />
          </CardContent>
        </Card>
      </div>

      {/* Workload summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Sliders className="mr-2 h-5 w-5" />
            Workload Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Work Orders</h3>
              <p className="text-2xl font-bold">{workOrders.length}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Unassigned</h3>
              <p className="text-2xl font-bold">{unassignedWorkOrders.length}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Available Craftspeople</h3>
              <p className="text-2xl font-bold">{craftspeople.filter((person) => !person.onLeave).length}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">On Leave</h3>
              <p className="text-2xl font-bold">{craftspeople.filter((person) => person.onLeave).length}</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Workload Distribution</h3>
            <div className="grid gap-2">
              {craftspeople
                .filter((person) => !person.onLeave)
                .sort((a, b) => b.currentWorkload - a.currentWorkload)
                .map((person) => (
                  <div key={person.id} className="flex items-center gap-2">
                    <div className="w-24 truncate text-sm">{person.name}</div>
                    <div className="flex-1">
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className={`h-2 rounded-full ${
                            person.currentWorkload > 90
                              ? "bg-red-500"
                              : person.currentWorkload > 75
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${person.currentWorkload}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm">{person.currentWorkload}%</div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
