"use client"

import { useState } from "react"
import { Check, Clock, AlertTriangle, X, Search, Plus, QrCode, Filter, Download, Edit, Trash2, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EquipmentDetailsDialog } from "./equipment-details-dialog"
import { QRCodeDialog } from "./qr-code-dialog"
import { AddEquipmentDialog } from "./add-equipment-dialog"
import { EditEquipmentDialog } from "./edit-equipment-dialog"
import { toast } from "@/components/ui/use-toast"

// Sample equipment data
const equipmentData = [
  {
    id: "EQ001",
    name: "Laser Welder",
    type: "Welding",
    status: "operational",
    lastMaintenance: "2023-04-15",
    nextMaintenance: "2023-07-15",
    usageHours: 1245,
    location: "Main Workshop",
    department: "Production",
    purchaseDate: "2020-06-10",
    serialNumber: "LW-2020-45678",
    manufacturer: "JewelTech",
    model: "LW-5000",
  },
  {
    id: "EQ002",
    name: "Casting Machine",
    type: "Casting",
    status: "maintenance",
    lastMaintenance: "2023-05-20",
    nextMaintenance: "2023-05-25",
    usageHours: 2340,
    location: "Casting Room",
    department: "Production",
    purchaseDate: "2019-03-22",
    serialNumber: "CM-2019-12345",
    manufacturer: "MetalCast",
    model: "ProCast 3000",
  },
  {
    id: "EQ003",
    name: "Polishing Machine",
    type: "Finishing",
    status: "out-of-order",
    lastMaintenance: "2023-03-10",
    nextMaintenance: "2023-06-10",
    usageHours: 3560,
    location: "Finishing Area",
    department: "Finishing",
    purchaseDate: "2021-01-15",
    serialNumber: "PM-2021-98765",
    manufacturer: "PolishPro",
    model: "PP-2000",
  },
  {
    id: "EQ004",
    name: "Microscope",
    type: "Quality Control",
    status: "operational",
    lastMaintenance: "2023-05-01",
    nextMaintenance: "2023-08-01",
    usageHours: 890,
    location: "QC Lab",
    department: "Quality Control",
    purchaseDate: "2022-02-28",
    serialNumber: "MS-2022-24680",
    manufacturer: "OptiView",
    model: "Precision 4K",
  },
  {
    id: "EQ005",
    name: "Stone Setting Workstation",
    type: "Setting",
    status: "operational",
    lastMaintenance: "2023-04-25",
    nextMaintenance: "2023-07-25",
    usageHours: 1780,
    location: "Setting Room",
    department: "Stone Setting",
    purchaseDate: "2021-09-12",
    serialNumber: "SSW-2021-13579",
    manufacturer: "SetMaster",
    model: "Pro Station 2",
  },
  {
    id: "EQ006",
    name: "Ultrasonic Cleaner",
    type: "Cleaning",
    status: "maintenance",
    lastMaintenance: "2023-05-15",
    nextMaintenance: "2023-05-18",
    usageHours: 2100,
    location: "Cleaning Area",
    department: "Finishing",
    purchaseDate: "2020-11-05",
    serialNumber: "UC-2020-97531",
    manufacturer: "CleanTech",
    model: "SonicPro 500",
  },
  {
    id: "EQ007",
    name: "3D Printer",
    type: "Prototyping",
    status: "operational",
    lastMaintenance: "2023-05-10",
    nextMaintenance: "2023-08-10",
    usageHours: 950,
    location: "Design Studio",
    department: "Design",
    purchaseDate: "2022-04-18",
    serialNumber: "3DP-2022-24680",
    manufacturer: "FormTech",
    model: "Jewel 3D Pro",
  },
]

export function EquipmentList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [equipmentToEdit, setEquipmentToEdit] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [equipment, setEquipment] = useState(equipmentData)

  const filteredEquipment = equipment.filter(
    (item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.department.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      
      return matchesSearch && matchesStatus
    }
  )

  const handleAddEquipment = (newEquipment: any) => {
    const equipmentWithId = {
      ...newEquipment,
      id: `EQ${String(equipment.length + 1).padStart(3, '0')}`,
      usageHours: 0
    }
    setEquipment(prev => [...prev, equipmentWithId])
    setShowAddDialog(false)
    toast({
      title: "Equipment Added",
      description: `${newEquipment.name} has been added to the inventory.`
    })
  }

  const handleEditEquipment = (updatedEquipment: any) => {
    setEquipment(prev => prev.map(item => 
      item.id === updatedEquipment.id ? updatedEquipment : item
    ))
    setShowEditDialog(false)
    setEquipmentToEdit(null)
    toast({
      title: "Equipment Updated",
      description: `${updatedEquipment.name} has been updated successfully.`
    })
  }

  const handleDeleteEquipment = (equipmentId: string) => {
    const equipmentToDelete = equipment.find(eq => eq.id === equipmentId)
    setEquipment(prev => prev.filter(item => item.id !== equipmentId))
    toast({
      title: "Equipment Deleted",
      description: `${equipmentToDelete?.name} has been removed from the inventory.`
    })
  }

  const handleExportData = () => {
    const csvContent = [
      ['ID', 'Name', 'Type', 'Status', 'Usage Hours', 'Location', 'Department', 'Next Maintenance'],
      ...filteredEquipment.map(eq => [
        eq.id,
        eq.name,
        eq.type,
        eq.status,
        eq.usageHours,
        eq.location,
        eq.department,
        new Date(eq.nextMaintenance).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `equipment-inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Export Complete",
      description: "Equipment data has been exported as CSV."
    })
  }

  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter)
  }

  const handleViewDetails = (equipment: any) => {
    setSelectedEquipment(equipment)
  }

  const handleEdit = (equipment: any) => {
    setEquipmentToEdit(equipment)
    setShowEditDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <Check className="mr-1 h-3 w-3" /> Operational
          </Badge>
        )
      case "maintenance":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="mr-1 h-3 w-3" /> Maintenance
          </Badge>
        )
      case "out-of-order":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <X className="mr-1 h-3 w-3" /> Out of Order
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">
            <AlertTriangle className="mr-1 h-3 w-3" /> Unknown
          </Badge>
        )
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              className="pl-8 rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleFilterChange("all")}>
                  All Equipment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("operational")}>
                  Operational Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("maintenance")}>
                  Maintenance Required
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("out-of-order")}>
                  Out of Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon" onClick={handleExportData}>
              <Download className="h-4 w-4" />
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Equipment
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Equipment Inventory ({filteredEquipment.length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage Hours</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Next Maintenance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipment.map((equipment) => (
                    <TableRow key={equipment.id}>
                      <TableCell>{equipment.id}</TableCell>
                      <TableCell className="font-medium">{equipment.name}</TableCell>
                      <TableCell>{equipment.type}</TableCell>
                      <TableCell>{getStatusBadge(equipment.status)}</TableCell>
                      <TableCell>{equipment.usageHours}</TableCell>
                      <TableCell>{equipment.location}</TableCell>
                      <TableCell>{equipment.department}</TableCell>
                      <TableCell>{new Date(equipment.nextMaintenance).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" title="Actions">
                              <span className="sr-only">Open actions</span>
                              <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="4" cy="10" r="1.5" fill="currentColor"/><circle cx="10" cy="10" r="1.5" fill="currentColor"/><circle cx="16" cy="10" r="1.5" fill="currentColor"/></svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedEquipment(equipment); setShowQRCode(true); }}>
                              <QrCode className="h-4 w-4 mr-2" /> QR Code
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDetails(equipment)}>
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(equipment)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteEquipment(equipment.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedEquipment && !showQRCode && (
        <EquipmentDetailsDialog
          equipment={selectedEquipment}
          open={!!selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
        />
      )}

      {selectedEquipment && showQRCode && (
        <QRCodeDialog
          equipment={selectedEquipment}
          open={showQRCode}
          onClose={() => {
            setShowQRCode(false)
            setSelectedEquipment(null)
          }}
        />
      )}

      <AddEquipmentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddEquipment}
      />

      {equipmentToEdit && (
        <EditEquipmentDialog
          equipment={equipmentToEdit}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={handleEditEquipment}
        />
      )}
    </>
  )
}
