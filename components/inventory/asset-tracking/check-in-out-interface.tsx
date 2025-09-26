"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownToDot, ArrowUpFromDot } from "lucide-react"
import { toast } from "sonner"

interface Location {
  id: string
  name: string
}

interface Employee {
  id: string
  name: string
}

interface CheckInOutInterfaceProps {
  locations: Location[]
  employees: Employee[]
  onCheckIn?: (assetId: string, notes?: string) => void
  onCheckOut?: (assetId: string, employeeId: string, locationId: string, returnDate: string, notes?: string) => void
}

function CheckInPanel({ onCheckIn }: { onCheckIn?: (assetId: string, notes?: string) => void }) {
  const [assetId, setAssetId] = useState("")
  const [notes, setNotes] = useState("")

  const handleCheckIn = () => {
    if (!assetId.trim()) {
      toast.error("Please enter an asset ID")
      return
    }
    onCheckIn?.(assetId, notes)
    setAssetId("")
    setNotes("")
  }

  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-2">
        <Label htmlFor="checkin-asset-id">Asset ID or SKU</Label>
        <Input 
          id="checkin-asset-id" 
          placeholder="Scan or enter asset identifier..." 
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCheckIn()}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="checkin-notes">Notes (Optional)</Label>
        <Textarea 
          id="checkin-notes" 
          placeholder="Condition notes, etc..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <Button className="w-full" onClick={handleCheckIn}>
        <ArrowDownToDot className="mr-2 h-4 w-4" />
        Check In Asset
      </Button>
    </div>
  )
}

function CheckOutPanel({ locations, employees, onCheckOut }: CheckInOutInterfaceProps) {
  const [date, setDate] = useState<Date>()
  const [assetId, setAssetId] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [locationId, setLocationId] = useState("")
  const [notes, setNotes] = useState("")

  const handleCheckOut = () => {
    if (!assetId.trim() || !employeeId || !locationId || !date) {
      toast.error("Please fill in all required fields")
      return
    }
    onCheckOut?.(assetId, employeeId, locationId, date.toISOString(), notes)
    setAssetId("")
    setEmployeeId("")
    setLocationId("")
    setDate(undefined)
    setNotes("")
  }

  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-2">
        <Label htmlFor="asset-id">Asset ID or SKU</Label>
        <Input 
          id="asset-id" 
          placeholder="Scan or enter asset identifier..." 
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="employee">Employee / Partner</Label>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger id="employee">
              <SelectValue placeholder="Select who is checking out..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>{employee.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="destination">Destination</Label>
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger id="destination">
              <SelectValue placeholder="Select destination location..." />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="return-date">Expected Return Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea 
          id="notes" 
          placeholder="Reason for check-out, special instructions, etc." 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button className="w-full" onClick={handleCheckOut}>
        <ArrowUpFromDot className="mr-2 h-4 w-4" />
        Check Out Asset
      </Button>
    </div>
  )
}

export function CheckInOutInterface({ locations, employees, onCheckIn, onCheckOut }: CheckInOutInterfaceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Check-In / Check-Out</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="checkout">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="checkout">
              <ArrowUpFromDot className="mr-2 h-4 w-4" />
              Check-Out
            </TabsTrigger>
            <TabsTrigger value="checkin">
              <ArrowDownToDot className="mr-2 h-4 w-4" />
              Check-In
            </TabsTrigger>
          </TabsList>
          <TabsContent value="checkout">
            <CheckOutPanel locations={locations} employees={employees} onCheckOut={onCheckOut} />
          </TabsContent>
          <TabsContent value="checkin">
            <CheckInPanel onCheckIn={onCheckIn} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 
 