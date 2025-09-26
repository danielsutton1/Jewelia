"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, Filter, Plus, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

// Sample work orders for demonstration
const workOrders = [
  {
    id: "WO-1001",
    customer: "Emma Thompson",
    item: "Diamond Stud Earrings",
    material: "14K White Gold",
    gemstones: "Diamond",
    stage: "Design",
    dueDate: "2023-07-15",
  },
  {
    id: "WO-1002",
    customer: "Michael Chen",
    item: "Diamond Stud Earrings",
    material: "14K White Gold",
    gemstones: "Diamond",
    stage: "Design",
    dueDate: "2023-07-18",
  },
  {
    id: "WO-1003",
    customer: "Sophia Rodriguez",
    item: "Diamond Pendant",
    material: "14K White Gold",
    gemstones: "Diamond",
    stage: "Design",
    dueDate: "2023-07-20",
  },
  {
    id: "WO-1004",
    customer: "James Wilson",
    item: "Diamond Tennis Bracelet",
    material: "14K White Gold",
    gemstones: "Diamond",
    stage: "Design",
    dueDate: "2023-07-22",
  },
  {
    id: "WO-1005",
    customer: "Olivia Martinez",
    item: "Sapphire Ring",
    material: "18K Yellow Gold",
    gemstones: "Sapphire",
    stage: "Design",
    dueDate: "2023-07-25",
  },
  {
    id: "WO-1006",
    customer: "William Taylor",
    item: "Ruby Earrings",
    material: "18K Yellow Gold",
    gemstones: "Ruby",
    stage: "Design",
    dueDate: "2023-07-28",
  },
  {
    id: "WO-1007",
    customer: "Ava Thompson",
    item: "Emerald Pendant",
    material: "18K Yellow Gold",
    gemstones: "Emerald",
    stage: "Design",
    dueDate: "2023-07-30",
  },
]

// Sample materials for grouping
const materials = [
  { value: "14k-white-gold", label: "14K White Gold" },
  { value: "14k-yellow-gold", label: "14K Yellow Gold" },
  { value: "14k-rose-gold", label: "14K Rose Gold" },
  { value: "18k-white-gold", label: "18K White Gold" },
  { value: "18k-yellow-gold", label: "18K Yellow Gold" },
  { value: "18k-rose-gold", label: "18K Rose Gold" },
  { value: "platinum", label: "Platinum" },
  { value: "silver", label: "Sterling Silver" },
]

// Sample processes for grouping
const processes = [
  { value: "casting", label: "Casting" },
  { value: "stone-setting", label: "Stone Setting" },
  { value: "polishing", label: "Polishing" },
  { value: "engraving", label: "Engraving" },
  { value: "plating", label: "Plating" },
]

// Sample item types for grouping
const itemTypes = [
  { value: "ring", label: "Rings" },
  { value: "earring", label: "Earrings" },
  { value: "necklace", label: "Necklaces" },
  { value: "bracelet", label: "Bracelets" },
  { value: "pendant", label: "Pendants" },
]

export function BatchCreation() {
  const router = useRouter()
  const { toast } = useToast();
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [materialFilter, setMaterialFilter] = useState<string | null>(null)
  const [itemTypeFilter, setItemTypeFilter] = useState<string | null>(null)
  const [batchName, setBatchName] = useState("")
  const [batchPriority, setBatchPriority] = useState("medium")
  const [groupingMethod, setGroupingMethod] = useState("material")
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null)
  const [openMaterial, setOpenMaterial] = useState(false)
  const [openProcess, setOpenProcess] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)

  // Filter work orders based on search query and filters
  const filteredWorkOrders = workOrders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.item.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesMaterial =
      materialFilter === null || order.material.toLowerCase().includes(materialFilter.toLowerCase())

    const matchesItemType =
      itemTypeFilter === null ||
      (itemTypeFilter === "ring" && order.item.toLowerCase().includes("ring")) ||
      (itemTypeFilter === "earring" && order.item.toLowerCase().includes("earring")) ||
      (itemTypeFilter === "necklace" && order.item.toLowerCase().includes("necklace")) ||
      (itemTypeFilter === "bracelet" && order.item.toLowerCase().includes("bracelet")) ||
      (itemTypeFilter === "pendant" && order.item.toLowerCase().includes("pendant"))

    return matchesSearch && matchesMaterial && matchesItemType
  })

  // Toggle work order selection
  const toggleWorkOrder = (id: string) => {
    setSelectedWorkOrders((prev) => (prev.includes(id) ? prev.filter((orderId) => orderId !== id) : [...prev, id]))
  }

  // Select all filtered work orders
  const selectAllFiltered = () => {
    setSelectedWorkOrders(filteredWorkOrders.map((order) => order.id))
  }

  // Clear all selections
  const clearSelections = () => {
    setSelectedWorkOrders([])
  }

  // Generate batch suggestions based on common attributes
  const generateBatchSuggestions = () => {
    // Group by material
    const materialGroups: Record<string, string[]> = {}
    workOrders.forEach((order) => {
      if (!materialGroups[order.material]) {
        materialGroups[order.material] = []
      }
      materialGroups[order.material].push(order.id)
    })

    // Group by item type
    const itemTypeGroups: Record<string, string[]> = {}
    workOrders.forEach((order) => {
      let itemType = "Other"
      if (order.item.toLowerCase().includes("ring")) itemType = "Rings"
      else if (order.item.toLowerCase().includes("earring")) itemType = "Earrings"
      else if (order.item.toLowerCase().includes("necklace")) itemType = "Necklaces"
      else if (order.item.toLowerCase().includes("bracelet")) itemType = "Bracelets"
      else if (order.item.toLowerCase().includes("pendant")) itemType = "Pendants"

      if (!itemTypeGroups[itemType]) {
        itemTypeGroups[itemType] = []
      }
      itemTypeGroups[itemType].push(order.id)
    })

    // Group by gemstone
    const gemstoneGroups: Record<string, string[]> = {}
    workOrders.forEach((order) => {
      if (!gemstoneGroups[order.gemstones]) {
        gemstoneGroups[order.gemstones] = []
      }
      gemstoneGroups[order.gemstones].push(order.id)
    })

    return [
      {
        name: "14K White Gold Items",
        description: "All items using 14K white gold",
        count: materialGroups["14K White Gold"]?.length || 0,
        ids: materialGroups["14K White Gold"] || [],
      },
      {
        name: "Diamond Jewelry",
        description: "All items with diamonds",
        count: gemstoneGroups["Diamond"]?.length || 0,
        ids: gemstoneGroups["Diamond"] || [],
      },
      {
        name: "Earrings Batch",
        description: "All earring items",
        count: itemTypeGroups["Earrings"]?.length || 0,
        ids: itemTypeGroups["Earrings"] || [],
      },
    ]
  }

  const batchSuggestions = generateBatchSuggestions()

  // Apply a suggested batch
  const applySuggestion = (ids: string[]) => {
    setSelectedWorkOrders(ids)
  }

  // Create a new batch
  const createBatch = () => {
    // In a real app, you would send this data to your backend
    const batchData = {
      name: batchName,
      priority: batchPriority,
      workOrders: selectedWorkOrders,
      groupingMethod,
      material: selectedMaterial,
      process: selectedProcess,
    }

    console.log("Creating batch:", batchData)

    toast({
      title: "Batch Created",
      description: `Batch '${batchName}' was created successfully!`,
      duration: 3000,
    });

    setTimeout(() => {
      router.push("/dashboard/production/batches")
    }, 1200);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Work Order Selection */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Select Work Orders for Batch</CardTitle>
            <CardDescription>Choose similar items to group into a production batch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search work orders..."
                  className="pl-8 rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Filter Work Orders</h4>
                      <div className="space-y-2">
                        <Label>Material</Label>
                        <Select
                          value={materialFilter || ""}
                          onValueChange={(value) => setMaterialFilter(value || null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All materials" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All materials</SelectItem>
                            {materials.map((material) => (
                              <SelectItem key={material.value} value={material.label}>
                                {material.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Item Type</Label>
                        <Select
                          value={itemTypeFilter || ""}
                          onValueChange={(value) => setItemTypeFilter(value || null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All item types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All item types</SelectItem>
                            {itemTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setMaterialFilter(null)
                            setItemTypeFilter(null)
                          }}
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button variant="outline" onClick={selectAllFiltered}>
                  Select All
                </Button>
                <Button variant="outline" onClick={clearSelections}>
                  Clear
                </Button>
              </div>
            </div>

            {/* Work order list */}
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 p-2 text-sm font-medium">
                <div className="col-span-1"></div>
                <div className="col-span-2">ID</div>
                <div className="col-span-2">Customer</div>
                <div className="col-span-3">Item</div>
                <div className="col-span-2">Material</div>
                <div className="col-span-2">Due Date</div>
              </div>
              <ScrollArea className="h-[400px]">
                {filteredWorkOrders.length === 0 ? (
                  <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
                    No work orders match your filters
                  </div>
                ) : (
                  filteredWorkOrders.map((order) => (
                    <div
                      key={order.id}
                      className={cn(
                        "grid grid-cols-12 gap-2 border-b p-2 text-sm",
                        selectedWorkOrders.includes(order.id) ? "bg-muted/50" : "",
                      )}
                    >
                      <div className="col-span-1 flex items-center">
                        <Checkbox
                          checked={selectedWorkOrders.includes(order.id)}
                          onCheckedChange={() => toggleWorkOrder(order.id)}
                        />
                      </div>
                      <div className="col-span-2 flex items-center font-medium">{order.id}</div>
                      <div className="col-span-2 flex items-center">{order.customer}</div>
                      <div className="col-span-3 flex items-center">{order.item}</div>
                      <div className="col-span-2 flex items-center">{order.material}</div>
                      <div className="col-span-2 flex items-center">{order.dueDate}</div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{selectedWorkOrders.length} work orders selected</div>
            </div>
          </CardContent>
        </Card>

        {/* Batch Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Configuration</CardTitle>
            <CardDescription>Define batch parameters and grouping</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batch-name">Batch Name</Label>
              <Input
                id="batch-name"
                placeholder="Enter batch name"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Priority Level</Label>
              <RadioGroup value={batchPriority} onValueChange={setBatchPriority}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="priority-high" />
                  <Label htmlFor="priority-high" className="text-red-500">
                    High
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="priority-medium" />
                  <Label htmlFor="priority-medium" className="text-amber-500">
                    Medium
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="priority-low" />
                  <Label htmlFor="priority-low" className="text-green-500">
                    Low
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Grouping Method</Label>
              <RadioGroup value={groupingMethod} onValueChange={setGroupingMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="material" id="group-material" />
                  <Label htmlFor="group-material">By Material</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="process" id="group-process" />
                  <Label htmlFor="group-process">By Process</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="item-type" id="group-item-type" />
                  <Label htmlFor="group-item-type">By Item Type</Label>
                </div>
              </RadioGroup>
            </div>

            {groupingMethod === "material" && (
              <div className="space-y-2">
                <Label>Select Material</Label>
                <Popover open={openMaterial} onOpenChange={setOpenMaterial}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openMaterial}
                      className="w-full justify-between"
                    >
                      {selectedMaterial
                        ? materials.find((material) => material.value === selectedMaterial)?.label
                        : "Select material..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search materials..." />
                      <CommandList>
                        <CommandEmpty>No material found.</CommandEmpty>
                        <CommandGroup>
                          {materials.map((material) => (
                            <CommandItem
                              key={material.value}
                              onSelect={() => {
                                setSelectedMaterial(material.value === selectedMaterial ? null : material.value)
                                setOpenMaterial(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedMaterial === material.value ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {material.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {groupingMethod === "process" && (
              <div className="space-y-2">
                <Label>Select Process</Label>
                <Popover open={openProcess} onOpenChange={setOpenProcess}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openProcess}
                      className="w-full justify-between"
                    >
                      {selectedProcess
                        ? processes.find((process) => process.value === selectedProcess)?.label
                        : "Select process..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search processes..." />
                      <CommandList>
                        <CommandEmpty>No process found.</CommandEmpty>
                        <CommandGroup>
                          {processes.map((process) => (
                            <CommandItem
                              key={process.value}
                              onSelect={() => {
                                setSelectedProcess(process.value === selectedProcess ? null : process.value)
                                setOpenProcess(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProcess === process.value ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {process.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {groupingMethod === "item-type" && (
              <div className="space-y-2">
                <Label>Select Item Type</Label>
                <Select value={itemTypeFilter || "ring"} onValueChange={(value) => setItemTypeFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
          <div>
            <Button className="w-full" disabled={selectedWorkOrders.length === 0 || !batchName} onClick={createBatch}>
              <Plus className="mr-2 h-4 w-4" />
              Create Batch
            </Button>
            {(selectedWorkOrders.length === 0 || !batchName) && (
              <div className="w-full text-xs text-muted-foreground mt-2 text-center">
                {selectedWorkOrders.length === 0 && !batchName && "Select at least one work order and enter a batch name."}
                {selectedWorkOrders.length === 0 && batchName && "Select at least one work order."}
                {selectedWorkOrders.length > 0 && !batchName && "Enter a batch name."}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Batch Suggestions */}
      {showSuggestions && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Suggested Batches</CardTitle>
              <CardDescription>Automatically generated batch suggestions based on common attributes</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowSuggestions(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {batchSuggestions.map((suggestion, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 p-4">
                    <CardTitle className="text-base">{suggestion.name}</CardTitle>
                    <CardDescription>{suggestion.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Work Orders:</span>
                      <Badge>{suggestion.count}</Badge>
                    </div>
                    <div className="space-y-1">
                      {suggestion.ids.slice(0, 3).map((id) => (
                        <div key={id} className="text-sm">
                          {id}
                        </div>
                      ))}
                      {suggestion.ids.length > 3 && (
                        <div className="text-sm text-muted-foreground">+{suggestion.ids.length - 3} more...</div>
                      )}
                    </div>
                  </CardContent>
                  <div className="border-t bg-muted/20 p-2">
                    <Button variant="ghost" className="w-full" onClick={() => applySuggestion(suggestion.ids)}>
                      Apply Suggestion
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
