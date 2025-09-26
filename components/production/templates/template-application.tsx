"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import type { ProductionTemplate, ProcessStep, Material, QualityCheckpoint, Tool } from "@/types/production-templates"

// Mock template data
const mockTemplate: ProductionTemplate = {
  id: "1",
  name: "Classic Solitaire Ring",
  description: "Standard process for creating a classic solitaire engagement ring with 4-prong setting",
  category: "rings",
  subcategory: "engagement",
  version: "2.1.0",
  createdBy: "John Smith",
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date("2023-06-22"),
  publishedAt: new Date("2023-01-20"),
  status: "published",
  processes: [
    {
      id: "p1",
      name: "Casting Preparation",
      description: "Prepare the mold and materials for casting the ring",
      estimatedTime: 45,
      requiredSkillLevel: "intermediate",
    },
    {
      id: "p2",
      name: "Casting",
      description: "Cast the ring using the prepared mold",
      estimatedTime: 60,
      requiredSkillLevel: "advanced",
      dependencies: ["p1"],
    },
    {
      id: "p3",
      name: "Initial Cleaning",
      description: "Clean the cast piece and remove any excess material",
      estimatedTime: 30,
      requiredSkillLevel: "beginner",
      dependencies: ["p2"],
    },
    {
      id: "p4",
      name: "Prong Creation",
      description: "Create and shape the prongs for the diamond setting",
      estimatedTime: 45,
      requiredSkillLevel: "advanced",
      dependencies: ["p3"],
    },
    {
      id: "p5",
      name: "Stone Setting",
      description: "Set the center diamond securely in the prongs",
      estimatedTime: 60,
      requiredSkillLevel: "expert",
      dependencies: ["p4"],
    },
    {
      id: "p6",
      name: "Polishing",
      description: "Polish the ring to a high shine finish",
      estimatedTime: 30,
      requiredSkillLevel: "intermediate",
      dependencies: ["p5"],
    },
    {
      id: "p7",
      name: "Final Inspection",
      description: "Perform final quality checks and prepare for delivery",
      estimatedTime: 20,
      requiredSkillLevel: "advanced",
      dependencies: ["p6"],
    },
  ],
  materials: [
    {
      id: "m1",
      name: "14K Yellow Gold",
      description: "Standard 14K yellow gold alloy",
      category: "metal",
      unit: "grams",
      estimatedQuantity: 5.5,
    },
    {
      id: "m2",
      name: "Round Brilliant Diamond",
      description: "Center stone, 1 carat, VS clarity, G color",
      category: "gemstone",
      unit: "pieces",
      estimatedQuantity: 1,
    },
    {
      id: "m3",
      name: "Casting Investment",
      description: "Standard jewelry casting investment material",
      category: "consumable",
      unit: "grams",
      estimatedQuantity: 100,
    },
    {
      id: "m4",
      name: "Polishing Compound",
      description: "Fine polishing compound for gold",
      category: "consumable",
      unit: "grams",
      estimatedQuantity: 10,
    },
  ],
  qualityCheckpoints: [
    {
      id: "q1",
      name: "Post-Casting Inspection",
      description: "Check for any defects or issues after casting",
      stage: "After Casting",
      criteria: ["No visible porosity", "Complete fill of all details", "No cracks or structural issues"],
      severity: "high",
    },
    {
      id: "q2",
      name: "Prong Security Check",
      description: "Ensure prongs are properly formed and secure",
      stage: "After Prong Creation",
      criteria: ["Even spacing between prongs", "Proper height for stone setting", "Smooth edges with no sharp points"],
      severity: "critical",
    },
    {
      id: "q3",
      name: "Stone Setting Security",
      description: "Verify the diamond is securely set",
      stage: "After Stone Setting",
      criteria: [
        "Stone is level and centered",
        "All prongs have proper tension",
        "Stone does not move when tested",
        "Prongs are properly finished with no sharp edges",
      ],
      severity: "critical",
    },
    {
      id: "q4",
      name: "Final Quality Check",
      description: "Complete inspection before delivery",
      stage: "After Polishing",
      criteria: [
        "Even polish with no scratches",
        "Proper ring size within tolerance",
        "All stamps and markings are clear",
        "Stone is clean and sparkles appropriately",
        "No manufacturing defects visible",
      ],
      severity: "high",
    },
  ],
  tools: [
    {
      id: "t1",
      name: "Casting Equipment",
      description: "Complete casting setup including kiln and centrifuge",
      category: "machine",
      optional: false,
    },
    {
      id: "t2",
      name: "Stone Setting Pliers",
      description: "Specialized pliers for setting stones",
      category: "hand tool",
      optional: false,
    },
    {
      id: "t3",
      name: "Jeweler's Loupe",
      description: "10x magnification for detailed work",
      category: "measuring",
      optional: false,
    },
    {
      id: "t4",
      name: "Polishing Machine",
      description: "With various buffs and compounds",
      category: "machine",
      optional: false,
    },
    {
      id: "t5",
      name: "Laser Welder",
      description: "For any necessary repairs or adjustments",
      category: "machine",
      optional: true,
    },
  ],
  estimatedTotalTime: 290,
  complexity: "moderate",
  tags: ["engagement", "solitaire", "prong-setting", "diamond"],
  imageUrl: "/assorted-jewelry-display.png",
  usageCount: 128,
  averageRating: 4.7,
}

// Mock work orders for selection
const mockWorkOrders = [
  { id: "wo1", name: "WO-2023-0568", customer: "Emma Thompson", item: "Custom Engagement Ring", dueDate: "2023-08-15" },
  { id: "wo2", name: "WO-2023-0571", customer: "Michael Chen", item: "Anniversary Band", dueDate: "2023-08-18" },
  { id: "wo3", name: "WO-2023-0575", customer: "Sarah Johnson", item: "Diamond Solitaire Ring", dueDate: "2023-08-20" },
  { id: "wo4", name: "WO-2023-0579", customer: "David Wilson", item: "Halo Engagement Ring", dueDate: "2023-08-22" },
]

const formSchema = z.object({
  workOrderId: z.string().min(1, { message: "Work order is required" }),
  notes: z.string().optional(),
})

export function TemplateApplication() {
  const [activeTab, setActiveTab] = useState("overview")
  const [customizations, setCustomizations] = useState<{
    processes: ProcessStep[]
    materials: Material[]
    qualityCheckpoints: QualityCheckpoint[]
    tools: Tool[]
  }>({
    processes: [...mockTemplate.processes],
    materials: [...mockTemplate.materials],
    qualityCheckpoints: [...mockTemplate.qualityCheckpoints],
    tools: [...mockTemplate.tools],
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemType, setEditingItemType] = useState<"process" | "material" | "checkpoint" | "tool" | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workOrderId: "",
      notes: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, this would save the template application to the database
    console.log("Applying template with customizations:", {
      workOrderId: values.workOrderId,
      templateId: mockTemplate.id,
      customizations,
      notes: values.notes,
    })
    setShowConfirmation(true)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Process customization functions
  const updateProcess = (processId: string, field: keyof ProcessStep, value: any) => {
    setCustomizations({
      ...customizations,
      processes: customizations.processes.map((process) =>
        process.id === processId ? { ...process, [field]: value } : process,
      ),
    })
  }

  const addProcess = () => {
    const newProcess: ProcessStep = {
      id: uuidv4(),
      name: "",
      description: "",
      estimatedTime: 0,
      requiredSkillLevel: "intermediate",
    }
    setCustomizations({
      ...customizations,
      processes: [...customizations.processes, newProcess],
    })
    setEditingItemId(newProcess.id)
    setEditingItemType("process")
  }

  const removeProcess = (processId: string) => {
    setCustomizations({
      ...customizations,
      processes: customizations.processes.filter((process) => process.id !== processId),
    })
  }

  // Material customization functions
  const updateMaterial = (materialId: string, field: keyof Material, value: any) => {
    setCustomizations({
      ...customizations,
      materials: customizations.materials.map((material) =>
        material.id === materialId ? { ...material, [field]: value } : material,
      ),
    })
  }

  const addMaterial = () => {
    const newMaterial: Material = {
      id: uuidv4(),
      name: "",
      category: "",
      unit: "",
      estimatedQuantity: 0,
    }
    setCustomizations({
      ...customizations,
      materials: [...customizations.materials, newMaterial],
    })
    setEditingItemId(newMaterial.id)
    setEditingItemType("material")
  }

  const removeMaterial = (materialId: string) => {
    setCustomizations({
      ...customizations,
      materials: customizations.materials.filter((material) => material.id !== materialId),
    })
  }

  // Quality checkpoint customization functions
  const updateQualityCheckpoint = (checkpointId: string, field: keyof QualityCheckpoint, value: any) => {
    setCustomizations({
      ...customizations,
      qualityCheckpoints: customizations.qualityCheckpoints.map((checkpoint) =>
        checkpoint.id === checkpointId ? { ...checkpoint, [field]: value } : checkpoint,
      ),
    })
  }

  const updateCheckpointCriteria = (checkpointId: string, criteriaIndex: number, value: string) => {
    setCustomizations({
      ...customizations,
      qualityCheckpoints: customizations.qualityCheckpoints.map((checkpoint) => {
        if (checkpoint.id === checkpointId) {
          const updatedCriteria = [...checkpoint.criteria]
          updatedCriteria[criteriaIndex] = value
          return { ...checkpoint, criteria: updatedCriteria }
        }
        return checkpoint
      }),
    })
  }

  const addCheckpointCriteria = (checkpointId: string) => {
    setCustomizations({
      ...customizations,
      qualityCheckpoints: customizations.qualityCheckpoints.map((checkpoint) => {
        if (checkpoint.id === checkpointId) {
          return { ...checkpoint, criteria: [...checkpoint.criteria, ""] }
        }
        return checkpoint
      }),
    })
  }

  const removeCheckpointCriteria = (checkpointId: string, criteriaIndex: number) => {
    setCustomizations({
      ...customizations,
      qualityCheckpoints: customizations.qualityCheckpoints.map((checkpoint) => {
        if (checkpoint.id === checkpointId) {
          const updatedCriteria = [...checkpoint.criteria]
          updatedCriteria.splice(criteriaIndex, 1)
          return { ...checkpoint, criteria: updatedCriteria }
        }
        return checkpoint
      }),
    })
  }

  const addQualityCheckpoint = () => {
    const newCheckpoint: QualityCheckpoint = {
      id: uuidv4(),
      name: "",
      description: "",
      stage: "",
      criteria: [""],
      severity: "medium",
    }
    setCustomizations({
      ...customizations,
      qualityCheckpoints: [...customizations.qualityCheckpoints, newCheckpoint],
    })
    setEditingItemId(newCheckpoint.id)
    setEditingItemType("checkpoint")
  }

  const removeQualityCheckpoint = (checkpointId: string) => {
    setCustomizations({
      ...customizations,
      qualityCheckpoints: customizations.qualityCheckpoints.filter((checkpoint) => checkpoint.id !== checkpointId),
    })
  }

  // Tool customization functions
  const updateTool = (toolId: string, field: keyof Tool, value: any) => {
    setCustomizations({
      ...customizations,
      tools: customizations.tools.map((tool) => (tool.id === toolId ? { ...tool, [field]: value } : tool)),
    })
  }

  const addTool = () => {
    const newTool: Tool = {
      id: uuidv4(),
      name: "",
      category: "",
      optional: false,
    }
    setCustomizations({
      ...customizations,
      tools: [...customizations.tools, newTool],
    })
    setEditingItemId(newTool.id)
    setEditingItemType("tool")
  }

  const removeTool = (toolId: string) => {
    setCustomizations({
      ...customizations,
      tools: customizations.tools.filter((tool) => tool.id !== toolId),
    })
  }

  // Calculate total time based on customized processes
  const calculateTotalTime = () => {
    return customizations.processes.reduce((total, process) => total + process.estimatedTime, 0)
  }

  // Check if there are any customizations compared to the original template
  const hasCustomizations = () => {
    const processesChanged = JSON.stringify(mockTemplate.processes) !== JSON.stringify(customizations.processes)
    const materialsChanged = JSON.stringify(mockTemplate.materials) !== JSON.stringify(customizations.materials)
    const checkpointsChanged =
      JSON.stringify(mockTemplate.qualityCheckpoints) !== JSON.stringify(customizations.qualityCheckpoints)
    const toolsChanged = JSON.stringify(mockTemplate.tools) !== JSON.stringify(customizations.tools)

    return processesChanged || materialsChanged || checkpointsChanged || toolsChanged
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Apply Production Template</h1>
          <p className="text-muted-foreground">Apply a template to a work order with optional customizations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar with template info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Template Information</CardTitle>
              <CardDescription>Details about the selected template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{mockTemplate.name}</h3>
                <p className="text-sm text-muted-foreground">{mockTemplate.description}</p>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Category</div>
                <div className="font-medium capitalize">{mockTemplate.category} - {mockTemplate.subcategory}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Complexity</div>
                <div className="font-medium capitalize">{mockTemplate.complexity}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Version</div>
                <div className="font-medium">{mockTemplate.version}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Standard Time</div>
                <div className="font-medium">{formatTime(mockTemplate.estimatedTotalTime)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Customized Time</div>
                <div className="font-medium">{formatTime(calculateTotalTime())}</div>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Process Steps</div>
                <div className="font-medium">{customizations.processes.length}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Materials</div>
                <div className="font-medium">{customizations.materials.length}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Quality Checkpoints</div>
                <div className="font-medium">{customizations.qualityCheckpoints.length}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Required Tools</div>
                <div className="font-medium">{customizations.tools.length}</div>
              </div>
              {hasCustomizations() && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Template Customized</p>
                      <p className="text-xs text-yellow-700">
                        You've made changes to the original template. These changes will only apply to this work order.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <div className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setIsCustomizing(!isCustomizing)}>
                {isCustomizing ? "View Only" : "Customize"}
              </Button>
              <Button variant="outline" disabled={!hasCustomizations()}>
                Save as New
              </Button>
            </div>
          </Card>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Work Order Selection</CardTitle>
              <CardDescription>Select the work order to apply this template to</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="workOrderId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Order</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a work order" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockWorkOrders.map(order => (
                              <SelectItem key={order.id} value={order.id}>
                                {order.name} - {order.item} ({order.customer})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any notes about applying this template..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          These notes will be attached to the work order for reference
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit">Apply Template to Work Order</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <Tabs defaultValue="overview" onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="processes">Process Steps</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                  <TabsTrigger value="quality">Quality Checkpoints</TabsTrigger>
                  <TabsTrigger value="tools">Required Tools</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
