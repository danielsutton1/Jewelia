"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, differenceInDays } from "date-fns"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  Flag,
  LinkIcon,
  MoreHorizontal,
  Printer,
  Share2,
  ShoppingCart,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { WorkOrderSpecifications } from "./work-order-specifications"
import { WorkOrderTimeline } from "./work-order-timeline"
import { WorkOrderMaterials } from "./work-order-materials"

// Mock data for demonstration
const mockWorkOrder = {
  id: "WO-12345",
  status: "In Production",
  salesOrderId: "SO-7890",
  createdAt: new Date(2023, 4, 10),
  dueDate: new Date(2023, 5, 15),
  priority: "High",
  customer: {
    id: "CUST-456",
    name: "Emma Thompson",
    email: "emma.thompson@example.com",
    phone: "(555) 123-4567",
    avatar: "/abstract-geometric-shapes.png",
  },
  assignedTo: "Michael Chen",
  currentStage: "Stone Setting",
  progress: 65,
  item: {
    name: "Custom Diamond Engagement Ring",
    description: "18K White Gold Solitaire with Pavé Band",
    images: ["/gold-necklace.png", "/emerald-bracelet.png", "/silver-earrings.png"],
    renders: ["/placeholder-epkys.png", "/placeholder-oktuv.png"],
    drawings: ["/placeholder-e5jke.png", "/placeholder-fi0lx.png"],
  },
  metal: {
    type: "18K White Gold",
    estimatedWeight: 5.2,
    actualWeight: 5.4,
    purity: "750",
    finish: "Polished",
  },
  stones: [
    {
      id: "ST-001",
      type: "Diamond",
      shape: "Round Brilliant",
      size: "1.25ct",
      color: "F",
      clarity: "VS1",
      quantity: 1,
      placement: "Center",
      status: "Set",
    },
    {
      id: "ST-002",
      type: "Diamond",
      shape: "Round Brilliant",
      size: "0.05ct",
      color: "F",
      clarity: "VS2",
      quantity: 12,
      placement: "Pavé Band",
      status: "Set",
    },
  ],
  instructions:
    "Customer prefers a slightly higher setting than standard. The band should be slightly thinner than the CAD model shows. Polish to a high shine finish.",
  timeline: [
    {
      stage: "Design/CAD",
      startDate: new Date(2023, 4, 10),
      endDate: new Date(2023, 4, 12),
      duration: 2,
      completedBy: "Sarah Johnson",
      notes: "Initial design approved by customer after minor adjustments to the prong height.",
      photos: ["/placeholder-ky43w.png"],
      qualityCheck: {
        passed: true,
        checkedBy: "David Wilson",
        date: new Date(2023, 4, 12),
        notes: "Design meets all specifications and customer requirements.",
      },
    },
    {
      stage: "Wax/3D Print",
      startDate: new Date(2023, 4, 13),
      endDate: new Date(2023, 4, 14),
      duration: 1,
      completedBy: "Robert Lee",
      notes: "Wax model created with precision 3D printing. Slight adjustment made to the band thickness.",
      photos: ["/placeholder-cxzmn.png"],
      qualityCheck: {
        passed: true,
        checkedBy: "David Wilson",
        date: new Date(2023, 4, 14),
        notes: "Wax model meets design specifications.",
      },
    },
    {
      stage: "Casting",
      startDate: new Date(2023, 4, 15),
      endDate: new Date(2023, 4, 17),
      duration: 2,
      completedBy: "Jennifer Adams",
      notes: "Cast in 18K white gold. Good flow, no visible defects.",
      photos: ["/placeholder-oc67l.png"],
      qualityCheck: {
        passed: true,
        checkedBy: "David Wilson",
        date: new Date(2023, 4, 17),
        notes: "Casting is clean with no porosity issues.",
      },
    },
    {
      stage: "Stone Setting",
      startDate: new Date(2023, 4, 18),
      endDate: null,
      duration: null,
      completedBy: null,
      notes: "Center stone set. Working on pavé setting.",
      photos: ["/placeholder-zjy0g.png"],
      qualityCheck: null,
    },
  ],
  materialsUsed: {
    metal: {
      estimated: {
        weight: 5.2,
        cost: 520,
      },
      actual: {
        weight: 5.4,
        cost: 540,
      },
    },
    stones: [
      {
        id: "ST-001",
        estimated: {
          quantity: 1,
          cost: 5000,
        },
        actual: {
          quantity: 1,
          cost: 5000,
        },
      },
      {
        id: "ST-002",
        estimated: {
          quantity: 12,
          cost: 600,
        },
        actual: {
          quantity: 12,
          cost: 600,
        },
      },
    ],
    additionalMaterials: [
      {
        name: "Rhodium Plating",
        cost: 50,
      },
      {
        name: "Polishing Compounds",
        cost: 15,
      },
    ],
    laborHours: {
      estimated: 8,
      actual: 8.5,
      rate: 75,
    },
  },
}

interface WorkOrderDetailProps {
  workOrderId: string
}

export function WorkOrderDetail({ workOrderId }: WorkOrderDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("specifications")

  // In a real application, you would fetch the work order data based on the workOrderId
  const workOrder = mockWorkOrder

  // Calculate due date urgency
  const dueDate = new Date(workOrder.dueDate)
  const today = new Date()
  const daysUntilDue = differenceInDays(dueDate, today)

  let dueDateColor = "bg-emerald-100 text-emerald-800"
  if (daysUntilDue < 0) {
    dueDateColor = "bg-red-100 text-red-800"
  } else if (daysUntilDue <= 3) {
    dueDateColor = "bg-amber-100 text-amber-800"
  } else if (daysUntilDue <= 7) {
    dueDateColor = "bg-blue-100 text-blue-800"
  }

  // Priority color
  const priorityColor = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-amber-100 text-amber-800",
    Low: "bg-emerald-100 text-emerald-800",
  }[workOrder.priority]

  // Status color
  const statusColor =
    {
      "In Production": "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      "On Hold": "bg-amber-100 text-amber-800",
      Cancelled: "bg-red-100 text-red-800",
      Pending: "bg-slate-100 text-slate-800",
    }[workOrder.status] || "bg-slate-100 text-slate-800"

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 p-6 print:p-0">
      {/* Back button and page title */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Work Order Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Work Order
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Work Order
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" />
                Share Work Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Work Order header card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{workOrder.id}</h2>
                    <Badge className={statusColor}>{workOrder.status}</Badge>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-muted-foreground">
                    <ShoppingCart className="mr-1 h-4 w-4" />
                    <span className="mr-1">Sales Order:</span>
                    <a
                      href={`/dashboard/orders/${workOrder.salesOrderId}`}
                      className="flex items-center hover:underline"
                    >
                      {workOrder.salesOrderId}
                      <LinkIcon className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                <div className="mt-1 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={workOrder.customer.avatar || "/placeholder.svg"} alt={workOrder.customer.name} />
                    <AvatarFallback>{workOrder.customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      <a href={`/dashboard/customers/${workOrder.customer.id}`} className="hover:underline">
                        {workOrder.customer.name}
                      </a>
                    </p>
                    <p className="text-sm text-muted-foreground">{workOrder.customer.email}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">Item</h3>
                <p className="font-medium">{workOrder.item.name}</p>
                <p className="text-sm text-muted-foreground">{workOrder.item.description}</p>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                  <div className="mt-1">
                    <Badge variant="outline" className={`${dueDateColor} flex items-center gap-1`}>
                      <Calendar className="h-3 w-3" />
                      {format(dueDate, "MMM d, yyyy")}
                      {daysUntilDue < 0 ? (
                        <span className="ml-1">({Math.abs(daysUntilDue)} days overdue)</span>
                      ) : (
                        <span className="ml-1">({daysUntilDue} days left)</span>
                      )}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                  <div className="mt-1">
                    <Badge variant="outline" className={`${priorityColor} flex items-center gap-1`}>
                      <Flag className="h-3 w-3" />
                      {workOrder.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Assigned To</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={`/abstract-geometric-shapes.png?height=32&width=32&query=${workOrder.assignedTo}`}
                      />
                      <AvatarFallback>{workOrder.assignedTo.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{workOrder.assignedTo}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Current Stage</h3>
                  <div className="mt-1">
                    <Badge variant="secondary">{workOrder.currentStage}</Badge>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Progress</h3>
                  <span className="text-sm font-medium">{workOrder.progress}%</span>
                </div>
                <Progress value={workOrder.progress} className="mt-2 h-2" />
              </div>
              <div className="flex flex-wrap gap-2 print:hidden">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark Stage Complete
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mark the current stage as complete and move to the next stage</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm">
                        <User className="mr-2 h-4 w-4" />
                        Reassign
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Assign this work order to a different craftsperson</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Clock className="mr-2 h-4 w-4" />
                        Log Time
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Record time spent working on this order</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content with tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full print:hidden">
          <TabsTrigger value="specifications" className="flex-1">
            Specifications
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex-1">
            Production Timeline
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex-1">
            Materials Used
          </TabsTrigger>
        </TabsList>

        <TabsContent value="specifications" className="mt-6">
          <WorkOrderSpecifications workOrder={workOrder} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <WorkOrderTimeline workOrder={workOrder} />
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          <WorkOrderMaterials workOrder={workOrder} />
        </TabsContent>
      </Tabs>

      {/* Action buttons */}
      <div className="flex justify-between print:hidden">
        <Button variant="outline" onClick={() => router.back()}>
          Back to Work Orders
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Work Order
          </Button>
          <Button>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Complete Work Order
          </Button>
        </div>
      </div>
    </div>
  )
}
