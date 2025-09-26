"use client"

import { useState } from "react"
import { CheckCircle, AlertTriangle, FileText, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Invoice, InvoiceDiscrepancy, PurchaseOrderLineItem } from "@/types/purchase-order"

interface InvoiceMatchingProps {
  invoices: Invoice[]
  lineItems: PurchaseOrderLineItem[]
  onAddInvoice?: (invoice: Omit<Invoice, "id">) => void
  onResolveDiscrepancy?: (invoiceId: string, discrepancyIndex: number, resolution: string) => void
  className?: string
}

export function InvoiceMatching({
  invoices,
  lineItems,
  onAddInvoice,
  onResolveDiscrepancy,
  className,
}: InvoiceMatchingProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const getMatchStatusColor = (status: Invoice["matchStatus"]) => {
    switch (status) {
      case "matched":
        return "bg-green-100 text-green-800"
      case "partially_matched":
        return "bg-amber-100 text-amber-800"
      case "discrepancy":
        return "bg-red-100 text-red-800"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getMatchStatusText = (status: Invoice["matchStatus"]) => {
    switch (status) {
      case "matched":
        return "Matched"
      case "partially_matched":
        return "Partially Matched"
      case "discrepancy":
        return "Discrepancy Found"
      default:
        return "Not Matched"
    }
  }

  const getInvoiceStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "paid":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Invoices</h3>
        {onAddInvoice && (
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Invoice
          </Button>
        )}
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/10">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No invoices have been added yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Invoice #{invoice.invoiceNumber}</CardTitle>
                  <Badge className={getInvoiceStatusColor(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-muted-foreground">Issue Date</div>
                    <div>{new Date(invoice.issueDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Due Date</div>
                    <div>{new Date(invoice.dueDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Amount</div>
                    <div>${invoice.amount.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Match Status</div>
                    <div className="flex items-center">
                      <Badge className={getMatchStatusColor(invoice.matchStatus)}>
                        {getMatchStatusText(invoice.matchStatus)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {invoice.discrepancies && invoice.discrepancies.length > 0 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                        View {invoice.discrepancies.length} Discrepancies
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Invoice Discrepancies</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        {invoice.discrepancies.map((discrepancy, index) => (
                          <DiscrepancyItem
                            key={index}
                            discrepancy={discrepancy}
                            onResolve={
                              onResolveDiscrepancy
                                ? (resolution) => onResolveDiscrepancy(invoice.id, index, resolution)
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {invoice.matchStatus === "matched" && (
                  <div className="flex items-center justify-center text-green-600 py-2">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Invoice matches PO
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

interface DiscrepancyItemProps {
  discrepancy: InvoiceDiscrepancy
  onResolve?: (resolution: string) => void
}

function DiscrepancyItem({ discrepancy, onResolve }: DiscrepancyItemProps) {
  const [resolution, setResolution] = useState("")

  const getDiscrepancyTypeLabel = (type: InvoiceDiscrepancy["type"]) => {
    switch (type) {
      case "price":
        return "Price Discrepancy"
      case "quantity":
        return "Quantity Discrepancy"
      case "item":
        return "Item Discrepancy"
      case "tax":
        return "Tax Discrepancy"
      default:
        return "Other Discrepancy"
    }
  }

  return (
    <div
      className={cn(
        "p-4 rounded-lg border",
        discrepancy.resolved ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{getDiscrepancyTypeLabel(discrepancy.type)}</h4>
          <p className="text-sm mt-1">{discrepancy.description}</p>

          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
            <div>
              <div className="text-muted-foreground">Expected</div>
              <div className="font-medium">{discrepancy.expectedValue}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Actual</div>
              <div className="font-medium">{discrepancy.actualValue}</div>
            </div>
          </div>
        </div>

        {discrepancy.resolved ? (
          <Badge className="bg-green-100 text-green-800">Resolved</Badge>
        ) : (
          <Badge className="bg-amber-100 text-amber-800">Unresolved</Badge>
        )}
      </div>

      {discrepancy.resolved && discrepancy.resolution && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <div className="text-sm text-muted-foreground">Resolution</div>
          <p className="text-sm">{discrepancy.resolution}</p>
        </div>
      )}

      {!discrepancy.resolved && onResolve && (
        <div className="mt-3 pt-3 border-t border-amber-200">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Enter resolution..."
              className="flex-1 px-3 py-1 text-sm rounded-md border"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
            <Button
              size="sm"
              onClick={() => {
                if (resolution.trim()) {
                  onResolve(resolution)
                  setResolution("")
                }
              }}
              disabled={!resolution.trim()}
            >
              Resolve
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
