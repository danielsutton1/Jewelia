import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SecurityOptions } from "@/components/security/security-options"
import { DataProtection } from "@/components/security/data-protection"
import { ComplianceTools } from "@/components/security/compliance-tools"
import { SecurityScanResults } from "@/components/security/security-scan-results"

export default function SecurityPage() {
  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Security Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Configure security options for your Jewelia CRM account</p>
      </div>

      <Tabs defaultValue="options" className="w-full">
        <TabsList className="mb-4 sm:mb-6 grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 overflow-x-auto">
          <TabsTrigger value="options" className="text-xs sm:text-sm min-h-[44px]">Security Options</TabsTrigger>
          <TabsTrigger value="data-protection" className="text-xs sm:text-sm min-h-[44px]">Data Protection</TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs sm:text-sm min-h-[44px]">Compliance</TabsTrigger>
          <TabsTrigger value="scan-results" className="text-xs sm:text-sm min-h-[44px]">Security Scan</TabsTrigger>
        </TabsList>

        <TabsContent value="options">
          <SecurityOptions />
        </TabsContent>

        <TabsContent value="data-protection">
          <DataProtection />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceTools />
        </TabsContent>

        <TabsContent value="scan-results">
          <SecurityScanResults />
        </TabsContent>
      </Tabs>
    </div>
  )
}
