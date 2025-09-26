"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { WorkshopData } from "./mock-data"
import {
  Activity,
  Users,
  Hammer,
  Printer,
  Package,
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
} from "lucide-react"

interface RealTimeViewProps {
  workshopData: WorkshopData
}

export function RealTimeView({ workshopData }: RealTimeViewProps) {
  const [refreshInterval, setRefreshInterval] = useState<number>(30) // seconds

  // Calculate active workstations
  const activeWorkstations = workshopData.workstations.filter((ws) => ws.isActive)
  const activeWorkstationsPercentage = Math.round((activeWorkstations.length / workshopData.workstations.length) * 100)

  // Calculate craftspeople utilization
  const busyCraftspeople = workshopData.craftspeople.filter((cp) => cp.availability === "busy")
  const busyCraftspeoplePecentage = Math.round(
    (busyCraftspeople.length / workshopData.craftspeople.filter((cp) => cp.availability !== "off-duty").length) * 100,
  )

  // Calculate equipment utilization
  const inUseEquipment = workshopData.equipment.filter((eq) => eq.isInUse)
  const inUseEquipmentPercentage = Math.round((inUseEquipment.length / workshopData.equipment.length) * 100)

  // Calculate projects in progress
  const inProgressProjects = workshopData.projects.filter((proj) => proj.status === "in-progress")
  const inProgressProjectsPercentage = Math.round((inProgressProjects.length / workshopData.projects.length) * 100)

  // Calculate storage utilization
  const storageUtilization = Math.round(
    (workshopData.storage.reduce((acc, storage) => acc + storage.capacityUsed / storage.totalCapacity, 0) /
      workshopData.storage.length) *
      100,
  )

  // Calculate safety compliance
  const safetyIssues = workshopData.safetyZones.filter(
    (sz) => sz.status === "needs-attention" || sz.status === "critical",
  )
  const safetyCompliancePercentage = Math.round(
    ((workshopData.safetyZones.length - safetyIssues.length) / workshopData.safetyZones.length) * 100,
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Workshop Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Workstations</p>
                    <div className="flex items-center">
                      <Hammer className="mr-2 h-5 w-5 text-primary" />
                      <h3 className="text-2xl font-bold">
                        {activeWorkstations.length}/{workshopData.workstations.length}
                      </h3>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">{activeWorkstationsPercentage}%</span>
                  </div>
                </div>
                <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${activeWorkstationsPercentage}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Craftspeople Utilization</p>
                    <div className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-primary" />
                      <h3 className="text-2xl font-bold">
                        {busyCraftspeople.length}/
                        {workshopData.craftspeople.filter((cp) => cp.availability !== "off-duty").length}
                      </h3>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">{busyCraftspeoplePecentage}%</span>
                  </div>
                </div>
                <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${busyCraftspeoplePecentage}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Equipment Utilization</p>
                    <div className="flex items-center">
                      <Printer className="mr-2 h-5 w-5 text-primary" />
                      <h3 className="text-2xl font-bold">
                        {inUseEquipment.length}/{workshopData.equipment.length}
                      </h3>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">{inUseEquipmentPercentage}%</span>
                  </div>
                </div>
                <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${inUseEquipmentPercentage}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Projects In Progress</p>
                    <div className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-primary" />
                      <h3 className="text-2xl font-bold">
                        {inProgressProjects.length}/{workshopData.projects.length}
                      </h3>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">{inProgressProjectsPercentage}%</span>
                  </div>
                </div>
                <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${inProgressProjectsPercentage}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Storage Utilization</p>
                    <div className="flex items-center">
                      <Package className="mr-2 h-5 w-5 text-primary" />
                      <h3 className="text-2xl font-bold">{storageUtilization}%</h3>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">{storageUtilization}%</span>
                  </div>
                </div>
                <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${storageUtilization}%` }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Safety Compliance</p>
                    <div className="flex items-center">
                      <ShieldAlert className="mr-2 h-5 w-5 text-primary" />
                      <h3 className="text-2xl font-bold">{safetyCompliancePercentage}%</h3>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">{safetyCompliancePercentage}%</span>
                  </div>
                </div>
                <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${safetyCompliancePercentage}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            <span>Auto-refreshing every {refreshInterval} seconds</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="workstations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workstations">Workstations</TabsTrigger>
          <TabsTrigger value="craftspeople">Craftspeople</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="workstations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Active Workstations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workstation</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Craftspeople</TableHead>
                    <TableHead>Current Projects</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workshopData.workstations.map((workstation) => (
                    <TableRow key={workstation.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Hammer className="mr-2 h-4 w-4" />
                          {workstation.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{workstation.type.replace("-", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        {workstation.isActive ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Activity className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {workstation.assignedCraftspeople.map((cpId) => {
                            const craftsperson = workshopData.craftspeople.find((cp) => cp.id === cpId)
                            return craftsperson ? (
                              <div key={cpId} className="flex items-center">
                                <Users className="mr-1 h-3 w-3" />
                                <span className="text-sm">{craftsperson.name}</span>
                              </div>
                            ) : null
                          })}
                          {workstation.assignedCraftspeople.length === 0 && (
                            <span className="text-sm text-muted-foreground">None assigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {workstation.currentProjects.map((projId) => {
                            const project = workshopData.projects.find((proj) => proj.id === projId)
                            return project ? (
                              <div key={projId} className="flex items-center">
                                <FileText className="mr-1 h-3 w-3" />
                                <span className="text-sm">{project.name}</span>
                              </div>
                            ) : null
                          })}
                          {workstation.currentProjects.length === 0 && (
                            <span className="text-sm text-muted-foreground">No active projects</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="craftspeople" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Craftspeople Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Location</TableHead>
                    <TableHead>Current Project</TableHead>
                    <TableHead>Efficiency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workshopData.craftspeople.map((craftsperson) => {
                    const workstation = workshopData.workstations.find(
                      (ws) => ws.id === craftsperson.assignedWorkstation,
                    )
                    const project = workshopData.projects.find((proj) => proj.id === craftsperson.currentProject)

                    return (
                      <TableRow key={craftsperson.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            {craftsperson.name}
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
                          {workstation ? (
                            <div className="flex items-center">
                              <Hammer className="mr-1 h-3 w-3" />
                              <span>{workstation.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {project ? (
                            <div className="flex items-center">
                              <FileText className="mr-1 h-3 w-3" />
                              <span>{project.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No active project</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-full bg-muted rounded-full h-2.5 max-w-24">
                              <div
                                className="bg-primary h-2.5 rounded-full"
                                style={{ width: `${craftsperson.efficiency}%` }}
                              ></div>
                            </div>
                            <span className="ml-2">{craftsperson.efficiency}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Equipment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>In Use</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workshopData.equipment.map((equipment) => {
                    const workstation = workshopData.workstations.find((ws) => ws.id === equipment.assignedWorkstation)

                    return (
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
                          {workstation ? (
                            <div className="flex items-center">
                              <Hammer className="mr-1 h-3 w-3" />
                              <span>{workstation.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
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
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Project Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workshopData.projects.map((project) => {
                    const workstation = workshopData.workstations.find((ws) => ws.id === project.assignedWorkstation)

                    return (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            {project.name}
                          </div>
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
                          <div className="flex flex-col gap-1">
                            {workstation && (
                              <div className="flex items-center">
                                <Hammer className="mr-1 h-3 w-3" />
                                <span className="text-sm">{workstation.name}</span>
                              </div>
                            )}
                            {project.assignedCraftspeople.map((cpId) => {
                              const craftsperson = workshopData.craftspeople.find((cp) => cp.id === cpId)
                              return craftsperson ? (
                                <div key={cpId} className="flex items-center">
                                  <Users className="mr-1 h-3 w-3" />
                                  <span className="text-sm">{craftsperson.name}</span>
                                </div>
                              ) : null
                            })}
                            {!workstation && project.assignedCraftspeople.length === 0 && (
                              <span className="text-sm text-muted-foreground">Not assigned</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-full bg-muted rounded-full h-2.5 max-w-24">
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
                            <Clock className="mr-1 h-3 w-3" />
                            <span>{project.deadline}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
