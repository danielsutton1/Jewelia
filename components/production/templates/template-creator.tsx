"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { Plus, Trash2, FileCheck, ArrowLeft, Clock, PenToolIcon as ToolIcon, CheckSquare, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ProductionTemplate, ProcessStep, Material, QualityCheckpoint, Tool } from "@/types/production-templates"

const formSchema = z.object({
  name: z.string().min(3, { message: "Template name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.string().min(1, { message: "Category is required" }),
  subcategory: z.string().optional(),
  complexity: z.enum(["simple", "moderate", "complex", "very complex"]),
  tags: z.string(),
  notes: z.string().optional(),
})

export function TemplateCreator() {
  const [activeTab, setActiveTab] = useState("general")
  const [processes, setProcesses] = useState<ProcessStep[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [qualityCheckpoints, setQualityCheckpoints] = useState<QualityCheckpoint[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [estimatedTotalTime, setEstimatedTotalTime] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      subcategory: "",
      complexity: "moderate",
      tags: "",
      notes: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Calculate total estimated time
    const totalTime = processes.reduce((sum, process) => sum + process.estimatedTime, 0)
    setEstimatedTotalTime(totalTime)

    // Create template object
    const template: ProductionTemplate = {
      id: uuidv4(),
      name: values.name,
      description: values.description,
      category: values.category,
      subcategory: values.subcategory,
      version: "1.0.0",
      createdBy: "current-user", // In a real app, get from auth context
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "draft",
      processes,
      materials,
      qualityCheckpoints,
      tools,
      estimatedTotalTime: totalTime,
      complexity: values.complexity as any,
      tags: values.tags.split(",").map((tag) => tag.trim()),
      usageCount: 0,
      notes: values.notes,
    }

    console.log("Template created:", template)
    // In a real app, save to database
    alert("Template saved successfully!")
  }

  // Process Steps Management
  const addProcess = () => {
    const newProcess: ProcessStep = {
      id: uuidv4(),
      name: "",
      description: "",
      estimatedTime: 0,
      requiredSkillLevel: "intermediate",
    }
    setProcesses([...processes, newProcess])
  }

  const updateProcess = (index: number, field: keyof ProcessStep, value: any) => {
    const updatedProcesses = [...processes]
    updatedProcesses[index] = { ...updatedProcesses[index], [field]: value }
    setProcesses(updatedProcesses)

    // Update total time if time estimate changed
    if (field === "estimatedTime") {
      const totalTime = updatedProcesses.reduce((sum, process) => sum + process.estimatedTime, 0)
      setEstimatedTotalTime(totalTime)
    }
  }

  const removeProcess = (index: number) => {
    const updatedProcesses = [...processes]
    updatedProcesses.splice(index, 1)
    setProcesses(updatedProcesses)

    // Update total time
    const totalTime = updatedProcesses.reduce((sum, process) => sum + process.estimatedTime, 0)
    setEstimatedTotalTime(totalTime)
  }

  // Materials Management
  const addMaterial = () => {
    const newMaterial: Material = {
      id: uuidv4(),
      name: "",
      category: "",
      unit: "",
      estimatedQuantity: 0,
    }
    setMaterials([...materials, newMaterial])
  }

  const updateMaterial = (index: number, field: keyof Material, value: any) => {
    const updatedMaterials = [...materials]
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value }
    setMaterials(updatedMaterials)
  }

  const removeMaterial = (index: number) => {
    const updatedMaterials = [...materials]
    updatedMaterials.splice(index, 1)
    setMaterials(updatedMaterials)
  }

  // Quality Checkpoints Management
  const addQualityCheckpoint = () => {
    const newCheckpoint: QualityCheckpoint = {
      id: uuidv4(),
      name: "",
      description: "",
      stage: "",
      criteria: [""],
      severity: "medium",
    }
    setQualityCheckpoints([...qualityCheckpoints, newCheckpoint])
  }

  const updateQualityCheckpoint = (index: number, field: keyof QualityCheckpoint, value: any) => {
    const updatedCheckpoints = [...qualityCheckpoints]
    updatedCheckpoints[index] = { ...updatedCheckpoints[index], [field]: value }
    setQualityCheckpoints(updatedCheckpoints)
  }

  const updateCheckpointCriteria = (checkpointIndex: number, criteriaIndex: number, value: string) => {
    const updatedCheckpoints = [...qualityCheckpoints]
    updatedCheckpoints[checkpointIndex].criteria[criteriaIndex] = value
    setQualityCheckpoints(updatedCheckpoints)
  }

  const addCheckpointCriteria = (checkpointIndex: number) => {
    const updatedCheckpoints = [...qualityCheckpoints]
    updatedCheckpoints[checkpointIndex].criteria.push("")
    setQualityCheckpoints(updatedCheckpoints)
  }

  const removeCheckpointCriteria = (checkpointIndex: number, criteriaIndex: number) => {
    const updatedCheckpoints = [...qualityCheckpoints]
    updatedCheckpoints[checkpointIndex].criteria.splice(criteriaIndex, 1)
    setQualityCheckpoints(updatedCheckpoints)
  }

  const removeQualityCheckpoint = (index: number) => {
    const updatedCheckpoints = [...qualityCheckpoints]
    updatedCheckpoints.splice(index, 1)
    setQualityCheckpoints(updatedCheckpoints)
  }

  // Tools Management
  const addTool = () => {
    const newTool: Tool = {
      id: uuidv4(),
      name: "",
      category: "",
      optional: false,
    }
    setTools([...tools, newTool])
  }

  const updateTool = (index: number, field: keyof Tool, value: any) => {
    const updatedTools = [...tools]
    updatedTools[index] = { ...updatedTools[index], [field]: value }
    setTools(updatedTools)
  }

  const removeTool = (index: number) => {
    const updatedTools = [...tools]
    updatedTools.splice(index, 1)
    setTools(updatedTools)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
        <h1 className="text-3xl font-bold">Create Production Template</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar with navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Template Sections</CardTitle>
              <CardDescription>Complete all sections to create a template</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="flex flex-col space-y-1 px-2">
                <Button
                  variant={activeTab === "general" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("general")}
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  General Information
                </Button>
                <Button
                  variant={activeTab === "processes" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("processes")}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Process Steps
                  <Badge variant="outline" className="ml-auto">
                    {processes.length}
                  </Badge>
                </Button>
                <Button
                  variant={activeTab === "materials" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("materials")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Materials
                  <Badge variant="outline" className="ml-auto">
                    {materials.length}
                  </Badge>
                </Button>
                <Button
                  variant={activeTab === "quality" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("quality")}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Quality Checkpoints
                  <Badge variant="outline" className="ml-auto">
                    {qualityCheckpoints.length}
                  </Badge>
                </Button>
                <Button
                  variant={activeTab === "tools" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("tools")}
                >
                  <ToolIcon className="h-4 w-4 mr-2" />
                  Required Tools
                  <Badge variant="outline" className="ml-auto">
                    {tools.length}
                  </Badge>
                </Button>
              </nav>
            </CardContent>
            <div className="border-t pt-4 flex flex-col space-y-2">
              <div className="w-full">
                <div className="text-sm font-medium">Estimated Total Time</div>
                <div className="text-2xl font-bold">{formatTime(estimatedTotalTime)}</div>
              </div>
              <div className="w-full">
                <div className="text-sm font-medium">Completion Status</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* General Information */}
              {activeTab === "general" && (
                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Basic details about this production template</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Standard Diamond Ring Setting" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="rings">Rings</SelectItem>
                                <SelectItem value="necklaces">Necklaces</SelectItem>
                                <SelectItem value="earrings">Earrings</SelectItem>
                                <SelectItem value="bracelets">Bracelets</SelectItem>
                                <SelectItem value="pendants">Pendants</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="subcategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subcategory</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Solitaire, Halo, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="complexity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complexity Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select complexity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="simple">Simple</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="complex">Complex</SelectItem>
                                <SelectItem value="very complex">Very Complex</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Detailed description of this production template..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., gold, diamond, prong-setting (comma separated)" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter tags separated by commas to help with searching and categorization
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any additional notes or special considerations..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Process Steps */}
              {activeTab === "processes" && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Process Steps</CardTitle>
                      <CardDescription>Define the manufacturing process steps and time estimates</CardDescription>
                    </div>
                    <Button type="button" onClick={addProcess} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      {processes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No process steps added yet. Click "Add Step" to begin.
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {processes.map((process, index) => (
                            <div key={process.id} className="border rounded-lg p-4 relative">
                              <div className="absolute top-4 right-4">
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeProcess(index)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <FormLabel>Step Name</FormLabel>
                                  <Input
                                    value={process.name}
                                    onChange={(e) => updateProcess(index, "name", e.target.value)}
                                    placeholder="e.g., Casting, Stone Setting"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <FormLabel>Time Estimate (minutes)</FormLabel>
                                    <Input
                                      type="number"
                                      value={process.estimatedTime}
                                      onChange={(e) =>
                                        updateProcess(index, "estimatedTime", Number.parseInt(e.target.value) || 0)
                                      }
                                      placeholder="Minutes"
                                    />
                                  </div>
                                  <div>
                                    <FormLabel>Skill Level</FormLabel>
                                    <Select
                                      value={process.requiredSkillLevel}
                                      onValueChange={(value) => updateProcess(index, "requiredSkillLevel", value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                        <SelectItem value="expert">Expert</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                  value={process.description}
                                  onChange={(e) => updateProcess(index, "description", e.target.value)}
                                  placeholder="Detailed description of this process step..."
                                  className="min-h-[80px]"
                                />
                              </div>
                              {index < processes.length - 1 && <Separator className="mt-4" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Materials */}
              {activeTab === "materials" && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Materials</CardTitle>
                      <CardDescription>List all required materials and their quantities</CardDescription>
                    </div>
                    <Button type="button" onClick={addMaterial} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Material
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      {materials.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No materials added yet. Click "Add Material" to begin.
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {materials.map((material, index) => (
                            <div key={material.id} className="border rounded-lg p-4 relative">
                              <div className="absolute top-4 right-4">
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeMaterial(index)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <FormLabel>Material Name</FormLabel>
                                  <Input
                                    value={material.name}
                                    onChange={(e) => updateMaterial(index, "name", e.target.value)}
                                    placeholder="e.g., 14K Yellow Gold, Diamond"
                                  />
                                </div>
                                <div>
                                  <FormLabel>Category</FormLabel>
                                  <Select
                                    value={material.category}
                                    onValueChange={(value) => updateMaterial(index, "category", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="metal">Metal</SelectItem>
                                      <SelectItem value="gemstone">Gemstone</SelectItem>
                                      <SelectItem value="finding">Finding</SelectItem>
                                      <SelectItem value="consumable">Consumable</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <FormLabel>Unit</FormLabel>
                                  <Input
                                    value={material.unit}
                                    onChange={(e) => updateMaterial(index, "unit", e.target.value)}
                                    placeholder="e.g., grams, carats, pieces"
                                  />
                                </div>
                                <div>
                                  <FormLabel>Estimated Quantity</FormLabel>
                                  <Input
                                    type="number"
                                    value={material.estimatedQuantity}
                                    onChange={(e) =>
                                      updateMaterial(index, "estimatedQuantity", Number.parseFloat(e.target.value) || 0)
                                    }
                                    placeholder="Quantity"
                                  />
                                </div>
                              </div>
                              <div>
                                <FormLabel>Description (Optional)</FormLabel>
                                <Textarea
                                  value={material.description || ""}
                                  onChange={(e) => updateMaterial(index, "description", e.target.value)}
                                  placeholder="Additional details about this material..."
                                />
                              </div>
                              {index < materials.length - 1 && <Separator className="mt-4" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Quality Checkpoints */}
              {activeTab === "quality" && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Quality Checkpoints</CardTitle>
                      <CardDescription>Define quality control checks throughout the process</CardDescription>
                    </div>
                    <Button type="button" onClick={addQualityCheckpoint} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Checkpoint
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      {qualityCheckpoints.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No quality checkpoints added yet. Click "Add Checkpoint" to begin.
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {qualityCheckpoints.map((checkpoint, index) => (
                            <div key={checkpoint.id} className="border rounded-lg p-4 relative">
                              <div className="absolute top-4 right-4">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeQualityCheckpoint(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <FormLabel>Checkpoint Name</FormLabel>
                                  <Input
                                    value={checkpoint.name}
                                    onChange={(e) => updateQualityCheckpoint(index, "name", e.target.value)}
                                    placeholder="e.g., Stone Security Check"
                                  />
                                </div>
                                <div>
                                  <FormLabel>Process Stage</FormLabel>
                                  <Input
                                    value={checkpoint.stage}
                                    onChange={(e) => updateQualityCheckpoint(index, "stage", e.target.value)}
                                    placeholder="e.g., After Stone Setting"
                                  />
                                </div>
                              </div>
                              <div className="mb-4">
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                  value={checkpoint.description}
                                  onChange={(e) => updateQualityCheckpoint(index, "description", e.target.value)}
                                  placeholder="Detailed description of this quality checkpoint..."
                                />
                              </div>
                              <div className="mb-4">
                                <FormLabel>Severity</FormLabel>
                                <Select
                                  value={checkpoint.severity}
                                  onValueChange={(value) => updateQualityCheckpoint(index, "severity", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select severity" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <FormLabel>Criteria</FormLabel>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addCheckpointCriteria(index)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Criteria
                                  </Button>
                                </div>
                                {checkpoint.criteria.map((criterion, criteriaIndex) => (
                                  <div key={criteriaIndex} className="flex items-center mb-2">
                                    <Input
                                      value={criterion}
                                      onChange={(e) => updateCheckpointCriteria(index, criteriaIndex, e.target.value)}
                                      placeholder="e.g., All prongs are secure and properly positioned"
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeCheckpointCriteria(index, criteriaIndex)}
                                      className="ml-2"
                                      disabled={checkpoint.criteria.length <= 1}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              {index < qualityCheckpoints.length - 1 && <Separator className="mt-4" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Required Tools */}
              {activeTab === "tools" && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Required Tools</CardTitle>
                      <CardDescription>List all tools needed for this production process</CardDescription>
                    </div>
                    <Button type="button" onClick={addTool} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tool
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      {tools.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No tools added yet. Click "Add Tool" to begin.
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {tools.map((tool, index) => (
                            <div key={tool.id} className="border rounded-lg p-4 relative">
                              <div className="absolute top-4 right-4">
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeTool(index)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <FormLabel>Tool Name</FormLabel>
                                  <Input
                                    value={tool.name}
                                    onChange={(e) => updateTool(index, "name", e.target.value)}
                                    placeholder="e.g., Laser Welder, Microscope"
                                  />
                                </div>
                                <div>
                                  <FormLabel>Category</FormLabel>
                                  <Select
                                    value={tool.category}
                                    onValueChange={(value) => updateTool(index, "category", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="hand tool">Hand Tool</SelectItem>
                                      <SelectItem value="power tool">Power Tool</SelectItem>
                                      <SelectItem value="machine">Machine</SelectItem>
                                      <SelectItem value="measuring">Measuring</SelectItem>
                                      <SelectItem value="safety">Safety</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <FormLabel>Description (Optional)</FormLabel>
                                  <Textarea
                                    value={tool.description || ""}
                                    onChange={(e) => updateTool(index, "description", e.target.value)}
                                    placeholder="Additional details about this tool..."
                                  />
                                </div>
                                <div className="flex items-center">
                                  <div className="flex items-center space-x-2 mt-6">
                                    <input
                                      type="checkbox"
                                      id={`optional-${tool.id}`}
                                      checked={tool.optional}
                                      onChange={(e) => updateTool(index, "optional", e.target.checked)}
                                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor={`optional-${tool.id}`} className="text-sm font-medium">
                                      This tool is optional
                                    </label>
                                  </div>
                                </div>
                              </div>
                              {index < tools.length - 1 && <Separator className="mt-4" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Action buttons */}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button type="submit">Create Template</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
