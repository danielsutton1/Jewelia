import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayawayPlanSetup } from "@/components/layaway/layaway-plan-setup"
import { LayawayPlanTracking } from "@/components/layaway/layaway-plan-tracking"

export default function LayawayPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold layaway-heading">Layaway Plans</h1>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 overflow-x-auto">
          <TabsTrigger value="active" className="min-h-[44px] min-w-[44px]">Active Plans</TabsTrigger>
          <TabsTrigger value="create" className="min-h-[44px] min-w-[44px]">Create Plan</TabsTrigger>
          <TabsTrigger value="completed" className="min-h-[44px] min-w-[44px]">Completed</TabsTrigger>
          <TabsTrigger value="cancelled" className="min-h-[44px] min-w-[44px]">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4 sm:mt-6">
          <LayawayPlanTracking />
        </TabsContent>
        <TabsContent value="create" className="mt-4 sm:mt-6">
          <LayawayPlanSetup orderTotal={1999.99} />
        </TabsContent>
        <TabsContent value="completed" className="mt-4 sm:mt-6">
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-muted-foreground">No completed layaway plans found.</p>
          </div>
        </TabsContent>
        <TabsContent value="cancelled" className="mt-4 sm:mt-6">
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-muted-foreground">No cancelled layaway plans found.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
