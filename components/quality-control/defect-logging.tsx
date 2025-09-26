"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Save, Plus, Trash2, AlertTriangle, Camera } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DefectLoggingProps {
  inspectionId: string
}

// Mock defect data
const mockDefects = [
  {
    id: "defect-1",
    description: "Surface scratch on inner band",
    severity: "minor",
    location: "Inner band",
    photoUrl: "/placeholder.svg?height=200&width=200&query=scratched%20metal%20surface",
    notes: "Small scratch, not visible when worn",
  },
  {
    id: "defect-2",
    description: "Loose prong on center stone",
    severity: "major",
    location: "Center stone setting",
    photoUrl: "/placeholder.svg?height=200&width=200&query=loose%20prong%20diamond%20setting",
    notes: "Requires repair before delivery",
  },
  {
    id: "defect-3",
    description: "Uneven polish on side facets",
    severity: "minor",
    location: "Side stones",
    photoUrl: "/placeholder.svg?height=200&width=200&query=uneven%20polish%20gemstone",
    notes: "Visible under magnification only",
  },
]

export function DefectLogging({ inspectionId }: DefectLoggingProps) {
  const [defects, setDefects] = useState(mockDefects)
  const [newDefect, setNewDefect] = useState({
    description: "",
    severity: "minor",
    location: "",
    photoUrl: "",
    notes: "",
  })
  const [showAddForm, setShowAddForm] = useState(false)

  const handleDeleteDefect = (id: string) => {
    setDefects(defects.filter((d) => d.id !== id))
  }

  const handleAddDefect = () => {
    // Validate form
    if (!newDefect.description || !newDefect.location) {
      return
    }

    // Add new defect
    const id = `defect-${Date.now()}`
    setDefects([
      ...defects,
      {
        id,
        ...newDefect,
        photoUrl: newDefect.photoUrl || "/placeholder.svg?height=200&width=200&query=jewelry%20defect",
      },
    ])

    // Reset form
    setNewDefect({
      description: "",
      severity: "minor",
      location: "",
      photoUrl: "",
      notes: "",
    })
    setShowAddForm(false)
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-500">Critical</Badge>
      case "major":
        return <Badge className="bg-orange-500">Major</Badge>
      case "minor":
        return <Badge className="bg-yellow-500 text-black">Minor</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Defect Logging</CardTitle>
              <CardDescription>Document and track quality issues</CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="gap-1">
              <Plus className="h-4 w-4" />
              Log New Defect
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <Card className="mb-6 border-dashed">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="defect-location">Location</Label>
                    <Input
                      id="defect-location"
                      value={newDefect.location}
                      onChange={(e) => setNewDefect({ ...newDefect, location: e.target.value })}
                      placeholder="e.g., Third link from clasp"
                    />
                  </div>
                  <div>
                    <Label htmlFor="defect-severity">Severity</Label>
                    <Select
                      value={newDefect.severity}
                      onValueChange={(value) => setNewDefect({ ...newDefect, severity: value })}
                    >
                      <SelectTrigger id="defect-severity">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="major">Major</SelectItem>
                        <SelectItem value="minor">Minor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="defect-description">Description</Label>
                    <Textarea
                      id="defect-description"
                      value={newDefect.description}
                      onChange={(e) => setNewDefect({ ...newDefect, description: e.target.value })}
                      placeholder="Describe the defect in detail..."
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="defect-notes">Notes</Label>
                    <Textarea
                      id="defect-notes"
                      value={newDefect.notes}
                      onChange={(e) => setNewDefect({ ...newDefect, notes: e.target.value })}
                      placeholder="Add any additional notes..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="defect-photo">Photo URL</Label>
                    <Input
                      id="defect-photo"
                      type="url"
                      value={newDefect.photoUrl}
                      onChange={(e) => setNewDefect({ ...newDefect, photoUrl: e.target.value })}
                      placeholder="Enter photo URL"
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" className="gap-1">
                    <Camera className="h-4 w-4" />
                    Add Photo
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddDefect}>Log Defect</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {defects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Defects Logged</h3>
              <p className="text-muted-foreground mt-1 mb-4">No quality issues have been found for this item.</p>
              <Button onClick={() => setShowAddForm(true)} className="gap-1">
                <Plus className="h-4 w-4" />
                Log New Defect
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Photo</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {defects.map((defect) => (
                    <TableRow key={defect.id}>
                      <TableCell>{defect.location}</TableCell>
                      <TableCell>{getSeverityBadge(defect.severity)}</TableCell>
                      <TableCell>{defect.description}</TableCell>
                      <TableCell>
                        {defect.photoUrl ? (
                          <div className="relative h-20 w-20">
                            <Image
                              src={defect.photoUrl || "/placeholder.svg"}
                              alt={`Defect: ${defect.id}`}
                              layout="fill"
                              objectFit="cover"
                              className="rounded"
                            />
                          </div>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Camera className="h-3 w-3 mr-2" />
                            Add Photo
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDeleteDefect(defect.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {defects.length > 0 && (
            <div className="flex justify-end mt-4">
              <Button className="gap-1">
                <Save className="h-4 w-4" />
                Save Defects
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
