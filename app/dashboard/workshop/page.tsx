import { WorkshopFloorManager } from "@/components/workshop/workshop-floor-manager"

export const metadata = {
  title: "Workshop Floor Management | Jewelia CRM",
  description: "Manage your jewelry workshop floor layout, resources, and safety compliance",
}

export default function WorkshopPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight workshop-heading">Workshop Floor Management</h1>
          <p className="text-muted-foreground workshop-subtext">
            Design your workshop layout, allocate resources, and monitor real-time activities
          </p>
        </div>
      </div>
      <WorkshopFloorManager />
    </div>
  )
}
