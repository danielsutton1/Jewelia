"use client"

import { useState } from "react"
import { Search, UserPlus, UserCog, Clock, Star, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

// Sample data for demonstration
const recentCustomers = [
  {
    id: "cust-001",
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    phone: "+1 (555) 123-4567",
    avatar: "/diverse-group-avatars.png",
    lifetimeValue: "$4,250.00",
    loyaltyStatus: "Gold",
    recentPurchases: [
      { id: "ord-123", date: "2023-04-15", amount: "$850.00", items: "Diamond Earrings" },
      { id: "ord-098", date: "2023-02-28", amount: "$1,200.00", items: "Gold Necklace" },
    ],
  },
  {
    id: "cust-002",
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    phone: "+1 (555) 234-5678",
    avatar: "/diverse-group-avatars.png",
    lifetimeValue: "$2,780.00",
    loyaltyStatus: "Silver",
    recentPurchases: [{ id: "ord-110", date: "2023-03-22", amount: "$450.00", items: "Silver Bracelet" }],
  },
  {
    id: "cust-003",
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    phone: "+1 (555) 345-6789",
    avatar: "/diverse-group-avatars.png",
    lifetimeValue: "$6,120.00",
    loyaltyStatus: "Platinum",
    recentPurchases: [
      { id: "ord-115", date: "2023-04-10", amount: "$1,850.00", items: "Diamond Pendant" },
      { id: "ord-092", date: "2023-01-15", amount: "$2,200.00", items: "Sapphire Ring" },
    ],
  },
]

const salesAssociates = [
  { id: "sa-001", name: "Emma Wilson" },
  { id: "sa-002", name: "Michael Chen" },
  { id: "sa-003", name: "Sophia Rodriguez" },
  { id: "sa-004", name: "James Johnson" },
]

export function OrderCreationHeader() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [dueDate, setDueDate] = useState<Date>()
  const [orderType, setOrderType] = useState<"retail" | "wholesale">("retail")
  const [channel, setChannel] = useState<"phone" | "online">("phone")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search customers by name, email, or phone" className="pl-10" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Recent Customers
            </h3>
            <div className="flex flex-wrap gap-4">
              {recentCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border transition-colors",
                    selectedCustomer === customer && "bg-primary text-primary-foreground border-primary"
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={customer.avatar || "/placeholder.svg"} alt={customer.name} />
                    <AvatarFallback>
                      {customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{customer.name}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="order-type">Order Type</Label>
              <div className="flex gap-2">
                <Button 
                  variant={orderType === 'retail' ? 'default' : 'outline'} 
                  className="w-full justify-center"
                  onClick={() => setOrderType('retail')}
                >
                  Retail
                </Button>
                <Button 
                  variant={orderType === 'wholesale' ? 'default' : 'outline'} 
                  className="w-full justify-center"
                  onClick={() => setOrderType('wholesale')}
                >
                  Wholesale
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant={channel === 'phone' ? 'default' : 'outline'} 
                  className="w-full justify-center"
                  onClick={() => setChannel('phone')}
                >
                  Phone
                </Button>
                <Button 
                  variant={channel === 'online' ? 'default' : 'outline'} 
                  className="w-full justify-center"
                  onClick={() => setChannel('online')}
                >
                  Online
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales-channel">Sales Channel</Label>
              <Select>
                <SelectTrigger id="sales-channel">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-store">In-Store</SelectItem>
                  <SelectItem value="e-commerce">E-commerce</SelectItem>
                  <SelectItem value="phone-order">Phone Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales-associate">Sales Associate</Label>
              <Select>
                <SelectTrigger id="sales-associate">
                  <SelectValue placeholder="Assign associate" />
                </SelectTrigger>
                <SelectContent>
                  {salesAssociates.map((associate) => (
                    <SelectItem key={associate.id} value={associate.id}>
                      {associate.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority-level">Priority Level</Label>
              <Select defaultValue="normal">
                <SelectTrigger id="priority-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="due-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate ? dueDate.toLocaleDateString() : <span>Select due date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
