import type { Metadata } from "next"
import { BulkImportWizard } from "@/components/inventory/bulk-import/bulk-import-wizard"

export const metadata: Metadata = {
  title: "Bulk Import | Jewelia CRM",
  description: "Import inventory data in bulk",
}

export default function BulkImportPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Bulk Import Inventory</h1>
      <BulkImportWizard />
    </div>
  )
}
