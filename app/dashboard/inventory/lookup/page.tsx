import { ManualLookup } from "@/components/scanner/manual-lookup"

export default function LookupPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Item Lookup</h1>
        <p className="text-muted-foreground">Search and filter inventory items manually</p>
      </div>

      <ManualLookup />
    </div>
  )
}
