"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Camera, Barcode, Keyboard } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

interface InventoryScanningProps {
  auditData: any
  updateAuditData: (data: any) => void
}

// Mock inventory data
const mockInventory = [
  {
    id: "item1",
    sku: "JR-001",
    name: "Diamond Ring",
    category: "Rings",
    location: "Display Case A",
    expectedQuantity: 3,
    actualQuantity: 0,
    status: "pending",
    image: "/gold-necklace.png",
  },
  {
    id: "item2",
    sku: "JN-002",
    name: "Gold Necklace",
    category: "Necklaces",
    location: "Display Case A",
    expectedQuantity: 2,
    actualQuantity: 0,
    status: "pending",
    image: "/gold-necklace.png",
  },
  {
    id: "item3",
    sku: "JE-003",
    name: "Pearl Earrings",
    category: "Earrings",
    location: "Display Case B",
    expectedQuantity: 5,
    actualQuantity: 0,
    status: "pending",
    image: "/pearl-earrings.png",
  },
  {
    id: "item4",
    sku: "JB-004",
    name: "Sapphire Bracelet",
    category: "Bracelets",
    location: "Display Case B",
    expectedQuantity: 1,
    actualQuantity: 0,
    status: "pending",
    image: "/emerald-bracelet.png",
  },
  {
    id: "item5",
    sku: "JP-005",
    name: "Diamond Pendant",
    category: "Pendants",
    location: "Safe 1",
    expectedQuantity: 2,
    actualQuantity: 0,
    status: "pending",
    image: "/sapphire-pendant.png",
  },
]

export function InventoryScanning({ auditData, updateAuditData }: InventoryScanningProps) {
  const [activeLocation, setActiveLocation] = useState<string | null>(null)
  const [inventory, setInventory] = useState<any[]>([])
  const [scannedItems, setScannedItems] = useState<any[]>(auditData.scannedItems || [])
  const [manualEntryOpen, setManualEntryOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<any | null>(null)
  const [scanInput, setScanInput] = useState("")
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false)
  const [discrepancies, setDiscrepancies] = useState<any[]>([])
  const [scanMode, setScanMode] = useState<"barcode" | "manual">("barcode")
  const [filterMode, setFilterMode] = useState<"all" | "pending" | "scanned" | "discrepancy">("all")

  // Initialize with mock data
  useEffect(() => {
    if (auditData.locations && auditData.locations.length > 0) {
      setActiveLocation(auditData.locations[0])
    }

    // Filter inventory based on selected locations
    const filteredInventory = mockInventory.filter((item) =>
      auditData.locations.some((locId: string) => {
        // This is a simplified check - in a real app, you'd have a proper location hierarchy
        return item.location.includes(locId) || locId.includes(item.location)
      }),
    )

    setInventory(filteredInventory)
  }, [auditData.locations])

  // Update parent component when scanned items change
  useEffect(() => {
    updateAuditData({
      scannedItems,
      discrepancies,
    })
  }, [scannedItems, discrepancies, updateAuditData])

  const handleScan = () => {
    // In a real app, this would trigger the barcode scanner
    // For this demo, we'll simulate finding an item
    const randomIndex = Math.floor(Math.random() * inventory.length)
    const scannedItem = inventory[randomIndex]

    if (scannedItem) {
      setCurrentItem(scannedItem)
      setManualEntryOpen(true)
    }
  }

  const handleManualSearch = () => {
    if (!scanInput) return

    // Find item by SKU
    const foundItem = inventory.find(
      (item) => item.sku.toLowerCase() === scanInput.toLowerCase() || item.id.toLowerCase() === scanInput.toLowerCase(),
    )

    if (foundItem) {
      setCurrentItem(foundItem)
      setManualEntryOpen(true)
    } else {
      alert("Item not found. Please check the SKU and try again.")
    }
  }

  const handleQuantitySubmit = (quantity: number) => {
    if (!currentItem) return

    const updatedItem = {
      ...currentItem,
      actualQuantity: quantity,
      status: "scanned",
      scannedAt: new Date(),
      scannedBy: "John Doe", // In a real app, this would be the current user
    }

    // Check for discrepancy
    if (quantity !== currentItem.expectedQuantity) {
      updatedItem.status = "discrepancy"

      // Add to discrepancies list
      const discrepancyItem = {
        ...updatedItem,
        discrepancyType: quantity > currentItem.expectedQuantity ? "excess" : "shortage",
        difference: quantity - currentItem.expectedQuantity,
      }

      setDiscrepancies((prev) => {
        const existing = prev.findIndex((d) => d.id === discrepancyItem.id)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = discrepancyItem
          return updated
        }
        return [...prev, discrepancyItem]
      })
    }

    // Update scanned items
    setScannedItems((prev) => {
      const existing = prev.findIndex((item) => item.id === updatedItem.id)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = updatedItem
        return updated
      }
      return [...prev, updatedItem]
    })

    setManualEntryOpen(false)
    setCurrentItem(null)
    setScanInput("")
  }

  const handleTakePhoto = () => {
    // In a real app, this would open the camera
    setPhotoDialogOpen(true)
  }

  const handlePhotoCapture = () => {
    // In a real app, this would save the captured photo
    alert("Photo captured and attached to the item.")
    setPhotoDialogOpen(false)
  }

  const getFilteredInventory = () => {
    switch (filterMode) {
      case "pending":
        return inventory.filter((item) => !scannedItems.some((s) => s.id === item.id))
      case "scanned":
        return scannedItems.filter((item) => item.status === "scanned")
      case "discrepancy":
        return scannedItems.filter((item) => item.status === "discrepancy")
      case "all":
      default:
        return inventory.map((item) => {
          const scanned = scannedItems.find((s) => s.id === item.id)
          return scanned || item
        })
    }
  }

  const filteredInventory = getFilteredInventory()
  const progress = (scannedItems.length / inventory.length) * 100

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Inventory Scanning</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Scan or manually count inventory items in the selected locations.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Progress: {scannedItems.length} of {inventory.length} items
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Location Selector */}
      <div className="space-y-2">
        <Label>Active Location</Label>
        <div className="flex flex-wrap gap-2">
          {auditData.locations.map((locId: string) => (
            <Button
              key={locId}
              variant={activeLocation === locId ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveLocation(locId)}
            >
              {locId}
            </Button>
          ))}
        </div>
      </div>

      {/* Scan Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Scan Items</CardTitle>
          <CardDescription>Use barcode scanner or enter SKU manually to count items</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="barcode" value={scanMode} onValueChange={(v) => setScanMode(v as "barcode" | "manual")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="barcode">
                <Barcode className="h-4 w-4 mr-2" />
                Barcode Scanner
              </TabsTrigger>
              <TabsTrigger value="manual">
                <Keyboard className="h-4 w-4 mr-2" />
                Manual Entry
              </TabsTrigger>
            </TabsList>
            <TabsContent value="barcode" className="space-y-4 pt-4">
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Barcode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h4 className="text-lg font-medium mb-2">Ready to Scan</h4>
                <p className="text-sm text-muted-foreground mb-4">Point your barcode scanner at the item's barcode</p>
                <Button onClick={handleScan}>Start Scanning</Button>
              </div>
            </TabsContent>
            <TabsContent value="manual" className="space-y-4 pt-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter SKU or Item ID"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                />
                <Button onClick={handleManualSearch}>Search</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Inventory Items</h4>
          <div className="flex space-x-2">
            <Button
              variant={filterMode === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("all")}
            >
              All
            </Button>
            <Button
              variant={filterMode === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("pending")}
            >
              Pending
            </Button>
            <Button
              variant={filterMode === "scanned" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("scanned")}
            >
              Scanned
            </Button>
            <Button
              variant={filterMode === "discrepancy" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("discrepancy")}
            >
              Discrepancies
            </Button>
          </div>
        </div>

        <div className="border rounded-md">
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Expected</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell className="text-right">{auditData.isBlindCount ? "—" : item.expectedQuantity}</TableCell>
                    <TableCell className="text-right">
                      {item.status === "pending" ? "—" : item.actualQuantity}
                    </TableCell>
                    <TableCell>
                      {item.status === "pending" && (
                        <Badge variant="outline" className="bg-muted">
                          Pending
                        </Badge>
                      )}
                      {item.status === "scanned" && <Badge className="bg-green-500">Counted</Badge>}
                      {item.status === "discrepancy" && <Badge className="bg-amber-500">Discrepancy</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentItem(item)
                          setManualEntryOpen(true)
                        }}
                      >
                        {item.status === "pending" ? "Count" : "Edit"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>

      {/* Manual Entry Dialog */}
      <Dialog open={manualEntryOpen} onOpenChange={setManualEntryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Item Count</DialogTitle>
            <DialogDescription>
              {currentItem?.name} ({currentItem?.sku})
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              {currentItem?.image && (
                <div className="w-20 h-20 rounded-md overflow-hidden bg-muted">
                  <img
                    src={currentItem.image || "/placeholder.svg"}
                    alt={currentItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h4 className="font-medium">{currentItem?.name}</h4>
                <p className="text-sm text-muted-foreground">SKU: {currentItem?.sku}</p>
                <p className="text-sm text-muted-foreground">Location: {currentItem?.location}</p>
                {!auditData.isBlindCount && (
                  <p className="text-sm">Expected Quantity: {currentItem?.expectedQuantity}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Actual Quantity</Label>
              <Input id="quantity" type="number" min="0" defaultValue={currentItem?.actualQuantity || 0} />
            </div>

            <div className="space-y-2">
              <Label>Photo Documentation</Label>
              <Button variant="outline" className="w-full" onClick={handleTakePhoto}>
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" placeholder="Add any notes about this item" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManualEntryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleQuantitySubmit(3)}>Save Count</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Take Photo</DialogTitle>
            <DialogDescription>Take a photo of the item for documentation</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="bg-muted h-64 rounded-md flex items-center justify-center">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePhotoCapture}>Capture Photo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
