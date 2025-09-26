import { PhysicalInventoryAudit } from "@/components/inventory/audit/physical-inventory-audit"

export const metadata = {
  title: "Physical Inventory Audit | Jewelia CRM",
  description: "Conduct physical inventory audits and reconcile discrepancies",
}

export default function AuditPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Physical Inventory Audit</h1>
      <PhysicalInventoryAudit />
    </div>
  )
}
