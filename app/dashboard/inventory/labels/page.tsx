import type { Metadata } from "next"
import { LabelPrinting } from "@/components/inventory/label-printing"

export const metadata: Metadata = {
  title: "Label Printing | Jewelia CRM",
  description: "Design and print labels for jewelry items",
}

export default function LabelPrintingPage() {
  return (
    <div className="h-full overflow-auto">
      <LabelPrinting />
    </div>
  )
}
