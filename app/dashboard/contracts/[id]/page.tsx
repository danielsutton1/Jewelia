import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContractHeader } from "@/components/contracts/contract-header"
import { ContractSummary } from "@/components/contracts/contract-summary"
import { ContractTerms } from "@/components/contracts/contract-terms"
import { ContractObligations } from "@/components/contracts/contract-obligations"
import { ContractPricing } from "@/components/contracts/contract-pricing"
import { ContractAddendums } from "@/components/contracts/contract-addendums"
import { ContractHistory } from "@/components/contracts/contract-history"
import { ContractCompliance } from "@/components/contracts/contract-compliance"

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return (
    <div className="space-y-6">
      <ContractHeader id={resolvedParams.id} />

      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          <TabsTrigger value="obligations">Obligations</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="addendums">Addendums</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="space-y-4 pt-4">
          <ContractSummary id={resolvedParams.id} />
        </TabsContent>
        <TabsContent value="terms" className="space-y-4 pt-4">
          <ContractTerms />
        </TabsContent>
        <TabsContent value="obligations" className="space-y-4 pt-4">
          <ContractObligations />
        </TabsContent>
        <TabsContent value="pricing" className="space-y-4 pt-4">
          <ContractPricing />
        </TabsContent>
        <TabsContent value="addendums" className="space-y-4 pt-4">
          <ContractAddendums />
        </TabsContent>
        <TabsContent value="history" className="space-y-4 pt-4">
          <ContractHistory />
        </TabsContent>
        <TabsContent value="compliance" className="space-y-4 pt-4">
          <ContractCompliance />
        </TabsContent>
      </Tabs>
    </div>
  )
}
