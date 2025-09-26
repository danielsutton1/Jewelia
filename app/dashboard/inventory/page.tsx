import { Suspense, lazy } from "react"

// Lazy load heavy components
const InventoryDashboard = lazy(() => import("@/components/inventory/inventory-dashboard"))

export default function InventoryPage() {
  return (
    <div className="container mx-auto py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-6 max-w-7xl w-full space-y-3 sm:space-y-4 lg:space-y-6">
      <main>
        <header className="space-y-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight inventory-heading">Inventory Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground inventory-subtext">
            Track and manage your jewelry inventory, including finished pieces, raw materials, and loose stones. 
            Monitor stock levels, process physical inventory counts, and manage item templates and pricing.
          </p>
        </header>

        <section className="grid gap-3 sm:gap-4 lg:gap-6">
          <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600 h-8 w-8"></div></div>}>
            <InventoryDashboard />
          </Suspense>
        </section>
      </main>
    </div>
  )
}
