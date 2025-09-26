"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Calendar as CalendarIcon, Save } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Mock data - replace with actual data fetching
const mockRepairData = {
  id: "REP-001",
  customer: { id: "CUST-001", name: "John Doe" },
  description: "Ring resizing - size 7 to 8",
  status: "In Progress",
  priority: "Medium",
  receivedDate: new Date("2023-10-01"),
  dueDate: new Date("2023-10-10"),
  assignedTo: "Sarah",
  price: 75.0,
  notes: "Customer wants it back by the 9th if possible.",
}

const statusOptions = ["Received", "In Progress", "Awaiting Parts", "Completed", "Ready for Pickup", "Delivered", "Cancelled"]
const priorityOptions = ["Low", "Medium", "High", "Urgent"]
const assignees = ["Sarah", "Mike", "Admin", "Pending"]

export default function EditRepairPage() {
  const router = useRouter()
  const params = useParams()
  const repairId = params.id

  const [repair, setRepair] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch repair data by ID
    setRepair(mockRepairData)
    setLoading(false)
  }, [repairId])

  const handleSave = () => {
    // Logic to save the repair data
    toast({
      title: "Repair Updated",
      description: `Repair ${repair.id} has been successfully updated.`,
    })
    router.push("/dashboard/repairs")
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!repair) {
    return <div>Repair not found.</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Repair Order</h1>
          <p className="text-muted-foreground">Editing order: {repair.id}</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Repair Details</CardTitle>
          <CardDescription>Update the information for this repair order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-medium">Customer</label>
              <Input value={repair.customer.name} readOnly className="mt-1" />
            </div>
            <div>
              <label htmlFor="price" className="font-medium">Price ($)</label>
              <Input
                id="price"
                type="number"
                value={repair.price}
                onChange={(e) => setRepair({ ...repair, price: parseFloat(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="font-medium">Description</label>
            <Textarea
              id="description"
              value={repair.description}
              onChange={(e) => setRepair({ ...repair, description: e.target.value })}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="status" className="font-medium">Status</label>
              <Select
                value={repair.status}
                onValueChange={(value) => setRepair({ ...repair, status: value })}
              >
                <SelectTrigger id="status" className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="priority" className="font-medium">Priority</label>
              <Select
                value={repair.priority}
                onValueChange={(value) => setRepair({ ...repair, priority: value })}
              >
                <SelectTrigger id="priority" className="mt-1">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="assignedTo" className="font-medium">Assigned To</label>
              <Select
                value={repair.assignedTo}
                onValueChange={(value) => setRepair({ ...repair, assignedTo: value })}
              >
                <SelectTrigger id="assignedTo" className="mt-1">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {assignees.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !repair.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {repair.dueDate ? format(repair.dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={repair.dueDate}
                    onSelect={(date) => setRepair({ ...repair, dueDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="font-medium">Notes</label>
            <Textarea
              id="notes"
              value={repair.notes}
              onChange={(e) => setRepair({ ...repair, notes: e.target.value })}
              className="mt-1"
              rows={4}
              placeholder="Add any internal notes about the repair..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/repairs")}>Cancel</Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 