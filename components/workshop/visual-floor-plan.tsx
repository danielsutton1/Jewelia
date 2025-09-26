"use client"

import type React from "react"

import { useState, useRef } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  WorkshopData,
  WorkstationType,
  EquipmentType,
  StorageType,
  SafetyZoneType,
  WorkstationItem,
  EquipmentItem,
  StorageItem,
  SafetyZoneItem,
} from "./mock-data"
import {
  Hammer,
  Printer,
  Package,
  ShieldAlert,
  RotateCw,
  Trash2,
  Undo,
  Redo,
  Plus,
  Minus,
  Download,
  Upload,
} from "lucide-react"

interface VisualFloorPlanProps {
  workshopData: WorkshopData
  onWorkshopDataChange: (data: WorkshopData) => void
}

// Item types for drag and drop
const ItemTypes = {
  WORKSTATION: "workstation",
  EQUIPMENT: "equipment",
  STORAGE: "storage",
  SAFETY_ZONE: "safety_zone",
  NEW_WORKSTATION: "new_workstation",
  NEW_EQUIPMENT: "new_equipment",
  NEW_STORAGE: "new_storage",
  NEW_SAFETY_ZONE: "new_safety_zone",
}

// Helper function to generate unique IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`

export function VisualFloorPlan({ workshopData, onWorkshopDataChange }: VisualFloorPlanProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [history, setHistory] = useState<WorkshopData[]>([workshopData])
  const [historyIndex, setHistoryIndex] = useState(0)
  const floorPlanRef = useRef<HTMLDivElement>(null)

  // Function to add item to history
  const addToHistory = (newData: WorkshopData) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newData)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      onWorkshopDataChange(JSON.parse(JSON.stringify(history[historyIndex - 1])))
    }
  }

  // Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      onWorkshopDataChange(JSON.parse(JSON.stringify(history[historyIndex + 1])))
    }
  }

  // Function to handle item movement
  const moveItem = (id: string, type: string, left: number, top: number) => {
    const newData = { ...workshopData }

    if (type === ItemTypes.WORKSTATION) {
      const index = newData.workstations.findIndex((item) => item.id === id)
      if (index !== -1) {
        newData.workstations[index].position.x = left
        newData.workstations[index].position.y = top
      }
    } else if (type === ItemTypes.EQUIPMENT) {
      const index = newData.equipment.findIndex((item) => item.id === id)
      if (index !== -1) {
        newData.equipment[index].position.x = left
        newData.equipment[index].position.y = top
      }
    } else if (type === ItemTypes.STORAGE) {
      const index = newData.storage.findIndex((item) => item.id === id)
      if (index !== -1) {
        newData.storage[index].position.x = left
        newData.storage[index].position.y = top
      }
    } else if (type === ItemTypes.SAFETY_ZONE) {
      const index = newData.safetyZones.findIndex((item) => item.id === id)
      if (index !== -1) {
        newData.safetyZones[index].position.x = left
        newData.safetyZones[index].position.y = top
      }
    }

    onWorkshopDataChange(newData)
    addToHistory(newData)
  }

  // Function to handle item rotation
  const rotateItem = (id: string, type: string) => {
    const newData = { ...workshopData }

    if (type === ItemTypes.WORKSTATION) {
      const index = newData.workstations.findIndex((item) => item.id === id)
      if (index !== -1) {
        newData.workstations[index].rotation = (newData.workstations[index].rotation + 90) % 360
      }
    } else if (type === ItemTypes.EQUIPMENT) {
      const index = newData.equipment.findIndex((item) => item.id === id)
      if (index !== -1) {
        newData.equipment[index].rotation = (newData.equipment[index].rotation + 90) % 360
      }
    } else if (type === ItemTypes.STORAGE) {
      const index = newData.storage.findIndex((item) => item.id === id)
      if (index !== -1) {
        newData.storage[index].rotation = (newData.storage[index].rotation + 90) % 360
      }
    } else if (type === ItemTypes.SAFETY_ZONE) {
      const index = newData.safetyZones.findIndex((item) => item.id === id)
      if (index !== -1) {
        newData.safetyZones[index].rotation = (newData.safetyZones[index].rotation + 90) % 360
      }
    }

    onWorkshopDataChange(newData)
    addToHistory(newData)
  }

  // Function to handle item deletion
  const deleteItem = (id: string, type: string) => {
    const newData = { ...workshopData }

    if (type === ItemTypes.WORKSTATION) {
      newData.workstations = newData.workstations.filter((item) => item.id !== id)
    } else if (type === ItemTypes.EQUIPMENT) {
      newData.equipment = newData.equipment.filter((item) => item.id !== id)
    } else if (type === ItemTypes.STORAGE) {
      newData.storage = newData.storage.filter((item) => item.id !== id)
    } else if (type === ItemTypes.SAFETY_ZONE) {
      newData.safetyZones = newData.safetyZones.filter((item) => item.id !== id)
    }

    setSelectedItemId(null)
    onWorkshopDataChange(newData)
    addToHistory(newData)
  }

  // Function to add new workstation
  const addWorkstation = (type: WorkstationType) => {
    const newWorkstation: WorkstationItem = {
      id: generateId("ws"),
      type,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Station`,
      position: { x: 50, y: 50 },
      size: { width: 120, height: 80 },
      rotation: 0,
      assignedCraftspeople: [],
      assignedEquipment: [],
      currentProjects: [],
      isActive: false,
    }

    const newData = {
      ...workshopData,
      workstations: [...workshopData.workstations, newWorkstation],
    }

    onWorkshopDataChange(newData)
    addToHistory(newData)
    setSelectedItemId(newWorkstation.id)
  }

  // Function to add new equipment
  const addEquipment = (type: EquipmentType) => {
    const newEquipment: EquipmentItem = {
      id: generateId("eq"),
      type,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      position: { x: 50, y: 50 },
      size: { width: 40, height: 40 },
      rotation: 0,
      assignedWorkstation: null,
      isInUse: false,
      maintenanceStatus: "good",
    }

    const newData = {
      ...workshopData,
      equipment: [...workshopData.equipment, newEquipment],
    }

    onWorkshopDataChange(newData)
    addToHistory(newData)
    setSelectedItemId(newEquipment.id)
  }

  // Function to add new storage
  const addStorage = (type: StorageType) => {
    const newStorage: StorageItem = {
      id: generateId("st"),
      type,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Storage`,
      position: { x: 50, y: 50 },
      size: { width: 80, height: 60 },
      rotation: 0,
      contents: [],
      capacityUsed: 0,
      totalCapacity: 100,
    }

    const newData = {
      ...workshopData,
      storage: [...workshopData.storage, newStorage],
    }

    onWorkshopDataChange(newData)
    addToHistory(newData)
    setSelectedItemId(newStorage.id)
  }

  // Function to add new safety zone
  const addSafetyZone = (type: SafetyZoneType) => {
    const newSafetyZone: SafetyZoneItem = {
      id: generateId("sz"),
      type,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      position: { x: 50, y: 50 },
      size: { width: 30, height: 30 },
      rotation: 0,
      lastInspected: new Date().toISOString().split("T")[0],
      status: "good",
    }

    const newData = {
      ...workshopData,
      safetyZones: [...workshopData.safetyZones, newSafetyZone],
    }

    onWorkshopDataChange(newData)
    addToHistory(newData)
    setSelectedItemId(newSafetyZone.id)
  }

  // Function to export floor plan
  const exportFloorPlan = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workshopData))
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "workshop_floor_plan.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  // Function to import floor plan
  const importFloorPlan = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader()
    fileReader.readAsText(event.target.files![0], "UTF-8")
    fileReader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsedData = JSON.parse(content) as WorkshopData
        onWorkshopDataChange(parsedData)
        addToHistory(parsedData)
      } catch (error) {
        console.error("Error importing floor plan:", error)
      }
    }
  }

  // Function to zoom in
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2))
  }

  // Function to zoom out
  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5))
  }

  // Function to reset zoom
  const resetZoom = () => {
    setScale(1)
  }

  // Get selected item details
  const getSelectedItem = () => {
    if (!selectedItemId) return null

    const workstation = workshopData.workstations.find((item) => item.id === selectedItemId)
    if (workstation) return { ...workstation, itemType: ItemTypes.WORKSTATION }

    const equipment = workshopData.equipment.find((item) => item.id === selectedItemId)
    if (equipment) return { ...equipment, itemType: ItemTypes.EQUIPMENT }

    const storage = workshopData.storage.find((item) => item.id === selectedItemId)
    if (storage) return { ...storage, itemType: ItemTypes.STORAGE }

    const safetyZone = workshopData.safetyZones.find((item) => item.id === selectedItemId)
    if (safetyZone) return { ...safetyZone, itemType: ItemTypes.SAFETY_ZONE }

    return null
  }

  // Update selected item name
  const updateItemName = (name: string) => {
    const selectedItem = getSelectedItem()
    if (!selectedItem) return

    const newData = { ...workshopData }

    if (selectedItem.itemType === ItemTypes.WORKSTATION) {
      const index = newData.workstations.findIndex((item) => item.id === selectedItemId)
      if (index !== -1) {
        newData.workstations[index].name = name
      }
    } else if (selectedItem.itemType === ItemTypes.EQUIPMENT) {
      const index = newData.equipment.findIndex((item) => item.id === selectedItemId)
      if (index !== -1) {
        newData.equipment[index].name = name
      }
    } else if (selectedItem.itemType === ItemTypes.STORAGE) {
      const index = newData.storage.findIndex((item) => item.id === selectedItemId)
      if (index !== -1) {
        newData.storage[index].name = name
      }
    } else if (selectedItem.itemType === ItemTypes.SAFETY_ZONE) {
      const index = newData.safetyZones.findIndex((item) => item.id === selectedItemId)
      if (index !== -1) {
        newData.safetyZones[index].name = name
      }
    }

    onWorkshopDataChange(newData)
  }

  // Draggable item component
  const DraggableItem = ({
    id,
    type,
    left,
    top,
    width,
    height,
    rotation,
    children,
    isSelected,
  }: {
    id: string
    type: string
    left: number
    top: number
    width: number
    height: number
    rotation: number
    children: React.ReactNode
    isSelected: boolean
  }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type,
      item: { id, type },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }))

    return (
      <div
        ref={drag as any}
        style={{
          position: "absolute",
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
          transform: `rotate(${rotation}deg)`,
          opacity: isDragging ? 0.5 : 1,
          cursor: "move",
          border: isSelected ? "2px solid #0ea5e9" : "1px solid #e2e8f0",
          borderRadius: "4px",
          backgroundColor: isSelected ? "rgba(14, 165, 233, 0.1)" : "rgba(255, 255, 255, 0.8)",
          zIndex: isSelected ? 100 : 10,
        }}
        onClick={(e) => {
          e.stopPropagation()
          setSelectedItemId(id)
        }}
      >
        {children}
      </div>
    )
  }

  // Droppable floor plan component
  const FloorPlan = () => {
    const [, drop] = useDrop(() => ({
      accept: [ItemTypes.WORKSTATION, ItemTypes.EQUIPMENT, ItemTypes.STORAGE, ItemTypes.SAFETY_ZONE],
      drop: (item: { id: string; type: string }, monitor) => {
        const delta = monitor.getDifferenceFromInitialOffset()
        if (!delta) return

        // Find the item in the workshop data
        let currentPosition = { x: 0, y: 0 }

        if (item.type === ItemTypes.WORKSTATION) {
          const workstation = workshopData.workstations.find((w) => w.id === item.id)
          if (workstation) currentPosition = workstation.position
        } else if (item.type === ItemTypes.EQUIPMENT) {
          const equipment = workshopData.equipment.find((e) => e.id === item.id)
          if (equipment) currentPosition = equipment.position
        } else if (item.type === ItemTypes.STORAGE) {
          const storage = workshopData.storage.find((s) => s.id === item.id)
          if (storage) currentPosition = storage.position
        } else if (item.type === ItemTypes.SAFETY_ZONE) {
          const safetyZone = workshopData.safetyZones.find((s) => s.id === item.id)
          if (safetyZone) currentPosition = safetyZone.position
        }

        const left = Math.round(currentPosition.x + delta.x)
        const top = Math.round(currentPosition.y + delta.y)

        moveItem(item.id, item.type, left, top)
      },
    }))

    return (
      <div
        ref={drop as any}
        style={{
          position: "relative",
          width: `${workshopData.workshopDimensions.width}px`,
          height: `${workshopData.workshopDimensions.height}px`,
          backgroundColor: "#f8fafc",
          backgroundImage:
            "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          border: "1px solid #e2e8f0",
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          transition: "transform 0.2s ease",
        }}
        onClick={() => setSelectedItemId(null)}
      >
        {/* Render workstations */}
        {workshopData.workstations.map((workstation) => (
          <DraggableItem
            key={workstation.id}
            id={workstation.id}
            type={ItemTypes.WORKSTATION}
            left={workstation.position.x}
            top={workstation.position.y}
            width={workstation.size.width}
            height={workstation.size.height}
            rotation={workstation.rotation}
            isSelected={selectedItemId === workstation.id}
          >
            <div className="flex flex-col items-center justify-center h-full p-2 text-center">
              <Hammer className="w-6 h-6 mb-1" />
              <div className="text-xs font-medium truncate w-full">{workstation.name}</div>
              <div className="text-xs text-muted-foreground truncate w-full">
                {workstation.isActive ? "Active" : "Inactive"}
              </div>
            </div>
          </DraggableItem>
        ))}

        {/* Render equipment */}
        {workshopData.equipment.map((equipment) => (
          <DraggableItem
            key={equipment.id}
            id={equipment.id}
            type={ItemTypes.EQUIPMENT}
            left={equipment.position.x}
            top={equipment.position.y}
            width={equipment.size.width}
            height={equipment.size.height}
            rotation={equipment.rotation}
            isSelected={selectedItemId === equipment.id}
          >
            <div className="flex flex-col items-center justify-center h-full p-1 text-center">
              <Printer className="w-5 h-5 mb-1" />
              <div className="text-xs font-medium truncate w-full">{equipment.name}</div>
            </div>
          </DraggableItem>
        ))}

        {/* Render storage */}
        {workshopData.storage.map((storage) => (
          <DraggableItem
            key={storage.id}
            id={storage.id}
            type={ItemTypes.STORAGE}
            left={storage.position.x}
            top={storage.position.y}
            width={storage.size.width}
            height={storage.size.height}
            rotation={storage.rotation}
            isSelected={selectedItemId === storage.id}
          >
            <div className="flex flex-col items-center justify-center h-full p-1 text-center">
              <Package className="w-5 h-5 mb-1" />
              <div className="text-xs font-medium truncate w-full">{storage.name}</div>
            </div>
          </DraggableItem>
        ))}

        {/* Render safety zones */}
        {workshopData.safetyZones.map((safetyZone) => (
          <DraggableItem
            key={safetyZone.id}
            id={safetyZone.id}
            type={ItemTypes.SAFETY_ZONE}
            left={safetyZone.position.x}
            top={safetyZone.position.y}
            width={safetyZone.size.width}
            height={safetyZone.size.height}
            rotation={safetyZone.rotation}
            isSelected={selectedItemId === safetyZone.id}
          >
            <div className="flex flex-col items-center justify-center h-full p-1 text-center">
              <ShieldAlert className="w-5 h-5 mb-1" />
              <div className="text-xs font-medium truncate w-full">{safetyZone.name}</div>
            </div>
          </DraggableItem>
        ))}
      </div>
    )
  }

  const selectedItem = getSelectedItem()

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleUndo} disabled={historyIndex === 0} className="min-h-[44px]">
                    <Undo className="h-4 w-4 mr-1" />
                    Undo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRedo}
                    disabled={historyIndex === history.length - 1}
                    className="min-h-[44px]"
                  >
                    <Redo className="h-4 w-4 mr-1" />
                    Redo
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={zoomOut} className="min-h-[44px] min-w-[44px]">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetZoom} className="min-h-[44px]">
                    {Math.round(scale * 100)}%
                  </Button>
                  <Button variant="outline" size="sm" onClick={zoomIn} className="min-h-[44px] min-w-[44px]">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={exportFloorPlan} className="min-h-[44px]">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" asChild className="min-h-[44px]">
                    <label>
                      <Upload className="h-4 w-4 mr-1" />
                      Import
                      <input type="file" accept=".json" className="hidden" onChange={importFloorPlan} />
                    </label>
                  </Button>
                </div>
              </div>
              <div
                ref={floorPlanRef}
                className="overflow-auto border rounded-md"
                style={{
                  height: "400px",
                  maxWidth: "100%",
                }}
              >
                <FloorPlan />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-4">
              <Tabs defaultValue="add">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="add">Add Items</TabsTrigger>
                  <TabsTrigger value="edit" disabled={!selectedItem}>
                    Properties
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="add" className="space-y-4 mt-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Workstations</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => addWorkstation("design")} className="min-h-[44px]">
                        Design
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addWorkstation("casting")} className="min-h-[44px]">
                        Casting
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addWorkstation("stone-setting")} className="min-h-[44px]">
                        Stone Setting
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addWorkstation("polishing")} className="min-h-[44px]">
                        Polishing
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addWorkstation("engraving")} className="min-h-[44px]">
                        Engraving
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addWorkstation("quality-control")} className="min-h-[44px]">
                        QC
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Equipment</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => addEquipment("3d-printer")} className="min-h-[44px]">
                        3D Printer
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addEquipment("casting-machine")} className="min-h-[44px]">
                        Casting
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addEquipment("laser-welder")} className="min-h-[44px]">
                        Laser Welder
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addEquipment("polishing-machine")} className="min-h-[44px]">
                        Polishing
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addEquipment("microscope")} className="min-h-[44px]">
                        Microscope
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addEquipment("engraving-machine")} className="min-h-[44px]">
                        Engraving
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Storage</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => addStorage("materials")} className="min-h-[44px]">
                        Materials
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addStorage("tools")} className="min-h-[44px]">
                        Tools
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addStorage("finished-products")} className="min-h-[44px]">
                        Finished
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addStorage("work-in-progress")} className="min-h-[44px]">
                        WIP
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Safety Zones</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => addSafetyZone("emergency-exit")} className="min-h-[44px]">
                        Exit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addSafetyZone("fire-extinguisher")} className="min-h-[44px]">
                        Fire Ext.
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addSafetyZone("first-aid")} className="min-h-[44px]">
                        First Aid
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addSafetyZone("eye-wash")} className="min-h-[44px]">
                        Eye Wash
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="edit" className="space-y-4 mt-4">
                  {selectedItem && (
                    <>
                      <div>
                        <Label htmlFor="item-name">Name</Label>
                        <Input
                          id="item-name"
                          value={selectedItem.name}
                          onChange={(e) => updateItemName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <div className="text-sm mt-1">{selectedItem.type}</div>
                      </div>
                      <div>
                        <Label>Position</Label>
                        <div className="text-sm mt-1">
                          X: {selectedItem.position.x}, Y: {selectedItem.position.y}
                        </div>
                      </div>
                      <div>
                        <Label>Size</Label>
                        <div className="text-sm mt-1">
                          W: {selectedItem.size.width}, H: {selectedItem.size.height}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rotateItem(selectedItem.id, selectedItem.itemType)}
                          className="min-h-[44px]"
                        >
                          <RotateCw className="h-4 w-4 mr-1" />
                          Rotate
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteItem(selectedItem.id, selectedItem.itemType)}
                          className="min-h-[44px]"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DndProvider>
  )
}
