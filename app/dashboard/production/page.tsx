import type { Metadata } from "next"
import { ProductionPipeline } from "@/components/production/production-pipeline"

export const metadata: Metadata = {
  title: "Production | Work Orders",
  description: "Production pipeline management for jewelry items",
}

export default function ProductionPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
      <ProductionPipeline />
    </div>
  )
}
