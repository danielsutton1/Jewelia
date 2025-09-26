"use client"

import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import type { PurchaseOrder } from "@/types/purchase-order"
import { formatCurrency } from "@/lib/utils"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface PDFGeneratorProps {
  purchaseOrder: PurchaseOrder
  variant?: "button" | "icon"
  size?: "default" | "sm"
}

export function PDFGenerator({ purchaseOrder, variant = "button", size = "default" }: PDFGeneratorProps) {
  const generatePDF = () => {
    const doc = new jsPDF()

    // Add company logo and header
    doc.setFontSize(20)
    doc.text("Jewelia CRM", 105, 20, { align: "center" })

    doc.setFontSize(16)
    doc.text("PURCHASE ORDER", 105, 30, { align: "center" })

    // PO details
    doc.setFontSize(12)
    doc.text(`PO Number: ${purchaseOrder.poNumber}`, 14, 45)
    doc.text(`Date: ${new Date(purchaseOrder.createdAt).toLocaleDateString()}`, 14, 52)
    doc.text(`Status: ${purchaseOrder.status}`, 14, 59)

    // Supplier details
    doc.text("Supplier:", 130, 45)
    doc.text(purchaseOrder.supplierName, 130, 52)
    doc.text("", 130, 59) // No address field in PurchaseOrder type
    doc.text("", 130, 66) // No email field in PurchaseOrder type

    // Shipping details
    doc.text("Ship To:", 14, 75)
    doc.text("Jewelia Jewelry Store", 14, 82)
    doc.text("123 Main Street", 14, 89)
    doc.text("New York, NY 10001", 14, 96)

    // Line items
    const tableColumn = ["Item", "Description", "Quantity", "Unit Price", "Total"]
    const tableRows = purchaseOrder.lineItems.map((item) => [
      item.productId || "",
      item.description,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      formatCurrency(item.quantity * item.unitPrice),
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 110,
      theme: "grid",
      headStyles: {
        fillColor: [100, 100, 100],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 60 },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 35, halign: "right" },
        4: { cellWidth: 35, halign: "right" },
      },
    })

    // Calculate the Y position after the table
    const finalY = (doc as any).lastAutoTable.finalY + 10

    // Totals
    doc.text("Subtotal:", 140, finalY + 10)
    doc.text(formatCurrency(purchaseOrder.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)), 180, finalY + 10, { align: "right" })

    doc.text("Tax:", 140, finalY + 17)
    doc.text(formatCurrency(purchaseOrder.lineItems.reduce((sum, item) => sum + (item.tax || 0), 0)), 180, finalY + 17, { align: "right" })

    doc.text("Shipping:", 140, finalY + 24)
    doc.text(formatCurrency(0), 180, finalY + 24, { align: "right" }) // No shipping field in PurchaseOrder type

    doc.setFontSize(14)
    doc.text("Total:", 140, finalY + 34)
    doc.text(formatCurrency(purchaseOrder.totalAmount), 180, finalY + 34, { align: "right" })

    // Terms and notes
    doc.setFontSize(12)
    doc.text("Terms and Conditions:", 14, finalY + 50)
    doc.setFontSize(10)
    doc.text(purchaseOrder.paymentTerms || "Standard terms apply.", 14, finalY + 57)

    doc.setFontSize(12)
    doc.text("Notes:", 14, finalY + 70)
    doc.setFontSize(10)
    doc.text(purchaseOrder.notes || "No additional notes.", 14, finalY + 77)

    // Signatures
    doc.setFontSize(12)
    doc.text("Authorized by: _______________________", 14, finalY + 95)
    doc.text("Date: _______________________", 130, finalY + 95)

    // Save the PDF
    doc.save(`PO-${purchaseOrder.poNumber}.pdf`)
  }

  if (variant === "icon") {
    return (
      <Button variant="ghost" size="icon" onClick={generatePDF} title="Download PDF">
        <FileDown className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button variant="outline" size={size} onClick={generatePDF}>
      <FileDown className="mr-2 h-4 w-4" />
      Download PDF
    </Button>
  )
}
