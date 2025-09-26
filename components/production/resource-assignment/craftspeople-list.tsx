"use client"
import { useDroppable } from "@dnd-kit/core"
import { format } from "date-fns"
import { AlertCircle, Calendar, Clock, FileText, MoreHorizontal, Star, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import type { Craftsperson, WorkOrder } from "./data"

interface CraftspeopleListProps {
  craftspeople: Craftsperson[]
  workOrders: WorkOrder[]
  onUnassignWorkOrder: (workOrderId: string) => void
  showWorkloadWarnings: boolean
  showSkillMismatchWarnings: boolean
}

export function CraftspeopleList({
  craftspeople,
  workOrders,
  onUnassignWorkOrder,
  showWorkloadWarnings,
  showSkillMismatchWarnings,
}: CraftspeopleListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-300px)] pr-4">
      <div className="space-y-4">
        {craftspeople.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed p-4 text-center">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <p className="mt-2 text-sm text-muted-foreground">No craftspeople match the current filters.</p>
            </div>
          </div>
        ) : (
          craftspeople.map((person) => (
            <CraftspersonCard
              key={person.id}
              person={person}
              workOrders={workOrders.filter((order) => order.assignedTo === person.id)}
              onUnassignWorkOrder={onUnassignWorkOrder}
              showWorkloadWarnings={showWorkloadWarnings}
              showSkillMismatchWarnings={showSkillMismatchWarnings}
            />
          ))
        )}
      </div>
    </ScrollArea>
  )
}

interface CraftspersonCardProps {
  person: Craftsperson
  workOrders: WorkOrder[]
  onUnassignWorkOrder: (workOrderId: string) => void
  showWorkloadWarnings: boolean
  showSkillMismatchWarnings: boolean
}

function CraftspersonCard({
  person,
  workOrders,
  onUnassignWorkOrder,
  showWorkloadWarnings,
  showSkillMismatchWarnings,
}: CraftspersonCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `craftsperson-${person.id}`,
  })

  // Check for skill mismatches
  const skillMismatches = workOrders.filter(
    (order) => !person.skills.some((skill) => skill.name === order.requiredSkill),
  )

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "relative transition-all",
        isOver && "ring-2 ring-primary ring-offset-2",
        person.onLeave && "opacity-60",
      )}
    >
      {person.onLeave && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/5 backdrop-blur-[1px]">
          <Badge variant="outline" className="bg-red-50 text-red-800">
            On Leave until {format(new Date(person.absences?.[0]?.endDate || new Date()), "MMM d")}
          </Badge>
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`/abstract-geometric-shapes.png?height=40&width=40&query=${person.name}`} />
              <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{person.name}</h3>
              <div className="mt-1 flex flex-wrap gap-1">
                {person.skills.map((skill) => (
                  <Badge key={skill.name} variant="outline" className="text-xs">
                    {skill.name}
                    {skill.level > 0 && (
                      <span className="ml-1 flex">
                        {Array.from({ length: skill.level }).map((_, i) => (
                          <Star key={i} className="h-2 w-2 fill-current" />
                        ))}
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="mr-2 h-4 w-4" />
                View Schedule
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Current Workload</h4>
            <span
              className={cn(
                "text-sm font-medium",
                person.currentWorkload > 90
                  ? "text-red-600"
                  : person.currentWorkload > 75
                    ? "text-amber-600"
                    : "text-emerald-600",
              )}
            >
              {person.currentWorkload}%
            </span>
          </div>
          <Progress
            value={person.currentWorkload}
            className={cn(
              "mt-2 h-2",
              person.currentWorkload > 90
                ? "bg-red-100"
                : person.currentWorkload > 75
                  ? "bg-amber-100"
                  : "bg-emerald-100",
            )}
            indicatorClassName={cn(
              person.currentWorkload > 90
                ? "bg-red-500"
                : person.currentWorkload > 75
                  ? "bg-amber-500"
                  : "bg-emerald-500",
            )}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Efficiency</p>
            <p className="font-medium">{person.efficiencyRating}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Quality</p>
            <p className="font-medium">{person.qualityRating}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Assigned</p>
            <p className="font-medium">{workOrders.length}</p>
          </div>
        </div>

        {/* Warnings */}
        {showWorkloadWarnings && person.currentWorkload > 90 && (
          <Alert variant="destructive" className="mt-4 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs">Overloaded</AlertTitle>
            <AlertDescription className="text-xs">This craftsperson is assigned too many work orders.</AlertDescription>
          </Alert>
        )}

        {showSkillMismatchWarnings && skillMismatches.length > 0 && (
          <Alert className="mt-4 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs">Skill Mismatch</AlertTitle>
            <AlertDescription className="text-xs">
              {skillMismatches.length} assigned {skillMismatches.length === 1 ? "order requires" : "orders require"}{" "}
              skills this craftsperson doesn't have.
            </AlertDescription>
          </Alert>
        )}

        {/* Assigned work orders */}
        {workOrders.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-medium">Assigned Work Orders</h4>
            <div className="space-y-2">
              {workOrders.map((order) => {
                const hasSkill = person.skills.some((skill) => skill.name === order.requiredSkill)
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-md border bg-background p-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          order.priority === "high"
                            ? "bg-red-50 text-red-800"
                            : order.priority === "medium"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-emerald-50 text-emerald-800"
                        }
                      >
                        {order.priority}
                      </Badge>
                      <span className="font-medium">{order.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline">
                              <Clock className="mr-1 h-3 w-3" />
                              {order.estimatedHours}h
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Estimated hours</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {!hasSkill && showSkillMismatchWarnings && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="bg-amber-50 text-amber-800">
                                <AlertCircle className="h-3 w-3" />
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Skill mismatch: Requires {order.requiredSkill} skill which this craftsperson doesn't
                                have
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUnassignWorkOrder(order.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Availability calendar preview */}
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-medium">Availability</h4>
          <div className="flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date()
              date.setDate(date.getDate() + i)
              const isUnavailable = person.absences?.some(
                (absence) => new Date(absence.startDate) <= date && new Date(absence.endDate) >= date,
              )
              return (
                <TooltipProvider key={i}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex h-8 w-8 flex-col items-center justify-center rounded-md text-xs",
                          isUnavailable
                            ? "bg-red-100 text-red-800"
                            : i === 0 || i === 6
                              ? "bg-slate-100 text-slate-500"
                              : "bg-emerald-50 text-emerald-800",
                        )}
                      >
                        <span>{format(date, "d")}</span>
                        <span className="text-[10px]">{format(date, "E")}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isUnavailable ? (
                        <p>Unavailable on {format(date, "EEEE, MMMM d")}</p>
                      ) : (
                        <p>Available on {format(date, "EEEE, MMMM d")}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
