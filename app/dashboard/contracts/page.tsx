import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContractsDashboard } from "@/components/contracts/contracts-dashboard"
import { ActiveContracts } from "@/components/contracts/active-contracts"
import { PendingContracts } from "@/components/contracts/pending-contracts"
import { ExpiringContracts } from "@/components/contracts/expiring-contracts"
import { ComplianceTracking } from "@/components/contracts/compliance-tracking"

export default function ContractsPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight contracts-heading">Contract Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground contracts-subtext">Manage your contracts, track expirations, and monitor compliance</p>
      </div>

      <ContractsDashboard />

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 overflow-x-auto">
          <TabsTrigger value="active" className="min-h-[44px] min-w-[44px]">Active Contracts</TabsTrigger>
          <TabsTrigger value="pending" className="min-h-[44px] min-w-[44px]">Pending Approval</TabsTrigger>
          <TabsTrigger value="expiring" className="min-h-[44px] min-w-[44px]">Expiring Soon</TabsTrigger>
          <TabsTrigger value="compliance" className="min-h-[44px] min-w-[44px]">Compliance</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
          <ActiveContracts />
        </TabsContent>
        <TabsContent value="pending" className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
          <PendingContracts />
        </TabsContent>
        <TabsContent value="expiring" className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
          <ExpiringContracts />
        </TabsContent>
        <TabsContent value="compliance" className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
          <ComplianceTracking />
        </TabsContent>
      </Tabs>
    </div>
  )
}
