"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { WorkshopData } from "./mock-data"
import { User, Printer, AlertTriangle, CheckCircle, XCircle, Clock, ArrowUpDown, FileText } from "lucide-react"

interface ResourceAllocationProps {
  workshopData: WorkshopData
  onWorkshopDataChange: (data: WorkshopData) => void
}

export function ResourceAllocation({ workshopData, onWorkshopDataChange }: ResourceAllocationProps) {
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Function to assign craftsperson to workstation
  const assignCraftsperson = (craftspersonId: string, workstationId: string | null) => {
    const newData = { ...workshopData }

    // Update craftsperson
    const craftspersonIndex = newData.craftspeople.findIndex((cp) => cp.id === craftspersonId)
    if (craftspersonIndex !== -1) {
      // If previously assigned to a workstation, remove from that workstation
      const previousWorkstationId = newData.craftspeople[craftspersonIndex].assignedWorkstation
      if (previousWorkstationId) {
        const previousWorkstationIndex = newData.workstations.findIndex((ws) => ws.id === previousWorkstationId)
        if (previousWorkstationIndex !== -1) {
          newData.workstations[previousWorkstationIndex].assignedCraftspeople = newData.workstations[
            previousWorkstationIndex
          ].assignedCraftspeople.filter((id) => id !== craftspersonId)
        }
      }

      // Update craftsperson's assigned workstation
      newData.craftspeople[craftspersonIndex].assignedWorkstation = workstationId
    }

    // Update workstation
    if (workstationId) {
      const workstationIndex = newData.workstations.findIndex((ws) => ws.id === workstationId)
      if (workstationIndex !== -1) {
        // Add craftsperson to workstation if not already assigned
        if (!newData.workstations[workstationIndex].assignedCraftspeople.includes(craftspersonId)) {
          newData.workstations[workstationIndex].assignedCraftspeople.push(craftspersonId)
        }
      }
    }

    onWorkshopDataChange(newData)
  }

  // Function to assign equipment to workstation
  const assignEquipment = (equipmentId: string, workstationId: string | null) => {
    const newData = { ...workshopData }

    // Update equipment
    const equipmentIndex = newData.equipment.findIndex((eq) => eq.id === equipmentId)
    if (equipmentIndex !== -1) {
      // If previously assigned to a workstation, remove from that workstation
      const previousWorkstationId = newData.equipment[equipmentIndex].assignedWorkstation
      if (previousWorkstationId) {
        const previousWorkstationIndex = newData.workstations.findIndex((ws) => ws.id === previousWorkstationId)
        if (previousWorkstationIndex !== -1) {
          newData.workstations[previousWorkstationIndex].assignedEquipment = newData.workstations[
            previousWorkstationIndex
          ].assignedEquipment.filter((id) => id !== equipmentId)
        }
      }

      // Update equipment's assigned workstation
      newData.equipment[equipmentIndex].assignedWorkstation = workstationId
    }

    // Update workstation
    if (workstationId) {
      const workstationIndex = newData.workstations.findIndex((ws) => ws.id === workstationId)
      if (workstationIndex !== -1) {
        // Add equipment to workstation if not already assigned
        if (!newData.workstations[workstationIndex].assignedEquipment.includes(equipmentId)) {
          newData.workstations[workstationIndex].assignedEquipment.push(equipmentId)
        }
      }
    }

    onWorkshopDataChange(newData)
  }

  // Function to assign project to workstation
  const assignProject = (projectId: string, workstationId: string | null) => {
    const newData = { ...workshopData }

    // Update project
    const projectIndex = newData.projects.findIndex((proj) => proj.id === projectId)
    if (projectIndex !== -1) {
      // Update project's assigned workstation
      newData.projects[projectIndex].assignedWorkstation = workstationId
    }

    // Update workstation
    if (workstationId) {
      const workstationIndex = newData.workstations.findIndex((ws) => ws.id === workstationId)
      if (workstationIndex !== -1) {
        // Add project to workstation if not already assigned
        if (!newData.workstations[workstationIndex].currentProjects.includes(projectId)) {
          newData.workstations[workstationIndex].currentProjects.push(projectId)
        }
      }
    } else {
      // If unassigning, remove from previous workstation
      const previousWorkstation = newData.workstations.find((ws) => ws.currentProjects.includes(projectId))
      if (previousWorkstation) {
        const previousWorkstationIndex = newData.workstations.findIndex((ws) => ws.id === previousWorkstation.id)
        newData.workstations[previousWorkstationIndex].currentProjects = newData.workstations[
          previousWorkstationIndex
        ].currentProjects.filter((id) => id !== projectId)
      }
    }

    onWorkshopDataChange(newData)
  }

  // Function to assign craftsperson to project
  const assignCraftspersonToProject = (craftspersonId: string, projectId: string | null) => {
    const newData = { ...workshopData }

    // Update craftsperson
    const craftspersonIndex = newData.craftspeople.findIndex((cp) => cp.id === craftspersonId)
    if (craftspersonIndex !== -1) {
      // Update craftsperson's current project
      newData.craftspeople[craftspersonIndex].currentProject = projectId
    }

    // Update project
    if (projectId) {
      const projectIndex = newData.projects.findIndex((proj) => proj.id === projectId)
      if (projectIndex !== -1) {
        // Add craftsperson to project if not already assigned
        if (!newData.projects[projectIndex].assignedCraftspeople.includes(craftspersonId)) {
          newData.projects[projectIndex].assignedCraftspeople.push(craftspersonId)
        }
      }
    } else {
      // If unassigning, remove from previous project
      const previousProject = newData.projects.find((proj) => proj.assignedCraftspeople.includes(craftspersonId))
      if (previousProject) {
        const previousProjectIndex = newData.projects.findIndex((proj) => proj.id === previousProject.id)
        newData.projects[previousProjectIndex].assignedCraftspeople = newData.projects[
          previousProjectIndex
        ].assignedCraftspeople.filter((id) => id !== craftspersonId)
      }
    }

    onWorkshopDataChange(newData)
  }

  // Function to toggle workstation active status
  const toggleWorkstationActive = (workstationId: string) => {
    const newData = { ...workshopData }
    const workstationIndex = newData.workstations.findIndex((ws) => ws.id === workstationId)

    if (workstationIndex !== -1) {
      newData.workstations[workstationIndex].isActive = !newData.workstations[workstationIndex].isActive
      onWorkshopDataChange(newData)
    }
  }

  // Function to sort craftspeople
  const sortedCraftspeople = [...workshopData.craftspeople].sort((a, b) => {
    let comparison = 0

    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name)
    } else if (sortField === "specialty") {
      comparison = a.specialties[0]?.localeCompare(b.specialties[0] || "") || 0
    } else if (sortField === "efficiency") {
      comparison = a.efficiency - b.efficiency
    } else if (sortField === "availability") {
      comparison = a.availability.localeCompare(b.availability)
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  // Function to sort equipment
  const sortedEquipment = [...workshopData.equipment].sort((a, b) => {
    let comparison = 0

    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name)
    } else if (sortField === "type") {
      comparison = a.type.localeCompare(b.type)
    } else if (sortField === "status") {
      comparison = a.maintenanceStatus.localeCompare(b.maintenanceStatus)
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  // Function to sort projects
  const sortedProjects = [...workshopData.projects].sort((a, b) => {
    let comparison = 0

    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name)
    } else if (sortField === "type") {
      comparison = a.type.localeCompare(b.type)
    } else if (sortField === "priority") {
      const priorityOrder = { low: 0, medium: 1, high: 2, urgent: 3 }
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
    } else if (sortField === "status") {
      comparison = a.status.localeCompare(b.status)
    } else if (sortField === "completion") {
      comparison = a.completionPercentage - b.completionPercentage
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  // Function to handle sort
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <Tabs defaultValue="craftspeople" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="craftspeople">Craftspeople</TabsTrigger>
        <TabsTrigger value="equipment">Equipment</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
      </TabsList>

      <TabsContent value="craftspeople" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Craftspeople Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <Button variant="ghost" size="sm" onClick={() => handleSort("name")}>
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("specialty")}>
                      Specialties
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("efficiency")}>
                      Efficiency
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("availability")}>
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Assigned Workstation</TableHead>
                  <TableHead>Current Project</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCraftspeople.map((craftsperson) => (
                  <TableRow key={craftsperson.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        {craftsperson.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {craftsperson.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline">
                            {specialty.replace("-", " ")}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${craftsperson.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="ml-2">{craftsperson.efficiency}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {craftsperson.availability === "available" && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Available
                        </Badge>
                      )}
                      {craftsperson.availability === "busy" && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Busy
                        </Badge>
                      )}
                      {craftsperson.availability === "off-duty" && (
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                          Off Duty
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={craftsperson.assignedWorkstation || ""}
                        onValueChange={(value) => assignCraftsperson(craftsperson.id, value || null)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Not assigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not assigned</SelectItem>
                          {workshopData.workstations.map((workstation) => (
                            <SelectItem key={workstation.id} value={workstation.id}>
                              {workstation.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={craftsperson.currentProject || ""}
                        onValueChange={(value) => assignCraftspersonToProject(craftsperson.id, value || null)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Not assigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not assigned</SelectItem>
                          {workshopData.projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="equipment" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Equipment Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <Button variant="ghost" size="sm" onClick={() => handleSort("name")}>
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("type")}>
                      Type
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("status")}>
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>In Use</TableHead>
                  <TableHead>Assigned Workstation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEquipment.map((equipment) => (
                  <TableRow key={equipment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Printer className="mr-2 h-4 w-4" />
                        {equipment.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{equipment.type.replace("-", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      {equipment.maintenanceStatus === "good" && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Good
                        </Badge>
                      )}
                      {equipment.maintenanceStatus === "needs-maintenance" && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Needs Maintenance
                        </Badge>
                      )}
                      {equipment.maintenanceStatus === "out-of-order" && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <XCircle className="mr-1 h-3 w-3" />
                          Out of Order
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {equipment.isInUse ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          In Use
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                          Idle
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={equipment.assignedWorkstation || ""}
                        onValueChange={(value) => assignEquipment(equipment.id, value || null)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Not assigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not assigned</SelectItem>
                          {workshopData.workstations.map((workstation) => (
                            <SelectItem key={workstation.id} value={workstation.id}>
                              {workstation.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="projects" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Project Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <Button variant="ghost" size="sm" onClick={() => handleSort("name")}>
                      Project Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("type")}>
                      Type
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("priority")}>
                      Priority
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("status")}>
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("completion")}>
                      Completion
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Assigned Workstation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        {project.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{project.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {project.priority === "low" && (
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                          Low
                        </Badge>
                      )}
                      {project.priority === "medium" && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Medium
                        </Badge>
                      )}
                      {project.priority === "high" && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          High
                        </Badge>
                      )}
                      {project.priority === "urgent" && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Urgent
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {project.status === "not-started" && (
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                          Not Started
                        </Badge>
                      )}
                      {project.status === "in-progress" && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          In Progress
                        </Badge>
                      )}
                      {project.status === "on-hold" && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          On Hold
                        </Badge>
                      )}
                      {project.status === "completed" && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Completed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${project.completionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="ml-2">{project.completionPercentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {project.deadline}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={project.assignedWorkstation || ""}
                        onValueChange={(value) => assignProject(project.id, value || null)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Not assigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not assigned</SelectItem>
                          {workshopData.workstations.map((workstation) => (
                            <SelectItem key={workstation.id} value={workstation.id}>
                              {workstation.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
