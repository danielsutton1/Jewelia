"use client"

import {
  ArrowRightLeft,
  ChevronsUpDown,
  Download,
  PlusCircle,
  QrCode,
  Search,
  Upload,
  FileWarning,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface QuickActionsBarProps {
  onCheckOut?: (assetId: string) => void
  onCheckIn?: (assetId: string) => void
  onTransfer?: (assetId: string) => void
  onReportMissing?: (assetId: string) => void
  onBulkCheckOut?: (assetIds: string[], employeeId: string, locationId: string) => void
  onBulkCheckIn?: (assetIds: string[]) => void
  onBulkTransfer?: (assetIds: string[]) => void
}

export function QuickActionsBar({
  onCheckOut,
  onCheckIn,
  onTransfer,
  onReportMissing,
  onBulkCheckOut,
  onBulkCheckIn,
  onBulkTransfer,
}: QuickActionsBarProps) {
  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false)
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [reportMissingDialogOpen, setReportMissingDialogOpen] = useState(false)
  const [bulkCheckOutDialogOpen, setBulkCheckOutDialogOpen] = useState(false)
  const [bulkCheckInDialogOpen, setBulkCheckInDialogOpen] = useState(false)
  const [bulkTransferDialogOpen, setBulkTransferDialogOpen] = useState(false)

  // Form states
  const [checkOutForm, setCheckOutForm] = useState({
    assetId: "",
    employeeId: "",
    locationId: "",
    returnDate: "",
    notes: "",
  })

  const [checkInForm, setCheckInForm] = useState({
    assetId: "",
    notes: "",
  })

  const [transferForm, setTransferForm] = useState({
    assetId: "",
    employeeId: "",
    locationId: "",
    notes: "",
  })

  const [reportMissingForm, setReportMissingForm] = useState({
    assetId: "",
    notes: "",
  })

  const [bulkForm, setBulkForm] = useState({
    assetIds: "",
    employeeId: "",
    locationId: "",
    notes: "",
  })

  // Mock data for dropdowns
  const mockEmployees = [
    { id: "emp_01", name: "Sarah Johnson" },
    { id: "emp_02", name: "Michael Chen" },
    { id: "emp_03", name: "Lisa Wong" },
  ]

  const mockLocations = [
    { id: "vault_main", name: "Main Vault" },
    { id: "qc_station", name: "Quality Control" },
    { id: "setting_bench", name: "Setting Bench" },
  ]

  const handleCheckOut = () => {
    if (!checkOutForm.assetId || !checkOutForm.employeeId || !checkOutForm.locationId) {
      toast.error("Please fill in all required fields")
      return
    }
    onCheckOut?.(checkOutForm.assetId)
    setCheckOutDialogOpen(false)
    setCheckOutForm({ assetId: "", employeeId: "", locationId: "", returnDate: "", notes: "" })
  }

  const handleCheckIn = () => {
    if (!checkInForm.assetId) {
      toast.error("Please enter an asset ID")
      return
    }
    onCheckIn?.(checkInForm.assetId)
    setCheckInDialogOpen(false)
    setCheckInForm({ assetId: "", notes: "" })
  }

  const handleTransfer = () => {
    if (!transferForm.assetId || !transferForm.employeeId || !transferForm.locationId) {
      toast.error("Please fill in all required fields")
      return
    }
    onTransfer?.(transferForm.assetId)
    setTransferDialogOpen(false)
    setTransferForm({ assetId: "", employeeId: "", locationId: "", notes: "" })
  }

  const handleReportMissing = () => {
    if (!reportMissingForm.assetId) {
      toast.error("Please enter an asset ID")
      return
    }
    onReportMissing?.(reportMissingForm.assetId)
    setReportMissingDialogOpen(false)
    setReportMissingForm({ assetId: "", notes: "" })
  }

  const handleBulkCheckOut = () => {
    if (!bulkForm.assetIds || !bulkForm.employeeId || !bulkForm.locationId) {
      toast.error("Please fill in all required fields")
      return
    }
    const assetIds = bulkForm.assetIds.split(",").map(id => id.trim())
    onBulkCheckOut?.(assetIds, bulkForm.employeeId, bulkForm.locationId)
    setBulkCheckOutDialogOpen(false)
    setBulkForm({ assetIds: "", employeeId: "", locationId: "", notes: "" })
  }

  const handleBulkCheckIn = () => {
    if (!bulkForm.assetIds) {
      toast.error("Please enter asset IDs")
      return
    }
    const assetIds = bulkForm.assetIds.split(",").map(id => id.trim())
    onBulkCheckIn?.(assetIds)
    setBulkCheckInDialogOpen(false)
    setBulkForm({ assetIds: "", employeeId: "", locationId: "", notes: "" })
  }

  const handleBulkTransfer = () => {
    if (!bulkForm.assetIds || !bulkForm.employeeId || !bulkForm.locationId) {
      toast.error("Please fill in all required fields")
      return
    }
    const assetIds = bulkForm.assetIds.split(",").map(id => id.trim())
    onBulkTransfer?.(assetIds)
    setBulkTransferDialogOpen(false)
    setBulkForm({ assetIds: "", employeeId: "", locationId: "", notes: "" })
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Dialog open={checkOutDialogOpen} onOpenChange={setCheckOutDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Check Out Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Check Out Asset</DialogTitle>
              <DialogDescription>
                Check out an asset to an employee or location.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="checkout-asset">Asset ID or SKU</Label>
                <Input
                  id="checkout-asset"
                  placeholder="Enter asset ID or SKU..."
                  value={checkOutForm.assetId}
                  onChange={(e) => setCheckOutForm(prev => ({ ...prev, assetId: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="checkout-employee">Employee</Label>
                <Select value={checkOutForm.employeeId} onValueChange={(value) => setCheckOutForm(prev => ({ ...prev, employeeId: value }))}>
                  <SelectTrigger id="checkout-employee">
                    <SelectValue placeholder="Select employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>{employee.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="checkout-location">Location</Label>
                <Select value={checkOutForm.locationId} onValueChange={(value) => setCheckOutForm(prev => ({ ...prev, locationId: value }))}>
                  <SelectTrigger id="checkout-location">
                    <SelectValue placeholder="Select location..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLocations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="checkout-notes">Notes (Optional)</Label>
                <Textarea
                  id="checkout-notes"
                  placeholder="Reason for check-out..."
                  value={checkOutForm.notes}
                  onChange={(e) => setCheckOutForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCheckOut} className="flex-1">
                  Check Out
                </Button>
                <Button variant="outline" onClick={() => setCheckOutDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Check In Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Check In Asset</DialogTitle>
              <DialogDescription>
                Check in an asset from an employee or location.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="checkin-asset">Asset ID or SKU</Label>
                <Input
                  id="checkin-asset"
                  placeholder="Enter asset ID or SKU..."
                  value={checkInForm.assetId}
                  onChange={(e) => setCheckInForm(prev => ({ ...prev, assetId: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="checkin-notes">Notes (Optional)</Label>
                <Textarea
                  id="checkin-notes"
                  placeholder="Condition notes, etc..."
                  value={checkInForm.notes}
                  onChange={(e) => setCheckInForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCheckIn} className="flex-1">
                  Check In
                </Button>
                <Button variant="outline" onClick={() => setCheckInDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <QrCode className="mr-2 h-4 w-4" />
              Transfer Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Asset</DialogTitle>
              <DialogDescription>
                Transfer an asset to a different location or employee.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="transfer-asset">Asset ID or SKU</Label>
                <Input
                  id="transfer-asset"
                  placeholder="Enter asset ID or SKU..."
                  value={transferForm.assetId}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, assetId: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="transfer-employee">Employee</Label>
                <Select value={transferForm.employeeId} onValueChange={(value) => setTransferForm(prev => ({ ...prev, employeeId: value }))}>
                  <SelectTrigger id="transfer-employee">
                    <SelectValue placeholder="Select employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>{employee.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="transfer-location">Destination Location</Label>
                <Select value={transferForm.locationId} onValueChange={(value) => setTransferForm(prev => ({ ...prev, locationId: value }))}>
                  <SelectTrigger id="transfer-location">
                    <SelectValue placeholder="Select location..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLocations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="transfer-notes">Notes (Optional)</Label>
                <Textarea
                  id="transfer-notes"
                  placeholder="Reason for transfer..."
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleTransfer} className="flex-1">
                  Transfer
                </Button>
                <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={reportMissingDialogOpen} onOpenChange={setReportMissingDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground">
              <FileWarning className="mr-2 h-4 w-4" />
              Report Missing
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Missing Asset</DialogTitle>
              <DialogDescription>
                Report an asset as missing or lost.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="missing-asset">Asset ID or SKU</Label>
                <Input
                  id="missing-asset"
                  placeholder="Enter asset ID or SKU..."
                  value={reportMissingForm.assetId}
                  onChange={(e) => setReportMissingForm(prev => ({ ...prev, assetId: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="missing-notes">Details (Optional)</Label>
                <Textarea
                  id="missing-notes"
                  placeholder="When was it last seen, circumstances..."
                  value={reportMissingForm.notes}
                  onChange={(e) => setReportMissingForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleReportMissing} className="flex-1">
                  Report Missing
                </Button>
                <Button variant="outline" onClick={() => setReportMissingDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">
              <ChevronsUpDown className="mr-2 h-4 w-4" />
              Bulk Operations
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setBulkCheckOutDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Check-Out
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setBulkCheckInDialogOpen(true)}>
              <Download className="mr-2 h-4 w-4" />
              Bulk Check-In
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setBulkTransferDialogOpen(true)}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Bulk Transfer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bulk Check-Out Dialog */}
      <Dialog open={bulkCheckOutDialogOpen} onOpenChange={setBulkCheckOutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Check-Out</DialogTitle>
            <DialogDescription>
              Check out multiple assets at once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="bulk-assets">Asset IDs (comma-separated)</Label>
              <Input
                id="bulk-assets"
                placeholder="asset1, asset2, asset3..."
                value={bulkForm.assetIds}
                onChange={(e) => setBulkForm(prev => ({ ...prev, assetIds: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bulk-employee">Employee</Label>
              <Select value={bulkForm.employeeId} onValueChange={(value) => setBulkForm(prev => ({ ...prev, employeeId: value }))}>
                <SelectTrigger id="bulk-employee">
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>{employee.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bulk-location">Location</Label>
              <Select value={bulkForm.locationId} onValueChange={(value) => setBulkForm(prev => ({ ...prev, locationId: value }))}>
                <SelectTrigger id="bulk-location">
                  <SelectValue placeholder="Select location..." />
                </SelectTrigger>
                <SelectContent>
                  {mockLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBulkCheckOut} className="flex-1">
                Bulk Check-Out
              </Button>
              <Button variant="outline" onClick={() => setBulkCheckOutDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Check-In Dialog */}
      <Dialog open={bulkCheckInDialogOpen} onOpenChange={setBulkCheckInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Check-In</DialogTitle>
            <DialogDescription>
              Check in multiple assets at once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="bulk-checkin-assets">Asset IDs (comma-separated)</Label>
              <Input
                id="bulk-checkin-assets"
                placeholder="asset1, asset2, asset3..."
                value={bulkForm.assetIds}
                onChange={(e) => setBulkForm(prev => ({ ...prev, assetIds: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBulkCheckIn} className="flex-1">
                Bulk Check-In
              </Button>
              <Button variant="outline" onClick={() => setBulkCheckInDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Transfer Dialog */}
      <Dialog open={bulkTransferDialogOpen} onOpenChange={setBulkTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Transfer</DialogTitle>
            <DialogDescription>
              Transfer multiple assets at once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="bulk-transfer-assets">Asset IDs (comma-separated)</Label>
              <Input
                id="bulk-transfer-assets"
                placeholder="asset1, asset2, asset3..."
                value={bulkForm.assetIds}
                onChange={(e) => setBulkForm(prev => ({ ...prev, assetIds: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bulk-transfer-employee">Employee</Label>
              <Select value={bulkForm.employeeId} onValueChange={(value) => setBulkForm(prev => ({ ...prev, employeeId: value }))}>
                <SelectTrigger id="bulk-transfer-employee">
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>{employee.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bulk-transfer-location">Destination Location</Label>
              <Select value={bulkForm.locationId} onValueChange={(value) => setBulkForm(prev => ({ ...prev, locationId: value }))}>
                <SelectTrigger id="bulk-transfer-location">
                  <SelectValue placeholder="Select location..." />
                </SelectTrigger>
                <SelectContent>
                  {mockLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBulkTransfer} className="flex-1">
                Bulk Transfer
              </Button>
              <Button variant="outline" onClick={() => setBulkTransferDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
 