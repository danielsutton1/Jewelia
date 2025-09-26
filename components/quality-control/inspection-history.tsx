"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface InspectionHistoryProps {
  inspectionId: string
}

export function InspectionHistory({ inspectionId }: InspectionHistoryProps) {
  // Mock history data
  const historyEvents = [
    {
      id: "event-1",
      type: "system",
      action: "Inspection created",
      user: "System",
      timestamp: "2023-11-15T10:25:00",
      details: "Inspection #INS-1001 created for order #ORD-5678",
    },
    {
      id: "event-2",
      type: "user",
      action: "Inspection started",
      user: "Alex Johnson",
      timestamp: "2023-11-15T10:30:00",
      details: "Inspection process initiated",
    },
    {
      id: "event-3",
      type: "checklist",
      action: "Checklist item completed",
      user: "Alex Johnson",
      timestamp: "2023-11-15T10:32:00",
      details: "Visual inspection: No visible scratches or damage - Passed",
    },
    {
      id: "event-4",
      type: "checklist",
      action: "Checklist item completed",
      user: "Alex Johnson",
      timestamp: "2023-11-15T10:33:00",
      details: "Visual inspection: Consistent finish and color - Passed",
    },
    {
      id: "event-5",
      type: "photo",
      action: "Photo added",
      user: "Alex Johnson",
      timestamp: "2023-11-15T10:35:00",
      details: "Front view photo added",
    },
    {
      id: "event-6",
      type: "note",
      action: "Note added",
      user: "Alex Johnson",
      timestamp: "2023-11-15T10:35:00",
      details: "Chain clasp needs additional inspection. The spring mechanism feels slightly stiff.",
    },
    {
      id: "event-7",
      type: "measurement",
      action: "Measurement recorded",
      user: "Alex Johnson",
      timestamp: "2023-11-15T10:38:00",
      details: "Length: 18.1 inches (Expected: 18.0 ±0.25) - Passed",
    },
    {
      id: "event-8",
      type: "photo",
      action: "Photo added",
      user: "Alex Johnson",
      timestamp: "2023-11-15T10:40:00",
      details: "Clasp closeup photo added",
    },
    {
      id: "event-9",
      type: "defect",
      action: "Defect logged",
      user: "Alex Johnson",
      timestamp: "2023-11-15T10:42:00",
      details: "Minor defect: Small surface scratch on third link from clasp",
    },
    {
      id: "event-10",
      type: "checklist",
      action: "Checklist item failed",
      user: "Alex Johnson",
      timestamp: "2023-11-15T10:45:00",
      details: "Structural integrity: No weak points in chain - Failed",
    },
  ]

  // Helper function to render event type badge
  const renderEventTypeBadge = (type: string) => {
    switch (type) {
      case "system":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            System
          </Badge>
        )
      case "user":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            User
          </Badge>
        )
      case "checklist":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Checklist
          </Badge>
        )
      case "photo":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Photo
          </Badge>
        )
      case "measurement":
        return (
          <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
            Measurement
          </Badge>
        )
      case "defect":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Defect
          </Badge>
        )
      case "note":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Note
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Inspection History</CardTitle>
              <CardDescription>Complete timeline of inspection activities</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              Export Log
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>{renderEventTypeBadge(event.type)}</TableCell>
                    <TableCell className="font-medium">{event.action}</TableCell>
                    <TableCell>{event.user}</TableCell>
                    <TableCell className="max-w-md truncate">{event.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
