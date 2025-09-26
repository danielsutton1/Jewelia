"use client"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InspectionHeader } from "@/components/quality-control/inspection-header"
import { InspectionChecklist } from "@/components/quality-control/inspection-checklist"
import { PhotoDocumentation } from "@/components/quality-control/photo-documentation"
import { MeasurementChecks } from "@/components/quality-control/measurement-checks"
import { DefectLogging } from "@/components/quality-control/defect-logging"
import { InspectionNotes } from "@/components/quality-control/inspection-notes"
import { InspectionHistory } from "@/components/quality-control/inspection-history"

export default function InspectionDetailPage() {
  const params = useParams()
  const inspectionId = params.id as string

  // Mock inspection data
  const inspectionData = {
    id: inspectionId,
    partnerName: "Goldsmith Supplies",
    itemType: "Diamond Ring",
    orderNumber: "ORD-5678",
    receivedDate: "2023-05-14",
    priority: "High",
    status: "In Progress",
    description: "14K White Gold Diamond Engagement Ring",
    inspector: "Jane Smith",
    lastUpdated: "2023-05-15T10:30:00Z",
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <InspectionHeader inspection={inspectionData} />

      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="defects">Defects</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="checklist" className="mt-6">
          <InspectionChecklist inspectionId={inspectionId} />
        </TabsContent>
        <TabsContent value="photos" className="mt-6">
          <PhotoDocumentation inspectionId={inspectionId} />
        </TabsContent>
        <TabsContent value="measurements" className="mt-6">
          <MeasurementChecks inspectionId={inspectionId} />
        </TabsContent>
        <TabsContent value="defects" className="mt-6">
          <DefectLogging inspectionId={inspectionId} />
        </TabsContent>
        <TabsContent value="notes" className="mt-6">
          <InspectionNotes inspectionId={inspectionId} />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <InspectionHistory inspectionId={inspectionId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
