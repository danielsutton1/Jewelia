"use client"

import { CheckCircle, XCircle, AlertTriangle, Camera, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { QualityInspection, PurchaseOrderLineItem } from "@/types/purchase-order"

interface QualityInspectionProps {
  inspections: QualityInspection[]
  lineItems: PurchaseOrderLineItem[]
  onAddInspection?: () => void
  className?: string
}

export function QualityInspectionComponent({
  inspections,
  lineItems,
  onAddInspection,
  className,
}: QualityInspectionProps) {
  const getStatusColor = (status: QualityInspection["status"]) => {
    switch (status) {
      case "passed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "conditional":
        return "bg-amber-100 text-amber-800"
    }
  }

  const getStatusIcon = (status: QualityInspection["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "conditional":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
    }
  }

  const getLineItemName = (lineItemId: string) => {
    const lineItem = lineItems.find((item) => item.id === lineItemId)
    return lineItem ? lineItem.description : "Unknown Item"
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Quality Inspections</h3>
        {onAddInspection && (
          <Button size="sm" variant="outline" onClick={onAddInspection}>
            <Plus className="mr-2 h-4 w-4" />
            New Inspection
          </Button>
        )}
      </div>

      {inspections.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/10">
          <CheckCircle className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No quality inspections have been performed yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {inspections.map((inspection) => (
            <Card key={inspection.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Inspection on {new Date(inspection.inspectionDate).toLocaleDateString()}
                  </CardTitle>
                  <Badge className={getStatusColor(inspection.status)}>
                    {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm mb-4">
                  <div className="text-muted-foreground">Inspector</div>
                  <div>{inspection.inspector}</div>
                </div>

                {inspection.notes && (
                  <div className="text-sm mb-4">
                    <div className="text-muted-foreground">Notes</div>
                    <div>{inspection.notes}</div>
                  </div>
                )}

                <div className="space-y-3 mt-4">
                  <h4 className="text-sm font-medium">Item Results</h4>
                  {inspection.lineItemResults.map((result, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-3 rounded-lg border",
                        result.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{getLineItemName(result.lineItemId)}</div>
                          {result.notes && <p className="text-sm mt-1">{result.notes}</p>}
                        </div>
                        <div className="flex items-center">
                          {result.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>

                      {result.images && result.images.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-muted">
                          <div className="flex items-center space-x-2">
                            <Camera className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {result.images.length} image{result.images.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export { QualityInspectionComponent as QualityInspection };
