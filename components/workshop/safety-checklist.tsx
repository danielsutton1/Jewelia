"use client"

import React from 'react'
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { WorkshopData } from "./mock-data"
import { Download, Printer, Save, User, Calendar } from "lucide-react"

interface SafetyChecklistProps {
  workshopData: WorkshopData
}

interface ChecklistItem {
  id: string
  category: string
  description: string
  status: "passed" | "failed" | "not-checked"
  notes: string
}

interface SafetyInspection {
  id: string
  date: string
  inspector: string
  items: ChecklistItem[]
  status: "completed" | "in-progress"
  notes: string
}

export function SafetyChecklist({ workshopData }: SafetyChecklistProps) {
  // Mock safety checklist items
  const defaultChecklistItems: ChecklistItem[] = [
    {
      id: "check-1",
      category: "Fire Safety",
      description: "Fire extinguishers are accessible and not expired",
      status: "not-checked",
      notes: ""
    },
    {
      id: "check-2",
      category: "Fire Safety",
      description: "Emergency exits are clearly marked and unobstructed",
      status: "not-checked",
      notes: ""
    },
    {
      id: "check-3",
      category: "Fire Safety",
      description: "Fire alarm system is operational",
      status: "not-checked",
      notes: ""
    },
    {
      id: "check-4",
      category: "Electrical Safety",
      description: "No exposed wiring or damaged cords",
      status: "not-checked",
      notes: ""
    },
    {
      id: "check-5",
      category: "Electrical Safety",
      description: "Electrical panels are accessible and labeled",
      status: "not-checked",
      notes: ""
    },
    {
      id: "check-6",
      category: "Chemical Safety",
      description: "Chemicals are properly labeled and stored",
      status: "not-checked",
      notes: ""
    },
    {
      id: "check-7",
      category: "Chemical Safety",
      description: "Safety Data Sheets (SDS) are available for all chemicals",
      status: "not-checked",
      notes: ""
    },
    {
      id: "check-8",
      category: "Chemical Safety",
      description: "Eye wash stations and emergency showers are operational",
      status: "not-checked",
      notes: ""
    },
    {
      id: "check-9",
      category: "Equipment Safety",
      description: "Machine guards are in place and functional",
      status: "not-checked",
      notes: ""
    },
    {
      id: "check-10",
      category: "Equipment Safety",
      description: "Equipment is properly maintained and in good working condition",
      status: "not-checked",
      notes: ""
    },
    {
      id: "check-11",
      category: "Equipment Safety",
      description: "Emergency stop buttons are accessible and operational",
      status: "not-checked",
      notes: ""
    },
    {
      id: "check-12",
      category: "Personal Protective Equipment",
      description: "Appropriate PPE is available and in good condition",
      status: "not-checked",
      notes: ""
    },
    {
      id: "check-13",
      category: "Personal Protective Equipment",
      description: "Employees are using required PPE",
      status: "not-checked",
      notes: ""
    },
    {
      id: "check-14",
      category: "Workstation Safety",
      description: "Workstations are clean and organized",
      status: "not-checked",
      notes: ""
    },
    {
      id: "check-15",
      category: "Workstation Safety",
      description: "Ergonomic considerations are implemented",
      status: "not-checked",
      notes: ""
    }
  ]
  
  // Mock previous inspections
  const mockPreviousInspections: SafetyInspection[] = [
    {
      id: "insp-1",
      date: "2023-04-15",
      inspector: "John Smith",
      items: defaultChecklistItems.map(item => ({
        ...item,
        status: Math.random() > 0.2 ? "passed" : "failed"
      })),
      status: "completed",
      notes: "Overall good compliance. Some issues with chemical storage need to be addressed."
    },
    {
      id: "insp-2",
      date: "2023-03-15",
      inspector: "Sarah Johnson",
      items: defaultChecklistItems.map(item => ({
        ...item,
        status: Math.random() > 0.3 ? "passed" : "failed"
      })),
      status: "completed",
      notes: "Several electrical safety issues identified. Follow-up required."
    }
  ]
  
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(defaultChecklistItems)
  const [previousInspections, setPreviousInspections] = useState<SafetyInspection[]>(mockPreviousInspections)
  const [currentInspection, setCurrentInspection] = useState<SafetyInspection>({
    id: `insp-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    inspector: "",
    items: defaultChecklistItems,
    status: "in-progress",
    notes: ""
  })
  const [activeTab, setActiveTab] = useState<"new" | "history">("new")
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null)
  
  // Function to update checklist item status
  const updateItemStatus = (id: string, status: "passed" | "failed" | "not-checked") => {
    const updatedItems = currentInspection.items.map(item => 
      item.id === id ? { ...item, status } : item
    )
    setCurrentInspection({ ...currentInspection, items: updatedItems })
  }
  
  // Function to update checklist item notes
  const updateItemNotes = (id: string, notes: string) => {
    const updatedItems = currentInspection.items.map(item => 
      item.id === id ? { ...item, notes } : item
    )
    setCurrentInspection({ ...currentInspection, items: updatedItems })
  }
  
  // Function to save inspection
  const saveInspection = () => {
    const completedInspection = {
      ...currentInspection,
      status: "completed" as const
    }
    
    setPreviousInspections([completedInspection, ...previousInspections])
    
    // Reset current inspection
    setCurrentInspection({
      id: `insp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      inspector: "",
      items: defaultChecklistItems,
      status: "in-progress",
      notes: ""
    })
  }
  
  // Function to print inspection
  const printInspection = () => {
    window.print()
  }
  
  // Function to export inspection as CSV
  const exportInspection = () => {
    const inspection = selectedInspection 
      ? previousInspections.find(insp => insp.id === selectedInspection) 
      : currentInspection
      
    if (!inspection) return
    
    let csv = "Category,Description,Status,Notes\n"
    
    inspection.items.forEach(item => {
      csv += `"${item.category}","${item.description}","${item.status}","${item.notes}"\n`
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', `safety-inspection-${inspection.date}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  
  // Calculate completion percentage
  const completionPercentage = Math.round(
    (currentInspection.items.filter(item => item.status !== "not-checked").length / 
    currentInspection.items.length) * 100
  )
  
  // Get selected inspection
  const getSelectedInspection = () => {
    if (!selectedInspection) return null
    return previousInspections.find(insp => insp.id === selectedInspection) || null
  }
  
  const selectedInspectionData = getSelectedInspection()
  
  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <Button 
          onClick={() => setActiveTab("new")}
        >
          New Inspection
        </Button>
        <Button 
          onClick={() => setActiveTab("history")}
        >
          Inspection History
        </Button>
      </div>
      
      {activeTab === "new" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Safety Inspection</CardTitle>
              <CardDescription>
                Complete the safety checklist to ensure workshop compliance with safety regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="inspector-name">Inspector Name</Label>
                  <Input 
                    id="inspector-name" 
                    value={currentInspection.inspector}
                    onChange={(e) => setCurrentInspection({ 
                      ...currentInspection, 
                      inspector: e.target.value 
                    })}
                    placeholder="Enter inspector name"
                  />
                </div>
                <div>
                  <Label htmlFor="inspection-date">Inspection Date</Label>
                  <Input 
                    id="inspection-date" 
                    type="date"
                    value={currentInspection.date}
                    onChange={(e) => setCurrentInspection({ 
                      ...currentInspection, 
                      date: e.target.value 
                    })}
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Checklist Progress</h3>
                  <span className="text-sm text-muted-foreground">
                    {currentInspection.items.filter(item => item.status !== "not-checked").length} of {currentInspection.items.length} items checked
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-6">
                {["Fire Safety", "Electrical Safety", "Chemical Safety", "Equipment Safety", "Personal Protective Equipment", "Workstation Safety"].map((category) => {
                  const categoryItems = currentInspection.items.filter(item => item.category === category)
                  
                  return (
                    <div key={category}>
                      <h3 className="text-lg font-medium mb-4">{category}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[400px]">Item</TableHead>
                            <TableHead className="w-[150px]">Status</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categoryItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox 
                                      id={`${item.id}-pass`}
                                      checked={item.status === "passed"}
                                      onCheckedChange={() => updateItemStatus(item.id, "passed")}
                                    />
                                    <Label 
                                      htmlFor={`${item.id}-pass`}
                                      className="text-sm font-normal"
                                    >
                                      Pass
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox 
                                      id={`${item.id}-fail`}
                                      checked={item.status === "failed"}
                                      onCheckedChange={() => updateItemStatus(item.id, "failed")}
                                    />
                                    <Label 
                                      htmlFor={`${item.id}-fail`}
                                      className="text-sm font-normal"
                                    >
                                      Fail
                                    </Label>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Input 
                                  value={item.notes}
                                  onChange={(e) => updateItemNotes(item.id, e.target.value)}
                                  placeholder="Add notes if needed"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-6">
                <Label htmlFor="inspection-notes">General Notes</Label>
                <Textarea 
                  id="inspection-notes"
                  value={currentInspection.notes}
                  onChange={(e) => setCurrentInspection({ 
                    ...currentInspection, 
                    notes: e.target.value 
                  })}
                  placeholder="Add any general notes or observations"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <Button onClick={exportInspection}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button onClick={printInspection}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button onClick={saveInspection}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Inspection
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {activeTab === "history" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl">Previous Inspections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {previousInspections.map((inspection) => {
                  const passedItems = inspection.items.filter(item => item.status === "passed").length
                  const failedItems = inspection.items.filter(item => item.status === "failed").length
                  const passRate = Math.round((passedItems / inspection.items.length) * 100)
                  
                  return (
                    <div 
                      key={inspection.id}
                      className={`p-4 border rounded-md cursor-pointer transition-colors ${
                        selectedInspection === inspection.id 
                          ? "border-primary bg-primary/5" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedInspection(inspection.id)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span className="font-medium">{inspection.date}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={passRate >= 90 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : passRate >= 70 
                              ? "bg-amber-50 text-amber-700 border-amber-200" 
                              : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {passRate}% Pass
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <User className="mr-2 h-3 w-3" />
                        <span>{inspection.inspector}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">{passedItems} Passed</span>
                        <span className="text-red-600">{failedItems} Failed</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Inspection Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedInspectionData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Inspector</h3>
                      <p className="font-medium">{selectedInspectionData.inspector}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Date</h3>
                      <p className="font-medium">{selectedInspectionData.date}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Label htmlFor="inspection-notes">General Notes</Label>
                    <Textarea 
                      id="inspection-notes"
                      value={selectedInspectionData.notes}
                      onChange={(e) => {
                        const updatedInspections = previousInspections.map(insp =>
                          insp.id === selectedInspectionData.id ? { ...insp, notes: e.target.value } : insp
                        )
                        setPreviousInspections(updatedInspections)
                      }}
                      placeholder="Add any general notes or observations"
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <p>No inspection details available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
