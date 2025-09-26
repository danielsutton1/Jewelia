"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Printer,
  Share2,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  MessageSquare,
  Clock,
  FileText,
  User,
  Tag,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Circle,
  DollarSign,
  Package,
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { copyToClipboard } from "@/components/ui/utils";

// Mock Data
const mockRepair = {
  id: "REP-001",
  customer: {
    id: "CUST-001",
    name: "John Doe",
    email: "john.d@example.com",
    phone: "555-123-4567",
    avatar: "/abstract-geometric-shapes.png",
  },
  description: "Ring resizing - size 7 to 8. Platinum band with a single 1ct diamond.",
  status: "In Progress",
  priority: "Medium",
  receivedDate: "2023-10-01",
  dueDate: "2023-10-10",
  assignedTo: "Sarah",
  price: 75.0,
  lastUpdated: "2023-10-03T10:00:00Z",
  notes: "Customer wants it back by the 9th if possible. Be careful with the setting.",
  timeline: [
    { status: "Received", date: "2023-10-01T14:30:00Z", user: "Admin", notes: "Initial intake" },
    { status: "Assessed", date: "2023-10-01T16:00:00Z", user: "Sarah", notes: "Confirmed resize task, no issues found." },
    { status: "In Progress", date: "2023-10-03T10:00:00Z", user: "Sarah", notes: "Resizing started." },
  ],
  items: [{ id: "ITEM-123", name: "Platinum Diamond Ring", sku: "SKU-PLT-DIA-01" }]
}

const statusWorkflow = ["Received", "Assessed", "In Progress", "Awaiting Parts", "Quality Check", "Completed", "Ready for Pickup", "Delivered"];

// Components
function RepairStatusTracker({ currentStatus }: { currentStatus: string }) {
  const currentIndex = statusWorkflow.indexOf(currentStatus)
  return (
    <div className="flex items-center justify-between text-xs text-center">
      {statusWorkflow.map((status, index) => (
        <div key={status} className="flex-1 group relative">
          <div className="flex items-center flex-col">
            {index <= currentIndex ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <p className={cn("mt-1", index <= currentIndex ? "font-semibold" : "text-muted-foreground")}>{status}</p>
          </div>
          {index < statusWorkflow.length - 1 && (
            <div className={cn("absolute top-[10px] left-1/2 w-full h-0.5", index < currentIndex ? "bg-green-500" : "bg-muted")} />
          )}
        </div>
      ))}
    </div>
  )
}

export function RepairDetails({ repairId }: { repairId: string }) {
  const router = useRouter()
  // In a real app, fetch data based on repairId
  const repair = mockRepair

  // Action Handlers
  const handleEdit = () => router.push(`/dashboard/repairs/${repair.id}/edit`)
  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      toast({ title: "Repair Deleted", description: `Repair ${repair.id} deleted.` })
      router.push("/dashboard/repairs")
    }
  }
  const handlePrint = () => window.print()
  const handleShare = () => {
    copyToClipboard(window.location.href, (msg) => toast({ title: msg }));
  }
  const handleSendEmail = () => window.open(`mailto:${repair.customer.email}?subject=Update on your repair ${repair.id}`)
  const handleSendMessage = () => toast({ title: "Send SMS", description: "This would open an SMS sending interface." })
  
  const getStatusBadge = (status: string) => {
    // Omitting for brevity, would be same as in dashboard
    return "bg-blue-200 text-blue-800"
  }
  
  const getPriorityBadge = (priority: string) => {
      return priority === "Urgent" || priority === "High" ? "destructive" : "secondary"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Repair Order: {repair.id}</h1>
          <Badge variant="outline" className={getStatusBadge(repair.status)}>{repair.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button variant="outline" size="sm" onClick={handleShare}><Share2 className="mr-2 h-4 w-4" />Share</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Workflow */}
          <Card>
            <CardHeader><CardTitle>Repair Progress</CardTitle></CardHeader>
            <CardContent>
              <RepairStatusTracker currentStatus={repair.status} />
            </CardContent>
          </Card>
          
          {/* Repair Info & Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5"/>Repair Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{repair.description}</p>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priority</span>
                    <Badge variant={getPriorityBadge(repair.priority)}>{repair.priority}</Badge>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Assigned To</span>
                    <span>{repair.assignedTo}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date</span>
                    <span>{format(new Date(repair.dueDate), "MMM dd, yyyy")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5"/>Customer Details</CardTitle></CardHeader>
              <CardContent>
                 <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={repair.customer.avatar} />
                    <AvatarFallback>{repair.customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{repair.customer.name}</p>
                    <p className="text-sm text-muted-foreground">{repair.customer.email}</p>
                    <p className="text-sm text-muted-foreground">{repair.customer.phone}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSendEmail}><Mail className="mr-2 h-4 w-4" />Email</Button>
                    <Button variant="outline" size="sm" onClick={handleSendMessage}><MessageSquare className="mr-2 h-4 w-4" />SMS</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent>
               <div className="space-y-4">
                {repair.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        {index < repair.timeline.length -1 && <div className="w-px h-full bg-gray-200 my-1"/>}
                    </div>
                    <div>
                      <p className="font-medium">{event.status}</p>
                      <p className="text-sm text-muted-foreground">{event.notes}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(event.date), "MMM d, yyyy h:mm a")} by {event.user}
                      </p>
                    </div>
                  </div>
                ))}
               </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Sidebar */}
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5"/>Pricing & Estimate</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-lg font-bold">${repair.price.toFixed(2)}</span>
                    </div>
                    <Button className="w-full mt-4">Generate Invoice</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5"/>Items</CardTitle></CardHeader>
                <CardContent>
                    {repair.items.map(item => (
                        <div key={item.id} className="text-sm">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-muted-foreground">SKU: {item.sku}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/>Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{repair.notes || "No additional notes."}</p>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
} 
 